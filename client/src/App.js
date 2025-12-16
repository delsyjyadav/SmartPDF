// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import CompressPDF from "./components/CompressPDF";
import ConvertToPDF from "./components/ConvertToPDF";
import ConvertFromPDF from "./components/ConvertFromPDF";
import EditPDF from "./components/EditPDF";
import ModifiedPDFPreview from "./components/ModifiedPDFPreview";
import ExtractText from "./components/ExtractText";
import ExtractImages from "./components/ExtractImages";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<MergePDF />} />
        <Route path="/split" element={<SplitPDF />} />
        <Route path="/compress" element={<CompressPDF />} />
        <Route path="/convert-to-pdf" element={<ConvertToPDF />} />
        <Route path="/convert-from-pdf" element={<ConvertFromPDF />} />
        <Route path="/edit-pdf" element={<EditPDF />} />
        <Route path="/preview-modified" element={<ModifiedPDFPreview />} />
        <Route path="/extract-text" element={<ExtractText />} />
        <Route path="/extract-images" element={<ExtractImages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
