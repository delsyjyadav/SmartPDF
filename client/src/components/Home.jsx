// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ToolCard = ({ title, desc, icon }) => {
  return (
    <div className="bg-[#24386b] hover:bg-[#2c4788] transition rounded-2xl shadow-xl p-6 flex flex-col items-center text-center min-h-[180px]">
      <div className="w-16 h-16 rounded-full bg-[#344b8d] flex items-center justify-center mb-4">
        <span className="text-white text-2xl">{icon}</span>
      </div>

      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      <p className="text-blue-200 text-sm opacity-80">{desc}</p>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Merge PDF",
      desc: "Combine multiple PDFs into one unified document instantly.",
      icon: "📎",
      route: "/merge",
    },
    {
      title: "Split PDF",
      desc: "Separate one page or a whole set for easy conversion.",
      icon: "✂️",
      route: "/split",
    },
    {
      title: "Compress PDF",
      desc: "Reduce file size while maintaining the best quality possible.",
      icon: "📉",
      route: "/compress",
    },
    {
      title: "Convert to PDF",
      desc: "Convert Word, PowerPoint and Excel files to and from PDF.",
      icon: "➕",
      route: "/convert-to-pdf",
    },
    {
      title: "Convert from PDF",
      desc: "Transform your PDFs into editable Word or Image formats.",
      icon: "🔄",
      route: "/convert-from-pdf",
    },
    {
      title: "Edit PDF",
      desc: "Add text, shapes, comments and highlights to your PDF.",
      icon: "✏️",
      route: "/edit-pdf",
    },
    {
      title: "Extract Text",
      desc: "Extract all text content from your PDF documents easily.",
      icon: "🔤",
      route: "/extract-text",
    },
    {
      title: "Extract Images",
      desc: "Get high-quality images extracted from your PDF files.",
      icon: "🖼️",
      route: "/extract-images",
    },
  ];

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-[#10172a] via-[#0f1a35] to-[#0c1225] py-16 px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          <span className="text-white">Welcome </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-white">
            to Smart PDF Tools
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg text-slate-300">
          Your all-in-one online platform for fast, secure, and powerful PDF
          editing. Simplify your document workflow with our intelligent suite of
          tools.
        </p>
      </div>

      {/* Tools */}
      <div className="max-w-6xl mx-auto mt-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-purple-500 rounded"></div>
          <h2 className="text-2xl font-bold">Our Tools</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => navigate(tool.route)}
            >
              <ToolCard
                title={tool.title}
                desc={tool.desc}
                icon={tool.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
