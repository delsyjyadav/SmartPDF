import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ModifiedPDFPreview = () => {
  const navigate = useNavigate();
  const pdfUrl = localStorage.getItem("editedPDF");

  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white px-6 py-10 flex flex-col items-center">

      <h1 className="text-4xl font-bold mb-8">
        Modified <span className="text-purple-400">PDF Preview</span>
      </h1>

      <div className="relative bg-[#131A2A] p-8 rounded-2xl">

        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 p-2 rounded"
        >
          <IoChevronBack />
        </button>

        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <Page pageNumber={page} width={300} />
          </Document>
        )}

        <button
          onClick={() => setPage(p => Math.min(numPages, p + 1))}
          disabled={page === numPages}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 p-2 rounded"
        >
          <IoChevronForward />
        </button>
      </div>

      <div className="flex gap-6 mt-10">
        <button
          onClick={() => navigate("/edit-pdf")}
          className="bg-gray-600 px-8 py-3 rounded-lg"
        >
          Back to Edit
        </button>

        <a
          href={pdfUrl}
          download="Edited_PDF.pdf"
          className="bg-purple-600 px-8 py-3 rounded-lg"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
};

export default ModifiedPDFPreview;
