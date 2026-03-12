import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import avatarImage from "../../assets/pngwing.com.png";
import languageIcon from "../../assets/language-svgrepo-com.svg";

import "../Sidebar/Sidebar.css";

const text = {
  en: {
    dashboardTitle: "Translator Dashboard",
    dashboardSubtitle: "Manage your requests and earnings overview",
    role: "Translator"
  },
  zh: {
    dashboardTitle: "翻译员控制面板",
    dashboardSubtitle: "管理您的请求和收入概览",
    role: "翻译员"
  }
};

function TranslatorLayout() {
  const [showLang, setShowLang] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { currentUser, userData } = useAuth();

  const handleChangeLanguage = (lang) => {
    changeLanguage(lang);
    setShowLang(false);
  };

  const t = text[language];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main main-content">
        {/* TOP BAR */}
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h3>{t.dashboardTitle}</h3>
            <p>{t.dashboardSubtitle}</p>
          </div>

          <div className="topbar-right">
            {/* Language */}
            <div className="topbar-language">
              <img
                src={languageIcon}
                alt="language"
                className="topbar-language-icon"
                onClick={() => setShowLang(!showLang)}
              />

              {showLang && (
                <div className="language-dropdown">
                  <div className="language-item" onClick={() => handleChangeLanguage("en")}>
                    <img
                      src="https://flagcdn.com/16x12/gb.png"
                      srcSet="https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x"
                      width="16"
                      height="12"
                      alt="United Kingdom"
                      className="language-flag"
                    />
                    <span className="language-flag-emoji" aria-hidden="true">🇬🇧</span>
                    <span>English</span>
                  </div>

                  <div className="language-item" onClick={() => handleChangeLanguage("zh")}>
                    <img
                      src="https://flagcdn.com/16x12/cn.png"
                      srcSet="https://flagcdn.com/32x24/cn.png 2x, https://flagcdn.com/48x36/cn.png 3x"
                      width="16"
                      height="12"
                      alt="China"
                      className="language-flag"
                    />
                    <span className="language-flag-emoji" aria-hidden="true">🇨🇳</span>
                    <span>中文</span>
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider"></div>

            {/* Avatar */}
            <div className="topbar-user">
              <img
                src={currentUser?.photoURL || userData?.photoURL || avatarImage}
                className="topbar-avatar"
                alt="avatar"
              />

              <div className="topbar-user-info">
                <span className="topbar-name">{currentUser?.displayName || userData?.name || "User"}</span>
                <span className="topbar-role">{userData?.role || t.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default TranslatorLayout;