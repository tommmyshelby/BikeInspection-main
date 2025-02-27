"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Mapping {
  _id: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  markers: { id: number; x: number; y: number; name: string }[];
}

export default function InspectionPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  console.log(mappings)

  useEffect(() => {
    fetch("http://localhost:5000/mapping/all")
      .then((res) => res.json())
      .then((data) => {
        setMappings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="inspection-container">
      <div className="hero">
        <h1>Inspection & Mapping List</h1>
        <p>View all bikes currently being mapped and in the pipeline.</p>
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : mappings.length === 0 ? (
        <p className="empty">No mappings available.</p>
      ) : (
        <div className="grid-container">
          {mappings.map((mapping) => (
            <div
              key={mapping._id}
              className="card"
              onClick={() => {
                localStorage.setItem("selectedMapping", JSON.stringify(mapping));
                router.push(`/inspection/${mapping._id}`);
              }}
            >
              <div className="image-wrapper">
                <img
                  src={mapping.imageUrl}
                  alt="Bike Mapping"
                  className="preview-image"
                  onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                />
              </div>
              <div className="card-content">
                <h3>Mapping ID: {mapping._id}</h3>
                <p>{mapping.markers.length} parts mapped</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
