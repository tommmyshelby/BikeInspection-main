"use client"
import React, { useRef, useState, useEffect } from 'react';
import styles from './ImageMapping.module.css'; // Import the CSS file

interface Marker {
  id: number;
  normalizedX: number;
  normalizedY: number;
  blinking: boolean;
  selected: boolean;
  partNumber?: number;
}
// Types
interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
  markerPosition?: { x: number; y: number };
}
const parts: Part[] = [
  { partNumber: 1, partName: "Front Disc Brake", view: "LHS", Group: 1 },
  { partNumber: 2, partName: "Front Tire", view: "LHS", Group: 1 },
  { partNumber: 3, partName: "Front Mudguard", view: "LHS", Group: 1 },
  { partNumber: 4, partName: "Front Suspension", view: "LHS", Group: 1 },
  { partNumber: 5, partName: "Left Handlebar", view: "LHS", Group: 2 },
  { partNumber: 6, partName: "Clutch Lever", view: "LHS", Group: 2 },
  { partNumber: 7, partName: "Gear Shifter", view: "LHS", Group: 3 },
  { partNumber: 8, partName: "Side Stand", view: "LHS", Group: 4 },
  { partNumber: 9, partName: "Left Foot Peg", view: "LHS", Group: 3 },
  { partNumber: 10, partName: "Rear Disc Brake", view: "LHS", Group: 5 },
  { partNumber: 11, partName: "Battery Compartment", view: "LHS", Group: 6 },

  { partNumber: 1, partName: "Front Brake Lever", view: "RHS", Group: 2 },
  { partNumber: 2, partName: "Right Handlebar", view: "RHS", Group: 2 },
  { partNumber: 3, partName: "Throttle Grip", view: "RHS", Group: 2 },
  { partNumber: 4, partName: "Exhaust Pipe", view: "RHS", Group: 6 },
  { partNumber: 5, partName: "Rear Brake Pedal", view: "RHS", Group: 3 },
  { partNumber: 6, partName: "Kick Starter", view: "RHS", Group: 3 },
  { partNumber: 7, partName: "Rear Suspension", view: "RHS", Group: 5 },
  { partNumber: 8, partName: "Rear Tire", view: "RHS", Group: 5 },
  { partNumber: 9, partName: "Rear Chain Sprocket", view: "RHS", Group: 3 },
  { partNumber: 10, partName: "Engine Block", view: "RHS", Group: 6 },
  { partNumber: 11, partName: "Oil Filter", view: "RHS", Group: 6 },
];


