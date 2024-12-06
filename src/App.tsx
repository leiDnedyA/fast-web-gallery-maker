import { useEffect, useState } from "react";
import './App.css'
import UploadScreen from "../components/UploadScreen";
import { UploadedFile } from "../lib/files";
import ConfigScreen from "../components/ConfigScreen";
import Preview from "../components/Preview";
import PublishScreen from "../components/PublishScreen";

function clearQueryParams() {
  const url = new URL(window.location.href);

  // Remove all query parameters
  url.search = '';

  // Update the URL without reloading the page
  window.history.replaceState({}, '', url);
}

async function getGithubUsername(token: string): Promise<string | null> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gh_username`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const responseJSON = await response.json();
  return responseJSON?.github_username;
}

function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [galleryName, setGalleryName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [githubToken, setGithubToken] = useState<string | null>(localStorage.getItem('githubToken'));
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const queryParams = new URLSearchParams(window.location.search);
  const githubTokenCode = queryParams.get("code");

  function signOutFromGitHub() {
    localStorage.removeItem('githubToken');
    setGithubUsername(null);
    setGithubToken(null);
    clearQueryParams()
  }

  useEffect(() => {
    if (!githubToken) {
      (async () => {
        if (githubTokenCode && import.meta.env.VITE_BACKEND_URL) {
          console.log(githubTokenCode)
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gh_token?code=${githubTokenCode}`);
          if (!response.ok) {
            alert("Failed to authenticate with GitHub.")
            clearQueryParams();
            return;
          }
          const responseJSON = await response.json();
          if (responseJSON?.access_token) {
            localStorage.setItem('githubToken', responseJSON.access_token);
            setGithubUsername(await getGithubUsername(responseJSON.access_token));
            setGithubToken(responseJSON.access_token)
          }
          clearQueryParams();
          window.location.href = "https://github.com/apps/fastgallery3d/installations/new"
        }
      })();
    } else {
      (async () => {
        try {
          setGithubUsername(await getGithubUsername(githubToken));
        } catch (err) {
          signOutFromGitHub(); // if the token is expired, this will trigger becasue fetching the username will fail
        }
      })();
    }
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 items-center text-slate-300">

      <h1 className="mt-10 font-extrabold">Fast Web Gallery Maker</h1>
      <p className="text-lg">Create and host an online 3D gallery of your artwork with nothing but a GitHub account!</p>
      {
        (!githubToken && import.meta.env.VITE_BACKEND_URL) ? <button
          className="bg-purple-800 font-bold"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth`
          }}
        >Connect Your GitHub Account</button> : <p>Signed in with GitHub as <span className="font-bold">{githubUsername}</span>.
          {' '}
          <a
            href="#"
            onClick={(e: any) => {
              e.preventDefault();
              signOutFromGitHub();
            }}
          >Sign Out</a></p>
      }
      {
        stepIndex === 0 ?
          <UploadScreen files={files} setFiles={setFiles} /> :
          stepIndex === 1 ?
            <ConfigScreen
              galleryName={galleryName}
              setGalleryName={setGalleryName}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
            /> :
            (stepIndex === 2 || !githubToken || !githubUsername) ?
              <Preview imageFiles={files} backgroundColor={backgroundColor} /> :
              <PublishScreen imageFiles={files} backgroundColor={backgroundColor} githubToken={githubToken} githubUsername={githubUsername} />
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
            (stepIndex === 1 && (galleryName.length === 0)) ||
            (stepIndex === 2 && (!githubUsername)) ||
            stepIndex === 3
          }
          onClick={() => { setStepIndex((i: number) => i + 1) }}
        >Next Step</button >
      </div>
    </div>
  )
}

export default App
