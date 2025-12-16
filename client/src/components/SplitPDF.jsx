import React, { useState } from "react";
import axios from "axios";

const SplitPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const [mode, setMode] = useState("single"); // "single" or "zip"
  const [toast, setToast] = useState(null);

  // Toast popup
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSplit = async () => {
    if (!selectedFile) return showToast("Please upload a PDF!", "error");
    if (!pages) return showToast("Enter page range!", "error");

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("pages", pages);
    formData.append("mode", mode);

    try {
      setLoading(true);
      setDownloadLink(null);

      const response = await axios.post(
        "http://localhost:5000/split-pdf",
        formData,
        { responseType: "blob" }
      );

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(fileURL);

      showToast("Split completed successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error splitting PDF!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto smooth-fade">

      {/* Toast Message */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white animate-fadeIn ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-5 text-center">📄 Split PDF</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">

        {/* File Upload */}
        <label
          className="block border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 upload-glow"
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          {selectedFile ? (
            <p className="font-medium">{selectedFile.name}</p>
          ) : (
            <p className="text-gray-600">Click to upload PDF</p>
          )}
        </label>

        {/* Page Range */}
        <input
          type="text"
          placeholder="Example: 1-3"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          className="w-full mt-4 p-3 border rounded-lg"
        />

        {/* Mode Selection */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setMode("single")}
            className={`w-full p-3 rounded-lg ${
              mode === "single" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            📄 Single PDF Output
          </button>

          <button
            onClick={() => setMode("zip")}
            className={`w-full p-3 rounded-lg ${
              mode === "zip" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            📦 ZIP (Each Page Separate)
          </button>
        </div>

        {/* Split Button */}
        <button
          onClick={handleSplit}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-xl animate-fadeIn"
        >
          🚀 Split Now
        </button>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-indigo-600 animate-spin"></div>
          </div>
        )}

        {/* Download Link */}
        {downloadLink && (
          <a
            href={downloadLink}
            download={mode === "zip" ? "split_pages.zip" : "split.pdf"}
            className="block mt-5 text-center bg-green-500 text-white py-3 rounded-xl font-semibold"
          >
            ⬇ Download File
          </a>
        )}
      </div>
    </div>
  );
};

export default SplitPDF;
