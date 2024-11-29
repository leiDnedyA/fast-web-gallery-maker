import { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface Props {
  backgroundColor: string;
  setBackgroundColor: any;
  galleryName: string;
  setGalleryName: any;
}

export default function ConfigScreen({
  backgroundColor, setBackgroundColor, galleryName, setGalleryName
}: Props) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  return <div className="w-full flex flex-col gap-4 items-center text-slate-300">
    <form className="flex flex-col items-center gap-5 shadow-2xl border border-slate-300/30 rounded-lg px-10 py-8">
      <h2 className="text-2xl">Gallery Settings</h2>
      <label>
        Gallery Name
        <input
          type="text"
          placeholder="My Cool Gallery..."
          value={galleryName}
          onInput={(e: any) => {
            setGalleryName(e.target.value);
          }}
          className="ml-4 focus:border-sky-300 px-4 py-2 transition-colors"
        />
      </label>
      <label className="relative">
        Wall Color
        <button className="ml-4 py-2 px-4 border border-gray-600 text-gray-300/90" onClick={(e) => { e.preventDefault(); setColorPickerOpen((currVal => !currVal)) }}>{colorPickerOpen ? "(Close color picker)" : "(Open color picker)"}</button>
        <div onClick={e => { e.preventDefault() }} className={colorPickerOpen ? "absolute top-10" : "hidden"}>
          <div onClick={_ => { setColorPickerOpen(false); }} className="fixed top-0 left-0 w-full h-full bg-black/60"></div>
          <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
        </div>
        <span className="ml-2">{backgroundColor}</span>
        <span
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: backgroundColor,
        }}
        className="inline-block ml-3"
        ></span>
      </label>
    </form>
  </div>
}
