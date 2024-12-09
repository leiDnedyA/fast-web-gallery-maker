import { useEffect, useState } from 'react';
import { UploadedFile } from '../lib/files';
import { createGalleryHtml } from '../lib/createGalleryHTML';
import { ClipLoader } from 'react-spinners';
import { adjustEndpointToEnvironment } from '../lib/utils';

function getRandomInt(min: number, max: number): number {
  // Ensure that min and max are integers
  min = Math.ceil(min);
  max = Math.floor(max);

  // Generate a random number between min (inclusive) and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Example usage: generate a random number between 1 and 10
let randomNumber = getRandomInt(1, 10);
console.log(randomNumber);
interface Props {
  backgroundColor: string;
  imageFiles: UploadedFile[];
  githubToken: string;
  githubUsername: string;
}


export default function PublishScreen({ backgroundColor, imageFiles, githubToken }: Props) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [createGhPagesLoading, setCreateGhPagesLoading] = useState<boolean>(false);
  const [pingingSite, setPingingSite] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const htmlContent = await createGalleryHtml(backgroundColor, imageFiles);
      setHtmlContent(htmlContent);
    })();
  }, []);

  return <div className="w-full flex flex-col items-center gap-6 mt-10">
    <h1 className="text-4xl font-bold">Publish Your Gallery!</h1>
    <p>Using <a href="https://pages.github.com/">GitHub Pages</a>, you can host your gallery online <strong>for free</strong>, forever! Click the button below to get a shareable permanent link to your gallery. 🧑‍🎨</p>
    <button
      className="bg-sky-600 color-white font-bold shadow-md hover:bg-sky-800 disabled:bg-sky-400 transition-colors shadow-lg"
      disabled={published || htmlContent === null || createGhPagesLoading}
      onClick={async () => {
        if (htmlContent === null) return;
        setCreateGhPagesLoading(true);
        const data = new FormData();
        const blob = new Blob([htmlContent], { type: "text/html" });
        data.append('html_file', blob);
        data.append('repo_name', `gallery_site_${getRandomInt(0, 100)}`);
        console.log(data);
        const response = await fetch(adjustEndpointToEnvironment("/api/create_github_pages"),
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${githubToken}`,
            },
            body: data
          });
        setCreateGhPagesLoading(false);
        const responseJSON = await response.json();
        if (responseJSON?.url) {
          const url = responseJSON.url;
          setLink(url);
          setPingingSite(true);
          let counter = 0;
          let MAX_PING_COUNT = 20_000;
          const interval = setInterval(async () => {
            counter++;
            const siteResponse = await fetch(adjustEndpointToEnvironment(`/ping_site?url=${encodeURIComponent(url)}`));
            const siteResponseJson = await siteResponse.json();
            if (siteResponseJson.ok) {
              setPingingSite(false);
              clearInterval(interval);
              setPublished(true);
              alert(`Success! Your site is live at ${url}!`)
            }
            if (counter > MAX_PING_COUNT) {
              clearInterval(interval);
              setPingingSite(false);
              setPublished(true);
              alert("Site is unresponsive, please test the link in a few minutes.");
            }
          }, 500);
        }
      }}
    >Publish to GitHub Pages {createGhPagesLoading && <ClipLoader />}</button>
    {link && (
      pingingSite ? <p className="text-lg">Waiting for the site to go live, this usually takes a minute or two. <ClipLoader /></p>
        : <p className="text-lg"><span className="text-green-400">Success!</span> <a className="underline" href={link}>Here's a permalink to your gallery!</a></p>
    )}
  </div>
};

