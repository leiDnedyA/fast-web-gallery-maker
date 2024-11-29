import { useState } from "react";
import './App.css'
import UploadScreen from "../components/UploadScreen";
import { UploadedFile } from "../lib/files";
import ConfigScreen from "../components/ConfigScreen";

function App() {
  // Global State
  const [stepIndex, setStepIndex] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [galleryName, setGalleryName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");

  return (
    <div className="w-full flex flex-col gap-4 items-center text-slate-300">

      <h1 className="mt-10 font-extrabold">Fast Web Gallery Maker</h1>
      <p className="text-lg">Create and host an online 3D gallery of your artwork with nothing but a GitHub account!</p>
      {
        stepIndex === 0 ?
          <UploadScreen files={files} setFiles={setFiles} /> :
          <ConfigScreen
            galleryName={galleryName}
            setGalleryName={setGalleryName}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
          />
      }
      <div className="flex flex-row gap-4 text-white">
        <button
          className="mt-6 cursor-pointer bg-sky-600 disabled:bg-sky-600/40 disabled:text-white/40 transition-colors disabled:cursor-default shadow-md"
          disabled={stepIndex === 0}
          onClick={() => { setStepIndex((i: number) => i - 1) }}
        >Last Step</button >
        <button
          className="mt-6 cursor-pointer bg-purple-800 disabled:bg-purple-800/40 disabled:text-white/40 transition-colors disabled:cursor-default shadow-md"
          disabled={
            (stepIndex === 0 && files.length === 0) ||
            (stepIndex === 1)
          }
          onClick={() => { setStepIndex((i: number) => i + 1) }}
        >Next Step</button >
      </div>
    </div>
  )
}

export default App
