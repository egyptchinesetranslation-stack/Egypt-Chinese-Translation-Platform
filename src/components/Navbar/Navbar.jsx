import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from '../../assets/Logo.png';
import avatarImage from '../../assets/pngwing.com.png';
import languageIcon from '../../assets/language-svgrepo-com.svg';
import "./Navbar.css";

const text = {
  en: {
    dashboard: "Dashboard",
    findTranslators: "Find Translators",
    myRequests: "My Requests",
    role: "CN Visitor",
    pageTitle: "Egypt Chinese Translation Platform | Dashboard" 
  },
  zh: {
    dashboard: "控制面板",
    findTranslators: "寻找翻译",
    myRequests: "我的请求",
    role: "中国访客",
    pageTitle: "埃及华人翻译平台 | 控制面板" 
  }
};

function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const cookieLang = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='));

    if (cookieLang) {
      const cookieValue = cookieLang.split('=')[1];
      setLanguage(cookieValue === 'zh' ? 'zh' : 'en');
    }
  }, []);

  useEffect(() => {
    if (language === "zh") {
      document.title = text.zh.pageTitle;
      document.documentElement.lang = "zh";
    } else {
      document.title = text.en.pageTitle;
      document.documentElement.lang = "en";
    }
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    setShowLangMenu(false);
  };

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

        <div className={`mobile-menu-icon ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? 'active-mobile' : ''}`}>
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
        </ul>
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
              <div className="navbar-language-option" onClick={() => changeLanguage("en")}>
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

              <div className="navbar-language-option" onClick={() => changeLanguage("zh")}>
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

        <div className="navbar-divider"></div>

        <div className="user-profile">
          <img src={avatarImage} alt="user avatar" className="avatar" />
          <div className="user-details">
            <span className="user-name">Zhang Wei</span>
            <span className="user-role">{t.role}</span>
          </div>
        </div>

      </div>

    </nav>
  );
}

export default Navbar;