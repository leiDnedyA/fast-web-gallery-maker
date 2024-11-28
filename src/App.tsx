import React, { useState, DragEvent, ChangeEvent } from "react";
import './App.css'
import UploadScreen from "../components/UploadScreen";
import { UploadedFile } from "../lib/files";

function App() {
  // Global State
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <>
      <UploadScreen files={files} setFiles={setFiles} />
    </>
  )
}

export default App
