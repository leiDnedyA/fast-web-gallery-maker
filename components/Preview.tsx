
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { UploadedFile } from '../lib/files';

interface Props {
  backgroundColor: string;
  imageFiles: UploadedFile[];
}

async function getImageDimensions(url: string): Promise<{ width: number, height: number }> {
  return new Promise((res, _) => {
    const image = new Image();
    image.onload = () => {
      res({ width: parseInt(`${image.width}`), height: parseInt(`${image.height}`) });
    };

    image.src = url;
  });
}

export default function Preview({ backgroundColor, imageFiles }: Props) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current === null) return;
    const renderer = new THREE.WebGLRenderer();
    const camera = new THREE.PerspectiveCamera(
      75,
      (mountRef as any)?.current?.clientWidth / (mountRef as any)?.current?.clientHeight,
      0.1,
      1000
    );
    let lastTime = Date.now();

    const keydownMap: { [key: string]: boolean } = {};
    const keydownHandler = (e: any) => {
      keydownMap[e.key] = true;
    }
    const keyupHandler = (e: any) => {
      keydownMap[e.key] = false;
    }
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);

    (async () => {
      const localRef = mountRef as any;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);

      renderer.setSize(
        localRef.current.clientWidth,
        localRef.current.clientHeight
      );
      localRef.current.appendChild(renderer.domElement);

      const GAP_ON_WALL = 1;

      for (let i = 0; i < imageFiles.length; i++) {
        const blobURL = URL.createObjectURL(imageFiles[i].file);
        const imageDimensions = await getImageDimensions(blobURL);
        const loader = new THREE.TextureLoader();
        loader.load(
          blobURL,
          (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(imageDimensions.width / imageDimensions.height, 1);
            const plane = new THREE.Mesh(geometry, material);
            scene.add(plane);

            plane.position.y = 0;
            if (i % 2 == 0) {
              plane.position.x = 2;
              plane.position.z = 2 -(Math.floor(i / 2) + (GAP_ON_WALL * Math.floor(i / 2)));
              plane.rotation.y = -(Math.PI / 2);
            } else {
              plane.position.x = -2;
              plane.position.z = 2 -(Math.floor(i / 2) + (GAP_ON_WALL * Math.floor(i / 2)));
              plane.rotation.y = Math.PI / 2;
            }
            renderer.render(scene, camera);

            URL.revokeObjectURL(blobURL);
          },
          undefined,
          (error) => {
            console.error('Error loading texture:', error);
          }
        );
      }

      camera.position.z = 5;

      // Animation Loop
      const animate = () => {
        requestAnimationFrame(animate);
        const deltaTime = Date.now() - lastTime;
        lastTime = Date.now();
        if (keydownMap?.["w"]) {
          camera.translateZ(-deltaTime / 300)
        }
        if (keydownMap?.["s"]) {
          camera.translateZ(deltaTime / 300)
        }
        if (keydownMap?.["d"]) {
          camera.translateX(deltaTime / 300)
        }
        if (keydownMap?.["a"]) {
          camera.translateX(-deltaTime / 300)
        }
        if (keydownMap?.["ArrowRight"]) {
          camera.rotation.y -= deltaTime / 600;
        }
        if (keydownMap?.["ArrowLeft"]) {
          camera.rotation.y += deltaTime / 600;
        }
        renderer.render(scene, camera);
      };
      animate();
    })();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);
      (mountRef as any)?.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="shadow-lg" ref={mountRef} style={{ width: '1000px', height: '1000px' }} />;
};

