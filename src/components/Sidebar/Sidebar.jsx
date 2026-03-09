import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">Translator</h2>

      <nav>
        <Link to="/translator/dashboard">Dashboard</Link>
        <Link to="/translator/jobs">My Jobs</Link>
        <Link to="/translator/messages">Messages</Link>
        <Link to="/translator/profile">Profile</Link>
      </nav>

    </div>
  );
}

export default Sidebar;