import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="w-full flex flex-col gap-4 items-center text-slate-300">
      <h1 className="mt-10 font-extrabold">Fast Web Gallery Maker</h1>
      <p className="text-lg">Create and host an online 3D gallery of your artwork with nothing but a GitHub account!</p>
      <div className="border-4 border-dashed border-sky-400 text-sky-400 rounded-lg shadow-lg px-12 py-32 mt-8 hover:border-sky-200 hover:text-sky-200 hover:shadow-2xl transition-colors cursor-pointer">
        <p className="text-xl">Drag and drop image files, or click to upload.</p>
      </div>
    </div>
  )
}

export default App
