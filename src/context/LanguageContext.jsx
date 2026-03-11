import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const cookieLang = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='));

    if (cookieLang) {
      const cookieValue = cookieLang.split('=')[1];
      setLanguage(cookieValue === 'zh' ? 'zh' : 'en');
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    
    // Update document title and lang attribute
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
