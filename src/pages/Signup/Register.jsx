import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import backgroundImage from "../../assets/L1.png";
import languageIcon from "../../assets/language-svgrepo-com.svg";
import logoImage from "../../assets/Logo.png";

function Register() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState("en");

  // States for form logic
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // 'user' or 'translator'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [translatorForm, setTranslatorForm] = useState({
    profilePhoto: null,
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    yearsExp: "",
    shortBio: "",
    emergencyPrice: "",
    tourPrice: "",
    dailyPrice: "",
    certifications: null,
  });

  const text = {
    en: {
      title: "Create Your Account",
      subtitle: "Join the Egypt Chinese Translation Platform",
      step1: "Step 1",
      step2: "Step 2",
      userRole: "Chinese User",
      userDesc: "I need translation assistance for travel, business, or emergencies.",
      translatorRole: "Translator",
      translatorDesc: "I am a professional Arabic-Chinese translator offering services.",
      continue: "Continue",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      createAccount: "Create Account",
      profilePhoto: "Profile Photo Upload",
      yearsExp: "Years of Experience",
      shortBio: "Short Bio",
      pricing: "Service Pricing",
      emergencyPrice: "Emergency Price",
      tourPrice: "Tour Guide Price",
      dailyPrice: "Daily Translation Price",
      certifications: "Upload Certifications",
      uploadPdfImage: "Upload PDF/Image",
      haveAccount: "Already have an account?",
      login: "Login",
      fullNameRequired: "Please enter your full name.",
      emailRequired: "Please enter your email address.",
      phoneRequired: "Please enter your phone number.",
      passwordRequired: "Please enter your password.",
      confirmPasswordRequired: "Please confirm your password.",
      invalidEmail: "Please enter a valid email address.",
      passwordMismatch: "Password and Confirm Password must match.",
      profilePhotoRequired: "Please upload your profile photo.",
      yearsExpRequired: "Please enter years of experience.",
      shortBioRequired: "Please enter your short bio.",
      emergencyPriceRequired: "Please enter emergency price.",
      tourPriceRequired: "Please enter tour guide price.",
      dailyPriceRequired: "Please enter daily translation price.",
      certificationsRequired: "Please upload your certifications.",
      createAccountSuccess: "Your account is ready to be submitted."
    },
    zh: {
      title: "创建您的账户",
      subtitle: "加入埃及华人翻译平台",
      step1: "第一步",
      step2: "第二步",
      userRole: "华人用户",
      userDesc: "我需要旅游、商务或紧急情况的翻译协助。",
      translatorRole: "翻译员",
      translatorDesc: "我是提供服务的专业阿中翻译员。",
      continue: "继续",
      fullName: "全名",
      email: "电子邮箱",
      phone: "电话号码",
      password: "密码",
      confirmPassword: "确认密码",
      createAccount: "创建账户",
      profilePhoto: "上传头像",
      yearsExp: "经验年限",
      shortBio: "个人简介",
      pricing: "服务定价",
      emergencyPrice: "紧急情况价格",
      tourPrice: "导游价格",
      dailyPrice: "日常翻译价格",
      certifications: "上传证书",
      uploadPdfImage: "上传 PDF/图片",
      haveAccount: "已有账户？",
      login: "登录",
      fullNameRequired: "请输入姓名。",
      emailRequired: "请输入电子邮箱。",
      phoneRequired: "请输入电话号码。",
      passwordRequired: "请输入密码。",
      confirmPasswordRequired: "请输入确认密码。",
      invalidEmail: "请输入有效的电子邮箱地址。",
      passwordMismatch: "密码和确认密码必须一致。",
      profilePhotoRequired: "请上传头像。",
      yearsExpRequired: "请输入经验年限。",
      shortBioRequired: "请输入个人简介。",
      emergencyPriceRequired: "请输入紧急情况价格。",
      tourPriceRequired: "请输入导游价格。",
      dailyPriceRequired: "请输入日常翻译价格。",
      certificationsRequired: "请上传证书。",
      createAccountSuccess: "账户信息已准备好提交。"
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

  const handleContinue = () => {
    if (role) setStep(2);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

  const handleUserInputChange = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    if (formMessage) {
      setFormMessage("");
      setMessageType("");
    }
  };

  const handleTranslatorInputChange = (field, value) => {
    setTranslatorForm((prev) => ({ ...prev, [field]: value }));
    if (formMessage) {
      setFormMessage("");
      setMessageType("");
    }
  };

  const handleCreateAccount = () => {
    const activeForm = role === "translator" ? translatorForm : userForm;

    if (!String(activeForm.fullName).trim()) {
      setMessageType("error");
      setFormMessage(currentText.fullNameRequired);
      return;
    }

    if (!String(activeForm.email).trim()) {
      setMessageType("error");
      setFormMessage(currentText.emailRequired);
      return;
    }

    if (!isValidEmail(activeForm.email)) {
      setMessageType("error");
      setFormMessage(currentText.invalidEmail);
      return;
    }

    if (!String(activeForm.phone).trim()) {
      setMessageType("error");
      setFormMessage(currentText.phoneRequired);
      return;
    }

    if (!String(activeForm.password).trim()) {
      setMessageType("error");
      setFormMessage(currentText.passwordRequired);
      return;
    }

    if (!String(activeForm.confirmPassword).trim()) {
      setMessageType("error");
      setFormMessage(currentText.confirmPasswordRequired);
      return;
    }

    if (activeForm.password !== activeForm.confirmPassword) {
      setMessageType("error");
      setFormMessage(currentText.passwordMismatch);
      return;
    }

    if (role === "translator") {
      if (!translatorForm.profilePhoto) {
        setMessageType("error");
        setFormMessage(currentText.profilePhotoRequired);
        return;
      }

      if (!String(translatorForm.yearsExp).trim()) {
        setMessageType("error");
        setFormMessage(currentText.yearsExpRequired);
        return;
      }

      if (!String(translatorForm.shortBio).trim()) {
        setMessageType("error");
        setFormMessage(currentText.shortBioRequired);
        return;
      }

      if (!String(translatorForm.emergencyPrice).trim()) {
        setMessageType("error");
        setFormMessage(currentText.emergencyPriceRequired);
        return;
      }

      if (!String(translatorForm.tourPrice).trim()) {
        setMessageType("error");
        setFormMessage(currentText.tourPriceRequired);
        return;
      }

      if (!String(translatorForm.dailyPrice).trim()) {
        setMessageType("error");
        setFormMessage(currentText.dailyPriceRequired);
        return;
      }

      if (!translatorForm.certifications) {
        setMessageType("error");
        setFormMessage(currentText.certificationsRequired);
        return;
      }
    }

    setMessageType("success");
    setFormMessage(currentText.createAccountSuccess);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div
      className="register-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="register-lang-wrapper">
        <img
          src={languageIcon}
          alt="language"
          className="register-lang-icon"
          onClick={() => setShowLangMenu(!showLangMenu)}
        />

        {showLangMenu && (
          <div className="register-lang-dropdown">
            <div className="register-lang-option" onClick={() => changeLanguage("en")}>
              <img
                src="https://flagcdn.com/16x12/gb.png"
                srcSet="https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x"
                width="16"
                height="12"
                alt="United Kingdom"
                className="register-flag"
              />
              <span className="register-flag-emoji" aria-hidden="true">🇬🇧</span>
              <span>English</span>
            </div>

            <div className="register-lang-option" onClick={() => changeLanguage("zh")}>
              <img
                src="https://flagcdn.com/16x12/cn.png"
                srcSet="https://flagcdn.com/32x24/cn.png 2x, https://flagcdn.com/48x36/cn.png 3x"
                width="16"
                height="12"
                alt="China"
                className="register-flag"
              />
              <span className="register-flag-emoji" aria-hidden="true">🇨🇳</span>
              <span>中文</span>
            </div>
          </div>
        )}
      </div>

      <div className={`register-main-card ${step === 2 && role === 'translator' ? 'register-translator-card' : ''}`}>
        
        {/* Header Section */}
        <div className="register-card-header">
          <img src={logoImage} alt="Logo" className="register-logo-img" />
          <h2 className="register-heading">{currentText.title}</h2>
          <p className="register-subheading">{currentText.subtitle}</p>
          
          <div className="register-steps">
            <span 
              className={`register-step-item ${step === 1 ? 'active' : 'completed'}`}
              onClick={() => setStep(1)}
              style={{ cursor: step === 2 ? 'pointer' : 'default' }}
            >
              {currentText.step1}
            </span>
            <span className="register-step-arrow">→</span>
            <span className={`register-step-item ${step === 2 ? 'active' : ''}`}>
              {currentText.step2}
            </span>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="register-step-content fade-in">
            <div className="register-roles-grid">
              {/* User Role Card */}
              <div 
                className={`register-role-box ${role === 'user' ? 'selected' : ''}`}
                onClick={() => setRole('user')}
              >
                <div className="register-role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>{currentText.userRole}</h3>
                <p>{currentText.userDesc}</p>
              </div>

              {/* Translator Role Card */}
              <div 
                className={`register-role-box ${role === 'translator' ? 'selected' : ''}`}
                onClick={() => setRole('translator')}
              >
                <div className="register-role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"></path>
                    <path d="M7 9h5"></path>
                    <path d="M7 12h3"></path>
                    <path d="M18 7.5h2.5a2.5 2.5 0 0 1 2.5 2.5v3"></path>
                    <path d="M20 16l3-3"></path>
                  </svg>
                </div>
                <h3>{currentText.translatorRole}</h3>
                <p>{currentText.translatorDesc}</p>
              </div>
            </div>

            <button 
              className={`register-btn-primary ${!role ? 'disabled' : ''}`} 
              onClick={handleContinue}
              disabled={!role}
            >
              {currentText.continue}
            </button>

            {/* Login Link Container */}
            <p className="register-login-text">
              {currentText.haveAccount} 
              <Link to="/Login"> {currentText.login}</Link>
            </p>

          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div className="register-step-content fade-in">
            
            {/* User Form */}
            {role === 'user' && (
              <div className="register-form-grid register-user-layout">
                <div className="register-input-col">
                  <label>{currentText.fullName}</label>
                  <input
                    type="text"
                    placeholder="Zhang Wei"
                    value={userForm.fullName}
                    onChange={(e) => handleUserInputChange("fullName", e.target.value)}
                  />
                </div>
                <div className="register-input-col">
                  <label>{currentText.email}</label>
                  <input
                    type="email"
                    placeholder="zhangwei@gmail.com"
                    value={userForm.email}
                    onChange={(e) => handleUserInputChange("email", e.target.value)}
                  />
                </div>
                <div className="register-input-col full-width">
                  <label>{currentText.phone}</label>
                  <input
                    type="text"
                    placeholder="+201234567890"
                    dir="ltr"
                    value={userForm.phone}
                    onChange={(e) => handleUserInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="register-input-col">
                  <label>{currentText.password}</label>
                  <div className="register-password-wrap">
                    <svg className="register-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      className={`register-password-field ${showPassword ? "" : "register-password-mask"}`}
                      type="text"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      dir="ltr"
                      value={userForm.password}
                      onChange={(e) => handleUserInputChange("password", e.target.value)}
                    />
                    <svg
                      className="register-input-icon-right register-icon-button"
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
                <div className="register-input-col">
                  <label>{currentText.confirmPassword}</label>
                  <div className="register-password-wrap">
                    <svg className="register-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      className={`register-password-field ${showConfirmPassword ? "" : "register-password-mask"}`}
                      type="text"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      dir="ltr"
                      value={userForm.confirmPassword}
                      onChange={(e) => handleUserInputChange("confirmPassword", e.target.value)}
                    />
                    <svg
                      className="register-input-icon-right register-icon-button"
                      onClick={toggleConfirmPasswordVisibility}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {showConfirmPassword ? (
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
              </div>
            )}

            {/* Translator Form */}
            {role === 'translator' && (
              <div className="register-form-grid register-trans-layout">
                
                {/* Row 1: Avatar + Name + Email */}
                <div className="register-flex-row align-end">
                   <div className="register-upload-area">
                      <label>{currentText.profilePhoto}</label>
                      <label className="register-avatar-box" htmlFor="avatar-upload">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={(e) => handleTranslatorInputChange("profilePhoto", e.target.files?.[0] ?? null)}
                        />
                      </label>
                   </div>
                   <div className="register-input-col flex-1">
                      <label>{currentText.fullName}</label>
                      <input
                        type="text"
                        placeholder="Ahmed Hassan"
                        value={translatorForm.fullName}
                        onChange={(e) => handleTranslatorInputChange("fullName", e.target.value)}
                      />
                   </div>
                   <div className="register-input-col flex-1">
                      <label>{currentText.email}</label>
                      <input
                        type="email"
                        placeholder="ahmed@gmail.com"
                        value={translatorForm.email}
                        onChange={(e) => handleTranslatorInputChange("email", e.target.value)}
                      />
                   </div>
                </div>

                {/* Row 2: Phone + Password + Confirm */}
                <div className="register-flex-row">
                   <div className="register-input-col flex-1">
                      <label>{currentText.phone}</label>
                     <input
                      type="text"
                      placeholder="+201234567890"
                      dir="ltr"
                      value={translatorForm.phone}
                      onChange={(e) => handleTranslatorInputChange("phone", e.target.value)}
                     />
                   </div>
                   <div className="register-input-col flex-1">
                      <label>{currentText.password}</label>
                      <div className="register-password-wrap">
                        <svg className="register-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          className={`register-password-field ${showPassword ? "" : "register-password-mask"}`}
                          type="text"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          dir="ltr"
                          value={translatorForm.password}
                          onChange={(e) => handleTranslatorInputChange("password", e.target.value)}
                        />
                        <svg
                          className="register-input-icon-right register-icon-button"
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
                   <div className="register-input-col flex-1">
                      <label>{currentText.confirmPassword}</label>
                      <div className="register-password-wrap">
                        <svg className="register-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          className={`register-password-field ${showConfirmPassword ? "" : "register-password-mask"}`}
                          type="text"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          dir="ltr"
                          value={translatorForm.confirmPassword}
                          onChange={(e) => handleTranslatorInputChange("confirmPassword", e.target.value)}
                        />
                        <svg
                          className="register-input-icon-right register-icon-button"
                          onClick={toggleConfirmPasswordVisibility}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {showConfirmPassword ? (
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
                </div>

                <div className="register-section-divider"></div>

                {/* Row 3: Years Exp + Bio + Certifications */}
                <div className="register-flex-row align-end">
                   <div className="register-input-col" style={{flex: '0.25'}}>
                      <label>{currentText.yearsExp}</label>
                     <input
                      type="number"
                      placeholder="5"
                      value={translatorForm.yearsExp}
                      onChange={(e) => handleTranslatorInputChange("yearsExp", e.target.value)}
                     />
                   </div>
                   <div className="register-input-col" style={{flex: '0.5'}}>
                      <label>{currentText.shortBio}</label>
                     <input
                      type="text"
                      placeholder="Professional Chinese-Arabic interpreter"
                      value={translatorForm.shortBio}
                      onChange={(e) => handleTranslatorInputChange("shortBio", e.target.value)}
                     />
                   </div>
                   <div className="register-input-col" style={{flex: '0.25'}}>
                      <label>{currentText.certifications}</label>
                      <label className="register-file-upload" htmlFor="cert-upload">
                        {currentText.uploadPdfImage}
                        <input
                          type="file"
                          id="cert-upload"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleTranslatorInputChange("certifications", e.target.files?.[0] ?? null)}
                        />
                      </label>
                   </div>
                </div>

                {/* Row 4: Pricing */}
                <div className="register-pricing-wrap">
                  <label className="register-section-lbl">{currentText.pricing}</label>
                  <div className="register-flex-row">
                    <div className="register-input-col flex-1">
                      <label>{currentText.emergencyPrice}</label>
                      <div className="register-price-input">
                        <span className="dollar-sign">$</span>
                        <input
                          type="number"
                          placeholder="100"
                          value={translatorForm.emergencyPrice}
                          onChange={(e) => handleTranslatorInputChange("emergencyPrice", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="register-input-col flex-1">
                      <label>{currentText.tourPrice}</label>
                      <div className="register-price-input">
                        <span className="dollar-sign">$</span>
                        <input
                          type="number"
                          placeholder="50"
                          value={translatorForm.tourPrice}
                          onChange={(e) => handleTranslatorInputChange("tourPrice", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="register-input-col flex-1">
                      <label>{currentText.dailyPrice}</label>
                      <div className="register-price-input">
                        <span className="dollar-sign">$</span>
                        <input
                          type="number"
                          placeholder="60"
                          value={translatorForm.dailyPrice}
                          onChange={(e) => handleTranslatorInputChange("dailyPrice", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            <p
              className={`register-form-message ${messageType === "success" ? "success" : "error"} ${
                formMessage ? "" : "is-hidden"
              }`}
            >
              {formMessage || " "}
            </p>

            <button className="register-btn-primary mt-compact" onClick={handleCreateAccount}>
              {currentText.createAccount}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Register;