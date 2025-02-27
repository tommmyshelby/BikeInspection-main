// BikePartMapper.tsx
"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PartMarker {
  id: number;
  x: number;
  y: number;
  name: string;
  value: string;
  imageUrl?: string;
  tooltipContent?: string;
}

interface ExportData {
  markers: PartMarker[];
  imageData: string;
  imageWidth: number;
  imageHeight: number;
}

const BikePartMapper = () => {
  const [markers, setMarkers] = useState<PartMarker[]>(() => {
    const saved = localStorage.getItem("bikeMarkers");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const router = useRouter();

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (!savedImage) {
      router.push("/");
      return;
    }
    setUploadedImage(savedImage);
  }, [router]);

  useEffect(() => {
    localStorage.setItem("bikeMarkers", JSON.stringify(markers));
  }, [markers]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageSize({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight
    });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker: PartMarker = {
      id: markers.length + 1,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      name: `Part ${markers.length + 1}`,
      value: "",
      imageUrl: "",
      tooltipContent: ""
    };
    
    setMarkers([...markers, newMarker]);
  };

  const exportData = async () => {
    if (!uploadedImage) {
      alert("No image found to export.");
      return;
    }
  
    try {
      // Convert Base64 to Blob
      const blob = await fetch(uploadedImage).then((res) => res.blob());
      const formData = new FormData();
      formData.append("image", blob, `bike-mapping-${Date.now()}.png`);
  
      // Upload the image first
      const uploadResponse = await fetch("http://localhost:5000/mapping/upload-image", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        alert("Failed to upload image.");
        return;
      }
  
      const { imageUrl } = await uploadResponse.json(); // Get the uploaded image URL
  
      // Now send the mapping data along with the image URL
      const mappingData = {
        markers,
        imageUrl, // Store the URL instead of base64
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
      };
  
      const saveResponse = await fetch("http://localhost:5000/mapping/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappingData),
      });
  
      if (saveResponse.ok) {
        alert("Mapping data saved successfully!");
      } else {
        alert("Failed to save mapping data.");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data.");
    }
  };
  
  

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData: ExportData = JSON.parse(event.target?.result as string);
        setMarkers(importedData.markers);
        setUploadedImage(importedData.imageData);
        setImageSize({
          width: importedData.imageWidth,
          height: importedData.imageHeight
        });
        localStorage.setItem("uploadedImage", importedData.imageData);
        localStorage.setItem("bikeMarkers", JSON.stringify(importedData.markers));
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Invalid import file format");
      }
    };
    reader.readAsText(file);
  };

  const updateMarker = (id: number, updates: Partial<PartMarker>) => {
    setMarkers(
      markers.map((marker) =>
        marker.id === id ? { ...marker, ...updates } : marker
      )
    );
  };

  const removeMarker = (id: number) => {
    const filteredMarkers = markers.filter(m => m.id !== id);
    const reindexedMarkers = filteredMarkers.map((marker, index) => ({
      ...marker,
      id: index + 1,
      name: marker.name === `Part ${marker.id}` ? `Part ${index + 1}` : marker.name
    }));
    setMarkers(reindexedMarkers);
    setSelectedMarkerId(null);
  };

  const handleReset = () => {
    setMarkers([]);
    localStorage.removeItem("bikeMarkers");
    localStorage.removeItem("uploadedImage");
    router.push("/");
  };

  if (!uploadedImage) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bike-mapper-container">
      <div className="header-container">
        <div>
          <h1 className="title">Bike Part Mapper</h1>
          <p className="subtitle">Click on the image to add numbered markers</p>
        </div>
        <div className="button-group">
          <button onClick={exportData} className="export-button">
            Export Mapping
          </button>
          <label className="import-button">
            Import Mapping
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleReset} className="reset-button">
            Reset & Upload New Image
          </button>
        </div>
      </div>
      
      <div className="bike-mapper-grid">
        <div className="image-area">
          <div className="image-container" onClick={handleImageClick}>
            <img
              src={uploadedImage}
              alt="Uploaded Bike"
              className="bike-image"
              onLoad={handleImageLoad}
            />
            {markers.map((marker) => (
              <button
                key={marker.id}
                className={`marker ${selectedMarkerId === marker.id ? 'selected' : ''}`}
                style={{ 
                  left: `${marker.x}%`, 
                  top: `${marker.y}%`,
                  backgroundImage: marker.imageUrl ? `url(${marker.imageUrl})` : 'none',
                  backgroundSize: 'cover'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarkerId(marker.id);
                }}
              >
                <span className="marker-label">{marker.id}</span>
                <div className="marker-tooltip">
                  {marker.tooltipContent || (
                    <>
                      {marker.name}
                      {marker.value && <> - {marker.value}</>}
                      <div>x: {marker.x}%, y: {marker.y}%</div>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="parts-list">
          {markers.length === 0 ? (
            <p className="parts-list-empty">
              No parts marked yet. Click on the image to add markers.
            </p>
          ) : (
            <>
              <h2 className="title">Marked Parts</h2>
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className={`part-item ${selectedMarkerId === marker.id ? 'selected' : ''}`}
                >
                  <div className="part-header">
                    <div
                      className={`part-number ${selectedMarkerId === marker.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMarkerId(marker.id)}
                    >
                      <span className="marker-label">{marker.id}</span>
                    </div>
                    <input
                      type="text"
                      value={marker.name}
                      onChange={(e) => updateMarker(marker.id, { name: e.target.value })}
                      className="part-input"
                      placeholder="Enter part name"
                    />
                    <button
                      onClick={() => removeMarker(marker.id)}
                      className="part-remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="part-details">
                    <input
                      type="text"
                      value={marker.value}
                      onChange={(e) => updateMarker(marker.id, { value: e.target.value })}
                      className="part-value"
                      placeholder="Enter part value"
                    />
                    <div className="part-coordinates">
                      ({marker.x}%, {marker.y}%)
                    </div>
                  </div>
                  <div className="part-details">
                    <input
                      type="text"
                      value={marker.imageUrl || ''}
                      onChange={(e) => updateMarker(marker.id, { imageUrl: e.target.value })}
                      className="part-value"
                      placeholder="Marker image URL (optional)"
                    />
                  </div>
                  <div className="part-details">
                    <input
                      type="text"
                      value={marker.tooltipContent || ''}
                      onChange={(e) => updateMarker(marker.id, { tooltipContent: e.target.value })}
                      className="part-value"
                      placeholder="Custom tooltip content (optional)"
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BikePartMapper;