import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import logoImage from "../../assets/Logo.png";

import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  User,
  LogOut,
  Menu
} from "lucide-react";

import "./Sidebar.css";

const text = {
  en: {
    dashboard: "Dashboard",
    myJobs: "My Jobs",
    messages: "Messages",
    account: "ACCOUNT",
    profile: "Profile",
    signOut: "Sign Out",
    pageTitle: "Egypt Chinese Translation Platform | Translator"
  },
  zh: {
    dashboard: "控制面板",
    myJobs: "我的工作",
    messages: "消息",
    account: "账户",
    profile: "个人资料",
    signOut: "退出登录",
    pageTitle: "埃及华人翻译平台 | 翻译员"
  }
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [chatCount, setChatCount] = useState(0);

  const t = text[language];

  // Real-time chat count
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => setChatCount(snap.size));
    return unsub;
  }, [currentUser]);

  // Update page title when language changes
  useEffect(() => {
    document.title = t.pageTitle;
    document.documentElement.lang = language;
  }, [language, t.pageTitle]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => setIsOpen(false);

  const SidebarContent = () => (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logoImage} alt="logo" />
      </div>

      {/* Menu */}
      <div className="sidebar-menu">
        <Link
          to="/translator/dashboard"
          className={`menu-item ${isActive("/translator/dashboard") ? "active" : ""}`}
          onClick={closeSidebar}
        >
          <LayoutDashboard size={20} />
          <span>{t.dashboard}</span>
        </Link>

        <Link
          to="/translator/jobs"
          className={`menu-item ${isActive("/translator/jobs") ? "active" : ""}`}
          onClick={closeSidebar}
        >
          <Briefcase size={20} />
          <span>{t.myJobs}</span>
        </Link>

        <Link
          to="/translator/messages"
          className={`menu-item ${isActive("/translator/messages") ? "active" : ""}`}
          onClick={closeSidebar}
        >
          <MessageSquare size={20} />
          <span>{t.messages}</span>
          {chatCount > 0 && <div className="badge">{chatCount}</div>}
        </Link>

        <div className="menu-title">{t.account}</div>

        <Link
          to="/translator/profile"
          className={`menu-item ${isActive("/translator/profile") ? "active" : ""}`}
          onClick={closeSidebar}
        >
          <User size={20} />
          <span>{t.profile}</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="sidebar-footer" onClick={handleLogout}>
        <LogOut size={20} />
        <span>{t.signOut}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Burger Button for Mobile */}
      <button className="burger-btn" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? "open" : ""}`}>
        <SidebarContent />
      </div>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default Sidebar;