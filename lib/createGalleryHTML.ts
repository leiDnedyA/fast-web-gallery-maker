import { UploadedFile } from "./files";
import * as ejs from 'ejs';

const MAX_SIZE = 500_000; // ~500kb

async function compressImage(file: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img: any = new Image();
      img.src = event?.target?.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx: any = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/jpeg', quality);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}

async function toDataURL(blob: Blob): Promise<string | ArrayBuffer | null> {
  // only compress if blob is larger than MAX_SIZE
  const compressedBlob = blob.size > MAX_SIZE ?
    await compressImage(blob, (MAX_SIZE / blob.size)) :
    blob;
  return new Promise((res, _) => {
    var reader = new FileReader();
    reader.readAsDataURL(compressedBlob);
    reader.onloadend = function() {
      var base64data = reader.result;
      res(base64data);
    }
  })
}

export async function createGalleryHtml(backgroundColor: string, imageFiles: UploadedFile[]): Promise<string> {
  const templateHtmlRequest = await fetch('/template.html');
  const templateHtml = await templateHtmlRequest.text();
  let imageUrls: string[] = [];
  for (let imageFile of imageFiles) {
    const data = await toDataURL(imageFile.file);
    if (typeof data === "string") {
      imageUrls.push(data);
    } else {
      console.error("image file not converted to string!")
    }
  }
  return ejs.render(templateHtml, { imageUrls: imageUrls, backgroundColor });
}
