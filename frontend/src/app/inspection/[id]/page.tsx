"use client";
import { useEffect, useState, useRef } from "react";
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

interface Mapping {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  markers: PartMarker[];
}

const InspectionPage = () => {
  const [mapping, setMapping] = useState<Mapping | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedMapping = localStorage.getItem("selectedMapping");
    if (storedMapping) {
      setMapping(JSON.parse(storedMapping));
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const handleStartInspection = () => {
    router.push("/inspection/inspection-workflow");
  };

  return (
    <div className="inspection-preview">
      <>
        <div className="inspection-container">
          <div>
            {mapping ? (
              <div className="image-area-start-inspection">
                <img
                  ref={imageRef}
                  src={mapping.imageUrl}
                  alt="Inspection"
                  onLoad={handleImageLoad}
                  className="bike-image"
                />

                {imageLoaded &&
                  mapping.markers.map((marker) => (
                    <button
                      key={marker.id}
                      className={`marker`}
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                        backgroundImage: marker.imageUrl
                          ? `url(${marker.imageUrl})`
                          : "none",
                        backgroundSize: "cover",
                      }}
                    >
                      <span className="marker-label">{marker.id}</span>
                      <div className="marker-tooltip">
                        { (
                          <>
                            {marker.name}
                            {marker.value && ` - ${marker.value}`}
                          </>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="parts-list-empty">
                <p>Loading...</p>
              </div>
            )}
          </div>
          <button className="upload-label" onClick={handleStartInspection}>
            Start Inspection
          </button>
        </div>
      </>
    </div>
  );
};

export default InspectionPage;