const ImageMapping: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [draggingMarkerId, setDraggingMarkerId] = useState<number | null>(null);

  // Load the image and initialize the canvas
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setUploadedImage(img);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Clear markers
        setMarkers([]);
      };
    };
    reader.readAsDataURL(file);
  };

  // Add useEffect for animation
  useEffect(() => {
    const animate = () => {
      if (uploadedImage && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

        markers.forEach((marker) => {
          const x = marker.normalizedX * canvas.width;
          const y = marker.normalizedY * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          
          // Handle selection color
          if (marker.selected) {
            ctx.fillStyle = 'yellow';
          } else if (marker.blinking) {
            const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 200);
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
          } else {
            ctx.fillStyle = 'red';
          }
          
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.stroke();

          // Draw part number if available
          if (marker.partNumber !== undefined) {
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText(`P${marker.partNumber}`, x + 8, y + 5);
          }
        });
      }
      setAnimationFrame(requestAnimationFrame(animate));
    };

    animationFrame && cancelAnimationFrame(animationFrame);
    setAnimationFrame(requestAnimationFrame(animate));

    return () => {
      animationFrame && cancelAnimationFrame(animationFrame);
    };
  }, [markers, uploadedImage, scale]);

  // Handle canvas click to add markers
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if we clicked on an existing marker
    const clickedMarker = markers.find(marker => {
      const markerX = marker.normalizedX * canvas.width;
      const markerY = marker.normalizedY * canvas.height;
      return Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2) < 10; // Increased radius
    });

    // If clicked on existing marker, just select it and return
    if (clickedMarker) {
      handleMarkerSelect(clickedMarker.id);
      return;
    }

    const normalizedX = x / canvas.width;
    const normalizedY = y / canvas.height;

    const newMarker: Marker = { 
      id: Date.now(), 
      normalizedX, 
      normalizedY,
      blinking: true,
      selected: false,
    };
    setMarkers((prev) => [...prev, newMarker]);
  };

  // Handle resizing the canvas
  const handleResize = (value: string) => {
    const newScale = parseInt(value) / 100;
    setScale(newScale);

    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize canvas
      canvas.width = originalWidth * newScale;
      canvas.height = originalHeight * newScale;

      // Redraw the image
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

      // Redraw markers
      markers.forEach((marker) => {
        const x = marker.normalizedX * canvas.width;
        const y = marker.normalizedY * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
      });
    }
  };

  // Save marker data as JSON
  const saveMarkerData = () => {
    const exportData = {
      originalWidth,
      originalHeight,
      markers: markers.map((marker) => ({
        id: marker.id,
        normalizedX: marker.normalizedX,
        normalizedY: marker.normalizedY,
      })),
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marker-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset markers
  const resetMarkers = () => {
    setMarkers([]);
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }
  };

 

  // Add useEffect to handle part sequencing
  useEffect(() => {
    if (markers.length > 0 && currentPartIndex < parts.length) {
      setMarkers(prev => prev.map((marker, i) => 
        i === prev.length - 1 ? { ...marker, partNumber: parts[currentPartIndex].partNumber } : marker
      ));
      setCurrentPartIndex(prev => prev + 1);
    }
  }, [markers]);

  // Add marker selection handler
  const handleMarkerSelect = (id: number) => {
    setMarkers(prev => 
      prev.map(marker => 
        marker.id === id 
          ? { ...marker, selected: true } 
          : { ...marker, selected: false }
      )
    );
  };

  // Add mouse handlers for drag and drop
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find if we clicked on a marker
    const clickedMarker = markers.find(marker => {
      const markerX = marker.normalizedX * canvas.width;
      const markerY = marker.normalizedY * canvas.height;
      return Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2) < 5;
    });

    if (clickedMarker) {
      setDraggingMarkerId(clickedMarker.id);
      handleMarkerSelect(clickedMarker.id);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage || !canvasRef.current || !draggingMarkerId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normalizedX = x / canvas.width;
    const normalizedY = y / canvas.height;

    setMarkers(prev => 
      prev.map(marker => 
        marker.id === draggingMarkerId 
          ? { ...marker, normalizedX, normalizedY } 
          : marker
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingMarkerId(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h2>Image Upload and Mapping POC</h2>
      
        
        <div id="canvas-container" className={styles.canvasContainer}>
          <canvas
            id="canvas"
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: '1px solid #ccc', background: '#fff', cursor: draggingMarkerId ? 'grabbing' : 'pointer' }}
          />
        </div>
        
        <div id="resizeControls">
          <label htmlFor="resizeSlider">Resize: </label>
          <input
            type="range"
            id="resizeSlider"
            min="25"
            max="100"
            defaultValue="100"
            onChange={(e) => handleResize(e.target.value)}
          />
          <span id="resizeValue">{scale * 100}%</span>
          <input type="file" id="imageLoader" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className={styles.controls}>
          <button
            id="saveBtn"
            className={styles.btn}
            onClick={saveMarkerData}
            disabled={markers.length === 0}
          >
            Save Marker Data
          </button>
          <button
            id="resetBtn"
            className={styles.btn}
            onClick={resetMarkers}
            disabled={markers.length === 0}
          >
            Reset Markers
          </button>
        </div>
      
      </div>
    </div>
  );
};

export default ImageMapping;