// src/types/interfaces.ts

import { Dispatch, SetStateAction } from 'react';

// Marker interface
export interface Marker {
    id: number;
    normalizedX: number;
    normalizedY: number;
    partNumber: number;
    partName: string;
    blinking?: boolean;
    selected?: boolean;
  }
  
  // Part interface
  export interface Part {
    partNumber: number;
    partName: string;
    view: string;
    Group: number;
    markerPosition?: { x: number; y: number };
  }
  export interface headerProps {
    parts: Part[];
    imageUrls: Record<string, string>;
    selectedView: string;
    setSelectedView: Dispatch<SetStateAction<string>>;
    setEditingMarker: Dispatch<SetStateAction<number | null>>;
    openImagePreview: () => void;
  }
  // Props for the PartsSidebar component
  export interface PartsSidebarProps {
    parts: Part[];
    selectedView: string;
    markers: Record<string, Marker[]>;
    currentPartIndex: number;
    editingMarker: number | null;
    toggleEditMode: (partNumber: number) => void;
    resetMapping: () => void;
    mappingMode: "initial" | "mapping" | "complete";

  }
  
  // Props for the MapperArea component
  export interface MapperAreaProps {
    currentViewMarkers: Marker[];
    currentPartName:string;
    canvasContainerRef: React.RefObject<HTMLDivElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    selectedView: string;
    imageUrls: Record<string, string>;
    uploadedImages: Record<string, HTMLImageElement>;
    markers: Record<string, Marker[]>;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleCanvasMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    handleCanvasMouseUp: () => void;
    handleCanvasMouseOut: () => void;
    draggingMarkerId: number | null;
    mappingMode: "initial" | "mapping" | "complete";
    editingMarker: number | null;
    startMapping: () => void;
    exportMapping: () => void;
    handleZoomChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    scale: number;
  }