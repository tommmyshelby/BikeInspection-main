"use client";

import { useRef, useState } from "react";
import "./page.css";

export default function CanvasMapping() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      drawImage(url);
    }
  };

  const drawImage = (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Set canvas size to match image size
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  return (
    <div className="container">
      <div className="panel">
       
        <div id="canvas-container" className="canvasContainer">
          <canvas id="canvas" ref={canvasRef} />
        </div>
        <input type="file" id="imageLoader" accept="image/*" onChange={handleImageUpload} />
      </div>
    </div>
  );
}
