import React, { useState } from "react";

const PDFtoWord = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleConvert = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    try {
      const response = await fetch("http://localhost:5000/api/pdf-to-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to convert PDF to Word.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">🔄 PDF to Word</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfFile && <p className="mt-2 text-sm">Selected: {pdfFile.name}</p>}

      <button
        onClick={handleConvert}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {loading ? "Converting..." : "Convert to Word"}
      </button>
    </div>
  );
};

export default PDFtoWord;
