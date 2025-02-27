import Link from "next/link";
import "@/styles/globals.css";

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          Bike Inspection
        </Link>
        <ul className="nav-links">
          <li><Link href="/upload">Upload New</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
