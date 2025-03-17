"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PartsList from "@/components/PartsList";

interface Part {

  partNumber: number;
  partName: string;
  checkPoints: string;

}

interface Draft {
  
  templateId:string;
  templateName: string;
  templateCategory: string;
  parts: Part[];
  status: string;

}

const CreateTemplatePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`http://localhost:5000/parts-template/${id}`);
        if (!res.ok) throw new Error("Failed to fetch draft data");
        const data = await res.json();
        const cleanedParts = data.parts.map(({ _id, ...rest }: any) => rest);
        console.log(`${cleanedParts}`);
        console.log(data)
        setDraft({...data,parts:cleanedParts});
      } catch (error) {
        console.error("Error fetching draft:", error);
        alert("Failed to load draft. Please try again.");
        router.push("/admin/parts-management");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDraft();
  }, [id, router]);

  const handleSave = async (parts: Part[], status: "draft" | "completed") => {
    if (!draft) return;
  


    const payload = {
      templateName: draft.templateName,
      templateCategory: draft.templateCategory,
      parts,
      status
    };

    try {
      const response = await fetch(`http://localhost:5000/parts-template/${draft.templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(status === "draft" ? "Draft saved successfully!" : "Template saved successfully!");
        router.push("/admin/parts-management");
      } else {
        console.error("Error response:", await response.text());
        alert("Failed to save template. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save template. Please check your connection.");
    }
  };

  if (loading) return <p>Loading draft...</p>;
  if (!draft) return <p>Draft not found.</p>;

  return (
    <PartsList
      templateName={draft.templateName}
      templateCategory={draft.templateCategory}
      initialParts={draft.parts}
      onSave={handleSave}
    />
  );
};

export default CreateTemplatePage;
