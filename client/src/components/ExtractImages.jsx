import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { AiOutlineDownload } from "react-icons/ai";

const ExtractImages = () => {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [images, setImages] = useState([]);

  // Fake extraction simulation
  const startExtraction = () => {
    setExtracting(true);

    setTimeout(() => {
      // Dummy images (UI only)
      setImages([
        {
          id: 1,
          src: "https://picsum.photos/300/200?1",
          size: "1.2 MB",
          resolution: "1200 × 900 px",
          format: "PNG",
        },
        {
          id: 2,
          src: "https://picsum.photos/300/200?2",
          size: "2.4 MB",
          resolution: "1920 × 1080 px",
          format: "JPG",
        },
        {
          id: 3,
          src: "https://picsum.photos/300/200?3",
          size: "0.8 MB",
          resolution: "800 × 600 px",
          format: "WEBP",
        },
      ]);

      setExtracting(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white px-6 py-12 flex flex-col items-center">
      
      {/* ----------- TITLE ----------- */}
      <h1 className="text-4xl font-bold text-center">
        Extract <span className="text-purple-400">Images</span> from PDF
      </h1>
      <p className="text-gray-400 mt-2 text-center max-w-2xl">
        Upload your PDF and extract all high-quality embedded images instantly.
      </p>

      {/* ----------- UPLOAD BOX ----------- */}
      <div className="w-full max-w-3xl mt-10">
        <label className="block bg-[#1B2343] border-2 border-dashed border-purple-600/40 rounded-2xl p-8 cursor-pointer text-center">
          <FiUploadCloud className="text-5xl mx-auto text-purple-400" />
          <p className="mt-3 text-gray-300 text-lg">
            Drag & Drop your PDF <span className="text-purple-400">here</span>
          </p>
          <p className="text-gray-500 text-sm">or click to browse from your computer</p>

          <div className="mt-5">
            <span className="bg-[#2A3360] px-4 py-2 rounded-lg text-purple-300 border border-purple-500/40">
              Choose File
            </span>
          </div>

          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* Selected File */}
        {file && (
          <div className="mt-4 bg-[#131A2A] border border-gray-700 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-gray-400 text-sm">
                {(file.size / 1024 / 1024).toFixed(1)} MB • 15 Pages
              </p>
            </div>

            <button
              className="text-red-400 text-lg"
              onClick={() => {
                setFile(null);
                setImages([]);
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ----------- EXTRACTION LOADING ----------- */}
      {extracting && (
        <div className="w-full max-w-3xl bg-[#1C1036] border border-purple-700/40 p-4 rounded-xl mt-6">
          <p className="text-purple-300 font-medium">Extracting images...</p>
          <p className="text-gray-400 text-sm">Processing page 7 of 15</p>

          {/* Progress Bar */}
          <div className="w-full bg-[#2A1F45] h-2 rounded-full mt-3">
            <div className="bg-purple-500 h-2 rounded-full w-[50%] transition-all"></div>
          </div>

          <button className="mt-2 bg-purple-600 px-4 py-1 rounded-lg text-sm">
            Extracting...
          </button>
        </div>
      )}

      {/* ----------- IMAGES OUTPUT ----------- */}
      {images.length > 0 && !extracting && (
        <div className="w-full max-w-5xl bg-[#1C1036] border border-purple-700/40 rounded-2xl p-6 mt-8">
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-purple-300">
              Found {images.length} images
            </h2>
            <p className="text-gray-400 text-sm">Total size: 12.8 MB</p>
          </div>

          {/* Image Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-[#24184F] rounded-xl border border-purple-500/30 p-3 relative"
              >
                <span className="text-xs bg-[#00000050] px-2 py-1 rounded absolute top-2 left-2">
                  #{img.id}
                </span>

                <img
                  src={img.src}
                  alt="extracted"
                  className="rounded-lg w-full h-40 object-cover"
                />

                <div className="mt-3">
                  <p className="text-gray-300 text-sm">{img.resolution}</p>
                  <p className="text-gray-400 text-xs">
                    {img.format} • {img.size}
                  </p>
                </div>

                <button className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 p-2 rounded-lg">
                  <AiOutlineDownload className="text-white text-lg" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-xs mt-5">
            ⏱️ Images are retained for 30 mins
          </p>

          <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl flex items-center gap-2">
            <AiOutlineDownload /> Download All as ZIP
          </button>
        </div>
      )}

      {/* ----------- NO IMAGES FOUND ----------- */}
      {file && !extracting && images.length === 0 && (
        <div className="w-full max-w-3xl bg-[#2A203D] border border-red-500/40 p-5 rounded-2xl mt-10">
          <p className="text-red-300 font-semibold">No images found in this PDF</p>
          <p className="text-gray-400 text-sm mt-1">
            The document might be scanned or text-only.
          </p>

          <button
            onClick={() => setFile(null)}
            className="mt-4 bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg"
          >
            Re-upload PDF
          </button>
        </div>
      )}

      {/* ----------- START EXTRACTION BUTTON ----------- */}
      {file && !extracting && images.length === 0 && (
        <button
          onClick={startExtraction}
          className="mt-6 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl"
        >
          Start Extraction ⚡
        </button>
      )}
    </div>
  );
};

export default ExtractImages;
