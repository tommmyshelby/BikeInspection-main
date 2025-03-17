  "use client";
  import { useRouter } from "next/navigation";

  export default function HomePage() {
    const router = useRouter();

    return (
      <section className="home-container">
        {/* Hero Section */}
        <div className="hero">
          <h1>Welcome to the Bike Inspection System</h1>
          <p>Manage bike inspections efficiently with our streamlined process.</p>
        </div>


        
        {/* Action Cards */}
        <div className="card-container">
       
        <div className="home-card" onClick={() => router.push("/admin/parts-management")}>
            <h2>Create New Parts-Mapping List </h2>
            <p>Here you can create a new list of parts to be mapped and fetched while mapping</p>
          </div>

          {/* Upload New Bike */}
          <div className="home-card" onClick={() => router.push("/image-list-creation")}>
            <h2>Create Inspection Data</h2>
            <p>In this page you create session for inspection for a Entity which can have multiple Image-View and corresponding PartsList</p>
          </div>

          {/* Inspection & Mapping List */}
          <div className="home-card" onClick={() => router.push("/inspection")}>
            <h2>Inspection & Mapping List</h2>
            <p>View all bikes currently being mapped and in the pipeline.</p>
          </div>
        </div>
      </section>
    );
  }
