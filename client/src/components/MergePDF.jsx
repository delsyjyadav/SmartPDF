// src/components/MergePDF.jsx
import React, { useState } from "react";

export default function MergePDF() {
  const [files, setFiles] = useState([]);

  const handleFileUpload = (e) => {
    let uploaded = Array.from(e.target.files);
    setFiles([...files, ...uploaded]);
  };

  // ⭐ ADD → Correct position (return ke upar)
  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please upload at least 2 PDF files");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("pdfs", file);
    });

    try {
      const response = await fetch("http://localhost:5000/merge-pdf", {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();
    } catch (error) {
      console.error(error);
      alert("Error merging PDFs");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1025] to-[#0f1a3a] text-white py-10 px-6">

      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <span className="text-purple-400">Smart</span>PDF
        </h2>

        <nav className="flex gap-10 text-slate-300">
          <a href="#" className="hover:text-white transition">Merge PDF</a>
          <a href="#" className="hover:text-white transition">Split PDF</a>
          <a href="#" className="hover:text-white transition">Compress</a>
          <a href="#" className="hover:text-white transition">Convert</a>
        </nav>

        <button className="px-6 py-2 rounded-full border border-slate-400 text-slate-200 hover:bg-white/10 transition">
          Sign In
        </button>
      </header>

      {/* Main Title */}
      <div className="text-center max-w-3xl mx-auto mt-6">
        <span className="px-4 py-1 bg-purple-900/40 rounded-full text-purple-300 text-sm">
          ⚡ Fast, Secure & Free
        </span>

        <h1 className="text-5xl font-extrabold mt-4">
          Merge PDF <span className="text-purple-300">Files</span>
        </h1>

        <p className="text-slate-300 mt-4">
          Upload multiple PDFs and merge them into a single document effortlessly.
          Secure processing with high-quality output.
        </p>
      </div>

      {/* Upload Box */}
      <div className="max-w-4xl mx-auto mt-16 border border-slate-700 rounded-2xl p-10 bg-[#111a3a]/30 backdrop-blur-sm">

        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-900/40 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">☁️</span>
          </div>

          <p className="text-lg text-slate-300">
            Drag & drop PDFs here
          </p>

          <p className="text-sm text-slate-500 mb-4">
            or select files from your computer
          </p>

          <label className="inline-block px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition cursor-pointer text-white">
            Choose Files
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </label>

          <p className="text-xs mt-4 text-slate-500">
            Supported formats: PDF • Max size: 100MB
          </p>
        </div>
      </div>

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <h3 className="text-lg font-semibold mb-3 text-slate-300">
            Uploaded Files ({files.length})
          </h3>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-[#162148] p-4 rounded-xl shadow flex justify-between items-center border border-slate-700"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  className="text-sm px-4 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setFiles(newFiles);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          <div className="text-right mt-8">
            <button
              onClick={handleMerge}   // ⭐ ADD
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-xl text-lg font-semibold shadow-lg"
            >
              Merge PDFs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
