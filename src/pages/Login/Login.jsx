import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Login.css';
import backgroundImage from '../../assets/L1.png';
import logoImage from '../../assets/Logo.png';
import languageIcon from '../../assets/language-svgrepo-com.svg';

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
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

    if(language === "zh"){
      document.title = "埃及华人翻译平台 | 登录";
      document.documentElement.lang = "zh";
    }
    else{
      document.title = "Egypt Chinese Translation Platform | Login";
      document.documentElement.lang = "en";
    }

  }, [language]);


  const changeLanguage = (lang) => {

    setLanguage(lang);

    document.cookie = `lang=${lang}; path=/; max-age=31536000`;

    setShowLangMenu(false);

  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const text = {

    en: {
      title: "Welcome Back",
      subtitle: "Login to access your account",
      email: "Email Address",
      password: "Password",
      forgot: "Forgot password?",
      keep: "Keep me logged in",
      signin: "Sign In",
      or: "OR CONTINUE WITH",
      google: "Login with Google",
      signup: "Don't have an account?",
      create: "Create account",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      support: "Support"
    },

    zh: {
      title: "欢迎回来",
      subtitle: "登录以访问您的账户",
      email: "电子邮箱",
      password: "密码",
      forgot: "忘记密码？",
      keep: "保持登录状态",
      signin: "登录",
      or: "或使用以下方式继续",
      google: "使用谷歌登录",
      signup: "没有账户？",
      create: "创建账户",
      privacy: "隐私政策",
      terms: "服务条款",
      support: "支持"
    }

  };


  return (

    <div
      className="login-container"
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

            <div
              className="language-option"
              onClick={() => changeLanguage("en")}
            >
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

            <div
              className="language-option"
              onClick={() => changeLanguage("zh")}
            >
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


      <div className="login-card">

        <div className="logo-container">
          <img src={logoImage} alt="Egypt Chinese Translation Platform" className="logo-image" />
        </div>

        <h2 className="login-title">{text[language].title}</h2>
        <p className="login-subtitle">{text[language].subtitle}</p>

        <form className="login-form">

          <div className="input-group">
            <label>{text[language].email}</label>

            <div className="input-wrapper">

              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>

              <input type="email" placeholder="zhang.wei@example.com" />

            </div>
          </div>


          <div className="input-group">

            <div className="label-row">
              <label>{text[language].password}</label>
              <a href="#" className="forgot-password">{text[language].forgot}</a>
            </div>

            <div className="input-wrapper">

              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>

              <input
                className="password-input"
                type="text"
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
              />

              <svg
                className="input-icon-right cursor-pointer"
                onClick={togglePasswordVisibility}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a20.3 20.3 0 0 1 5.06-6.94" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.82 20.82 0 0 1-3.12 4.5" />
                    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>

            </div>

          </div>


          <div className="checkbox-group">
            <input type="checkbox" id="keep-logged"/>
            <label htmlFor="keep-logged">{text[language].keep}</label>
          </div>


          <button type="submit" className="signin-btn">
            {text[language].signin}
          </button>

        </form>


        <div className="divider">
          <span>{text[language].or}</span>
        </div>


        <button type="button" className="google-btn">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
          >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.89 2.3 30.34 0 24 0 14.62 0 6.54 5.48 2.63 13.44l8.04 6.24C12.4 13.02 17.72 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.66-.15-3.26-.42-4.8H24v9.1h12.7c-.55 2.96-2.22 5.47-4.73 7.15l7.27 5.65C43.95 37.7 46.5 31.7 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.67 28.68a14.6 14.6 0 010-9.36l-8.04-6.24A23.97 23.97 0 000 24c0 3.86.92 7.52 2.63 10.92l8.04-6.24z"/>
            <path fill="#34A853" d="M24 48c6.34 0 11.66-2.1 15.55-5.73l-7.27-5.65c-2.02 1.35-4.62 2.15-8.28 2.15-6.28 0-11.6-3.52-13.33-8.68l-8.04 6.24C6.54 42.52 14.62 48 24 48z"/>
          </svg>

          {text[language].google}

        </button>

        <p className="signup-text">
          {text[language].signup} 
          <Link to="/Signup"> {text[language].create}</Link>
        </p>

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
};

export default Login;