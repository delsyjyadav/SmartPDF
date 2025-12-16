// server/index.js (FINAL - drop in place, replace previous index.js)
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const JSZip = require("jszip");
const { exec } = require("child_process");
const archiver = require("archiver");

const app = express();
app.use(cors());
app.use(express.json());

// --- Config (edit these if needed) ---
const PORT = process.env.PORT || 5000;
const GHOSTSCRIPT_CMD = "gswin64c"; // Windows: gswin64c (change if different), Linux/mac: gs
const LIBREOFFICE_PATH = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'; // keep quotes, change if different

// --- Ensure required folders exist ---
const requiredDirs = ["uploads", "merged", "compressed", "converted", "jpgs"];
for (const d of requiredDirs) {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// --- Auto-cleanup: delete files older than 24h in merged & compressed & converted & uploads ---
const CLEANUP_OLDER_THAN_MS = 24 * 60 * 60 * 1000; // 24 hours
function cleanupOldFiles() {
  const folders = ["merged", "compressed", "converted", "uploads", "jpgs"];
  const now = Date.now();
  for (const f of folders) {
    const folderPath = path.join(__dirname, f);
    if (!fs.existsSync(folderPath)) continue;
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      try {
        const full = path.join(folderPath, file);
        const stat = fs.statSync(full);
        if (now - stat.mtimeMs > CLEANUP_OLDER_THAN_MS) {
          fs.unlinkSync(full);
        }
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
  }
}
// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);
cleanupOldFiles(); // one run at startup

// ------------------ Multer Setup ------------------ //
// For disk uploads (merge/compress/pdf-to-word/pdf-to-jpg)
const upload = multer({ dest: path.join(__dirname, "uploads/") });

const rgbFromHex = (hex) => {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  return rgb(r, g, b);
};


// For memory uploads (split routes that use buffer)
const uploadMem = multer({ storage: multer.memoryStorage() });

// ------------------ MERGE PDF ------------------ //
app.post("/merge-pdf", upload.array("pdfs", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "At least 2 PDF files required!" });
    }

    const mergedPdf = await PDFDocument.create();
    for (let file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      try { fs.unlinkSync(file.path); } catch (e) {}
    }

    const outputFile = `merged_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "merged", outputFile);
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    return res.json({
      message: "PDF merged successfully!",
      mergedFile: outputFile,
      downloadUrl: `/merged/${outputFile}`,
    });
  } catch (error) {
    console.error("Merge error:", error);
    return res.status(500).json({ error: "Failed to merge PDFs" });
  }
});

// Serve merged folder
app.use("/merged", express.static(path.join(__dirname, "merged")));

// ------------------ SPLIT PDF (single selected pages) ------------------ //
app.post("/split-pdf-single", uploadMem.single("pdf"), async (req, res) => {
  try {
    const pages = req.body.pages; // "2-5"
    if (!req.file) return res.status(400).send("No PDF uploaded");
    if (!pages || typeof pages !== "string" || !pages.includes("-"))
      return res.status(400).send("Invalid pages parameter. Use start-end (e.g. 2-5)");

    const [startRaw, endRaw] = pages.split("-").map((s) => s.trim());
    const start = Number(startRaw), end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start)
      return res.status(400).send("Invalid page range");

    const originalPdf = await PDFDocument.load(req.file.buffer);
    const pageCount = originalPdf.getPageCount ? originalPdf.getPageCount() : originalPdf.getPages().length;
    if (end > pageCount) return res.status(400).send(`Page range exceeds document pages (${pageCount})`);

    const newPdf = await PDFDocument.create();
    const range = Array.from({ length: end - start + 1 }, (_, i) => i + (start - 1));
    const extracted = await newPdf.copyPages(originalPdf, range);
    extracted.forEach((p) => newPdf.addPage(p));
    const newBytes = await newPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=selected-pages.pdf");
    res.send(Buffer.from(newBytes));
  } catch (err) {
    console.error("Split single error:", err);
    res.status(500).send("Error splitting PDF");
  }
});

// ------------------ SPLIT PDF (each page -> ZIP) ------------------ //
app.post("/split-pdf-zip", uploadMem.single("pdf"), async (req, res) => {
  try {
    const pages = req.body.pages;
    if (!req.file) return res.status(400).send("No PDF uploaded");
    if (!pages || typeof pages !== "string" || !pages.includes("-"))
      return res.status(400).send("Invalid pages parameter. Use start-end (e.g. 2-5)");

    const [startRaw, endRaw] = pages.split("-").map((s) => s.trim());
    const start = Number(startRaw), end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start)
      return res.status(400).send("Invalid page range");

    const originalPdf = await PDFDocument.load(req.file.buffer);
    const pageCount = originalPdf.getPageCount ? originalPdf.getPageCount() : originalPdf.getPages().length;
    if (end > pageCount) return res.status(400).send(`Page range exceeds document pages (${pageCount})`);

    const zip = new JSZip();
    for (let i = start; i <= end; i++) {
      const doc = await PDFDocument.create();
      const [singlePage] = await doc.copyPages(originalPdf, [i - 1]);
      doc.addPage(singlePage);
      const bytes = await doc.save();
      zip.file(`page-${i}.pdf`, bytes);
    }
    const zipData = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=split_pages.zip");
    return res.send(zipData);
  } catch (err) {
    console.error("Split zip error:", err);
    res.status(500).send("Error creating ZIP");
  }
});

// ------------------ PDF -> JPG (Ghostscript) ------------------ //
app.post("/pdf-to-jpg", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No PDF uploaded");
    const inputPath = req.file.path;
    const outDir = path.join(__dirname, "jpgs", `${Date.now()}`);
    fs.mkdirSync(outDir, { recursive: true });

    // Use gswin64c (Windows) or gs (linux) - make sure it's available
    const command = `"${GHOSTSCRIPT_CMD}" -dNOPAUSE -dBATCH -sDEVICE=jpeg -r144 -sOutputFile="${path.join(outDir, "page_%03d.jpg")}" "${inputPath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Ghostscript error:", err, stderr);
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(500).send("Failed to convert PDF to JPG.");
      }

      // create a zip of images
      const zipName = `images_${Date.now()}.zip`;
      const zipPath = path.join(__dirname, "jpgs", zipName);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip");
      output.on("close", () => {
        try { fs.unlinkSync(inputPath); } catch(e){}
        // remove images folder after zipping
        fs.rmSync(outDir, { recursive: true, force: true });
        res.download(zipPath, zipName, (err) => {
          try { fs.unlinkSync(zipPath); } catch(e){}
        });
      });
      archive.on("error", (zipErr) => {
        console.error("Archive error:", zipErr);
        res.status(500).send("ZIP creation failed.");
      });
      archive.pipe(output);
      archive.directory(outDir, false);
      archive.finalize();
    });
  } catch (err) {
    console.error("pdf-to-jpg error:", err);
    res.status(500).send("Error converting PDF to JPG.");
  }
});

