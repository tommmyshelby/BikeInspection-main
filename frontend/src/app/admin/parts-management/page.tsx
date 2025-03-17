"use client";


import { useRouter } from "next/navigation";
import React from "react";

const AdminPartsDashboard = () => {

const router = useRouter();
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Parts List Management</h1>
        <p>
          Manage, create, and organize your parts list templates efficiently.
        </p>
      </header>

      <section className="dashboard-options">
        <div className="dashboard-card create-new">
          <h3>Create New Template</h3>
          <p>Start fresh by defining a new parts list for a bike model.</p>
          <button
            className="dashboard-btn"
            onClick={() => router.push("/admin/parts-management/create")}
          >
            Start New Template
          </button>
        </div>

        <div className="dashboard-card open-draft">
          <h3>Open Draft</h3>
          <p>
            Resume your saved work and continue editing from where you left off.
          </p>
          <button className="dashboard-btn"
          onClick={() => router.push("/admin/parts-management/drafts")}>View Drafts</button>
        </div>

        <div className="dashboard-card view-templates">
          <h3>View & Clone Existing</h3>
          <p>
            Browse finalized templates or clone an existing one to save time.
          </p>
          <button className="dashboard-btn">Browse Templates</button>
        </div>
      </section>
    </div>
  );
};

export default AdminPartsDashboard;
