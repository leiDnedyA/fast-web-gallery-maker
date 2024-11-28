import React, { useState, DragEvent, ChangeEvent } from "react";
import { UploadedFile } from '../lib/files.ts';

interface Props {
  files: UploadedFile[];
  setFiles: any; // I don't feel like writing out the other type for this
}

export default function UploadScreen({
  files, setFiles
}: Props) {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        size: Math.round(file.size / 1024), // Convert bytes to KB
      }));
      setFiles((prevFiles: UploadedFile[]) => [...prevFiles, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        size: Math.round(file.size / 1024), // Convert bytes to KB
      }));
      setFiles((prevFiles: UploadedFile[]) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number): void => {
    setFiles((prevFiles: UploadedFile) => prevFiles.filter((_, i) => i !== index));
  };
  return <div className="w-full flex flex-col gap-4 items-center text-slate-300">
    <h1 className="mt-10 font-extrabold">Fast Web Gallery Maker</h1>
    <p className="text-lg">Create and host an online 3D gallery of your artwork with nothing but a GitHub account!</p>
    <div
      className="border-4 border-dashed border-sky-400 text-sky-400 rounded-lg shadow-lg px-12 py-32 mt-8 hover:border-sky-200 hover:text-sky-200 hover:shadow-2xl transition-colors cursor-pointer"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <p className="text-xl">Drag and drop image files, or click to upload.</p>
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="file-upload"
        onChange={handleFileSelect}
      />
      <label
        htmlFor="file-upload"
        className="text-white rounded-lg mt-10 px-4 py-2 inline-block cursor-pointer bg-sky-600 hover:bg-sky-800 transition-colors"
      >
        Browse Files
      </label>
    </div>
    <div className="mt-4">
      <h3>Uploaded Files:</h3>
      <ul className="mt-4">
        {
          files.length === 0 ?
            (<p className="text-gray-300/80">No files uploaded.</p>) :
            files.map((file, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                {file.file.name} - {file.size} KB
                <button
                  className="ml-2 bg-rose-600 text-white border-none cursor-pointer hover:bg-rose-800 transition-colors"
                  onClick={() => removeFile(index)}
                >
                  Remove
                </button>
              </li>
            ))
        }
      </ul>
    </div>
  </div>
}