// ------------------ PDF -> Word (LibreOffice) ------------------ //
app.post("/pdf-to-word", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No PDF uploaded");

    const inputPath = req.file.path;
    const outDir = path.join(__dirname, "converted");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // LibreOffice command - full path recommended on Windows (variable above)
    const command = `${LIBREOFFICE_PATH} --headless --convert-to docx --outdir "${outDir}" "${inputPath}"`;

    exec(command, { windowsHide: true }, (error, stdout, stderr) => {
      console.log("📥 Input File:", inputPath);
      console.log("📤 Output Dir:", outDir);
      console.log("⚙️ LibreOffice Command:", command);

      if (error) {
        console.error("Conversion error:", error);
        console.error("stderr:", stderr);
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(500).send("Conversion failed.");
      }

      const baseName = path.basename(inputPath) + ".docx"; // multer gives filename without extension maybe
      // Try to find actual converted file (LibreOffice names by original name if extension exists)
      const candidates = fs.readdirSync(outDir);
      // prefer file with same base as uploaded (with .docx) or last modified
      let outputFile = null;
      // First try exact match
      const expected = path.basename(inputPath, path.extname(inputPath)) + ".docx";
      if (candidates.includes(expected)) outputFile = expected;
      else if (candidates.length) {
        // pick the newest file
        candidates.sort((a,b) => fs.statSync(path.join(outDir,b)).mtimeMs - fs.statSync(path.join(outDir,a)).mtimeMs);
        outputFile = candidates[0];
      }

      if (!outputFile) {
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(500).send("Converted file not found.");
      }

      const outputPath = path.join(outDir, outputFile);
      res.download(outputPath, "converted.docx", (err) => {
        try { fs.unlinkSync(inputPath); } catch(e){}
        try { fs.unlinkSync(outputPath); } catch(e){}
      });
    });
  } catch (err) {
    console.error("pdf-to-word route error:", err);
    res.status(500).send("Error converting PDF to Word.");
  }
});

