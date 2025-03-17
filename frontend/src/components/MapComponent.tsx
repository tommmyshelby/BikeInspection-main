import React from "react";

interface Part {
  partNumber: number;
  partName: string;
  view: string;
  Group: number;
}

interface MapComponentProps {
  parts: Part[];
}

const MapComponent: React.FC<MapComponentProps> = ({ parts }) => {
  return (
    <div>
      <h2>Mapping Parts</h2>
      <ul>
        {parts.map((part) => (
          <li key={part.partNumber}>
            {part.partName} (Group {part.Group})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapComponent;
