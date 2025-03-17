"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Part {
  partNumber: number;
  partName: string;
  checkPoints: string;
}

interface Draft {
  _id: string;
  templateId: string;
  templateName: string;
  templateCategory: string;
  status: string;
  parts: Part[];
  createdAt: string;
  version: number;
}

const DraftsPage = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/parts-template/drafts")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched drafts:", data);
        const sortedDrafts = data.sort(
          (a: Draft, b: Draft) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setDrafts(sortedDrafts);
      })
      .catch((err) => {
        console.error("Failed to fetch drafts:", err);
      });
  }, []);

  const openDraft = (draft: Draft) => {
    console.log("Opening draft:", draft);
    if (!draft._id) {
      console.error("Draft ID is undefined:", draft);
      return;
    }
    router.push(`/admin/parts-management/create/${draft.templateId}`);
  };

  return (
    <div className="drafts-page">
      <header className="drafts-header">
        <h1>Saved Drafts</h1>
        <p>
          Manage your saved drafts and continue editing whenever you're ready.
        </p>
      </header>

      <div className="drafts-list">
        {drafts.length === 0 ? (
          <p className="no-drafts">No drafts available.</p>
        ) : (
          drafts.map((draft) => (
            <div key={draft._id} className="draft-card">
              <div className="draft-info">
                <h3>{draft.templateName}</h3>
                <p>
                  Category: <strong>{draft.templateCategory}</strong>
                </p>
                <p>Created on: {new Date(draft.createdAt).toLocaleString()}</p>
              </div>
              <div className="draft-actions">
                <button
                  className="open-draft-btn"
                  onClick={() => openDraft(draft)}
                >
                  Continue Editing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DraftsPage;
