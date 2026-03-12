import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, googleProvider } from "../../firebase";
import "./Register.css";
import backgroundImage from "../../assets/L1.png";
import languageIcon from "../../assets/language-svgrepo-com.svg";
import { useAuth } from "../../context/AuthContext";
import logoImage from "../../assets/Logo.png";

function Register() {
  const navigate = useNavigate();
  const { setUserDataManually } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  // States for form logic
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // 'user' or 'translator'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [userForm, setUserForm] = useState({
    profilePhoto: null,
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

  const [userAvatarPreview, setUserAvatarPreview] = useState("");

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
      uploadDone: "Done",
      selectedFile: "Selected:",
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
      atLeastOnePriceRequired: "Please enter at least one service price.",
      certificationsRequired: "Please upload your certifications.",
      createAccountSuccess: "Account created successfully! Redirecting...",
      creatingAccount: "Creating account...",
      emailInUse: "This email is already registered.",
      weakPassword: "Password should be at least 6 characters.",
      registrationError: "Registration failed. Please try again.",
      or: "OR CONTINUE WITH",
      googleSignup: "Signup with Google"
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
      uploadDone: "已上传",
      selectedFile: "已选择:",
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
      atLeastOnePriceRequired: "请至少输入一项服务价格。",
      certificationsRequired: "请上传证书。",
      createAccountSuccess: "账户创建成功！正在跳转...",
      creatingAccount: "正在创建账户...",
      emailInUse: "此邮箱已被注册。",
      weakPassword: "密码至少需要6个字符。",
      registrationError: "注册失败，请重试。",
      or: "或使用以下方式继续",
      googleSignup: "使用谷歌注册"
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

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (userAvatarPreview) {
        URL.revokeObjectURL(userAvatarPreview);
      }
    };
  }, [avatarPreview, userAvatarPreview]);

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

  const handleUserProfilePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    handleUserInputChange("profilePhoto", file);

    setUserAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const handleTranslatorInputChange = (field, value) => {
    setTranslatorForm((prev) => ({ ...prev, [field]: value }));
    if (formMessage) {
      setFormMessage("");
      setMessageType("");
    }
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    handleTranslatorInputChange("profilePhoto", file);

    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }

      return file ? URL.createObjectURL(file) : "";
    });
  };

  // Helper function to upload file to Firebase Storage
  const uploadFileToStorage = async (file, path) => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleCreateAccount = async () => {
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

      const hasEmergency = String(translatorForm.emergencyPrice).trim() !== "";
      const hasTour = String(translatorForm.tourPrice).trim() !== "";
      const hasDaily = String(translatorForm.dailyPrice).trim() !== "";
      if (!hasEmergency && !hasTour && !hasDaily) {
        setMessageType("error");
        setFormMessage(currentText.atLeastOnePriceRequired);
        return;
      }

      if (!translatorForm.certifications) {
        setMessageType("error");
        setFormMessage(currentText.certificationsRequired);
        return;
      }
    }

    // Start Firebase registration
    setIsLoading(true);
    setMessageType("");
    setFormMessage(currentText.creatingAccount);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        activeForm.email,
        activeForm.password
      );
      const user = userCredential.user;

      let userData;

      if (role === "translator") {
        let photoURL = "";
        let certURL = "";

        // Upload profile photo
        try {
          console.log("Uploading profile photo...");
          photoURL = await uploadFileToStorage(
            translatorForm.profilePhoto,
            `users/${user.uid}/profilePhoto`
          );
          console.log("Profile photo uploaded:", photoURL);
        } catch (uploadError) {
          console.error("Error uploading profile photo:", uploadError);
          // Continue without photo if upload fails
        }

        // Upload certifications
        try {
          console.log("Uploading certifications...");
          certURL = await uploadFileToStorage(
            translatorForm.certifications,
            `users/${user.uid}/certifications/${translatorForm.certifications.name}`
          );
          console.log("Certifications uploaded:", certURL);
        } catch (uploadError) {
          console.error("Error uploading certifications:", uploadError);
          // Continue without certifications if upload fails
        }

        // Translator user data
        userData = {
          name: translatorForm.fullName,
          email: translatorForm.email,
          role: "translator",
          phone: translatorForm.phone,
          photoURL: photoURL,
          createdAt: serverTimestamp(),
          experienceYears: parseInt(translatorForm.yearsExp) || 0,
          bio: translatorForm.shortBio,
          pricing: {
            emergency: parseFloat(translatorForm.emergencyPrice) || 0,
            tourGuide: parseFloat(translatorForm.tourPrice) || 0,
            daily: parseFloat(translatorForm.dailyPrice) || 0
          },
          certifications: certURL ? [
            {
              name: translatorForm.certifications.name,
              fileURL: certURL
            }
          ] : [],
          avgRating: 0,
          totalReviews: 0,
          totalEarnings: 0
        };

        console.log("Translator userData:", userData);
      } else {
        // Chinese user data
        let userPhotoURL = "";

        // Upload profile photo if provided
        if (userForm.profilePhoto) {
          try {
            console.log("Uploading Chinese user profile photo...");
            userPhotoURL = await uploadFileToStorage(
              userForm.profilePhoto,
              `users/${user.uid}/profilePhoto`
            );
            console.log("Profile photo uploaded:", userPhotoURL);
          } catch (uploadError) {
            console.error("Error uploading profile photo:", uploadError);
          }
        }

        userData = {
          name: userForm.fullName,
          email: userForm.email,
          role: "chinese",
          phone: userForm.phone,
          photoURL: userPhotoURL,
          createdAt: serverTimestamp()
        };
      }

      // Save user data to Firestore
      console.log("Saving to Firestore...");
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Data saved successfully!");

      // حفظ بيانات المستخدم في الكوكيز
      document.cookie = `user_name=${encodeURIComponent(userData.name || "")}; path=/; max-age=31536000`;
      document.cookie = `user_photoURL=${encodeURIComponent(userData.photoURL || "")}; path=/; max-age=31536000`;
      document.cookie = `user_email=${encodeURIComponent(userData.email || "")}; path=/; max-age=31536000`;
      document.cookie = `user_phone=${encodeURIComponent(userData.phone || "")}; path=/; max-age=31536000`;
      document.cookie = `user_role=${encodeURIComponent(userData.role || "")}; path=/; max-age=31536000`;

      // Set user data manually in AuthContext to avoid race condition
      // Replace serverTimestamp with actual date for local state
      const localUserData = { ...userData, createdAt: new Date() };
      setUserDataManually(localUserData);

      setMessageType("success");
      setFormMessage(currentText.createAccountSuccess);

      // Redirect immediately after successful registration
      if (role === "translator") {
        navigate("/translator/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);

      if (error.code === "auth/email-already-in-use") {
        setMessageType("error");
        setFormMessage(currentText.emailInUse);
      } else if (error.code === "auth/weak-password") {
        setMessageType("error");
        setFormMessage(currentText.weakPassword);
      } else {
        setMessageType("error");
        setFormMessage(currentText.registrationError);
      }
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create Chinese user data for Google sign-in
      const userData = {
        name: user.displayName || "",
        email: user.email,
        role: "chinese",
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp()
      };

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });

      // حفظ بيانات المستخدم في الكوكيز
      document.cookie = `user_name=${encodeURIComponent(userData.name || "")}; path=/; max-age=31536000`;
      document.cookie = `user_photoURL=${encodeURIComponent(userData.photoURL || "")}; path=/; max-age=31536000`;
      document.cookie = `user_email=${encodeURIComponent(userData.email || "")}; path=/; max-age=31536000`;
      document.cookie = `user_phone=${encodeURIComponent(userData.phone || "")}; path=/; max-age=31536000`;
      document.cookie = `user_role=${encodeURIComponent(userData.role || "")}; path=/; max-age=31536000`;

      // Set user data manually in AuthContext to avoid race condition
      const localUserData = { ...userData, createdAt: new Date() };
      setUserDataManually(localUserData);

      setMessageType("success");
      setFormMessage(currentText.createAccountSuccess);

      // Redirect immediately
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("Google signup error:", error);
      setIsLoading(false);
      setMessageType("error");
      setFormMessage(currentText.registrationError);
    }
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
                {/* Profile Photo Upload for Chinese User */}
                <div className="register-input-col full-width" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'px' }}>
                  <div className="register-upload-area">
                    <label>{currentText.profilePhoto}</label>
                    <label className={`register-avatar-box ${userForm.profilePhoto ? "has-file" : ""}`} htmlFor="user-avatar-upload">
                      {userAvatarPreview ? (
                        <img src={userAvatarPreview} alt="Profile preview" className="register-avatar-preview" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                      <input
                        type="file"
                        id="user-avatar-upload"
                        accept="image/*"
                        onChange={handleUserProfilePhotoChange}
                      />
                    </label>
                  </div>
                </div>
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
                      <label className={`register-avatar-box ${translatorForm.profilePhoto ? "has-file" : ""}`} htmlFor="avatar-upload">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile preview" className="register-avatar-preview" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
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
                      <label className={`register-file-upload ${translatorForm.certifications ? "has-file" : ""}`} htmlFor="cert-upload">
                        {translatorForm.certifications
                          ? `${currentText.selectedFile} ${translatorForm.certifications.name}`
                          : currentText.uploadPdfImage}
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

            <button 
              className="register-btn-primary mt-compact" 
              onClick={handleCreateAccount}
              disabled={isLoading}
            >
              {isLoading ? currentText.creatingAccount : currentText.createAccount}
            </button>

            {role === "user" && (
              <>
                <div className="register-divider">
                  <span>{currentText.or}</span>
                </div>

                <button 
                  type="button" 
                  className="register-google-btn"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
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
                  {currentText.googleSignup}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Register;