import React, { useEffect, useState } from "react";
import "./Register.css";
import backgroundImage from "../../assets/L1.png";
import languageIcon from "../../assets/language-svgrepo-com.svg";

function Register() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState("en");

  const text = {
    en: {
      registerTitle: "Signup page",
    },
    zh: {
      registerTitle: "注册页面",
    },
  };

  const currentText = text[language] ?? text.en;

  useEffect(() => {
    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="));

    if (cookieLang) {
      const cookieValue = cookieLang.split("=")[1];
      setLanguage(cookieValue === "zh" ? "zh" : "en");
    } else {
      document.cookie = "lang=en; path=/; max-age=31536000";
    }
  }, []);

  useEffect(() => {
    if (language === "zh") {
      document.title = "埃及华人翻译平台 | 注册页面";
      document.documentElement.lang = "zh";
    } else {
      document.title = "Egypt Chinese Translation Platform | Signup page";
      document.documentElement.lang = "en";
    }
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    setShowLangMenu(false);
  };

  return (
    <div
      className="register-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="register-language-wrapper">
        <img
          src={languageIcon}
          alt="language"
          className="register-language-icon"
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
              <span className="flag-emoji" aria-hidden="true">
                🇬🇧
              </span>
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
              <span className="flag-emoji" aria-hidden="true">
                🇨🇳
              </span>
              <span>中文</span>
            </div>
          </div>
        )}
      </div>

      <h1 className="register-title">{currentText.registerTitle}</h1>
    </div>
  );
}

export default Register;