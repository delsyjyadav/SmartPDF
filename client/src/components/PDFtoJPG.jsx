// src/components/PDFtoJPG.jsx
import React, { useState } from "react";

const PDFtoJPG = () => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf" && file.size <= 60 * 1024 * 1024) {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF under 60MB.");
    }
  };

  const handleConvert = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch("http://localhost:5000/pdf-to-jpg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "images.zip";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Failed to convert PDF to JPG.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">🖼️ Convert PDF to JPG</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      {pdfFile && (
        <p className="mb-4 text-sm text-gray-700">Selected: {pdfFile.name}</p>
      )}

      <button
        onClick={handleConvert}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
      >
        Convert to JPG
      </button>
    </div>
  );
};

export default PDFtoJPG;
