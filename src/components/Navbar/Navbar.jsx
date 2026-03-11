import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import logoImage from '../../assets/Logo.png';
import avatarImage from '../../assets/pngwing.com.png';
import languageIcon from '../../assets/language-svgrepo-com.svg';
import logoutIcon from '../../assets/logout-2-svgrepo-com.svg';
import { useLanguage } from "../../context/LanguageContext";
import "./Navbar.css";

const text = {
  en: {
    dashboard: "Dashboard",
    findTranslators: "Find Translators",
    myRequests: "My Requests",
    role: "CN Visitor",
    pageTitle: "Egypt Chinese Translation Platform | Dashboard",
    logout: "Logout"
  },
  zh: {
    dashboard: "控制面板",
    findTranslators: "寻找翻译",
    myRequests: "我的请求",
    role: "中国访客",
    pageTitle: "埃及华人翻译平台 | 控制面板",
    logout: "退出登录"
  }
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getCookieValue = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : '';
  };

  const [userInfo, setUserInfo] = useState({
    name: '',
    photoURL: '',
    email: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    setUserInfo({
      name: getCookieValue('user_name'),
      photoURL: getCookieValue('user_photoURL'),
      email: getCookieValue('user_email'),
      phone: getCookieValue('user_phone'),
      role: getCookieValue('user_role'),
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLangMenu(false);
  };

  // Update document title when language changes
  useEffect(() => {
    document.title = language === "zh" ? text.zh.pageTitle : text.en.pageTitle;
  }, [language]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const t = text[language];

  return (
    <nav className="navbar">

      <div className="navbar-left-section">
        <div className="logo">
          <img src={logoImage} alt="Egypt Chinese Translation Platform Logo" className="logo-images" />
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? 'active-mobile' : ''}`}>
          {/* Mobile only: user info + logout (first) */}
          <li className="mobile-only-items">
            <div className="mobile-user-section">
              <img src={userInfo.photoURL || avatarImage} alt="user avatar" className="avatar" />
              <div className="user-details">
                <span className="user-name">{userInfo.name || "User"}</span>
                <span className="user-role">{userInfo.role ? userInfo.role : t.role}</span>
              </div>
            </div>
          </li>

          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t.dashboard}
            </Link>
          </li>
          <li>
            <Link 
              to="/translators" 
              className={location.pathname === '/translators' || location.pathname === '/' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t.findTranslators}
            </Link>
          </li>
          <li>
            <Link 
              to="/my-requests" 
              className={location.pathname === '/my-requests' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {t.myRequests}
            </Link>
          </li>

          {/* Mobile only: logout at bottom */}
          <li className="mobile-only-items mobile-logout-section">
            <button className="mobile-menu-logout-btn" onClick={handleLogout}>
              <img src={logoutIcon} alt="logout" className="mobile-menu-logout-icon" />
              <span>{t.logout}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile: language + burger */}
      <div className="navbar-mobile-right">
        <div className="navbar-language-wrapper">
          <img
            src={languageIcon}
            alt="language"
            className="navbar-language-icon"
            onClick={() => setShowLangMenu(!showLangMenu)}
          />
          {showLangMenu && (
            <div className="navbar-language-dropdown">
              <div className="navbar-language-option" onClick={() => handleLanguageChange("en")}>
                <img
                  src="https://flagcdn.com/16x12/gb.png"
                  srcSet="https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x"
                  width="16" height="12" alt="United Kingdom" className="navbar-flag"
                />
                <span className="navbar-flag-emoji" aria-hidden="true">🇬🇧</span>
                <span>English</span>
              </div>
              <div className="navbar-language-option" onClick={() => handleLanguageChange("zh")}>
                <img
                  src="https://flagcdn.com/16x12/cn.png"
                  srcSet="https://flagcdn.com/32x24/cn.png 2x, https://flagcdn.com/48x36/cn.png 3x"
                  width="16" height="12" alt="China" className="navbar-flag"
                />
                <span className="navbar-flag-emoji" aria-hidden="true">🇨🇳</span>
                <span>中文</span>
              </div>
            </div>
          )}
        </div>
        <div className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="navbar-right-section">
        
        <div className="navbar-language-wrapper">
          <img
            src={languageIcon}
            alt="language"
            className="navbar-language-icon"
            onClick={() => setShowLangMenu(!showLangMenu)}
          />

          {showLangMenu && (
            <div className="navbar-language-dropdown">
              <div className="navbar-language-option" onClick={() => handleLanguageChange("en")}>
                <img
                  src="https://flagcdn.com/16x12/gb.png"
                  srcSet="https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x"
                  width="16"
                  height="12"
                  alt="United Kingdom"
                  className="navbar-flag"
                />
                <span className="navbar-flag-emoji" aria-hidden="true">🇬🇧</span>
                <span>English</span>
              </div>

              <div className="navbar-language-option" onClick={() => handleLanguageChange("zh")}>
                <img
                  src="https://flagcdn.com/16x12/cn.png"
                  srcSet="https://flagcdn.com/32x24/cn.png 2x, https://flagcdn.com/48x36/cn.png 3x"
                  width="16"
                  height="12"
                  alt="China"
                  className="navbar-flag"
                />
                <span className="navbar-flag-emoji" aria-hidden="true">🇨🇳</span>
                <span>中文</span>
              </div>
            </div>
          )}
        </div>
        <button className="navbar-logout-btn" onClick={handleLogout} title={t.logout}>
          <img src={logoutIcon} alt="logout" className="navbar-logout-icon" />
        </button>

        <div className="navbar-divider"></div>

        <div className="user-profile">
          <img src={userInfo.photoURL || avatarImage} alt="user avatar" className="avatar" />
          <div className="user-details">
            <span className="user-name">{userInfo.name || "User"}</span>
            <span className="user-role">{userInfo.role ? userInfo.role : t.role}</span>
          </div>
        </div>


      </div>

    </nav>
  );
}

export default Navbar;