// ------------------ COMPRESS PDF (Ghostscript) ------------------ //
app.post("/compress-pdf", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No PDF uploaded");
    const inputPath = req.file.path;
    const outputFile = `compressed_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "compressed", outputFile);

    // Ghostscript command
    const compressCmd = `"${GHOSTSCRIPT_CMD}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    exec(compressCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Ghostscript error:", error);
        console.error("stderr:", stderr);
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(500).json({ error: "Compression failed" });
      }

      if (!fs.existsSync(outputPath)) {
        console.error("Compression finished but output missing:", outputPath, stdout, stderr);
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(500).json({ error: "Compression output missing" });
      }

      const originalSize = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
      const compressedSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);

      try { fs.unlinkSync(inputPath); } catch(e){}

      return res.json({
        message: "Compressed Successfully",
        file: outputFile,
        downloadUrl: `/compressed/${outputFile}`,
        originalSize,
        compressedSize,
        percent: Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)),
      });
    });
  } catch (err) {
    console.error("Compress route error:", err);
    return res.status(500).send("Error compressing PDF");
  }
});

// Serve compressed folder
app.use("/compressed", express.static(path.join(__dirname, "compressed")));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


// ------------------ CONVERT TO PDF ------------------ //
app.post("/convert-to-pdf", upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const inputFile = req.files[0]; // abhi 1 file support
    const inputPath = inputFile.path;

    const outputFile = `converted_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "converted", outputFile);

    const command = `${LIBREOFFICE_PATH} --headless --convert-to pdf --outdir "${path.join(
      __dirname,
      "converted"
    )}" "${inputPath}"`;

    exec(command, (error) => {
      try { fs.unlinkSync(inputPath); } catch (e) {}

      if (error) {
        console.error("Convert to PDF error:", error);
        return res.status(500).send("Conversion failed");
      }

      res.json({
        message: "Converted Successfully",
        file: outputFile,
        downloadUrl: `/converted/${outputFile}`,
      });
    });
  } catch (err) {
    console.error("Convert PDF route error:", err);
    res.status(500).send("Error converting file");
  }
});

// Serve converted folder
app.use("/converted", express.static(path.join(__dirname, "converted")));



const { upload, convertFromPDF } = require("./convertFromPDF");

app.post(
  "/api/convert-from-pdf",
  upload.single("file"),
  convertFromPDF
);


// ================= EDIT PDF ================= //
// -------- EDIT PDF ROUTE --------//
app.post("/edit-pdf", upload.single("file"), async (req, res) => {
  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // -------- LOAD FONTS --------
    const fonts = {
      Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
      TimesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
      Courier: await pdfDoc.embedFont(StandardFonts.Courier),
    };

    const texts = JSON.parse(req.body.texts || "[]");
    const highlights = JSON.parse(req.body.highlights || "[]");
    const images = JSON.parse(req.body.images || "[]");

    const pages = pdfDoc.getPages();

    // -------- TEXT --------
    texts.forEach(t => {
      const page = pages[t.page - 1];
      if (!page) return;

      page.drawText(t.value || "", {
        x: t.x,
        y: page.getHeight() - t.y,
        size: t.size || 14,
        font: fonts[t.font] || fonts.Helvetica,
        color: rgbFromHex(t.color || "#ffffff"),
      });
    });

    // -------- HIGHLIGHT --------
    highlights.forEach(h => {
      const page = pages[h.page - 1];
      if (!page) return;

      page.drawRectangle({
        x: h.x,
        y: page.getHeight() - h.y - h.h,
        width: h.w,
        height: h.h,
        color: rgb(1, 1, 0),
        opacity: 0.4,
      });
    });

    // -------- IMAGES --------
    for (const img of images) {
      const page = pages[img.page - 1];
      if (!page) continue;

      const base64 = img.src.split(",")[1];
      const bytes = Buffer.from(base64, "base64");

      const embedded = img.src.includes("png")
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);

      page.drawImage(embedded, {
        x: img.x,
        y: page.getHeight() - img.y - img.height,
        width: img.width,
        height: img.height,
      });
    }

    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, "converted", `edited_${Date.now()}.pdf`);

    fs.writeFileSync(outPath, out);

    res.download(outPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Edit PDF failed" });
  }
});
