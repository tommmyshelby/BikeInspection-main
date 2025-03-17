"use client";
import { useRef, useState, useEffect } from "react";
import "./page.css";

// Types
interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
  markerPosition?: { x: number; y: number };
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

  // Handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create object URL and initialize mapping for this view
      setImageUrls((prev) => ({
        ...prev,
        [selectedView]: URL.createObjectURL(file),
      }));
      setMappedPartsByView((prev) => ({
        ...prev,
        [selectedView]: prev[selectedView] || [],
      }));
      setMappingMode("initial");
    }
  };

  const startMapping = () => {
    setMappingMode("mapping");
    setCurrentPartIndex(0);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (
      mappingMode !== "mapping" ||
      currentPartIndex >= filteredParts.length ||
      !imageRef.current
    )
      return;

    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();

    // Get the natural dimensions of the image
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Calculate the displayed dimensions of the image accounting for object-fit: contain
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = rect.width / rect.height;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container (relative to their aspect ratios)
      displayedWidth = rect.width;
      displayedHeight = rect.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (rect.height - displayedHeight) / 2;
    } else {
      // Image is taller than container (relative to their aspect ratios)
      displayedHeight = rect.height;
      displayedWidth = rect.height * imageAspectRatio;
      offsetX = (rect.width - displayedWidth) / 2;
      offsetY = 0;
    }

    // Calculate click position relative to the actual displayed image
    const clickX = event.clientX - rect.left - offsetX;
    const clickY = event.clientY - rect.top - offsetY;

    // Check if click is within the actual image boundaries
    if (
      clickX >= 0 &&
      clickX <= displayedWidth &&
      clickY >= 0 &&
      clickY <= displayedHeight
    ) {
      // Convert to percentage of the image
      const x = (clickX / displayedWidth) * 100;
      const y = (clickY / displayedHeight) * 100;

      // Update the mapped part with its position
      setMappedPartsByView((prev) => {
        const updatedParts = [...(prev[selectedView] || [])];
        const currentPart = filteredParts[currentPartIndex];

        const existingIndex = updatedParts.findIndex(
          (part) => part.partNumber === currentPart.partNumber
        );

        if (existingIndex !== -1) {
          updatedParts[existingIndex] = {
            ...updatedParts[existingIndex],
            markerPosition: { x, y },
          };
        } else {
          updatedParts.push({
            ...currentPart,
            markerPosition: { x, y },
          });
        }

        return { ...prev, [selectedView]: updatedParts };
      });

      // Move to next part or complete mapping
      setCurrentPartIndex((current) => current + 1);
      if (currentPartIndex >= filteredParts.length - 1) {
        setMappingMode("complete");
      }
    }
  };

  const handleMarkerDrag = (event: React.DragEvent, partNumber: number) => {
    event.stopPropagation();
    if (!imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    // Get the natural dimensions of the image
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Calculate the displayed dimensions of the image accounting for object-fit: contain
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = rect.width / rect.height;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container (relative to their aspect ratios)
      displayedWidth = rect.width;
      displayedHeight = rect.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (rect.height - displayedHeight) / 2;
    } else {
      // Image is taller than container (relative to their aspect ratios)
      displayedHeight = rect.height;
      displayedWidth = rect.height * imageAspectRatio;
      offsetX = (rect.width - displayedWidth) / 2;
      offsetY = 0;
    }

    // Calculate drag position relative to the actual displayed image
    const dragX = event.clientX - rect.left - offsetX;
    const dragY = event.clientY - rect.top - offsetY;

    // Convert to percentage of the image and constrain to image bounds
    const x = Math.max(0, Math.min(100, (dragX / displayedWidth) * 100));
    const y = Math.max(0, Math.min(100, (dragY / displayedHeight) * 100));

    setMappedPartsByView((prev) => ({
      ...prev,
      [selectedView]: prev[selectedView].map((part) =>
        part.partNumber === partNumber
          ? { ...part, markerPosition: { x, y } }
          : part
      ),
    }));
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
          {/* Parts list sidebar code remains unchanged */}
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
            {imageUrls[selectedView] ? (
              <>
                {/* Notification bar - first child of image-area */}
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
                          mappedPartsForCurrentView.find(
                            (part) => part.partNumber === editingPart
                          )?.partName
                        }
                      </span>
                      <span>
                        Drag the marker to reposition or click "Done" when
                        finished
                      </span>
                      <button
                        className="notification-action-button"
                        onClick={() => setEditingPart(null)}
                      >
                        Done
                      </button>
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

                {/* Image container wrapper - second child of image-area */}
                <div className="image-container">
               
                  <img
                    ref={imageRef}
                    src={imageUrls[selectedView]}
                    className="mapped-image"
                    alt="Uploaded"
                    onClick={handleImageClick}
                    onLoad={(e) => {
                      // Optionally track image dimensions when loaded
                      if (imageRef.current) {
                        const { naturalWidth, naturalHeight } =
                          imageRef.current;
                        console.log(
                          "Image dimensions:",
                          naturalWidth,
                          naturalHeight
                        );
                      }
                    }}
                  />
              
                  

                  {/* Markers container - overlays the image 
                  <div className="markers-container">
                    {mappedPartsForCurrentView.map((part, index) => {
                      if (!part.markerPosition) return null;

                      const isEditing = editingPart === part.partNumber;
                      return (
                        <button
                          key={index}
                          className={`marker ${isEditing ? "editing" : ""}`}
                          style={{
                            left: `${part.markerPosition.x}%`,
                            top: `${part.markerPosition.y}%`,
                          }}
                          draggable={isEditing}
                          onDragEnd={(e) =>
                            isEditing && handleMarkerDrag(e, part.partNumber)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEditMode(part.partNumber);
                          }}
                        >
                          {part.partNumber}
                        </button>
                      );
                    })}
                  </div>*/}
                </div>
              </>
            ) : (
              <div className="upload-placeholder">
                <p>Select Image to Map</p>
                <label htmlFor="file-input" className="upload-label">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="file-input"
                  />
                  Click to Upload
                </label>
              </div>
            )}
          </div>
 
      </div>
    </div>
  );
}
