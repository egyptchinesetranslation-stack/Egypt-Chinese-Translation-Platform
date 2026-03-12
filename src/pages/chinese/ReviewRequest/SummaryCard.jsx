import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

const text = {
  en: {
    summary: "Summary",
    reviews: "reviews",
    certifiedTranslator: "Certified Translator",
    platformFee: "Platform Service Fee",
    totalEstimate: "TOTAL ESTIMATE",
    taxIncluded: "tax included",
    confirmRequest: "Confirm Request",
    sending: "Sending...",
    secureEncryption: "SECURE ENCRYPTION",
  },
  zh: {
    summary: "摘要",
    reviews: "条评价",
    certifiedTranslator: "认证翻译",
    platformFee: "平台服务费",
    totalEstimate: "预估总计",
    taxIncluded: "含税",
    confirmRequest: "确认请求",
    sending: "发送中...",
    secureEncryption: "安全加密",
  },
};

function SummaryCard({
  translatorName,
  translatorPhoto,
  translatorRating,
  translatorReviews,
  serviceLabel,
  servicePrice,
  selectedService,
  hours,
  subtotal,
  serviceFee,
  total,
  translatorId,
  date,
  timeStart,
  language = "en",
}) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const t = text[language];
  const avatarSrc = translatorPhoto
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(translatorName)}&background=e0e7ff&color=3730a3&size=96&font-size=0.4&bold=true`;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Combine date + timeStart into a Firestore Timestamp
      const startDate = new Date(`${date}T${timeStart}`);
      await addDoc(collection(db, "bookings"), {
        clientId: currentUser.uid,
        translatorId,
        serviceType: selectedService,
        serviceDuration: hours,
        price: total,
        isCompleted: false,
        isReviewed: false,
        isAccepted: false,
        startTime: Timestamp.fromDate(startDate),
        createdAt: serverTimestamp(),
      });
      navigate("/my-requests");
    } catch (err) {
      console.error("Error creating booking:", err);
      setLoading(false);
    }
  };

  return (
    <div className="rr-summary">
      <h3 className="rr-summary__title">{t.summary}</h3>

      {/* Translator Profile */}
      <div className="rr-translator">
        <img
          className="rr-translator__avatar"
          src={avatarSrc}
          alt={translatorName}
        />
        <div className="rr-translator__info">
          <span className="rr-translator__name">{translatorName}</span>
          <span className="rr-translator__rating">⭐ {translatorRating} ({translatorReviews} {t.reviews})</span>
          <span className="rr-translator__badge">{t.certifiedTranslator}</span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="rr-pricing">
        <div className="rr-pricing__row">
          <span>{serviceLabel} (${servicePrice} × {hours}hrs)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="rr-pricing__row">
          <span>{t.platformFee}</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="rr-pricing__divider" />
        <div className="rr-pricing__total">
          <span className="rr-pricing__total-label">{t.totalEstimate}</span>
          <div className="rr-pricing__total-amount">
            <span className="rr-pricing__price">${total.toFixed(2)}</span>
            <span className="rr-pricing__tax">{t.taxIncluded}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="rr-confirm-btn" onClick={handleConfirm} disabled={loading}>
        {loading ? t.sending : t.confirmRequest}
        {!loading && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>

      {/* Secure Text */}
      <div className="rr-secure">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{t.secureEncryption}</span>
      </div>
    </div>
  );
}

export default SummaryCard;
