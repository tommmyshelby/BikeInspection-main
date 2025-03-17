"use client";
import Header from "@/components/ImageMapper/Header/Header";
import PartsSidebar from "@/components/ImageMapper/PartsSidebar/PartsSidebar";
import { useEffect, useRef, useState } from "react";
import { Part, Marker } from "@/types/interface";
import MappingArea from "@/components/ImageMapper/ImageMappingArea/MappingArea";
import "./page.css";

export default function ImageMapper() {
  const parts: Part[] = [
    // Front View
    { partNumber: 1, partName: "Headlight", view: "Front", Group: 1 },
    { partNumber: 2, partName: "Front Disc Brake", view: "Front", Group: 1 },
    { partNumber: 3, partName: "Front Tire", view: "Front", Group: 1 },
    { partNumber: 4, partName: "Front Mudguard", view: "Front", Group: 1 },
    { partNumber: 5, partName: "Front Suspension", view: "Front", Group: 1 },

    // Rear View
    { partNumber: 1, partName: "Rear Tire", view: "Rear", Group: 5 },
    { partNumber: 2, partName: "Rear Disc Brake", view: "Rear", Group: 5 },
    { partNumber: 3, partName: "Taillight", view: "Rear", Group: 5 },
    { partNumber: 4, partName: "Rear Suspension", view: "Rear", Group: 5 },
    { partNumber: 5, partName: "Exhaust Pipe", view: "Rear", Group: 6 },

    // Left-Hand Side (LHS) View
    { partNumber: 1, partName: "Left Handlebar", view: "LHS", Group: 2 },
    { partNumber: 2, partName: "Clutch Lever", view: "LHS", Group: 2 },
    { partNumber: 3, partName: "Gear Shifter", view: "LHS", Group: 3 },
    { partNumber: 4, partName: "Side Stand", view: "LHS", Group: 4 },
    { partNumber: 5, partName: "Left Foot Peg", view: "LHS", Group: 3 },
    { partNumber: 6, partName: "Battery Compartment", view: "LHS", Group: 6 },

    // Right-Hand Side (RHS) View
    { partNumber: 1, partName: "Front Brake Lever", view: "RHS", Group: 2 },
    { partNumber: 2, partName: "Right Handlebar", view: "RHS", Group: 2 },
    { partNumber: 3, partName: "Throttle Grip", view: "RHS", Group: 2 },
    { partNumber: 4, partName: "Rear Brake Pedal", view: "RHS", Group: 3 },
    { partNumber: 5, partName: "Kick Starter", view: "RHS", Group: 3 },
    { partNumber: 6, partName: "Rear Chain Sprocket", view: "RHS", Group: 3 },
    { partNumber: 7, partName: "Engine Block", view: "RHS", Group: 6 },
    { partNumber: 8, partName: "Oil Filter", view: "RHS", Group: 6 },

    // Top View
    { partNumber: 1, partName: "Fuel Tank", view: "Top", Group: 1 },
    { partNumber: 2, partName: "Seat", view: "Top", Group: 1 },
    { partNumber: 3, partName: "Handlebars", view: "Top", Group: 2 },
    { partNumber: 4, partName: "Speedometer", view: "Top", Group: 2 },
  ];

  //states
  const [selectedView, setSelectedView] = useState<string>("LHS");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [markers, setMarkers] = useState<Record<string, Marker[]>>({});
  const [uploadedImages, setUploadedImages] = useState<
    Record<string, HTMLImageElement>
  >({});
  const [originalDimensions, setOriginalDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [mappingMode, setMappingMode] = useState<
    "initial" | "mapping" | "complete"
  >("initial");
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
  const [editingMarker, setEditingMarker] = useState<number | null>(null);
  const [draggingMarkerId, setDraggingMarkerId] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isImagePreview, setIsImagePreview] = useState<boolean>(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [imageRect, setImageRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Derived state
  const filteredParts = parts.filter((part) => part.view === selectedView);
  const currentViewMarkers = markers[selectedView] || [];
  const currentPartName =
    currentPartIndex < filteredParts.length
      ? filteredParts[currentPartIndex].partName
      : "";

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapperContainerRef = useRef<HTMLDivElement>(null);
  const imagePreviewRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    setIsLoaded(true);

    // Load saved mapping data from localStorage
    const savedData = localStorage.getItem("mappedMarkerData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setMarkers(data.markers || {});
        setImageUrls(data.imageUrls || {});
        setOriginalDimensions(data.originalDimensions || {});

        // Reload any saved images
        Object.entries(data.imageUrls || {}).forEach(([view, url]) => {
          const img = new Image();
          img.src = url as string;
          img.onload = () => {
            setUploadedImages((prev) => ({
              ...prev,
              [view]: img,
            }));
          };
        });
      } catch (e) {
        console.error("Error loading saved mapping data:", e);
      }
    }

    // Handle window resize
    const handleResize = () => {
      updateCanvasDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Save mapping data to localStorage when it changes
    if (Object.keys(markers).length > 0) {
      const saveData = {
        markers,
        imageUrls,
        originalDimensions,
      };
      localStorage.setItem("mappedMarkerData", JSON.stringify(saveData));
    }
  }, [markers, imageUrls, originalDimensions]);

  useEffect(() => {
    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && isImagePreview) {
        setIsImagePreview(false);
      }
      // Reset canvas dimensions after fullscreen change
      setTimeout(updateCanvasDimensions, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isImagePreview]);

  useEffect(() => {
    // Handle ESC key for image preview
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isImagePreview) {
        setIsImagePreview(false);
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImagePreview]);

  useEffect(() => {
    // Update canvas dimensions when view or image changes
    updateCanvasDimensions();
  }, [selectedView, uploadedImages, scale]);

  // Clean up animation frame on unmount
  useEffect(() => {
    renderCanvas();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    selectedView,
    uploadedImages,
    markers,
    scale,
    editingMarker,
    imageRect,
    canvasDimensions,
  ]);

  // Preview canvas render
  useEffect(() => {
    if (
      isImagePreview &&
      previewCanvasRef.current &&
      uploadedImages[selectedView]
    ) {
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get original dimensions
      const imgWidth = originalDimensions[selectedView]?.width || 0;
      const imgHeight = originalDimensions[selectedView]?.height || 0;

      // Get container dimensions
      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || window.innerWidth;
      const containerHeight = container?.clientHeight || window.innerHeight;

      // Calculate scale to fit image within container
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgWidth;
      const previewScale = Math.min(scaleX, scaleY, 1); // Don't upscale beyond 100%

      // Set canvas to fit within container
      canvas.width = imgWidth * previewScale;
      canvas.height = imgHeight * previewScale;

      // Draw the image scaled to fit
      ctx.drawImage(
        uploadedImages[selectedView],
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Draw markers at their normalized positions
      currentViewMarkers.forEach((marker) => {
        const x = marker.normalizedX * canvas.width;
        const y = marker.normalizedY * canvas.height;

        // Draw marker circle
        ctx.beginPath();
        ctx.arc(x, y, 20 * previewScale, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff453a";
        ctx.fill();
        ctx.lineWidth = 3 * previewScale;
        ctx.strokeStyle = "white";
        ctx.stroke();

        // Draw part number
        ctx.fillStyle = "white";
        ctx.font = `bold ${14 * previewScale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(marker.partNumber.toString(), x, y);

        // Draw part name tooltip
        const tooltipPadding = 8 * previewScale;
        const tooltipBorderRadius = 4 * previewScale;
        const tooltipText = marker.partName;
        ctx.font = `${12 * previewScale}px Arial`;

        // Measure text for tooltip sizing
        const textMetrics = ctx.measureText(tooltipText);
        const tooltipWidth = textMetrics.width + tooltipPadding * 2;
        const tooltipHeight = 20 * previewScale;

        // Position tooltip above marker
        const tooltipX = x - tooltipWidth / 2;
        const tooltipY = y - 40 * previewScale;

        // Draw tooltip background
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(
          tooltipX,
          tooltipY,
          tooltipWidth,
          tooltipHeight,
          tooltipBorderRadius
        );
        ctx.fill();

        // Draw part name in tooltip
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(tooltipText, x, tooltipY + tooltipHeight / 2);
      });
    }
  }, [
    isImagePreview,
    selectedView,
    uploadedImages,
    currentViewMarkers,
    originalDimensions,
  ]);

  // Handlers
  const updateCanvasDimensions = () => {
    if (
      !uploadedImages[selectedView] ||
      !canvasRef.current ||
      !canvasContainerRef.current
    )
      return;

    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;

    const imgWidth = originalDimensions[selectedView]?.width || 0;
    const imgHeight = originalDimensions[selectedView]?.height || 0;

    if (imgWidth === 0 || imgHeight === 0) return;

    // Calculate scaled dimensions maintaining aspect ratio
    let scaledWidth = imgWidth * scale;
    let scaledHeight = imgHeight * scale;

    // Set canvas dimensions to match the scaled image size
    const canvas = canvasRef.current;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Store image rectangle (now full canvas size)
    setImageRect({
      x: 0,
      y: 0,
      width: scaledWidth,
      height: scaledHeight,
    });

    setCanvasDimensions({
      width: scaledWidth,
      height: scaledHeight,
    });

    // Force redraw
    renderCanvas();
  };

  const renderCanvas = () => {
    if (!uploadedImages[selectedView] || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Enable image smoothing only for scaling down
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (checkerboard pattern for transparency)
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image at full canvas size with crisp scaling
    ctx.save();
    ctx.scale(1, 1); // Ensure no fractional scaling
    ctx.drawImage(
      uploadedImages[selectedView],
      0,
      0,
      Math.floor(canvas.width),
      Math.floor(canvas.height)
    );
    ctx.restore();

    // Remove the semi-transparent gray overlay as it reduces clarity
    ctx.fillStyle = "rgba(96, 92, 92, 0.39)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw markers
    currentViewMarkers.forEach((marker) => {
      // Calculate actual position based on normalized coordinates
      const markerX = Math.floor(marker.normalizedX * canvas.width);
      const markerY = Math.floor(marker.normalizedY * canvas.height);

      // Draw marker circle
      ctx.beginPath();
      ctx.arc(markerX, markerY, 20, 0, 2 * Math.PI);

      // Handle different marker states
      if (marker.id === editingMarker) {
        ctx.fillStyle = "#FFD700"; // Amber for editing
      } else if (marker) {
        ctx.fillStyle = `#6fc018`; // Green for normal markers
      } else {
        ctx.fillStyle = "#ff453a"; // Regular red
      }

      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.stroke();

      // Draw part number text with crisp rendering
      ctx.save();
      ctx.translate(markerX, markerY);
      ctx.scale(1, 1);
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(marker.partNumber.toString(), 0, 0);
      ctx.restore();
    });

    // Continue animation
    animationRef.current = requestAnimationFrame(renderCanvas);
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        // Create and load the image
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          // Store the image URL and original dimensions
          setImageUrls((prev) => ({
            ...prev,
            [selectedView]: dataUrl,
          }));

          setOriginalDimensions((prev) => ({
            ...prev,
            [selectedView]: {
              width: img.width,
              height: img.height,
            },
          }));

          setUploadedImages((prev) => ({
            ...prev,
            [selectedView]: img,
          }));

          setMarkers((prev) => ({
            ...prev,
            [selectedView]: prev[selectedView] || [],
          }));

          setMappingMode("initial");

          // Canvas size will be updated in useEffect
          setTimeout(updateCanvasDimensions, 100);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const startMapping = () => {
    setMappingMode("mapping");
    setCurrentPartIndex(0);
  };

  const calculateClickPosition = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate click position relative to canvas
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const { x, y, width, height } = imageRect;

    // Check if click is within the image boundaries
    if (
      clickX >= x &&
      clickX <= x + width &&
      clickY >= y &&
      clickY <= y + height
    ) {
      // Calculate normalized coordinates (0-1) relative to the image
      const normalizedX = (clickX - x) / width;
      const normalizedY = (clickY - y) / height;

      return { normalizedX, normalizedY, canvasX: clickX, canvasY: clickY };
    }

    return null;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      (mappingMode !== "mapping" && editingMarker === null) ||
      currentPartIndex >= filteredParts.length ||
      !canvasRef.current ||
      !uploadedImages[selectedView]
    ){
      return;}

    // Check if we clicked on an existing marker
    const clickedMarker = getMarkerAtPosition(event);

    // If clicked on existing marker, select it for editing
    if (clickedMarker && mappingMode !== "mapping") {
      setEditingMarker(clickedMarker.id);

      return;
    }

    // Get click position
    const position = calculateClickPosition(event);

    if (!position) {
      return;
    }

    const { normalizedX, normalizedY } = position;

    if (editingMarker !== null) {
      // If editing, update the marker position
      setMarkers((prev) => ({
        ...prev,
        [selectedView]: prev[selectedView].map((marker) =>
          marker.id === editingMarker
            ? { ...marker, normalizedX, normalizedY }
            : marker
        ),
      }));

      const editedMarker = currentViewMarkers.find(
        (m) => m.id === editingMarker
      );
    } else {
      // Update or add a new marker
      const currentPart = filteredParts[currentPartIndex];
      const newMarkerId = Date.now();

      setMarkers((prev) => {
        const updatedMarkers = [...(prev[selectedView] || [])];

        // Check if marker for this part already exists
        const existingIndex = updatedMarkers.findIndex(
          (marker) => marker.partNumber === currentPart.partNumber
        );

        if (existingIndex !== -1) {
          // Update existing marker
          updatedMarkers[existingIndex] = {
            ...updatedMarkers[existingIndex],
            normalizedX,
            normalizedY,
          };
        } else {
          // Add new marker
          updatedMarkers.push({
            id: newMarkerId,
            normalizedX,
            normalizedY,
            partNumber: currentPart.partNumber,
            partName: currentPart.partName,
            blinking: true,
          });
        }

        return { ...prev, [selectedView]: updatedMarkers };
      });

      // Move to next part or complete mapping
      if (currentPartIndex < filteredParts.length - 1) {
        setCurrentPartIndex((prev) => {
          const next = prev + 1;

          return next;
        });
      } else {
        setMappingMode("complete");
      }
    }
  };

  const getMarkerAtPosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !uploadedImages[selectedView]) return null;

    const clickPos = calculateClickPosition(event);
    if (!clickPos) return null;

    const { canvasX, canvasY } = clickPos;
    const { x, y, width, height } = imageRect;

    // Find if we clicked on a marker
    return currentViewMarkers.find((marker) => {
      const markerX = x + marker.normalizedX * width;
      const markerY = y + marker.normalizedY * height;
      const distance = Math.sqrt(
        Math.pow(canvasX - markerX, 2) + Math.pow(canvasY - markerY, 2)
      );
      return distance < 14; // Use marker radius for hit testing
    });
  };

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!canvasRef.current || !uploadedImages[selectedView]) return;

    // Find if we clicked on a marker
    const clickedMarker = getMarkerAtPosition(event);

    if (clickedMarker) {
      setDraggingMarkerId(clickedMarker.id);
      setEditingMarker(clickedMarker.id);

      // Set cursor style
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grabbing";
      }

      event.preventDefault();
    }
  };

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!canvasRef.current || draggingMarkerId === null) return;

    const position = calculateClickPosition(event);
    if (!position) return;

    const { normalizedX, normalizedY } = position;

    // Update marker position
    setMarkers((prev) => ({
      ...prev,
      [selectedView]: prev[selectedView].map((marker) =>
        marker.id === draggingMarkerId
          ? { ...marker, normalizedX, normalizedY }
          : marker
      ),
    }));

    event.preventDefault();
  };

  const handleCanvasMouseUp = () => {
    if (draggingMarkerId && canvasRef.current) {
      // Reset cursor
      canvasRef.current.style.cursor = "default";

      // Find the dragged marker
      const draggedMarker = currentViewMarkers.find(
        (m) => m.id === draggingMarkerId
      );
      if (draggedMarker) {
      }
    }

    setDraggingMarkerId(null);
  };

  const handleCanvasMouseOut = () => {
    if (draggingMarkerId !== null) {
      handleCanvasMouseUp();
    }
  };

  const toggleEditMode = (partNumber: number) => {
    // Find marker with this part number
    const markerToEdit = currentViewMarkers.find(
      (m) => m.partNumber === partNumber
    );

    if (!markerToEdit) {
      return;
    }

    if (editingMarker === markerToEdit.id) {
      // Exit edit mode
      setEditingMarker(null);

      // Find next unmapped part to continue mapping
      const mappedPartNumbers = currentViewMarkers.map(
        (marker) => marker.partNumber
      );
      const nextPartIndex = filteredParts.findIndex(
        (part) => !mappedPartNumbers.includes(part.partNumber)
      );

      if (nextPartIndex !== -1) {
        setCurrentPartIndex(nextPartIndex);
        setMappingMode("mapping");
      } else {
        setMappingMode("complete");
      }
    } else {
      // Enter edit mode
      setEditingMarker(markerToEdit.id);
      setMappingMode("complete");
    }
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseInt(event.target.value) / 100;
    setScale(newScale);
    // Canvas dimensions will be updated in useEffect
  };



  const resetMapping = () => {
    setMarkers((prev) => ({
      ...prev,
      [selectedView]: [],
    }));
    setMappingMode("initial");
    setCurrentPartIndex(0);
    setEditingMarker(null);
  };

  const openImagePreview = () => {
    if (!imageUrls[selectedView]) return;

    setIsImagePreview(true);

    // Use a small timeout to ensure the preview container is in the DOM
    setTimeout(() => {
      if (imagePreviewRef.current) {
        imagePreviewRef.current.requestFullscreen().catch((err) => {
          setIsImagePreview(false);
        });
      }
    }, 100);
  };

  const exportMapping = () => {
    // Convert markers to the original Part[] format for compatibility
    const exportData: Record<string, Part[]> = {};

    Object.entries(markers).forEach(([view, viewMarkers]) => {
      exportData[view] = viewMarkers.map((marker) => ({
        partNumber: marker.partNumber,
        partName: marker.partName,
        view,
        Group:
          filteredParts.find((p) => p.partNumber === marker.partNumber)
            ?.Group || 0,
        markerPosition: {
          x: marker.normalizedX * 100, // Convert to percentage (0-100)
          y: marker.normalizedY * 100,
        },
      }));
    });

    // Create and download JSON file
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "part-mapping.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Header 
      parts={parts}
      imageUrls={imageUrls}
      selectedView={selectedView}
      setSelectedView={setSelectedView}
      setEditingMarker={setEditingMarker}
      openImagePreview={openImagePreview}/>
      <div ref={mapperContainerRef} className="imageMapper fullscreen">
        <div className="contentContainer">
          <PartsSidebar
            parts={parts}
            selectedView={selectedView}
            markers={markers}
            currentPartIndex={currentPartIndex}
            editingMarker={editingMarker}
            toggleEditMode={toggleEditMode}
            mappingMode={mappingMode}
            resetMapping={resetMapping}
          />

          <MappingArea
            currentViewMarkers={currentViewMarkers}
            currentPartName={currentPartName}
            canvasContainerRef={canvasContainerRef}
            canvasRef={canvasRef}
            selectedView={selectedView}
            imageUrls={imageUrls}
            uploadedImages={uploadedImages}
            markers={markers}
            handleImageUpload={handleImageUpload}
            handleCanvasClick={handleCanvasClick}
            handleCanvasMouseDown={handleCanvasMouseDown}
            handleCanvasMouseMove={handleCanvasMouseMove}
            handleCanvasMouseUp={handleCanvasMouseUp}
            handleCanvasMouseOut={handleCanvasMouseOut}
            draggingMarkerId={draggingMarkerId}
            mappingMode={mappingMode}
            editingMarker={editingMarker}
            startMapping={startMapping}
            exportMapping={exportMapping}
            handleZoomChange={handleZoomChange}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
}
