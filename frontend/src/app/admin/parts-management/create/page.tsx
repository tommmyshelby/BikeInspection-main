"use client";

import React, { useState, useEffect } from "react";
import PartsList from "@/components/PartsList";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

interface Part {
  partNumber: number;
  partName: string;
  checkPoints: string;
  _id?: string;
}

const CreatePartsTemplate = () => {
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [partCount, setPartCount] = useState(0);
  const [parts, setParts] = useState<Part[]>([]);
  const [showModal, setShowModal] = useState(true);
  const [importMode, setImportMode] = useState<"manual" | "csv">("manual");
  const [isEditMode, setIsEditMode] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const router = useRouter();

  // Check for template ID in URL
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setIsEditMode(true);
      setTemplateId(id);
      fetchTemplateData(id);
    }
  }, []);

  const fetchTemplateData = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/parts-template/${id}`
      );
      const data = await response.json();
      console.log(`This is whole parts data`, JSON.stringify(data, null, 2));
      setTemplateName(data.templateName);
      setTemplateCategory(data.templateCategory);
      const formattedParts = data.parts.map((part: any) => ({
        partNumber: part.partNumber,
        partName: part.partName,
        checkPoints: part.checkPoints,
        _id: part._id
      }));
      console.log(`This is parts data`, JSON.stringify(formattedParts, null, 2));
      setParts(formattedParts);
      setShowModal(false);
      // Set the templateId from the response data
      setTemplateId(data.templateId || data._id);
    } catch (error) {
      console.error("Failed to fetch template:", error);
    }
  };

  const handleManualStart = () => {
    setParts(
      Array.from({ length: partCount }, (_, index) => ({
        partNumber: index + 1,
        partName: "",
        checkPoints: "",
      }))
    );
    setShowModal(false);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Part[];
        setParts(
          rows.map((row, index) => ({
            partNumber: parseInt(row.partNumber as any) || index + 1,
            partName: row.partName || "",
            checkPoints: row.checkPoints || "",
          }))
        );
        setShowModal(false);
      },
    });
  };

  const saveTemplate = async (
    parts: Part[],
    status: "draft" | "completed"
  ) => {
    

    const payload = {
      templateName,
      templateCategory,
      parts , 
      status,
    };




    try {
      const response = await fetch("http://localhost:5000/parts-template", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(
          status === "draft"
            ? "Draft saved successfully!"
            : "Template saved successfully!"
        );
        router.push("/admin/parts-management");
      } else {
        console.error('Response status:', response.status);
        console.error('Response text:', await response.text());
        throw new Error("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  useEffect(() => {
    console.log("Parts state updated:", JSON.stringify(parts, null, 2));
  }, [parts]);

  useEffect(() => {
    if (parts.length > 0) {
      console.log("Passing parts to PartsList:", JSON.stringify(parts, null, 2));
    }
  }, [parts]);

  return (
    <div className="create-parts-template-page">
      {showModal && !isEditMode ? (
        <div className="create-parts-modal">
          <h2>
            {isEditMode ? "Edit Parts Template" : "Create New Parts Template"}
          </h2>
          <div className="modal-inputs">
            <input
              type="text"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Template Category (e.g., bike, car, etc.)"
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
            />
          </div>

          <div className="import-options">
            <button onClick={() => setImportMode("manual")}>
              Enter Number of Parts
            </button>
            <button onClick={() => setImportMode("csv")}>Import via CSV</button>
          </div>

          {importMode === "manual" && (
            <input
              type="number"
              placeholder="Number of Parts"
              onChange={(e) => setPartCount(parseInt(e.target.value) || 0)}
            />
          )}

          {importMode === "csv" && (
            <input type="file" accept=".csv" onChange={handleCSVUpload} />
          )}

          <button
            onClick={importMode === "manual" ? handleManualStart : undefined}
            disabled={
              !templateName ||
              !templateCategory ||
              (importMode === "manual" && partCount <= 0)
            }
          >
            Next
          </button>
        </div>
      ) : (
        <PartsList
          templateName={templateName}
          templateCategory={templateCategory}
          initialParts={parts}
          onSave={(parts, status) => saveTemplate(parts, status)}
          
        />
      )}
    </div>
  );
};

export default CreatePartsTemplate;
