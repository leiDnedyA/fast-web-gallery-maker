import { useRef, useEffect, useState } from 'react';
import { UploadedFile } from '../lib/files';
import { createGalleryHtml } from '../lib/createGalleryHTML';

interface Props {
  backgroundColor: string;
  imageFiles: UploadedFile[];
}


function downloadHtmlFile(filename: string, htmlContent: string) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
  }
  else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

export default function Preview({ backgroundColor, imageFiles }: Props) {
  const mountRef = useRef(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const previewHtmlContent = await createGalleryHtml(backgroundColor, imageFiles);
      setHtmlContent(previewHtmlContent);
      const localRef = mountRef as any;
      if (localRef.current) {
        let iframeDoc = localRef.current.contentDocument || localRef.current.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(previewHtmlContent);
        iframeDoc.close();
      }
    })();
  }, []);

  return <div className="w-full flex flex-col items-center gap-3">
    <iframe ref={mountRef} height="600px" width="800px" />
    <div>
      <button
        className="bg-sky-600 color-white font-bold shadow-md hover:bg-sky-800 transition-colors shadow-lg"
        disabled={htmlContent === null}
        onClick={() => {
          if (htmlContent === null) return;
          downloadHtmlFile("gallery.html", htmlContent);
        }}
      >Download Code</button>
    </div>
  </div>
};

