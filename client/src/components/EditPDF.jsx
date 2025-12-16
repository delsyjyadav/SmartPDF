import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { ChromePicker } from "react-color";


pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const EditPDF = () => {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [activeTextId, setActiveTextId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [tool, setTool] = useState("select");
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);

  const pdfRef = useRef();
  const navigate = useNavigate();

  /* ---------- FILE ---------- */
  const onFileUpload = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPdfUrl(URL.createObjectURL(f));
  };

  /* ---------- TEXT ADD ---------- */
  const addText = (e, page) => {
    if (tool !== "text") return;
    const rect = pdfRef.current.getBoundingClientRect();

    setTexts(prev => [
      ...prev,
      {
        id: Date.now(),
        page,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: "Edit text",
        size: 16,
        color: "#ffffff",
        bold: false,
        font: "Helvetica",
      },
    ]);
  };

  /* ---------- IMAGE ADD ---------- */
  const addImage = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImages(prev => [
        ...prev,
        {
          id: Date.now(),
          page: 1,
          x: 120,
          y: 120,
          width: 150,
          height: 150,
          src: reader.result,
        },
      ]);
    };
    reader.readAsDataURL(img);
  };

  /* ---------- SAVE ---------- */
  const savePDF = async () => {
    const form = new FormData();
    form.append("file", file);
    form.append("texts", JSON.stringify(texts));
    form.append("images", JSON.stringify(images));

    const res = await axios.post(
      "http://localhost:5000/edit-pdf",
      form,
      { responseType: "blob" }
    );

    const url = URL.createObjectURL(res.data);
    localStorage.setItem("editedPDF", url);
    navigate("/preview-modified");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">
        Edit <span className="text-purple-400">PDF</span>
      </h1>

      <input type="file" accept="application/pdf" onChange={onFileUpload} />

      {/* TOOLS */}
      <div className="flex gap-4 my-4">
        {["select", "text", "image"].map(t => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`px-6 py-2 rounded ${
              tool === t ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}

        {tool === "image" && (
          <input type="file" accept="image/*" onChange={addImage} />
        )}
      </div>

      {/* PDF */}
      {pdfUrl && (
        <div ref={pdfRef}>
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from(new Array(numPages), (_, i) => (
              <div
                key={i}
                className="relative mb-6"
                onClick={(e) => addText(e, i + 1)}
              >
                <Page pageNumber={i + 1} />

                {/* IMAGES */}
                {images.filter(img => img.page === i + 1).map(img => (
                  <Draggable
                    key={img.id}
                    position={{ x: img.x, y: img.y }}
                    onStop={(e, d) =>
                      setImages(prev =>
                        prev.map(x =>
                          x.id === img.id ? { ...x, x: d.x, y: d.y } : x
                        )
                      )
                    }
                  >
                    <ResizableBox
                      width={img.width}
                      height={img.height}
                      resizeHandles={["se"]}
                      onResizeStop={(e, { size }) =>
                        setImages(prev =>
                          prev.map(x =>
                            x.id === img.id
                              ? { ...x, width: size.width, height: size.height }
                              : x
                          )
                        )
                      }
                    >
                      <img
                        src={img.src}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "2px dashed purple",
                        }}
                        alt=""
                      />
                    </ResizableBox>
                  </Draggable>
                ))}

                {/* TEXT */}
                {texts.filter(t => t.page === i + 1).map(t => (
                  <Draggable
                    key={t.id}
                    position={{ x: t.x, y: t.y }}
                    onStop={(e, d) =>
                      setTexts(prev =>
                        prev.map(x =>
                          x.id === t.id ? { ...x, x: d.x, y: d.y } : x
                        )
                      )
                    }
                  >
                    

                    <input
                      value={t.value}
                      onClick={() => {
                        setActiveTextId(t.id);
                        setShowColorPicker(false);
                      }}

                      style={{
                        position: "absolute",
                        fontSize: t.size,
                        fontWeight: t.bold ? "bold" : "normal",
                        fontFamily: t.font,
                        color: t.color,
                        background: "transparent",
                        border: activeTextId === t.id
                          ? "1px dashed purple"
                          : "none",
                      }}
                      onChange={(e) =>
                        setTexts(prev =>
                          prev.map(x =>
                            x.id === t.id ? { ...x, value: e.target.value } : x
                          )
                        )
                      }
                    />

                  </Draggable>
                ))}
              </div>
            ))}
          </Document>
        </div>
      )}


      {activeTextId && (
        <div className="bg-[#131A2A] border border-gray-700 p-4 rounded-lg flex gap-4 items-center mb-4">

          {/* FONT SIZE */}
          <button
            onClick={() =>
              setTexts(t =>
                t.map(x =>
                  x.id === activeTextId ? { ...x, size: x.size + 2 } : x
                )
              )
            }
          >A+</button>

          <button
            onClick={() =>
              setTexts(t =>
                t.map(x =>
                  x.id === activeTextId ? { ...x, size: Math.max(10, x.size - 2) } : x
                )
              )
            }
          >A−</button>

          {/* BOLD */}
          <button
            onClick={() =>
              setTexts(t =>
                t.map(x =>
                  x.id === activeTextId ? { ...x, bold: !x.bold } : x
                )
              )
            }
          >
            <b>B</b>
          </button>

          {/* FONT FAMILY */}
          <select
            onChange={(e) =>
              setTexts(t =>
                t.map(x =>
                  x.id === activeTextId ? { ...x, font: e.target.value } : x
                )
              )
            }
          >
            <option value="Helvetica">Sans</option>
            <option value="TimesRoman">Serif</option>
            <option value="Courier">Mono</option>
          </select>

          {/* COLOR */}
          <button onClick={() => setShowColorPicker(!showColorPicker)}>
            🎨
          </button>

          {showColorPicker && (
            <ChromePicker
              color={
                texts.find(t => t.id === activeTextId)?.color || "#fff"
              }
              onChange={(c) =>
                setTexts(t =>
                  t.map(x =>
                    x.id === activeTextId ? { ...x, color: c.hex } : x
                  )
                )
              }
            />
          )}
        </div>
      )}


      {file && (
        <button onClick={savePDF} className="bg-purple-600 px-8 py-3 mt-6 rounded-lg">
          Save & Preview
        </button>
      )}
    </div>
  );
};

export default EditPDF;
