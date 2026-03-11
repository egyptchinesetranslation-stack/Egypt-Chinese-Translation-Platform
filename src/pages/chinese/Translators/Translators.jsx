import { useState, useEffect } from "react";
import "./Translators.css";
import { MessageCircle, Check, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import backgroundImage from "../../../assets/L2.png";
import { useLanguage } from "../../../context/LanguageContext";
import { db } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const text = {
  en: {
    filters: "Filters",
    resetAll: "Reset All",
    serviceType: "SERVICE TYPE",
    emergencyAssistance: "Emergency Assistance",
    tourGuide: "Tour Guide",
    dailyTranslation: "Daily Translation",
    priceRange: "PRICE RANGE",
    minRating: "MIN RATING",
    experience: "EXPERIENCE",
    anyExperience: "Any Experience",
    availableTranslators: "Available Translators",
    foundTranslators: "Found translators in Cairo, Egypt",
    yearsExp: "YEARS EXPERIENCE",
    verified: "VERIFIED",
    reviews: "Reviews",
    tourGuideService: "Tour Guide",
    dailyTranslationService: "Daily Translation",
    emergencyService: "Emergency",
    perHour: "/hr",
    viewProfile: "View Profile"
  },
  zh: {
    filters: "筛选",
    resetAll: "重置全部",
    serviceType: "服务类型",
    emergencyAssistance: "紧急援助",
    tourGuide: "导游",
    dailyTranslation: "日常翻译",
    priceRange: "价格范围",
    minRating: "最低评分",
    experience: "经验",
    anyExperience: "不限经验",
    availableTranslators: "可用翻译员",
    foundTranslators: "在开罗，埃及找到的翻译员",
    yearsExp: "年经验",
    verified: "已认证",
    reviews: "条评价",
    tourGuideService: "导游",
    dailyTranslationService: "日常翻译",
    emergencyService: "紧急援助",
    perHour: "/小时",
    viewProfile: "查看资料"
  }
};

function Translators() {
  const { language } = useLanguage();
  const navigate = useNavigate();   
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [minRating, setMinRating] = useState(0);
  const [filters, setFilters] = useState({
    emergencyAssistance: true,
    tourGuide: true,
    dailyTranslation: true
  });
  const [experience, setExperience] = useState("any");

  // Fetch translators from Firebase with real-time updates
  useEffect(() => {
    setLoading(true);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "translator"));
    
    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const translatorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTranslators(translatorsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching translators:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const t = text[language];

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      emergencyAssistance: true,
      tourGuide: true,
      dailyTranslation: true
    });
    setPriceRange([0, 300]);
    setMinRating(0);
    setExperience("any");
  };

  const handleRatingClick = (rating) => {
    setMinRating(rating === minRating ? 0 : rating);
  };

  // Filter translators based on criteria
  const filteredTranslators = translators.filter(translator => {
    const rating = translator.avgRating || 0;
    const tourGuidePrice = translator.pricing?.tourGuide || 0;
    const years = translator.experienceYears || 0;
    
    const meetsRating = rating >= minRating;
    // Only apply price filter if user has changed the slider (not at default max of 300)
    const meetsPrice = priceRange[1] === 300 || tourGuidePrice <= priceRange[1];
    const meetsExperience = experience === "any" || 
                            (experience === "1-3" && years >= 1 && years <= 3) ||
                            (experience === "4-6" && years >= 4 && years <= 6) ||
                            (experience === "7+" && years >= 7);
    return meetsRating && meetsPrice && meetsExperience;
  });

  const translatorsPerPage = 3;
  const totalPages = Math.ceil(filteredTranslators.length / translatorsPerPage);
  const startIndex = (currentPage - 1) * translatorsPerPage;
  const displayedTranslators = filteredTranslators.slice(startIndex, startIndex + translatorsPerPage);

  const next = () => {
    if (currentPage === totalPages) return;
    setCurrentPage(currentPage + 1);
  };

  const prev = () => {
    if (currentPage === 1) return;
    setCurrentPage(currentPage - 1);
  };

  const renderStars = (count, interactive = false, filled = 0) => {
    return Array.from({ length: count }, (_, i) => (
      <Star
        key={i}
        size={interactive ? 20 : 14}
        className={`star-icon ${i < filled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => handleRatingClick(i + 1) : undefined}
        fill={i < filled ? "#fbbf24" : "none"}
        stroke={i < filled ? "#fbbf24" : "#d1d5db"}
      />
    ));
  };

  return (
    <div className="translators-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Background Pattern */}
      <div className="background-overlay"></div>

      <div className="translators-main-container">
        {/* Left Sidebar - Filters */}
        <aside className="filters-sidebar">
          <div className="filters-card">
            <div className="filters-header">
              <h3>{t.filters}</h3>
              <button className="reset-btn" onClick={handleResetFilters}>
                {t.resetAll}
              </button>
            </div>

            {/* Service Type Filter */}
            <div className="filter-section">
              <h4>{t.serviceType}</h4>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.emergencyAssistance}
                    onChange={() => handleFilterChange('emergencyAssistance')}
                  />
                  <span className="checkmark"></span>
                  {t.emergencyAssistance}
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.tourGuide}
                    onChange={() => handleFilterChange('tourGuide')}
                  />
                  <span className="checkmark"></span>
                  {t.tourGuide}
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.dailyTranslation}
                    onChange={() => handleFilterChange('dailyTranslation')}
                  />
                  <span className="checkmark"></span>
                  {t.dailyTranslation}
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
              <h4>{t.priceRange}</h4>
              <div className="price-range-container">
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="price-slider"
                />
                <div className="price-labels">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Min Rating Filter */}
            <div className="filter-section">
              <h4>{t.minRating}</h4>
              <div className="rating-filter">
                {renderStars(5, true, minRating)}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="filter-section">
              <h4>{t.experience}</h4>
              <select
                className="experience-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="any">{t.anyExperience}</option>
                <option value="1-3">1-3 {language === "zh" ? "年" : "Years"}</option>
                <option value="4-6">4-6 {language === "zh" ? "年" : "Years"}</option>
                <option value="7+">7+ {language === "zh" ? "年" : "Years"}</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Right Content - Translators Grid */}
        <main className="translators-content">
          <div className="content-header">
            <h1>{t.availableTranslators}</h1>
            <p>{t.foundTranslators}</p>
          </div>

          <div className="translators-grid">
            {loading ? (
              <div className="loading-container">
                <Loader2 className="loading-spinner" size={40} />
                <p>{language === "zh" ? "加载中..." : "Loading translators..."}</p>
              </div>
            ) : displayedTranslators.length > 0 ? (
              displayedTranslators.map((translator) => (
                <div className="translator-card" key={translator.id}>
                  {/* Card Header */}
                  <div className="card-header">
                    <img
                      src={translator.photoURL || "https://i.pravatar.cc/150?img=1"}
                      alt={translator.name}
                      className="translator-avatar"
                    />
                    <div className="translator-info">
                      <h3>{translator.name || ""}</h3>
                      <p className="experience-text">
                        {translator.experienceYears || 0} {t.yearsExp}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="translator-description">
                    {translator.bio || (language === "zh" ? "暂无简介" : "No bio available")}
                  </p>

                  {/* Rating */}
                  <div className="rating-section">
                    <div className="rating-stars">
                      <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                      <span className="rating-value">{translator.avgRating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <span className="reviews-count">
                      {translator.totalReviews || 0} {t.reviews}
                    </span>
                  </div>

                  {/* Services */}
                  <div className="services-section">
                    <div className="service-row">
                      <span>{t.tourGuideService}</span>
                      <span className="service-price">
                        ${translator.pricing?.tourGuide || 0}{t.perHour}
                      </span>
                    </div>
                    <div className="service-row">
                      <span>{t.dailyTranslationService}</span>
                      <span className="service-price">
                        ${translator.pricing?.daily || 0}{t.perHour}
                      </span>
                    </div>
                    <div className="service-row">
                      <span>{t.emergencyService}</span>
                      <span className="service-price">
                        ${translator.pricing?.emergency || 0}{t.perHour}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <button
                      className="view-profile-btn"
                      onClick={() =>
                        navigate(`/translator/${translator.id}`)
                      }
                    >
                      {t.viewProfile}
                    </button>
                    <button className="message-btn">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>{language === "zh" ? "未找到翻译员" : "No translators found"}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn nav-btn"
                onClick={prev}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="page-btn nav-btn"
                onClick={next}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Translators;