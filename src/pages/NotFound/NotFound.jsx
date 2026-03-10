import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import backgroundImage from '../../assets/L1.png';
import languageIcon from '../../assets/language-svgrepo-com.svg';

function NotFound() {
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const cookieLang = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='));
    if (cookieLang) {
      setLanguage(cookieLang.split('=')[1]);
    }
  }, []);

  useEffect(() => {
    if (language === "zh") {
      document.title = "埃及华人翻译平台 | 404";
      document.documentElement.lang = "zh";
    } else {
      document.title = "Egypt Chinese Translation Platform | 404";
      document.documentElement.lang = "en";
    }
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    setShowLangMenu(false);
  };

  const text = {
    en: {
      title: "Page Not Found",
      subtitle: "Sorry, the page you're looking for doesn't exist or has been moved",
      home: "Go to Home",
      back: "Go Back",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      support: "Support"
    },
    zh: {
      title: "页面未找到",
      subtitle: "抱歉，您要查找的页面不存在或已被移动",
      home: "返回首页",
      back: "返回上页",
      privacy: "隐私政策",
      terms: "服务条款",
      support: "支持"
    }
  };

  return (
    <div
      className="notfound-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Language Selector */}
      <div className="language-wrapper">
        <img
          src={languageIcon}
          alt="language"
          className="language-icon"
          onClick={() => setShowLangMenu(!showLangMenu)}
        />
        {showLangMenu && (
          <div className="language-dropdown">
            <div className="language-option" onClick={() => changeLanguage("en")}>
              <img
                src="https://flagcdn.com/16x12/gb.png"
                srcSet="https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x"
                width="16"
                height="12"
                alt="United Kingdom"
                className="flag"
              />
              <span className="flag-emoji" aria-hidden="true">🇬🇧</span>
              <span>English</span>
            </div>
            <div className="language-option" onClick={() => changeLanguage("zh")}>
              <img
                src="https://flagcdn.com/16x12/cn.png"
                srcSet="https://flagcdn.com/32x24/cn.png 2x, https://flagcdn.com/48x36/cn.png 3x"
                width="16"
                height="12"
                alt="China"
                className="flag"
              />
              <span className="flag-emoji" aria-hidden="true">🇨🇳</span>
              <span>中文</span>
            </div>
          </div>
        )}
      </div>

      <div className="notfound-card">
        {/* 404 SVG Illustration */}
        <svg
          className="notfound-svg"
          viewBox="0 0 500 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background clouds */}
          <ellipse cx="80" cy="220" rx="60" ry="20" fill="#e8f4f8" />
          <ellipse cx="420" cy="200" rx="50" ry="15" fill="#e8f4f8" />
          <ellipse cx="250" cy="250" rx="80" ry="25" fill="#e8f4f8" />

          {/* Large 4 - Left */}
          <g className="number-4-left">
            <path
              d="M 85 95 L 35 165 L 35 185 L 70 185 L 70 220 L 95 220 L 95 185 L 115 185 L 115 165 L 95 165 L 95 95 Z"
              fill="url(#gradient1)"
              stroke="#1a365d"
              strokeWidth="3"
            />
          </g>

          {/* Broken 0 with crack */}
          <g className="number-0">
            <ellipse
              cx="250"
              cy="160"
              rx="50"
              ry="70"
              fill="url(#gradient2)"
              stroke="#c53030"
              strokeWidth="4"
            />
            <ellipse
              cx="250"
              cy="160"
              rx="25"
              ry="40"
              fill="#fff5f5"
            />
            {/* Crack effect */}
            <path
              d="M235 100 L245 130 L230 145 L250 160 L235 175 L255 200 L245 220"
              fill="none"
              stroke="#c53030"
              strokeWidth="3"
              strokeLinecap="round"
              className="crack"
            />
            {/* Small pieces flying */}
            <polygon points="270,110 280,115 275,125" fill="#fc8181" className="piece piece-1" />
            <polygon points="285,140 295,135 290,150" fill="#fc8181" className="piece piece-2" />
          </g>

          {/* Large 4 - Right */}
          <g className="number-4-right">
            <path
              d="M 405 95 L 355 165 L 355 185 L 390 185 L 390 220 L 415 220 L 415 185 L 435 185 L 435 165 L 415 165 L 415 95 Z"
              fill="url(#gradient1)"
              stroke="#1a365d"
              strokeWidth="3"
            />
          </g>

          {/* Lost astronaut */}
          <g className="astronaut">
            {/* Body */}
            <ellipse cx="250" cy="50" rx="15" ry="18" fill="#e2e8f0" stroke="#718096" strokeWidth="2" />
            {/* Helmet visor */}
            <ellipse cx="250" cy="48" rx="10" ry="12" fill="#4299e1" opacity="0.6" />
            {/* Reflection */}
            <ellipse cx="246" cy="44" rx="3" ry="4" fill="#fff" opacity="0.7" />
          </g>

          {/* Stars */}
          <g className="stars">
            <polygon points="150,50 152,56 158,56 153,60 155,66 150,62 145,66 147,60 142,56 148,56" fill="#ecc94b" />
            <polygon points="350,70 351,74 355,74 352,76 353,80 350,78 347,80 348,76 345,74 349,74" fill="#ecc94b" />
            <polygon points="100,120 101,123 104,123 102,125 103,128 100,126 97,128 98,125 95,123 99,123" fill="#ecc94b" />
            <polygon points="400,100 401,103 404,103 402,105 403,108 400,106 397,108 398,105 395,103 399,103" fill="#ecc94b" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4299e1" />
              <stop offset="100%" stopColor="#2b6cb0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fc8181" />
              <stop offset="100%" stopColor="#c53030" />
            </linearGradient>
          </defs>
        </svg>

        <h2 className="notfound-title">{text[language].title}</h2>
        <p className="notfound-subtitle">{text[language].subtitle}</p>

        <div className="notfound-actions">
          <Link to="/dashboard" className="primary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {text[language].home}
          </Link>
          <button onClick={() => window.history.back()} className="secondary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {text[language].back}
          </button>
        </div>
      </div>

      <div className="page-footer">
        <a href="#">{text[language].privacy}</a>
        <span className="dot">•</span>
        <a href="#">{text[language].terms}</a>
        <span className="dot">•</span>
        <a href="#">{text[language].support}</a>
      </div>
    </div>
  );
}

export default NotFound;
