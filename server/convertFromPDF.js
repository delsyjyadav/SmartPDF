const multer = require("multer");
const fs = require("fs");
const libre = require("libreoffice-convert");

const upload = multer({ dest: "uploads/" });

const convertFromPDF = async (req, res) => {
  const { format } = req.body;
  const filePath = req.file.path;

  try {
    const pdfBuffer = fs.readFileSync(filePath);

    const outputExt =
      format === "word" ? ".docx" :
      format === "jpg" ? ".jpg" :
      format === "png" ? ".png" : ".txt";

    libre.convert(pdfBuffer, outputExt, undefined, (err, done) => {
      if (err) return res.status(500).send("Conversion failed");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=converted${outputExt}`
      );
      res.send(done);

      fs.unlinkSync(filePath);
    });

  } catch (err) {
    res.status(500).send("Error processing file");
  }
};

module.exports = { upload, convertFromPDF };
