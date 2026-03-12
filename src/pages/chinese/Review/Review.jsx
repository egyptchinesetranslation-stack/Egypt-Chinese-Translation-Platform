import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { Star, Check, Send, Lock, Shield, Loader2, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import backgroundImage from "../../../assets/L2.png";
import "./Review.css";

const text = {
  en: {
    title: "Service Completed!",
    subtitle: "Thank you for using our service",
    rateTitle: "RATE YOUR EXPERIENCE",
    clickStar: "Click a star to rate",
    youRated: "You rated",
    star: "star",
    stars: "stars",
    detailedReview: "DETAILED REVIEW",
    placeholder: "How was the communication? Was the translator helpful? (Optional)",
    langSupport: "Support for 中文 & Arabic",
    submit: "Submit Review",
    notNow: "Not Now",
    secureData: "Secure Data",
    verifiedService: "Verified Service",
    loading: "Loading booking details...",
    notCompleted: "This service has not been completed yet.",
    alreadyReviewed: "You have already submitted a review for this booking.",
    notFound: "Booking not found.",
    goBack: "Go Back",
    submitting: "Submitting...",
    successTitle: "Review Submitted!",
    successMsg: "Thank you for your feedback. Your review helps improve our services.",
    goToDashboard: "Go to Dashboard",
    tourGuide: "TOUR GUIDE SERVICE",
    dailyTranslation: "DAILY TRANSLATION SERVICE",
    emergency: "EMERGENCY ASSISTANCE",
    selectRating: "Please select a rating before submitting.",
  },
  zh: {
    title: "服务已完成！",
    subtitle: "感谢您使用我们的服务",
    rateTitle: "评价您的体验",
    clickStar: "点击星星评分",
    youRated: "您评了",
    star: "颗星",
    stars: "颗星",
    detailedReview: "详细评价",
    placeholder: "沟通如何？翻译员是否有帮助？（可选）",
    langSupport: "支持中文和阿拉伯语",
    submit: "提交评价",
    notNow: "暂时不要",
    secureData: "数据安全",
    verifiedService: "已验证服务",
    loading: "加载预约详情...",
    notCompleted: "此服务尚未完成。",
    alreadyReviewed: "您已经提交了此预约的评价。",
    notFound: "未找到预约。",
    goBack: "返回",
    submitting: "提交中...",
    successTitle: "评价已提交！",
    successMsg: "感谢您的反馈，您的评价有助于改善我们的服务。",
    goToDashboard: "返回首页",
    tourGuide: "导游服务",
    dailyTranslation: "日常翻译服务",
    emergency: "紧急援助服务",
    selectRating: "请先选择评分再提交。",
  },
};

const serviceTypeLabels = {
  en: { tourGuide: "TOUR GUIDE SERVICE", dailyTranslation: "DAILY TRANSLATION SERVICE", emergency: "EMERGENCY ASSISTANCE" },
  zh: { tourGuide: "导游服务", dailyTranslation: "日常翻译服务", emergency: "紧急援助服务" },
};

function Review() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const t = text[language];

  const [booking, setBooking] = useState(null);
  const [translator, setTranslator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Fetch booking + translator data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingSnap = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingSnap.exists()) {
          setError("notFound");
          setLoading(false);
          return;
        }

        const bookingData = { id: bookingSnap.id, ...bookingSnap.data() };
        setBooking(bookingData);

        if (!bookingData.isCompleted) {
          setError("notCompleted");
          setLoading(false);
          return;
        }

        if (bookingData.isReviewed) {
          setError("alreadyReviewed");
          setLoading(false);
          return;
        }

        // Fetch translator info
        if (bookingData.translatorId) {
          const translatorSnap = await getDoc(doc(db, "users", bookingData.translatorId));
          if (translatorSnap.exists()) {
            setTranslator({ id: translatorSnap.id, ...translatorSnap.data() });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("notFound");
        setLoading(false);
      }
    };

    if (bookingId) fetchData();
  }, [bookingId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).toUpperCase();
  };

  const getServiceLabel = () => {
    if (!booking?.serviceType) return "";
    return serviceTypeLabels[language]?.[booking.serviceType] || booking.serviceType;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setSubmitting(true);

    try {
      // 1. Save review to "reviews" collection
      await addDoc(collection(db, "reviews"), {
        clientId: currentUser.uid,
        translatorId: booking.translatorId,
        bookingId: bookingId,
        rating: rating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      // 2. Update booking: isCompleted = true, isReviewed = true
      await updateDoc(doc(db, "bookings", bookingId), {
        isCompleted: true,
        isReviewed: true,
      });

      // 3. Update translator's avgRating & totalReviews
      const oldAvg = translator?.avgRating || 0;
      const oldCount = translator?.totalReviews || 0;
      const newCount = oldCount + 1;
      const newAvg = Math.round(((oldAvg * oldCount + rating) / newCount) * 10) / 10;
      await updateDoc(doc(db, "users", booking.translatorId), {
        avgRating: newAvg,
        totalReviews: newCount,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="review-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="review-overlay" />
        <div className="review-card">
          <div className="review-header">
            <Loader2 className="review-loading-spinner" size={40} />
            <h1 className="review-title">{t.loading}</h1>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="review-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="review-overlay" />
        <div className="review-card">
          <div className="review-header review-header-error">
            <div className="review-icon-circle review-icon-error">
              <AlertCircle size={26} color="white" />
            </div>
            <h1 className="review-title">
              {error === "alreadyReviewed"
                ? (language === "zh" ? "已评价" : "Already Reviewed")
                : (language === "zh" ? "无法评价" : "Cannot Review")}
            </h1>
            <p className="review-subtitle">{t[error]}</p>
          </div>
          <div className="review-body review-body-center">
            <button className="review-submit-btn" onClick={() => navigate("/my-requests")}>
              {t.goBack}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success State ───
  if (submitted) {
    return (
      <div className="review-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="review-overlay" />
        <div className="review-card">
          <div className="review-header review-header-success">
            <div className="review-icon-circle review-icon-success">
              <CheckCircle2 size={26} color="white" />
            </div>
            <h1 className="review-title">{t.successTitle}</h1>
            <p className="review-subtitle">{t.successMsg}</p>
          </div>
          <div className="review-body review-body-center">
            <div className="review-success-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  fill={star <= rating ? "#ff8a2b" : "#dcdcdc"}
                  stroke={star <= rating ? "#ff8a2b" : "#dcdcdc"}
                />
              ))}
            </div>
            {reviewText && (
              <p className="review-success-comment">"{reviewText}"</p>
            )}
            <button className="review-submit-btn" onClick={() => navigate("/my-requests")}>
              {t.goToDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Review Form ───
  return (
    <div className="review-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="review-overlay" />
      <div className="review-card">
        {/* Blue Header */}
        <div className="review-header">
          <div className="review-icon-circle">
            <Check size={26} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="review-title">{t.title}</h1>
          <p className="review-subtitle">{t.subtitle}</p>
        </div>

        {/* Body */}
        <div className="review-body">
          {/* Profile */}
          <div className="review-profile">
            <div className="review-avatar-wrapper">
              <img
                src={
                  translator?.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(translator?.name || "T")}&background=4f7edc&color=fff&size=140&bold=true`
                }
                alt={translator?.name || "Translator"}
                className="review-avatar"
              />
              <span className="review-avatar-badge">
                <Camera size={12} color="white" />
              </span>
            </div>
            <h2 className="review-translator-name">{translator?.name || ""}</h2>
            <p className="review-service-info">
              {getServiceLabel()} · {formatDate(booking?.createdAt)}
            </p>
          </div>

          {/* Rating */}
          <div className="review-rating-section">
            <span className="review-section-label">{t.rateTitle}</span>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="review-star-btn"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => { setRating(star); setRatingError(false); }}
                  aria-label={`${star} ${star > 1 ? t.stars : t.star}`}
                >
                  <Star
                    size={28}
                    fill={star <= (hoveredStar || rating) ? "#ff8a2b" : "#dcdcdc"}
                    stroke={star <= (hoveredStar || rating) ? "#ff8a2b" : "#dcdcdc"}
                  />
                </button>
              ))}
            </div>
            <p className={`review-star-hint ${ratingError ? "review-star-hint-error" : ""}`}>
              {ratingError
                ? t.selectRating
                : rating === 0
                  ? t.clickStar
                  : `${t.youRated} ${rating} ${rating > 1 ? t.stars : t.star}`}
            </p>
          </div>

          {/* Textarea */}
          <div className="review-textarea-section">
            <span className="review-section-label">{t.detailedReview}</span>
            <div className="review-textarea-wrapper">
              <textarea
                className="review-textarea"
                placeholder={t.placeholder}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
              />
              <span className="review-textarea-hint">{t.langSupport}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="review-actions">
            <button
              type="button"
              className="review-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="review-btn-spinner" />
                  {t.submitting}
                </>
              ) : (
                <>
                  {t.submit}
                  <Send size={18} />
                </>
              )}
            </button>
            <button
              type="button"
              className="review-skip-btn"
              onClick={() => navigate("/my-requests")}
            >
              {t.notNow}
            </button>
          </div>

          {submitError && (
            <p style={{ color: "#ef4444", textAlign: "center", marginTop: 8, fontSize: 14 }}>
              {language === "zh" ? "提交失败，请重试。" : "Submission failed. Please try again."}
            </p>
          )}

          {/* Bottom Info */}
          <div className="review-bottom-info">
            <div className="review-info-item">
              <Lock size={14} />
              <span>{t.secureData}</span>
            </div>
            <div className="review-info-item">
              <Shield size={14} />
              <span>{t.verifiedService}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;