
"use client";

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}


const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        style={{
          background: "transparent",
          borderColor: "#e5e5e5",
        }}
      />

      <style>{`
        .ql-picker {
          color: #1d1d1d !important;
        }

        .ql-editor {
          min-height: 200px;
          color: #1d1d1d;
        }

        .ql-snow {
          border-color: #e5e5e5 !important;
          border-radius: 8px;
        }

        .ql-editor.ql-blank::before {
          color: #9a9a9a !important;
        }

        .ql-picker-options {
          background: #ffffff !important;
          border-color: #e5e5e5 !important;
        }

        .ql-toolbar {
          border-radius: 8px 8px 0 0;
        }

        .ql-container {
          border-radius: 0 0 8px 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
