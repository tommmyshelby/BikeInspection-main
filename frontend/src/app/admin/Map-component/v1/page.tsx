"use client";
import { useRef, useState, useEffect } from "react";
import "./page.css";
import styles from './ImageMapping.module.css'; // Import the CSS file
import React from 'react';


// Types
interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
  markerPosition?: { x: number; y: number };
}

// Add Marker interface
interface Marker {
  id: number;
  normalizedX: number;
  normalizedY: number;
  blinking: boolean;
  selected: boolean;
  partNumber?: number;
}

export default function ImageMapper() {
  // Data
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

  // State
  const [selectedView, setSelectedView] = useState<string>("LHS");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [mappedPartsByView, setMappedPartsByView] = useState<
    Record<string, Part[]>
  >({});
  const [mappingMode, setMappingMode] = useState<
    "initial" | "mapping" | "complete"
  >("initial");
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
  const [editingPart, setEditingPart] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [draggingMarkerId, setDraggingMarkerId] = useState<number | null>(null);

  // Refs
  const imageRef = useRef<HTMLImageElement>(null);

  // Derived state
  const filteredParts = parts.filter((part) => part.view === selectedView);
  const mappedPartsForCurrentView = mappedPartsByView[selectedView] || [];

  // Effects
  useEffect(() => {
    // Load saved mapping data from localStorage
    const savedData = localStorage.getItem("mappedPartsData");
    if (savedData) {
      setMappedPartsByView(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Save mapping data to localStorage when it changes
    localStorage.setItem("mappedPartsData", JSON.stringify(mappedPartsByView));
  }, [mappedPartsByView]);

  // Add canvas methods
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedMarker = markers.find(marker => {
      const markerX = marker.normalizedX * canvas.width;
      const markerY = marker.normalizedY * canvas.height;
      return Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2) < 10;
    });

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

  const handleMarkerSelect = (id: number) => {
    setMarkers(prev => 
      prev.map(marker => 
        marker.id === id 
          ? { ...marker, selected: true } 
          : { ...marker, selected: false }
      )
    );
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

  // Update handleImageUpload to maintain aspect ratio
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

        // Get container dimensions
        const container = canvas.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate aspect ratio
        const imageAspectRatio = img.width / img.height;
        const containerAspectRatio = containerWidth / containerHeight;

        // Set canvas dimensions to fit container while maintaining aspect ratio
        if (imageAspectRatio > containerAspectRatio) {
          canvas.width = containerWidth;
          canvas.height = containerWidth / imageAspectRatio;
        } else {
          canvas.height = containerHeight;
          canvas.width = containerHeight * imageAspectRatio;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas and draw the image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Clear existing markers
        setMarkers([]);
      };

      img.onerror = (error) => {
        console.error('Image loading error:', error);
      };
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
    };

    reader.readAsDataURL(file);
  };

  // Add animation effect
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

  // Handlers
  const startMapping = () => {
    setMappingMode("mapping");
    setCurrentPartIndex(0);
  };

  const toggleEditMode = (partNumber: number) => {
    if (editingPart === partNumber) {
      // Exit edit mode
      setEditingPart(null);

      // Find next unmapped part to continue mapping
      const mappedPartNumbers = mappedPartsForCurrentView.map(
        (part) => part.partNumber
      );
      const nextPartIndex = filteredParts.findIndex(
        (part) => !mappedPartNumbers.includes(part.partNumber)
      );

      if (nextPartIndex !== -1) {
        setCurrentPartIndex(nextPartIndex);
        setMappingMode("mapping");
      }
    } else {
      // Enter edit mode
      setEditingPart(partNumber);
      setMappingMode("complete");
    }
  };

  // Add resize handler
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

  // Add save marker data function
  const saveMarkerData = () => {
    const exportData = {
      originalWidth,
      originalHeight,
      markers: markers.map((marker) => ({
        id: marker.id,
        normalizedX: marker.normalizedX,
        normalizedY: marker.normalizedY,
        partNumber: marker.partNumber
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

  // Add reset markers function
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

  return (
    <div className="app-container">
      {/* View selection dropdown */}
      <div className="controls">
        <label>Select View:</label>
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
        >
          <option value="LHS">LHS</option>
          <option value="RHS">RHS</option>
        </select>
      </div>

      <div className="bike-mapper-grid">
        <div className="parts-list-sidebar">
          <div className="list-header">
            <span className="column-header">S.No</span>
            <span className="column-header">Part Name</span>
          </div>
          <div className="parts-list">
            {filteredParts.map((part, index) => {
              const isMapped = mappedPartsForCurrentView.some(
                (mappedPart) =>
                  mappedPart.partNumber === part.partNumber &&
                  mappedPart.markerPosition
              );

              const isEditing = editingPart === part.partNumber;

              return (
                <div key={index} className="parts-row">
                  <span className="parts-number">{part.partNumber}</span>
                  <span className="parts-name">{part.partName}</span>

                  {isMapped && (
                    <button
                      className="edit-button"
                      onClick={() => toggleEditMode(part.partNumber)}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Image mapping area */}
        <div className="image-area">
          {/* Add loading state indicator */}
          {!uploadedImage && (
            <div className="upload-placeholder">
              <p>Select Image to Map</p>
              <label htmlFor="file-input" className="upload-label">
                <input
                  type="file"
                  id="file-input"
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                Click to Upload
              </label>
            </div>
          )}

          {/* Only show canvas when image is loaded */}
          {uploadedImage && (
            <>
              <div className="mapping-notification-bar">
                {mappingMode === "initial" ? (
                  <div className="notification-content">
                    <span>
                      Ready to map your image. Click the button to begin.
                    </span>
                    <button
                      className="notification-action-button"
                      onClick={startMapping}
                    >
                      Start Mapping
                    </button>
                  </div>
                ) : mappingMode === "mapping" ? (
                  <div className="notification-content">
                    <span>
                      Select a part from the list and click on the image to
                      place a marker
                    </span>
                  </div>
                ) : editingPart ? (
                  <div className="notification-content">
                    <span>
                      Currently editing:{" "}
                      {
                        filteredParts.find(
                          (part) => part.partNumber === editingPart
                        )?.partName
                      }
                    </span>
                    <span>
                      Drag the marker to reposition or click "Done" when
                      finished
                    </span>
                  </div>
                ) : (
                  <div className="notification-content">
                    <span>
                      Mapping in progress. Select a part to edit or continue
                      mapping.
                    </span>
                  </div>
                )}
              </div>
              <div id="canvas-container" className={styles.canvasContainer}>
                <canvas
                  id="canvas"
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    background: "#fff",
                    cursor: draggingMarkerId ? "grabbing" : "pointer",
                  }}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
