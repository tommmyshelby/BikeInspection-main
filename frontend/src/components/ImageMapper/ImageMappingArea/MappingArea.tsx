"use client"
import"./mappingArea.css"
import { MapperAreaProps } from "@/types/interface";
import { Upload,PlayCircle} from "lucide-react";

export default function MappingArea({
    selectedView,
    imageUrls,
    uploadedImages,
    markers,
    handleImageUpload,
    handleCanvasClick,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseOut,
    draggingMarkerId,
    mappingMode,
    editingMarker,
    startMapping,
    exportMapping,
    handleZoomChange,
    scale,
    currentViewMarkers,
    canvasContainerRef,
    canvasRef,
    currentPartName
  }: MapperAreaProps){




    return(   
        <div className="mapperArea">
          {/* Status bar */}
          <div className="statusBar">
            <div className="statusIndicator">
              {mappingMode === "initial" ? (
                <>
                  <div className="statusDot"></div>
                  <span className="statusText">Ready to map</span>
                </>
              ) : mappingMode === "mapping" ? (
                <>
                  <div
                    className="statusDot statusDotMapping"
                  ></div>
                  <span className="statusText">
                    Mapping:{" "}
                    <span className="statusPartName">
                      {currentPartName}
                    </span>
                  </span>
                </>
              ) : editingMarker ? (
                <>
                  <div
                    className="statusDot statusDotMapping"
                  ></div>
                  <span className="statusText">
                    Editing:{" "}
                    <span className="statusPartName">
                      {
                        currentViewMarkers.find((m) => m.id === editingMarker)
                          ?.partName
                      }
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="statusDot statusDotComplete"
                  ></div>
                  <span className="statusText">Mapping complete</span>
                </>
              )}
            </div>

            {mappingMode === "initial" && imageUrls[selectedView] && (
              <button
                onClick={startMapping}
                className="startMappingButton slideUp"
              >
                <PlayCircle size={16} />
                Start Mapping
              </button>
            )}

            {mappingMode === "complete" && currentViewMarkers.length > 0 && (
              <button
                onClick={exportMapping}
                className="startMappingButton"
              >
                <Upload size={16} />
                Export Mapping
              </button>
            )}
          </div>

          {imageUrls[selectedView] && (
            <div className="resizeControls">
              <label htmlFor="zoomSlider">Zoom: </label>
              <input
                type="range"
                id="zoomSlider"
                min="100"
                max="500"
                value={scale * 100}
                onChange={handleZoomChange}
              />
              <span className="zoomValue">
                {Math.round(scale * 100)}%
              </span>
            </div>
          )}

          {/* Canvas container */}
          <div ref={canvasContainerRef} className="canvasContainer">
            {imageUrls[selectedView] ? (
              <canvas
                ref={canvasRef}
                className="canvas"
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseOut={handleCanvasMouseOut}
                style={{
                  cursor:
                    draggingMarkerId !== null
                      ? "grabbing"
                      : mappingMode === "mapping" || editingMarker !== null
                      ? "crosshair"
                      : "default",
                }}
              />
            ) : (
              <div className="uploadContainer">
                <Upload size={48} className="uploadIcon"/>
                <h3 className="uploadTitle">Upload an Image</h3>
                <p className="uploadText">
                  Select an image to begin mapping parts
                </p>
                <label className="uploadButton">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload size={16} />
                  Select Image
                </label>
              </div>
            )}
          </div>
        </div>
    )
}