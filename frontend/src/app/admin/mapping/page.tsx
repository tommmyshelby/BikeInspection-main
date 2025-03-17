"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./mapping.css";

interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
}

interface GridConfig {
  id: number;
  selectedView: string;
  imageUrl: string;
  file?: File;
}

export default function BikePartMapper() {
  const router = useRouter();

  // Dummy data from template in a real app,this would come from an API
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
    { partNumber: 11, partName: "Oil Filter", view: "RHS", Group: 6 }
  
  ]

  const allViews = Array.from(new Set(parts.map((part) => part.view)));

  const [grids, setGrids] = useState<GridConfig[]>(() => {
    //Initialize one grid per available view
    return allViews.map((view, index) => ({
      id: index,
      selectedView: view,
      imageUrl: "",
    }));
  });

  // Track which views are already assigned to grids
  const [assignedViews, setAssignedViews] = useState<Record<string, boolean>>(
    {}
  );

  // State for error messages and UI feedback
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Update assigned views whenever grids change
  useEffect(() => {
    const newAssignedViews: Record<string, boolean> = {};
    grids.forEach((grid) => {
      if (grid.selectedView) {
        newAssignedViews[grid.selectedView] = true;
      }
    });
    setAssignedViews(newAssignedViews);
    setError("");
  }, [grids]);

  const handleImageChange = (
    gridId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size is too large. Maximum allowed size is 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setGrids((prevGrids) =>
        prevGrids.map((grid) =>
          grid.id === gridId ? { ...grid, imageUrl, file } : grid
        )
      );

      // Clear any existing errors
      setError("");

      // Show success message
      setSuccessMessage("Image successfully uploaded!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Handle view selection for a specific grid
  const handleViewChange = (
    gridId: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSelectedView = event.target.value;

    setGrids((prevGrids) =>
      prevGrids.map((grid) =>
        grid.id === gridId ? { ...grid, selectedView: newSelectedView } : grid
      )
    );
  };

  // Add a new grid only if there are unassigned views
  const addGrid = () => {
    const unassignedViews = allViews.filter((view) => !assignedViews[view]);

    // Only allow adding a grid if there are unassigned views
    if (unassignedViews.length === 0) {
      setError(
        "Cannot add more grids. All available views are already assigned."
      );
      return;
    }

    setGrids((prevGrids) => [
      ...prevGrids,
      {
        id:
          prevGrids.length > 0
            ? Math.max(...prevGrids.map((grid) => grid.id)) + 1
            : 0,
        selectedView: unassignedViews[0], //select the first unassigned view
        imageUrl: "",
      },
    ]);
    setSuccessMessage("New grid added successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Remove a grid
  const removeGrid = (gridId: number) => {
    if (grids.length <= 1) {
      setError("Cannot remove the last grid. At least one grid is required.");
      return;
    }
    setGrids((prevGrids) => prevGrids.filter((grid) => grid.id !== gridId));
    setSuccessMessage("Grid removed successfully!");
    setTimeout(() => setSuccessMessage(""), 3000); //update messages to maybe toast later
  };

  // Get parts for a specific view
  const getPartsForView = (view: string) => {
    return parts.filter((part) => part.view === view);
  };

  // Get group counts for a specific view
  const getGroupsForView = (view: string) => {
    const groups = new Set(
      parts.filter((part) => part.view === view).map((part) => part.Group)
    );
    return groups.size;
  };


  
  // Check if all views are covered by at least one grid
  const allViewsCovered = allViews.every((view) => assignedViews[view]);
  const maxGridsReached = grids.length >= allViews.length;

  // New state for mapping data
  const [mappingData, setMappingData] = useState<{
    [view: string]: {
      imageUrl: string;
      parts: Part[];
    };
  } | null>(null);

  // Check if all grids are complete
  const allGridsComplete = grids.every(
    (grid) => grid.selectedView && grid.imageUrl
  );

  // Handle start mapping
  const handleStartMapping = () => {
    if (!allGridsComplete) {
      setError("Please complete all grids (select views and upload images) before starting mapping.");
      return;
    }

    // Create mapping data structure
    const newMappingData = grids.reduce((acc, grid) => {
      if (grid.selectedView && grid.imageUrl) {
        acc[grid.selectedView] = {
          imageUrl: grid.imageUrl,
          parts: getPartsForView(grid.selectedView),
        };
      }
      return acc;
    }, {} as { [view: string]: { imageUrl: string; parts: Part[] } });

    // Save to state and localStorage
    setMappingData(newMappingData);
    localStorage.setItem("mappingData", JSON.stringify(newMappingData));
    setSuccessMessage("Mapping started successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    router.push("mapping/image-mapping")
  };

  return (
    
    <div className="container">
      <div className="header">
        <h1 className="title">Motorcycle Part Configuration</h1>
        <p className="description">
          Configure each view and upload reference images to begin mapping
          parts.
        </p>
      </div>

      {/* Error and success messages */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Progress indicator */}
      <div className="progress-bar">
        <div className="progress-text">
          {allViewsCovered
            ? "✅ All views configured"
            : `Configuration progress: ${Object.keys(assignedViews).length}/${
                allViews.length
              } views`}
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${
                (Object.keys(assignedViews).length / allViews.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="grids-container">
        {grids.map((grid) => (
          <div key={grid.id} className="view-container">
            <div className="view-header">
              <h3 className="view-title">
                {grid.selectedView
                  ? `${grid.selectedView} View`
                  : "Select a View"}
              </h3>
              <button
                className="remove-button"
                onClick={() => removeGrid(grid.id)}
                aria-label="Remove grid"
                title="Remove this grid"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* Image Selection */}
            <div className="image-section">
              <label className="image-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(grid.id, e)}
                  hidden
                />
                <div
                  className={`image-placeholder ${
                    grid.imageUrl ? "has-image" : ""
                  }`}
                >
                  {grid.imageUrl ? (
                    <img
                      src={grid.imageUrl}
                      alt={`${grid.selectedView} View`}
                      className="preview-image"
                    />
                  ) : (
                    <>
                      <svg
                        className="upload-icon"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      >
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      <span>Upload Image</span>
                    </>
                  )}
                </div>
              </label>

              {grid.imageUrl && (
                <button
                  className="clear-image-button"
                  onClick={() =>
                    setGrids((prevGrids) =>
                      prevGrids.map((g) =>
                        g.id === grid.id
                          ? { ...g, imageUrl: "", file: undefined }
                          : g
                      )
                    )
                  }
                  aria-label="Clear image"
                  title="Remove this image"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid-details">
              {/* View Selection Dropdown */}
              <div className="view-info">
                <label
                  className="view-label"
                  htmlFor={`view-select-${grid.id}`}
                >
                  View Type
                </label>
                <select
                  id={`view-select-${grid.id}`}
                  className="view-select"
                  value={grid.selectedView}
                  onChange={(e) => handleViewChange(grid.id, e)}
                >
                  <option value="" disabled>
                    Select a View
                  </option>
                  {allViews.map((viewOption) => (
                    <option
                      key={viewOption}
                      value={viewOption}
                      disabled={
                        assignedViews[viewOption] &&
                        grid.selectedView !== viewOption
                      }
                    >
                      {viewOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parts info */}
              {grid.selectedView && (
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="stat-label">Parts:</span>
                    <span className="stat-value">
                      {getPartsForView(grid.selectedView).length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Groups:</span>
                    <span className="stat-value">
                      {getGroupsForView(grid.selectedView)}
                    </span>
                  </div>
                </div>
              )}

             
            </div>
          </div>
        ))}
      </div>

      {/* Move the actions container to the bottom and modify it */}
      <div className="actions-container">
        <button
          className={`add-grid-button ${maxGridsReached ? "disabled" : ""}`}
          onClick={addGrid}
          disabled={maxGridsReached}
        >
          {maxGridsReached ? "Maximum Grids Added" : "Add View Grid"}
        </button>

        <button
          className={`start-mapping-button ${!allGridsComplete ? "disabled" : ""}`}
          onClick={handleStartMapping}
          disabled={!allGridsComplete}
        >
          Start Mapping
        </button>

        {maxGridsReached && (
          <p className="max-grids-message">
            You've reached the maximum number of grids based on available views.
          </p>
        )}
      </div>
    </div>
  );
}
