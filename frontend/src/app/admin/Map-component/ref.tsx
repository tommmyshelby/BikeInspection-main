"use client"
import { useRef, useState, useEffect } from "react"
import type React from "react"

import "./image-mapper.css"

interface Part {
  partNumber: number
  partName: string
  view: string
  Group: number
  markerPosition?: { x: number; y: number }
}

export default function ImageMapper() {
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
  ]

  const [selectedView, setSelectedView] = useState<string>("LHS")
  const [imageUrls, setImageUrls] = useState<{ [view: string]: string }>({})
  const [mappedParts, setMappedParts] = useState<Part[]>([])
  const [mappingMode, setMappingMode] = useState<"initial" | "mapping" | "complete">("initial")
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0)
  const [editingPart, setEditingPart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showOverlay, setShowOverlay] = useState(true)

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const markerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Load from localStorage on first render
  useEffect(() => {
    const savedData = localStorage.getItem("mappedPartsData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setMappedParts(parsedData)
      } catch (error) {
        console.error("Error parsing saved data:", error)
      }
    }
  }, [])

  // Save mapped parts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("mappedPartsData", JSON.stringify(mappedParts))
  }, [mappedParts])

  // Filter parts based on the selected view
  const filteredParts = parts.filter((part) => part.view === selectedView)

  // Start mapping when the button is clicked
  const startMapping = () => {
    setMappingMode("mapping")
    setCurrentPartIndex(0)
  }

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImageUrls((prev) => ({ ...prev, [selectedView]: imageUrl }))
      // Don't clear mapped parts when switching views
      setMappingMode("initial")
    }
  }

  // Get exact coordinates relative to the image
  const getImageCoordinates = (clientX: number, clientY: number) => {
    if (!imageRef.current) return { x: 0, y: 0 }

    const rect = imageRef.current.getBoundingClientRect()

    // Calculate the actual image dimensions (accounting for object-fit: contain)
    const imageAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight
    const containerAspectRatio = rect.width / rect.height

    let imageWidth, imageHeight, offsetX, offsetY

    if (imageAspectRatio > containerAspectRatio) {
      // Image is constrained by width
      imageWidth = rect.width
      imageHeight = rect.width / imageAspectRatio
      offsetX = 0
      offsetY = (rect.height - imageHeight) / 2
    } else {
      // Image is constrained by height
      imageHeight = rect.height
      imageWidth = rect.height * imageAspectRatio
      offsetX = (rect.width - imageWidth) / 2
      offsetY = 0
    }

    // Calculate position within the actual image area
    const x = clientX - rect.left - offsetX
    const y = clientY - rect.top - offsetY

    // Convert to percentage of the actual image dimensions
    const xPercent = (x / imageWidth) * 100
    const yPercent = (y / imageHeight) * 100

    // Ensure values are within bounds
    return {
      x: Math.max(0, Math.min(100, xPercent)),
      y: Math.max(0, Math.min(100, yPercent)),
    }
  }

  // Handle Image Click (Marker Placement)
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return // Don't place new markers if we're dragging
    if (mappingMode !== "mapping" || currentPartIndex >= filteredParts.length) return
    if (!imageRef.current) return

    const { x, y } = getImageCoordinates(event.clientX, event.clientY)

    const currentPart = filteredParts[currentPartIndex]

    // Find if this part already exists in mappedParts
    const existingPartIndex = mappedParts.findIndex(
      (p) => p.partNumber === currentPart.partNumber && p.view === selectedView,
    )

    const updatedParts = [...mappedParts]

    if (existingPartIndex >= 0) {
      // Update existing part
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex],
        markerPosition: { x, y },
      }
    } else {
      // Add new part
      updatedParts.push({
        ...currentPart,
        markerPosition: { x, y },
      })
    }

    setMappedParts(updatedParts)

    // Move to next part
    if (currentPartIndex < filteredParts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1)
    } else {
      setMappingMode("complete")
    }
  }

  // Handle marker drag start
  const handleMarkerDragStart = (event: React.DragEvent, partNumber: number) => {
    if (editingPart !== partNumber) return

    // Prevent default drag ghost image
    event.dataTransfer.setDragImage(new Image(), 0, 0)

    // Calculate offset within the marker for more accurate positioning
    const marker = event.currentTarget as HTMLElement
    const rect = marker.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2

    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)
  }

  // Handle marker drag
  const handleMarkerDrag = (event: React.DragEvent, partNumber: number) => {
    if (!editingPart || !imageRef.current || editingPart !== partNumber) return

    // Get the marker element
    const markerKey = `${selectedView}-${partNumber}`
    const markerElement = markerRefs.current[markerKey]
    if (!markerElement) return

    // Calculate position accounting for the drag offset
    const { x, y } = getImageCoordinates(event.clientX - dragOffset.x, event.clientY - dragOffset.y)

    // Update marker position visually during drag
    markerElement.style.left = `${x}%`
    markerElement.style.top = `${y}%`
  }

  // Handle marker drag end
  const handleMarkerDragEnd = (event: React.DragEvent, partNumber: number) => {
    if (!editingPart || !imageRef.current || editingPart !== partNumber) return

    // Calculate final position accounting for the drag offset
    const { x, y } = getImageCoordinates(event.clientX - dragOffset.x, event.clientY - dragOffset.y)

    // Update the mapped part with new position
    const updatedParts = mappedParts.map((part) => {
      if (part.partNumber === partNumber && part.view === selectedView) {
        return {
          ...part,
          markerPosition: { x, y },
        }
      }
      return part
    })

    setMappedParts(updatedParts)
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // Toggle edit mode for a marker
  const toggleEditMode = (partNumber: number) => {
    if (editingPart === partNumber) {
      setEditingPart(null)
    } else {
      setEditingPart(partNumber)
      setMappingMode("complete")
    }
  }

  // Get filtered mapped parts for current view
  const currentViewMappedParts = mappedParts.filter((part) => part.view === selectedView)

  return (
    <div className="app-container">
      <div className="controls">
        <label>Select View:</label>
        <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
          <option value="LHS">LHS</option>
          <option value="RHS">RHS</option>
        </select>

        <div className="toggle-overlay">
          <label>
            <input type="checkbox" checked={showOverlay} onChange={() => setShowOverlay(!showOverlay)} />
            Show Overlay
          </label>
        </div>

        {editingPart && (
          <div className="edit-mode-indicator">
            <span>Editing Part #{editingPart} - Drag to reposition</span>
            <button onClick={() => setEditingPart(null)}>Done</button>
          </div>
        )}
      </div>

      <div className="main-content">
        {/* Parts List Sidebar */}
        <div className="parts-list-sidebar">
          <div className="list-header">
            <span className="column-header">S.No</span>
            <span className="column-header">Part Name</span>
          </div>
          <div className="parts-list">
            {filteredParts.map((part, index) => {
              const isMapped = mappedParts.some(
                (mappedPart) =>
                  mappedPart.partNumber === part.partNumber &&
                  mappedPart.view === selectedView &&
                  mappedPart.markerPosition,
              )

              const isActive = currentPartIndex === index && mappingMode === "mapping"
              const isEditing = editingPart === part.partNumber

              return (
                <div
                  key={index}
                  className={`parts-row ${isActive ? "active" : ""} ${isMapped ? "mapped" : ""} ${isEditing ? "editing" : ""}`}
                  onClick={() => {
                    if (mappingMode === "complete") {
                      setCurrentPartIndex(index)
                      setMappingMode("mapping")
                    }
                  }}
                >
                  <span className="parts-number">{part.partNumber}</span>
                  <span className="parts-name">{part.partName}</span>

                  {/* Show Edit Button if the part is mapped */}
                  {isMapped && (
                    <button
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleEditMode(part.partNumber)
                      }}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Image Mapping Section */}
        <div className="image-area">
          <div className="image-container" onClick={handleImageClick} ref={containerRef}>
            {imageUrls[selectedView] ? (
              <>
                <img
                  ref={imageRef}
                  src={imageUrls[selectedView] || "/placeholder.svg"}
                  alt="Uploaded"
                  className="mapped-image"
                />

                {/* Semi-transparent overlay */}
                {showOverlay && <div className="image-overlay"></div>}

                {/* Render markers */}
                {currentViewMappedParts.map((part, index) => {
                  if (!part.markerPosition) return null

                  const isEditing = editingPart === part.partNumber
                  const markerKey = `${selectedView}-${part.partNumber}`

                  return (
                    <div
                      key={index}
                      ref={(el) => (markerRefs.current[markerKey] = el)}
                      className={`marker ${isEditing ? "editing" : ""}`}
                      style={{
                        left: `${part.markerPosition.x}%`,
                        top: `${part.markerPosition.y}%`,
                      }}
                      draggable={isEditing}
                      onDragStart={(e) => handleMarkerDragStart(e, part.partNumber)}
                      onDrag={(e) => handleMarkerDrag(e, part.partNumber)}
                      onDragEnd={(e) => handleMarkerDragEnd(e, part.partNumber)}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleEditMode(part.partNumber)
                      }}
                    >
                      <span className="marker-number">{part.partNumber}</span>
                      <div className="marker-tooltip">{part.partName}</div>
                    </div>
                  )
                })}

                {/* Mapping instructions */}
                {mappingMode === "mapping" && currentPartIndex < filteredParts.length && (
                  <div className="mapping-instructions">
                    <div className="instruction-content">
                      <span className="instruction-number">
                        {currentPartIndex + 1}/{filteredParts.length}
                      </span>
                      <span className="instruction-text">
                        Click to place: {filteredParts[currentPartIndex].partName}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">+</div>
                <p>Select Image to Map</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>

          {/* Show Start Mapping Button After Image Upload */}
          {imageUrls[selectedView] && mappingMode === "initial" && (
            <button className="start-mapping-button" onClick={startMapping}>
              Start Mapping
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

