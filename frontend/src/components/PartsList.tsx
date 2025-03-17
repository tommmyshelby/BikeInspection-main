"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { IconGripVertical } from "@tabler/icons-react";
import TextField from "@mui/material/TextField";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import { useRouter } from "next/navigation";

interface Part {
  partNumber: number;
  partName: string;
  checkPoints: string;
}

interface PartsListProps {
  templateName: string;
  templateCategory: string;
  initialParts: Part[];
  onSave: (parts: Part[], status: "draft" | "completed") => Promise<void>;
}

const PartsList = ({ templateName, templateCategory, initialParts, onSave }: PartsListProps) => {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    // When initial parts change (e.g., when editing existing template), update state
    setParts(initialParts);
  }, [initialParts]);

  const handleChange = (index: number, field: keyof Part, value: string) => {
    const updatedParts = [...parts];
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    setParts(updatedParts);
  };

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedParts = [...parts];
    const [movedPart] = reorderedParts.splice(source.index, 1);
    reorderedParts.splice(destination.index, 0, movedPart);

    setParts(reorderedParts.map((part, index) => ({ ...part, partNumber: index + 1 })));
  };

  const handleDelete = (index: number) => {
    const updatedParts = parts.filter((_, i) => i !== index);
    setParts(updatedParts.map((part, i) => ({ ...part, partNumber: i + 1 })));
  };

  const addNewRow = () => {
    setParts([
      ...parts,
      {
        partNumber: parts.length + 1,
        partName: "",
        checkPoints: "",
      },
    ]);
  };

  const savePartsList = async (status: "draft" | "completed") => {
    await onSave(parts, status);
  };

  return (
    <div className="parts-list-container">
      <h2 className="parts-list-title">
        Parts List for {templateName} ({templateCategory})
      </h2>

      <div className="parts-fixed-header">
        <span>Part #</span>
        <span>Part Name</span>
        <span>Check Points</span>
        <span>Action</span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="partsList">
          {(provided) => (
            <div className="parts-list-wrapper" {...provided.droppableProps} ref={provided.innerRef}>
              {parts.map((part, index) => (
                <Draggable key={`part-${index}`} draggableId={`part-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`parts-list-item ${snapshot.isDragging ? "dragging" : ""}`}
                    >
                      <div className="parts-list-number">{part.partNumber}</div>
                      <div className="parts-list-content">
                        <div {...provided.dragHandleProps} className="parts-list-drag-handle">
                          <IconGripVertical size={16} />
                        </div>
                        <TextField
                          size="small"
                          fullWidth
                          multiline
                          maxRows={4}
                          placeholder="Part Name"
                          value={part.partName}
                          onChange={(e) => handleChange(index, "partName", e.target.value)}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          multiline
                          maxRows={4}
                          placeholder="Check Points"
                          value={part.checkPoints}
                          onChange={(e) => handleChange(index, "checkPoints", e.target.value)}
                        />
                        <CancelPresentationIcon className="part-delete-icon" onClick={() => handleDelete(index)} />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="parts-list-actions">
        <button className="add-row-button" onClick={addNewRow}>
          <AddCircleOutlineSharpIcon /> Add New Row
        </button>
        <button className="save-draft-button" onClick={() => savePartsList("draft")}>
          📝 Save Draft
        </button>
        <button className="save-template-button" onClick={() => savePartsList("completed")}>
          💾 Save Template
        </button>
      </div>
    </div>
  );
};

export default PartsList;
