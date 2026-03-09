import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">

      </div>

      <ul className="nav-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/translators">Find Translators</Link>
        </li>

        <li>
          <Link to="/my-requests">My Requests</Link>
        </li>
      </ul>

      <div className="search-box">
        <input type="text" placeholder="Search by name or keyword..." />
      </div>

      <div className="user">
        <img src="/avatar.png" alt="user" />
        <span>Zhang Wei</span>
      </div>

    </nav>
  );
}

export default Navbar;