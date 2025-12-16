import React, { useState } from "react";
import axios from "axios";

const ConvertToPDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = (e) => {
    setFiles(Array.from(e.target.files));
    setResult(null);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const startConversion = async () => {
    if (files.length === 0) {
      return showToast("Please select at least one file", "error");
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(
        "http://localhost:5000/convert-to-pdf",
        formData
      );

      setResult(res.data);
      showToast("Conversion Successful!");
    } catch (err) {
      showToast("Conversion failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080f1f] text-white px-6 py-14">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-xl shadow-lg
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-12">
        <span className="bg-purple-900/40 text-purple-300 px-4 py-1 rounded-full text-sm">
          ✦ PREMIUM PDF CONVERTER
        </span>

        <h1 className="text-5xl font-bold mt-4">
          Convert to <span className="text-purple-400">PDF</span>
        </h1>

        <p className="text-gray-300 mt-4 text-lg">
          Convert Word, Excel, PPT, Images into high-quality PDF.
        </p>
      </div>

      {/* Upload */}
      <div className="max-w-5xl mx-auto bg-[#0f1b34] p-8 rounded-2xl">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-purple-500/40 rounded-xl py-10 text-center">
            <div className="text-purple-300 text-4xl mb-3">⬆</div>
            <p>Drag & Drop files here</p>
            <button className="bg-blue-600 px-5 py-2 rounded-lg mt-4">
              Choose File
            </button>
          </div>

          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </label>

        {/* Files */}
        <div className="mt-6">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-[#16254d] p-4 rounded-xl mb-3 flex justify-between"
            >
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <button
                onClick={() => removeFile(index)}
                className="text-red-400"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* Convert Button */}
        <button
          onClick={startConversion}
          className="w-full bg-purple-600 mt-6 py-3 rounded-xl font-semibold"
        >
          {loading ? "Processing..." : "Convert to PDF →"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="max-w-5xl mx-auto mt-8 bg-[#102034] p-6 rounded-xl flex justify-between">
          <div>
            <p className="text-green-400 font-semibold">✔ Conversion Complete</p>
            <p>{result.file}</p>
          </div>

          <a
            href={result.downloadUrl}
            className="bg-green-500 text-black px-6 py-2 rounded-xl font-semibold"
          >
            ⬇ Download
          </a>
        </div>
      )}
    </div>
  );
};

export default ConvertToPDF;
