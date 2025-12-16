import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { HiCheckCircle } from "react-icons/hi";

const ExtractText = () => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("full"); 
  const [pages, setPages] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [wordsCount, setWordsCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white px-6 py-12 flex flex-col items-center">

      {/* Title */}
      <h1 className="text-4xl font-bold text-center">
        Extract <span className="text-purple-400">Text</span> from PDF
      </h1>
      <p className="text-gray-400 mt-2 text-center max-w-xl">
        Upload your PDF and extract clean, searchable text instantly.
      </p>

      {/* Upload Box */}
      <div className="w-full max-w-3xl bg-[#131A2A] border border-gray-700 rounded-2xl p-6 mt-10">

        {!file ? (
          <label className="border-2 border-dashed border-gray-600 hover:border-purple-400 transition cursor-pointer p-10 rounded-xl flex flex-col items-center bg-[#0D1320]">
            <FiUploadCloud className="text-5xl text-purple-400" />
            <p className="text-gray-300 mt-3">Drag & Drop your PDF here</p>
            <p className="text-gray-500 text-sm">Max file size 50MB</p>

            <span className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg">
              Choose File
            </span>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-[#1A1230] border border-purple-500/40 px-4 py-3 rounded-xl">
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-gray-400 text-sm">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              className="text-red-400 hover:text-red-300 text-2xl"
              onClick={() => setFile(null)}
            >
              <IoClose />
            </button>
          </div>
        )}
      </div>

      {/* Extraction Settings */}
      {file && (
        <div className="w-full max-w-3xl bg-gradient-to-br from-[#2F1A4A] to-[#1B1433] border border-purple-500/40 rounded-2xl p-6 mt-8">

          <p className="text-xl font-semibold">Extraction Settings</p>

          {/* Option 1 — Full Text */}
          <label className="flex items-center gap-3 mt-5 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={mode === "full"}
              onChange={() => setMode("full")}
              className="h-4 w-4"
            />
            <span className="text-gray-300">Extract Full PDF Text</span>
          </label>

          {/* Option 2 — Specific Pages */}
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={mode === "pages"}
              onChange={() => setMode("pages")}
              className="h-4 w-4"
            />
            <span className="text-gray-300">Extract from Specific Pages</span>
          </label>

          {mode === "pages" && (
            <input
              type="text"
              placeholder="Enter page numbers (e.g., 1,3,5-7)"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="w-full mt-4 bg-[#0D1320] px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
            />
          )}

          {/* Start Extraction Button */}
          <button
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-lg"
            onClick={() => {
              // Fake extraction result
              setExtractedText(
                "Introduction to Financial Performance Q3 2024\n\nThe third quarter of 2024 has demonstrated resilience..."
              );
              setWordsCount(1246);
            }}
          >
            Start Extraction ✨
          </button>
        </div>
      )}

      {/* Output Box */}
      {extractedText && (
        <div className="w-full max-w-3xl bg-[#131A2A] border border-gray-700 rounded-2xl p-6 mt-10">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-green-400">
              <HiCheckCircle className="text-xl" />
              <span>Extraction Complete</span>
            </div>
            <span className="text-gray-400 text-sm">{wordsCount} words extracted</span>
          </div>

          {/* Text */}
          <div className="bg-[#0D1320] rounded-xl p-5 text-gray-200 leading-relaxed">
            {extractedText}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg">
              Copy to Clipboard
            </button>
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg">
              Download as .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractText;
