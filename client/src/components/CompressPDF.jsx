// src/components/CompressPDF.jsx
import React, { useState } from "react";
import axios from "axios";

const SERVER_ORIGIN = "http://localhost:5000"; // change if your server runs elsewhere

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) {
      showToast("Please upload a PDF", "error");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setLoading(true);
      setResult(null);

      // POST to server
      const res = await axios.post(`${SERVER_ORIGIN}/compress-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Server returns JSON like: { message, file, downloadUrl, originalSize, compressedSize, percent }
      const data = res.data;
      if (!data || !data.downloadUrl) {
        showToast("Compression completed but server response invalid", "error");
        setResult(null);
        return;
      }

      // Normalize: ensure downloadUrl is absolute
      const downloadUrl =
        data.downloadUrl.startsWith("http") ? data.downloadUrl : `${SERVER_ORIGIN}${data.downloadUrl}`;

      setResult({
        originalSize: data.originalSize,
        compressedSize: data.compressedSize,
        percent: data.percent,
        downloadUrl,
      });

      showToast("Compression Successful!");
    } catch (err) {
      console.error("Compress request failed:", err);
      const msg = err?.response?.data?.error || "Compression failed. See console.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081120] text-white px-6 py-14">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-xl shadow-lg animate-fadeIn text-white 
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-12">
        <span className="bg-purple-900/40 text-purple-300 px-4 py-1 rounded-full text-sm">
          ✦ AI-Powered Compression
        </span>

        <h1 className="text-5xl font-bold mt-4">
          Compress <span className="text-purple-400">PDF</span>
        </h1>

        <p className="text-gray-300 mt-4 text-lg">
          Reduce PDF size while maintaining quality. Upload, compress, and download — fast.
        </p>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <div className="bg-[#0f1c38] p-8 rounded-2xl border border-blue-900/20">
          <label className="block cursor-pointer">
            <div className="w-full border-2 border-dashed border-purple-500/40 rounded-xl py-12 text-center">
              <div className="text-purple-300 text-4xl mb-3">⬆</div>
              <p className="text-gray-300 text-lg">Drag & Drop your PDF here</p>
              <p className="text-gray-500 text-sm mt-2">or click to browse</p>

              <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg mt-4">
                Choose File
              </button>
            </div>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          {/* Uploaded File */}
          {file && (
            <div className="mt-6 bg-[#152550] p-5 rounded-xl flex justify-between items-center animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-red-400 text-2xl">📄</span>
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                className="text-gray-300 hover:text-red-400 text-xl"
                onClick={() => setFile(null)}
              >
                🗑
              </button>
            </div>
          )}

          {/* Compress Button */}
          <button
            onClick={handleCompress}
            className="w-full bg-purple-600 hover:bg-purple-700 mt-8 py-4 text-lg font-semibold rounded-2xl"
            disabled={loading}
          >
            {loading ? "Processing..." : "Compress PDF →"}
          </button>

          {/* Loader */}
          {loading && (
            <div className="flex justify-center mt-4">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-gray-400 text-sm mt-12">
            <p>🔒 Secure<br />Files auto-deleted</p>
            <p>⚡ Fast<br />Smart compression</p>
            <p>🎯 High Quality<br />Optimized output</p>
          </div>
        </div>

        {/* RIGHT SIDE RESULT */}
        {result && (
          <div className="bg-[#1a0f2d] p-8 rounded-2xl border border-purple-800/30 animate-fadeIn">
            <p className="text-green-400 font-semibold mb-3 text-lg">✔ Compression Complete!</p>

            {/* Bars */}
            <div className="mb-6">
              <div className="flex justify-between text-gray-300 text-sm mb-1">
                <span>Original</span>
                <span>{result.originalSize} MB</span>
              </div>

              <div className="w-full h-2 bg-gray-700 rounded-full mb-4">
                <div className="h-full bg-purple-500 rounded-full w-full"></div>
              </div>

              <div className="flex justify-between text-gray-300 text-sm mb-1">
                <span>Compressed</span>
                <span>{result.compressedSize} MB</span>
              </div>

              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div
                  className="h-full bg-purple-300 rounded-full"
                  style={{ width: `${result.percent}%` }}
                />
              </div>
            </div>

            {/* Percentage Circle */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center text-3xl font-bold">
                {result.percent}%
              </div>
            </div>

            {/* Download */}
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full block bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 text-center"
            >
              ⬇ Download Compressed PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPDF;
