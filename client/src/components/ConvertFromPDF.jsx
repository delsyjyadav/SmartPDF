import React, { useState } from "react";
import { FiUploadCloud, FiX, FiCheck, FiDownload } from "react-icons/fi";
import axios from "axios";

const ConvertFromPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("word");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFile, setOutputFile] = useState(null);

  const formats = [
    { id: "word", title: "Word", desc: "Editable .docx document" },
    { id: "jpg", title: "JPG Images", desc: "High quality .jpg" },
    { id: "png", title: "PNG Images", desc: "Lossless .png" },
    { id: "text", title: "Plain Text", desc: "Extracted text content" },
  ];

  const startConversion = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setOutputFile(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("format", selectedFormat);

    try {
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 400);

      const res = await axios.post(
        "http://localhost:5000/api/convert-from-pdf",
        formData,
        { responseType: "blob" }
      );

      clearInterval(progressTimer);
      setProgress(100);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      setOutputFile({
        url,
        name: `converted.${selectedFormat === "word" ? "docx" : selectedFormat}`,
      });

    } catch (err) {
      alert("Conversion failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center px-4 py-10">

      <h1 className="text-4xl font-bold text-center">
        Convert <span className="text-purple-400">From PDF</span>
      </h1>

      <p className="text-gray-400 text-center mt-3 max-w-xl">
        Transform your PDF documents into editable formats or images.
      </p>

      <div className="w-full max-w-3xl bg-[#131A2A] border border-gray-800 rounded-2xl mt-10 p-8">

        <h2 className="text-gray-300 text-lg font-semibold">📄 Source File</h2>

        {!selectedFile ? (
          <label className="mt-4 border border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-purple-400">
            <FiUploadCloud className="text-4xl text-purple-400" />
            <p className="mt-2 text-gray-400">Click to upload PDF file</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="mt-4 flex items-center justify-between bg-[#0D1320] border border-gray-700 p-4 rounded-xl">
            <div>
              <p className="font-semibold">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button onClick={() => setSelectedFile(null)}>
              <FiX className="text-gray-400 text-xl hover:text-red-400" />
            </button>
          </div>
        )}

        <h2 className="text-gray-300 text-lg font-semibold mt-8">
          🎯 Select Output Format
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {formats.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`p-4 rounded-xl cursor-pointer border
              ${selectedFormat === f.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 bg-[#0D1320]"
                }`}
            >
              <p className="font-semibold">{f.title}</p>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={startConversion}
          disabled={!selectedFile || isProcessing}
          className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-3 rounded-xl text-lg font-semibold"
        >
          Convert to {formats.find(f => f.id === selectedFormat).title}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Files are encrypted and deleted after 1 hour.
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-3xl mt-8 bg-[#131A2A] p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="flex-1">
            <p className="text-gray-300">Converting...</p>
            <div className="w-full h-2 bg-gray-700 rounded mt-2">
              <div className="h-2 bg-purple-500 rounded" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className="text-purple-400 font-semibold">{progress}%</p>
        </div>
      )}

      {outputFile && (
        <div className="w-full max-w-3xl mt-6 bg-[#131A2A] p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-green-400 font-semibold flex items-center gap-2">
              <FiCheck /> Conversion Complete
            </p>
            <p className="text-gray-400 text-sm">{outputFile.name}</p>
          </div>

          <a
            href={outputFile.url}
            download={outputFile.name}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiDownload /> Download
          </a>
        </div>
      )}
    </div>
  );
};

export default ConvertFromPDF;
