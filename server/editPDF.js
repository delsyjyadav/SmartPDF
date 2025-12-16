const { PDFDocument, rgb } = require("pdf-lib");

async function editPDF(fileBuffer, texts) {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();

  texts.forEach((t) => {
    const page = pages[t.page - 1];
    page.drawText(t.value, {
      x: t.x,
      y: page.getHeight() - t.y,
      size: t.size,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}

module.exports = editPDF;
