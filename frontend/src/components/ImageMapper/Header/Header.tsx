"use client"
import { headerProps } from "@/types/interface";
import "./header.css"

export default function Header({
    parts,
    selectedView,
    setSelectedView,
    setEditingMarker,
  
}:headerProps){

return( 
    <div className="mapperHeader">
        <h1 className="mapperTitle">Visual Part Mapper</h1>

        <div className="mapperControls">
        <div className="viewSelector">
            <label>View:</label>
            <select
              value={selectedView}
              onChange={(e) => {
                setSelectedView(e.target.value);
                setEditingMarker(null);
              }}
            >
              {Array.from(new Set(parts.map((part) => part.view))).map(
                (view) => (
                  <option key={view} value={view}>
                    {view}
                  </option>
                )
              )}
            </select>
           

          </div>
          </div>

    </div>
    
)
}