"use client";
import "./image_mapping.css"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


// Define the interfaces for our data structure
interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
}


interface MappingData {
  [viewName: string]: {
    imageUrl: string;
    parts: Part[];
    groups?: number[]; // Optional since it's not in your data
  };
}

export default function ImageMappingPage() {
  const router = useRouter();
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  const [currentView, setCurrentView] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve the data from localStorage
    try {
      const storedData = localStorage.getItem("mappingData");
      if (storedData) {
        const parsedData = JSON.parse(storedData) as MappingData;
        setMappingData(parsedData);
        
        // Set the initial view to the first one in the list
        const firstView = Object.keys(parsedData)[0];
        if (firstView) {
          setCurrentView(firstView);
        }
      } else {
        setError("No mapping data found. Please configure views first.");
      }
    } catch (e) {
      setError("Error loading mapping data. Please try again.");
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Go back to configuration page
  const handleGoBack = () => {
    router.push("/admin/mapping"); // Adjust based on your actual route
  };

  // Get the current view data
  const getCurrentViewData = () => {
    if (!mappingData || !currentView) return undefined;
    return mappingData[currentView];
  };

  // Handle view change
  const handleViewChange = (viewName: string) => {
    setCurrentView(viewName);
  };

  // Handle part selection
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  
  const handlePartSelect = (partNumber: number) => {
    setSelectedPart(partNumber === selectedPart ? null : partNumber);
  };

  if (loading) {
    return (
      <div className="image-mapping-loading">
        <div className="loading-spinner"></div>
        <p>Loading mapping data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="image-mapping-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleGoBack} className="back-button">
          Go Back to Configuration
        </button>
      </div>
    );
  }

  if (!mappingData) {
    return (
      <div className="image-mapping-error">
        <h2>No Data Available</h2>
        <p>No mapping data was found. Please configure views first.</p>
        <button onClick={handleGoBack} className="back-button">
          Go Back to Configuration
        </button>
      </div>
    );
  }

  const currentViewData = getCurrentViewData();

  return (
    <div className="image-mapping-container">
      <div className="image-mapping-header">
        <h1>Motorcycle Part Mapping</h1>
        <div className="view-toggle-container">
          {mappingData && Object.keys(mappingData).map((viewName) => (
            <button
              key={viewName}
              className={`view-toggle-button ${currentView === viewName ? 'active' : ''}`}
              onClick={() => handleViewChange(viewName)}
            >
              {viewName} View
            </button>
          ))}
        </div>
        <button className="back-button" onClick={handleGoBack}>
          Back to Configuration
        </button>
      </div>

      <div className="image-mapping-content">
        <div className="image-mapping-sidebar">
          <div className="sidebar-header">
            <h2>{currentView} View Parts</h2>
            <div className="sidebar-stats">
              <span>{currentViewData?.parts.length || 0} Parts</span>
              <span>{
                currentViewData?.groups?.length || 
                new Set(currentViewData?.parts.map(part => part.Group)).size || 
                0
              } Groups</span>
            </div>
          </div>
          
          <div className="sidebar-part-list">
            {currentViewData?.parts.map((part) => (
              <div 
                key={part.partNumber}
                className={`sidebar-part-item ${selectedPart === part.partNumber ? 'selected' : ''}`}
                onClick={() => handlePartSelect(part.partNumber)}
              >
                <span className="part-number">#{part.partNumber}</span>
                <span className="part-name">{part.partName}</span>
                <span className="part-group">Group: {part.Group}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="image-mapping-workspace">
          <div className="image-container">
            {currentViewData && (
              <div className="image-overlay-container">
                <img 
                  src={currentViewData.imageUrl} 
                  alt={`${currentView} View`} 
                  className="mapping-image"
                />
                {/* Optional: Add overlay elements for part mapping here */}
                <div className="mapping-overlay">
                  {/* This is where you would add interactive mapping elements */}
                  {selectedPart && (
                    <div className="selected-part-indicator">
                      <p>Now mapping: Part #{selectedPart}</p>
                      <p>Click on the image to set position</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mapping-controls">
            <h3>Mapping Controls</h3>
            <p>Select a part from the sidebar and click on the image to map its position.</p>
            {selectedPart && (
              <div className="selected-part-info">
                <h4>Selected Part</h4>
                <p>
                  #{selectedPart} - {
                    currentViewData?.parts.find(p => p.partNumber === selectedPart)?.partName || 'Unknown Part'
                  }
                </p>
                <button className="clear-selection-button" onClick={() => setSelectedPart(null)}>
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}