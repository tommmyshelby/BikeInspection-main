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
          {/* Upload New Bike */}
          <div className="home-card" onClick={() => router.push("/upload")}>
            <h2>Upload New Bike</h2>
            <p>Select and upload bike images for mapping.</p>
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
