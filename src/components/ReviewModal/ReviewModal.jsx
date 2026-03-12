import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Star, Check, Send, Lock, Shield, Loader2, Camera, CheckCircle2, X } from "lucide-react";
import "./ReviewModal.css";

const text = {
  en: {
    title: "Service Completed!",
    subtitle: "Please take a moment to rate your experience",
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
    submitting: "Submitting...",
    successTitle: "Review Submitted!",
    successMsg: "Thank you for your feedback!",
    close: "Close",
    selectRating: "Please select a rating before submitting.",
  },
  zh: {
    title: "服务已完成！",
    subtitle: "请花一点时间评价您的体验",
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
    submitting: "提交中...",
    successTitle: "评价已提交！",
    successMsg: "感谢您的反馈！",
    close: "关闭",
    selectRating: "请先选择评分再提交。",
  },
};

const serviceTypeLabels = {
  en: { tourGuide: "TOUR GUIDE SERVICE", dailyTranslation: "DAILY TRANSLATION SERVICE", emergency: "EMERGENCY ASSISTANCE" },
  zh: { tourGuide: "导游服务", dailyTranslation: "日常翻译服务", emergency: "紧急援助服务" },
};

function ReviewModal() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const t = text[language];

  const [pendingBooking, setPendingBooking] = useState(null);
  const [translator, setTranslator] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  // Check for pending reviews on mount
  useEffect(() => {
    if (!currentUser?.uid) return;

    const checkPending = async () => {
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("clientId", "==", currentUser.uid),
          where("isCompleted", "==", true),
          where("isReviewed", "==", false),
          limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        const bookingDoc = snapshot.docs[0];
        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
        setPendingBooking(bookingData);

        // Fetch translator
        if (bookingData.translatorId) {
          const translatorSnap = await getDoc(doc(db, "users", bookingData.translatorId));
          if (translatorSnap.exists()) {
            setTranslator({ id: translatorSnap.id, ...translatorSnap.data() });
          }
        }

        setVisible(true);
        setLoading(false);
      } catch (err) {
        console.error("Error checking pending reviews:", err);
        setLoading(false);
      }
    };

    checkPending();
  }, [currentUser?.uid]);

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
    if (!pendingBooking?.serviceType) return "";
    return serviceTypeLabels[language]?.[pendingBooking.serviceType] || pendingBooking.serviceType;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setSubmitting(true);

    try {
      await addDoc(collection(db, "reviews"), {
        clientId: currentUser.uid,
        translatorId: pendingBooking.translatorId,
        bookingId: pendingBooking.id,
        rating: rating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "bookings", pendingBooking.id), {
        isCompleted: true,
        isReviewed: true,
      });

      // 3. Update translator's avgRating & totalReviews
      const oldAvg = translator?.avgRating || 0;
      const oldCount = translator?.totalReviews || 0;
      const newCount = oldCount + 1;
      const newAvg = Math.round(((oldAvg * oldCount + rating) / newCount) * 10) / 10;
      await updateDoc(doc(db, "users", pendingBooking.translatorId), {
        avgRating: newAvg,
        totalReviews: newCount,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  if (loading || !visible) return null;

  // ─── Success State ───
  if (submitted) {
    return (
      <div className="rm-backdrop" onClick={handleClose}>
        <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="rm-close-btn" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
          <div className="rm-header rm-header-success">
            <div className="rm-icon-circle">
              <CheckCircle2 size={26} color="white" />
            </div>
            <h2 className="rm-title">{t.successTitle}</h2>
            <p className="rm-subtitle">{t.successMsg}</p>
          </div>
          <div className="rm-body rm-body-center">
            <div className="rm-success-stars">
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
              <p className="rm-success-comment">"{reviewText}"</p>
            )}
            <button className="rm-submit-btn" onClick={handleClose}>
              {t.close}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Review Form ───
  return (
    <div className="rm-backdrop" onClick={handleClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rm-close-btn" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Blue Header */}
        <div className="rm-header">
          <div className="rm-icon-circle">
            <Check size={26} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="rm-title">{t.title}</h2>
          <p className="rm-subtitle">{t.subtitle}</p>
        </div>

        {/* Body */}
        <div className="rm-body">
          {/* Profile */}
          <div className="rm-profile">
            <div className="rm-avatar-wrapper">
              <img
                src={
                  translator?.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(translator?.name || "T")}&background=4f7edc&color=fff&size=140&bold=true`
                }
                alt={translator?.name || "Translator"}
                className="rm-avatar"
              />
              <span className="rm-avatar-badge">
                <Camera size={12} color="white" />
              </span>
            </div>
            <h3 className="rm-translator-name">{translator?.name || ""}</h3>
            <p className="rm-service-info">
              {getServiceLabel()} · {formatDate(pendingBooking?.createdAt)}
            </p>
          </div>

          {/* Rating */}
          <div className="rm-rating-section">
            <span className="rm-section-label">{t.rateTitle}</span>
            <div className="rm-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="rm-star-btn"
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
            <p className={`rm-star-hint ${ratingError ? "rm-star-hint-error" : ""}`}>
              {ratingError
                ? t.selectRating
                : rating === 0
                  ? t.clickStar
                  : `${t.youRated} ${rating} ${rating > 1 ? t.stars : t.star}`}
            </p>
          </div>

          {/* Textarea */}
          <div className="rm-textarea-section">
            <span className="rm-section-label">{t.detailedReview}</span>
            <div className="rm-textarea-wrapper">
              <textarea
                className="rm-textarea"
                placeholder={t.placeholder}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
              />
              <span className="rm-textarea-hint">{t.langSupport}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="rm-actions">
            <button
              type="button"
              className="rm-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="rm-btn-spinner" />
                  {t.submitting}
                </>
              ) : (
                <>
                  {t.submit}
                  <Send size={18} />
                </>
              )}
            </button>
            <button type="button" className="rm-skip-btn" onClick={handleClose}>
              {t.notNow}
            </button>
          </div>

          {/* Bottom Info */}
          <div className="rm-bottom-info">
            <div className="rm-info-item">
              <Lock size={14} />
              <span>{t.secureData}</span>
            </div>
            <div className="rm-info-item">
              <Shield size={14} />
              <span>{t.verifiedService}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
