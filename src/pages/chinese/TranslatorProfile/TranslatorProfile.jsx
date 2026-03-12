import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./TranslatorProfile.css";
import { useLanguage } from "../../../context/LanguageContext";
import backgroundImage from "../../../assets/L2.png";

const text = {
  en: {
    translator: "Translator",
    verifiedExpert: "Verified Expert",
    rating: "reviews",
    yearsExp: "Years Experience",
    phone: "Phone",
    email: "Email",
    bioTab: "Bio",
    certificatesTab: "Certificates",
    about: "About",
    keyCertifications: "Key Certifications",
    noCertifications: "No certifications available.",
    servicePricing: "Service Pricing",
    emergency: "Emergency",
    emergencyDesc: "Instant response (24/7)",
    tourGuide: "Tour Guide",
    tourGuideDesc: "Minimum 4 hours",
    daily: "Daily Assistance",
    dailyDesc: "Flexible duration",
    pricePerHour: "/hr",
    booking: "Book",
    selectService: "Select Service",
    date: "Date",
    duration: "Duration",
    estimateTotal: "Estimated Total",
    sendRequest: "Send Request Now",
    contactDirectly: "Contact Directly",
    loading: "Loading...",
    userNotFound: "User not found.",
    close: "Close",
    hours: "Hours",
    timeStart: "Start Time",
    fullDay: "Full Day"
  },
  zh: {
    translator: "翻译员",
    verifiedExpert: "已认证专家",
    rating: "条评价",
    yearsExp: "年经验",
    phone: "电话",
    email: "邮箱",
    bioTab: "简介",
    certificatesTab: "证书",
    about: "关于",
    keyCertifications: "主要证书",
    noCertifications: "暂无证书。",
    servicePricing: "服务价格",
    emergency: "紧急援助",
    emergencyDesc: "即时响应（全天候）",
    tourGuide: "导游",
    tourGuideDesc: "至少4小时",
    daily: "日常协助",
    dailyDesc: "时长灵活",
    pricePerHour: "/小时",
    booking: "预订",
    selectService: "选择服务",
    date: "日期",
    duration: "时长",
    estimateTotal: "预计总价",
    sendRequest: "立即发送请求",
    contactDirectly: "直接联系",
    loading: "加载中...",
    userNotFound: "未找到用户。",
    close: "关闭",
    hours: "小时",
    timeStart: "开始时间",
    fullDay: "全天"
  }
};

function TranslatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const t = text[language];
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("bio");
  const [certPreview, setCertPreview] = useState(null);
  const [loading, setLoading] = useState(true);
    // Booking form states
    const [selectedService, setSelectedService] = useState("");
    const [hours, setHours] = useState(2);
    const [date, setDate] = useState("");
    const [timeStart, setTimeStart] = useState("");

    // Auto-select first available service
    useEffect(() => {
      if (!user) return;
      const p = user.pricing || {};
      if ((p.tourGuide || 0) > 0) setSelectedService("tourGuide");
      else if ((p.emergency || 0) > 0) setSelectedService("emergency");
      else if ((p.daily || 0) > 0) setSelectedService("daily");
    }, [user]);

    // Calculate pricing
    const servicePrice = user?.pricing?.[selectedService] || 0;
    const subtotal = servicePrice * hours;
    const serviceFee = Math.round(subtotal * 0.15 * 100) / 100;
    const total = Math.round((subtotal + serviceFee) * 100) / 100;

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="tp-bg" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="tp-container"><div>{t.loading}</div></div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="tp-bg" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="tp-container"><div>{t.userNotFound}</div></div>
      </div>
    );
  }
  return (
    <div className="tp-bg" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="tp-container">
        <div className="tp-left">
          <div className="tp-profile-card">
            {/* Avatar at very top */}
            {/* Avatar at top left */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: -100 }}>
              <img
                src={user.photoURL}
                alt={user.name}
                className="tp-avatar"
                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              />
            </div>
            <div className="tp-avatar-wrapper"></div>
            {/* Modal for certificate preview */}
            {certPreview && (
              <div className="tp-cert-modal" onClick={() => setCertPreview(null)}>
                <div className="tp-cert-modal-content" onClick={e => e.stopPropagation()}>
                  <img src={certPreview.fileURL} alt={certPreview.name} style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 8 }} />
                  <div style={{ textAlign: "center", marginTop: 8 }}>{certPreview.name}</div>
                  <button style={{ marginTop: 12 }} onClick={() => setCertPreview(null)}>{t.close}</button>
                </div>
              </div>
            )}
            <div className="tp-profile-info">
              <div className="tp-profile-top">
                <div>
                  <div className="tp-name">{user.name}</div>
                  <div className="tp-subtitle">{t.translator}</div>
                </div>
                <div className="tp-badges">
                  <span className="tp-badge tp-badge-verified">{t.verifiedExpert}</span>
                  <span className="tp-badge tp-badge-rating">
                    <span className="tp-star">⭐</span> {user.avgRating} ({user.totalReviews} {t.rating})
                  </span>
                </div>
              </div>
              {/* Info Row */}
              <div className="tp-info-row">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="tp-icon"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                    <path d="M16 3h-8v4h8V3z"></path>
                  </svg>
                  {user.experienceYears}+ {t.yearsExp}
                </span>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="tp-icon"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 
                    19.79 19.79 0 0 1-8.63-3.07 
                    19.5 19.5 0 0 1-6-6 
                    19.79 19.79 0 0 1-3.07-8.67 
                    A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 
                    1.72 12.84 12.84 0 0 0 .7 2.81 
                    2 2 0 0 1-.45 2.11L8.09 9.91
                    a16 16 0 0 0 6 6l1-1.27
                    a2 2 0 0 1 2.11-.45
                    12.84 12.84 0 0 0 2.81.7
                    A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {user.phone}
                </span>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="tp-icon"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <path d="M3 7l9 6 9-6"></path>
                  </svg>
                  {user.email}
                </span>
              </div>
              {/* Only Bio and Certificates Tabs */}
              <div className="tp-tabs">
                <button
                  className={"tp-tab" + (activeTab === "bio" ? " active" : "")}
                  onClick={() => setActiveTab("bio")}
                >
                  {t.bioTab}
                </button>
                <button
                  className={"tp-tab" + (activeTab === "certificates" ? " active" : "")}
                  onClick={() => setActiveTab("certificates")}
                >
                  {t.certificatesTab}
                </button>
              </div>
              {/* About Section */}
              {activeTab === "bio" && (
                <div className="tp-about">
                  <div className="tp-about-title">{t.about} {user.name}</div>
                  <div className="tp-about-text">{user.bio}</div>
                </div>
              )}
              {/* Certificates Section only in Certificates tab */}
              {activeTab === "certificates" && (
                <div className="tp-info-cards">
                  <div className="tp-info-card">
                    <div className="tp-info-card-title">{t.keyCertifications}</div>
                    <div className="tp-cert-list">
                      {user.certifications && user.certifications.length > 0 ? user.certifications.map((cert, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setCertPreview(cert)}>
                          <img src={cert.fileURL} alt={cert.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} />
                          <span>{cert.name}</span>
                        </div>
                      )) : <span>{t.noCertifications}</span>}
                    </div>
                  </div>
                </div>
              )}
              {/* Service Pricing */}
              <div className="tp-pricing-section">
                <div className="tp-pricing-title">{t.servicePricing}</div>
                <div className="tp-pricing-cards">
                  {(user.pricing?.emergency || 0) > 0 && (
                    <div className="tp-pricing-card">
                      <div className="tp-pricing-type">{t.emergency}</div>
                      <div className="tp-pricing-desc">{t.emergencyDesc}</div>
                      <div className="tp-pricing-price">${user.pricing.emergency}{t.pricePerHour}</div>
                    </div>
                  )}
                  {(user.pricing?.tourGuide || 0) > 0 && (
                    <div className="tp-pricing-card">
                      <div className="tp-pricing-type">{t.tourGuide}</div>
                      <div className="tp-pricing-desc">{t.tourGuideDesc}</div>
                      <div className="tp-pricing-price">${user.pricing.tourGuide}{t.pricePerHour}</div>
                    </div>
                  )}
                  {(user.pricing?.daily || 0) > 0 && (
                    <div className="tp-pricing-card">
                      <div className="tp-pricing-type">{t.daily}</div>
                      <div className="tp-pricing-desc">{t.dailyDesc}</div>
                      <div className="tp-pricing-price">${user.pricing.daily}{t.pricePerHour}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tp-right">
          <div className="tp-booking-card">
            <div className="tp-booking-title">{t.booking} {user.name}</div>
            <form onSubmit={e => e.preventDefault()}>
              <div className="tp-form-group">
                <label className="tp-form-label">{t.selectService}</label>
                <select className="tp-form-input" value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                  {(user.pricing?.tourGuide || 0) > 0 && (
                    <option value="tourGuide">{t.tourGuide} (${user.pricing.tourGuide}{t.pricePerHour})</option>
                  )}
                  {(user.pricing?.emergency || 0) > 0 && (
                    <option value="emergency">{t.emergency} (${user.pricing.emergency}{t.pricePerHour})</option>
                  )}
                  {(user.pricing?.daily || 0) > 0 && (
                    <option value="daily">{t.daily} (${user.pricing.daily}{t.pricePerHour})</option>
                  )}
                </select>
              </div>
              <div className="tp-form-group">
                <label className="tp-form-label">{t.date}</label>
                <input type="date" className="tp-form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="tp-form-group">
                <label className="tp-form-label">{t.timeStart}</label>
                <input type="time" className="tp-form-input" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
              </div>
              <div className="tp-form-group">
                <label className="tp-form-label">{t.hours}</label>
                <input type="number" min={1} className="tp-form-input" value={hours} onChange={e => setHours(Number(e.target.value))} />
              </div>
              <div className="tp-estimate-box">
                <div className="tp-estimate-label">{language === "en" ? t.servicePricing : t.servicePricing}</div>
                <div className="tp-estimate-price">${servicePrice} × {hours} = ${subtotal}</div>
              </div>
              <div className="tp-estimate-box">
                <div className="tp-estimate-label">{language === "en" ? "Service Fee (15%)" : "服务费 (15%)"}</div>
                <div className="tp-estimate-price">${serviceFee}</div>
              </div>
              <div className="tp-estimate-box">
                <div className="tp-estimate-label">{t.estimateTotal}</div>
                <div className="tp-estimate-price">${total}</div>
              </div>
              <button
                type="button"
                className="tp-main-btn"
                disabled={!date || !timeStart || hours < 1}
                onClick={() => {
                const serviceLabels = { tourGuide: language === 'en' ? 'Tour Guide' : '导游', emergency: language === 'en' ? 'Emergency' : '紧急援助', daily: language === 'en' ? 'Daily Assistance' : '日常协助' };
                navigate(`/review-request/${id}`, {
                  state: {
                    translatorId: id,
                    translatorName: user.name,
                    translatorPhoto: user.photoURL,
                    translatorRating: user.avgRating,
                    translatorReviews: user.totalReviews,
                    selectedService,
                    serviceLabel: serviceLabels[selectedService],
                    servicePrice,
                    date,
                    timeStart,
                    hours,
                    subtotal,
                    serviceFee,
                    total,
                  }
                });
              }}>
                {t.sendRequest}
                <span className="tp-send-icon">
                  <svg width="22" height="22" fill="none">
                    <path d="M2 11h16M14 7l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <button type="button" className="tp-secondary-btn" onClick={() => navigate(`/dashboard?chat=${id}`)}>
                {t.contactDirectly}
              </button>
            </form>
            {/* Footer removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}


export default TranslatorProfile;