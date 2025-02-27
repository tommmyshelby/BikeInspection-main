"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface PartMarker {
  id: number;
  x: number;
  y: number;
  name: string;
  value: "pending" | "ok" | "not_ok";
}

interface Mapping {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  markers: PartMarker[];
}

const InspectionWorkflowPage = () => {
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [inspectionData, setInspectionData] = useState<PartMarker[] | null>(
    null
  );
  const [selectedMarker, setSelectedMarker] = useState<PartMarker | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedMapping = localStorage.getItem("selectedMapping");
    if (storedMapping) {
      const parsedMapping = JSON.parse(storedMapping);
      setMapping(parsedMapping);

      const storedInspectionData = localStorage.getItem("inspectionData");
      if (storedInspectionData) {
        setInspectionData(JSON.parse(storedInspectionData));
      } else {
        const initialInspectionData = parsedMapping.markers.map(
          (marker: PartMarker) => ({
            ...marker,
            value: "pending",
          })
        );
        setInspectionData(initialInspectionData);
        localStorage.setItem(
          "inspectionData",
          JSON.stringify(initialInspectionData)
        );
      }
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMarkerClick = (marker: PartMarker) => {
    setSelectedMarker(marker);
  };

  const handleStatusChange = (
    markerId: number,
    value: "pending" | "ok" | "not_ok"
  ) => {
    if (!inspectionData) return;

    const updatedInspectionData = inspectionData.map((marker) =>
      marker.id === markerId ? { ...marker, value } : marker
    );

    setInspectionData(updatedInspectionData);
    localStorage.setItem(
      "inspectionData",
      JSON.stringify(updatedInspectionData)
    );

    if (selectedMarker && selectedMarker.id === markerId) {
      setSelectedMarker({ ...selectedMarker, value });
    }
  };

  const handleSaveInspection = () => {
    if (inspectionData) {
      localStorage.setItem(
        "completedInspection",
        JSON.stringify({
          date: new Date().toISOString(),
          data: inspectionData,
        })
      );
      alert("Inspection saved successfully!");
      router.push("/inspection/summary");
    }
  };

  return (
    <div className="inspection-workflow-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <h2>Inspection Checklist</h2>
        <div className="markers-list">
          {inspectionData &&
            inspectionData.map((marker) => (
              <div
                key={marker.id}
                className={`marker-item ${
                  selectedMarker?.id === marker.id ? "selected" : ""
                } ${marker.value}`}
                onClick={() => handleMarkerClick(marker)}
              >
                <div className="marker-header">
                  <span className="marker-id">{marker.id}.</span>
                  <span className="marker-name">{marker.name}</span>
                </div>
                <div className="status-controls">
                  <button
                    className={`status-btn pending ${
                      marker.value === "pending" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(marker.id, "pending");
                    }}
                  >
                    Pending
                  </button>
                  <button
                    className={`status-btn ok ${
                      marker.value === "ok" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(marker.id, "ok");
                    }}
                  >
                    OK
                  </button>
                  <button
                    className={`status-btn not-ok ${
                      marker.value === "not_ok" ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(marker.id, "not_ok");
                    }}
                  >
                    Not OK
                  </button>
                </div>
              </div>
            ))}
        </div>
        <button className="save-inspection-btn" onClick={handleSaveInspection}>
          Complete Inspection
        </button>
      </div>

      {/* Middle - Inspection Container */}
      <div className="inspection-container">
        <div>
          {mapping ? (
            <div className="image-area-inspection">
              <img
                ref={imageRef}
                src={mapping.imageUrl}
                alt="Inspection"
                onLoad={handleImageLoad}
                className="bike-image"
              />
              {imageLoaded &&
  inspectionData?.map((marker) => {
    const backgroundColor =
      marker.value === "ok"
        ? "green"
        : marker.value === "not_ok"
        ? "red"
        : marker.value === "pending"
        ? "yellow"
        : "gray";

    return (
      <button
        key={marker.id}
        className="marker"
        style={{
          left: `${marker.x}%`,
          top: `${marker.y}%`,
          backgroundColor, // This will now update immediately
          backgroundSize: "cover",
        }}
        onClick={() => handleMarkerClick(marker)}
      >
        <span className="marker-label">{marker.id}</span>
        <div className="marker-tooltip">
          {marker.name} {marker.value && ` - ${marker.value}`}
        </div>
      </button>
    );
  })}

            </div>
          ) : (
            <div className="parts-list-empty">
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <h2>Part Details</h2>
        {selectedMarker ? (
          <div className="marker-details">
            <h3>{selectedMarker.name}</h3>

            <div className="part-info">
              <p>
                <strong>ID:</strong> {selectedMarker.id}
              </p>
              {selectedMarker.value && (
                <p>
                  <strong>Value:</strong> {selectedMarker.value}
                </p>
              )}
              <p>
                <strong>Status:</strong>
                <span className={`status-label ${selectedMarker.value}`}>
                  {selectedMarker.value.replace("_", " ").toUpperCase()}
                </span>
              </p>
              <div className="status-change">
                <p>
                  <strong>Change Status:</strong>
                </p>
                <div className="status-buttons">
                  <button
                    className={`status-btn pending ${
                      selectedMarker.value === "pending" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedMarker.id, "pending")
                    }
                  >
                    Pending
                  </button>
                  <button
                    className={`status-btn ok ${
                      selectedMarker.value === "ok" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange(selectedMarker.id, "ok")}
                  >
                    OK
                  </button>
                  <button
                    className={`status-btn not-ok ${
                      selectedMarker.value === "not_ok" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(selectedMarker.id, "not_ok")
                    }
                  >
                    Not OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <p>Select a part marker to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionWorkflowPage;
