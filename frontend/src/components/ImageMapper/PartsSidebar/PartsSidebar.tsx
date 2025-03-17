"use client";

import { PartsSidebarProps } from "@/types/interface";
import { X, CheckCircle,
    Edit } from "lucide-react";
import "./partsSidebar.css";

export default function   PartsSidebar({
  parts,
  selectedView,
  markers,
  currentPartIndex,
  editingMarker,
  toggleEditMode,
  resetMapping,
  mappingMode
}: PartsSidebarProps) {
  const filteredParts = parts.filter((part) => part.view === selectedView);
  const currentViewMarkers = markers[selectedView] || [];

  return (
    <div className="partsSidebar">
      <div className="sidebarHeader">
        <h2 className="sidebarTitle">Parts List</h2>
        {currentViewMarkers.length > 0 && (
          <button onClick={resetMapping} className="resetButton">
            <X size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="partsGridHeader">
        <span>#</span>
        <span>Part Name</span>
        <span>Status</span>
      </div>

      <div className="partsList">
        {filteredParts.map((part, index) => {
          const isMapped = currentViewMarkers.some(
            (marker) => marker.partNumber === part.partNumber
          );

          const isEditing =
            editingMarker !== null &&
            currentViewMarkers.find((m) => m.id === editingMarker)
              ?.partNumber === part.partNumber;

          const isCurrentPart =
            currentPartIndex === index && mappingMode === "mapping";

          return (
            <div
              key={index}
              className={`partItem ${isCurrentPart ? "partItemCurrent" : ""} ${
                isEditing ? "partItemEditing" : ""
              }`}
            >
              <span className="partNumber">{part.partNumber}</span>
              <span className="partName">{part.partName}</span>
              <div className="partStatus">
                {isMapped ? (
                  <button
                    className={` "statusBadge" ${
                      isEditing ? "statusBadgeEditing" : "statusBadgeEdit"
                    }`}
                    onClick={() => toggleEditMode(part.partNumber)}
                  >
                    {isEditing ? (
                      <>
                        <CheckCircle size={12} />
                        Done
                      </>
                    ) : (
                      <>
                        <Edit size={12} />
                        Edit
                      </>
                    )}
                  </button>
                ) : (
                  <span className={"statusBadge statusBadgeUnmapped"}>
                    {isCurrentPart ? "Mapping..." : "Unmapped"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
