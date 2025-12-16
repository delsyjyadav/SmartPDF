// server/compress.js
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Set this to your Ghostscript executable - either "gswin64c" or full path to exe
// Example Windows full path:
// const ghostscriptCmd = `"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe"`;
const ghostscriptCmd = "gswin64c"; // change if needed

/**
 * Compress a PDF using Ghostscript.
 * @param {string} inputPath - full path to input PDF
 * @param {string} outputPath - full path to desired output PDF
 * @returns {Promise<void>}
 */
function compressPDF(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // -dPDFSETTINGS options (choose as needed):
    // /screen (lowest), /ebook (good), /printer, /prepress (highest quality)
    const cmd = `"${ghostscriptCmd}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        // include stderr for debugging
        return reject(new Error(`Ghostscript error: ${error.message}\n${stderr}`));
      }
      if (!fs.existsSync(outputPath)) {
        return reject(new Error("Ghostscript finished but output not found"));
      }
      resolve();
    });
  });
}

module.exports = compressPDF;
