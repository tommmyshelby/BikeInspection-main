"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PartMarker {
  id: number;
  x: number;
  y: number;
  name: string;
  value: string;
}

interface ExportData {
  markers: PartMarker[];
  imageUrl: string;                                                           
  imageWidth: string;
  imageHeight: number;
}

export default function BikePartMapper() {
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
      height: e.currentTarget.naturalHeight,
    });
  };
  const exportData= async()=>{
    if (!uploadedImage) {
        alert("No image found to export.");
        return;
      }
      try{
        const blob =await fetch(uploadedImage).then((res)=>res.blob());
        const formData = new FormData();
        formData.append("image",blob,`bike-mapping-${Date.now()}.png`) 

        const uploadResponse = await fetch("http://localhost:5000/mapping/upload-image",{
            method:"POST",
            body:formData,
        });
        const {imageUrl}= await uploadResponse.json();
        const mappingData ={
            markers,
            imageUrl,
            imageWidth:imageSize.width,
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


  }
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect(); //Getting position of img relative to viewport

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newMarker: PartMarker = {
      id: markers.length + 1,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      name: `Part ${markers.length + 1}`,
      value: "",
    };
    setMarkers([...markers, newMarker]);
  };
  const handleMarkerClick = (e: React.MouseEvent, markerId: number) => {
    e.stopPropagation(); // Prevents the click from reaching the image
    setSelectedMarkerId(markerId);
    console.log(selectedMarkerId);
  };

  const updateMarker = (id: number, updates: Partial<PartMarker>) => {
    setMarkers(
      markers.map((marker) =>
        marker.id === id ? { ...marker, ...updates } : marker
      )
    );
  };

  const removeMarker = (id: number) => {
    const filteredMarkers = markers.filter((marker) => marker.id !== id);
    const reindexedMarkers = filteredMarkers.map((marker, index) => ({
      ...marker,
      id: index + 1,
      name:
        marker.name === `Part ${marker.id}` ? `Part${index + 1}` : marker.name,
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
    return <div>Loading....</div>;
  }

  return (
    <div className="bike-mapper-container">
      <div className="header-container">
        <div>
          <h1 className="title">Bike Part Mapper</h1>
          <p className="subtitle">Click on the image to add numbered markers</p>
        </div>
        <div className="button-group">
          <button className="export-button" onClick={exportData}>Export Mapping</button>

          <button onClick={handleReset} className="reset-button">
            Reset & Upload New Image
          </button>
        </div>
      </div>

      <div className="bike-mapper-grid">
      <div className="parts-list">
          {markers.length === 0 ? (
            <p className="parts-list-empty">
              No parts marked yet. Click on the Bike parts to add markers and
              map them
            </p>
          ) : (
            <>
              <h2 className="title">Marked Parts</h2>
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className={`part-item ${
                    selectedMarkerId === marker.id ? "selected" : ""
                  }`}
                >
                  <div className="part-header">
                    <div
                      className={`part-number ${
                        selectedMarkerId === marker.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedMarkerId(marker.id)}
                    >
                      <span className="marker-label">{marker.id}</span>
                    </div>
                    <input
                      type="text"
                      value={marker.name}
                      onChange={(e) =>
                        updateMarker(marker.id, { name: e.target.value })
                      }
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
                      onChange={(e) =>
                        updateMarker(marker.id, { value: e.target.value })
                      }
                      className="part-value"
                      placeholder="Enter part value"
                    />
                    <div className="part-coordinates">
                      ({marker.x}%, {marker.y}%)
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="image-area" onClick={handleImageClick}>
          <img
            src={uploadedImage}
            alt="Uploaded Image"
            className="bike-image"
            onLoad={handleImageLoad}
          />
          {markers.map((marker) => (
            <button
              key={marker.id}
              className={`marker ${
                selectedMarkerId === marker.id ? "selected" : ""
              }`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={(e) => handleMarkerClick(e, marker.id)}
            >
              <span className="marker-label">{marker.id}</span>
              <div className="marker-tooltip">
                {marker.name} <br /> {marker.value}
              </div>
            </button>
          ))}
        </div>

       
      </div>
    </div>
  );
}
