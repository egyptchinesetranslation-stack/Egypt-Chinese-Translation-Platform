import { useLocation, useNavigate } from "react-router-dom";
import "./ReviewRequest.css";
import RequestDetailsCard from "./RequestDetailsCard";
import SummaryCard from "./SummaryCard";
import backgroundImage from "../../../assets/L2.png";
import { useLanguage } from "../../../context/LanguageContext";

const text = {
  en: {
    noData: "No request data found. Please go back and select a service.",
    backToTranslators: "Back to Translators",
    title: "Review Your Request",
    subtitle: "Please verify your service details before connecting with the translator.",
  },
  zh: {
    noData: "未找到请求数据。请返回并选择服务。",
    backToTranslators: "返回翻译列表",
    title: "审核您的请求",
    subtitle: "请在与翻译人员联系之前确认您的服务详情。",
  },
};

function ReviewRequest() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = text[language];

  if (!state) {
    return (
      <div className="rr-page">
        <div className="rr-container">
          <p>{t.noData}</p>
          <button className="rr-back-link" onClick={() => navigate('/translators')}>{t.backToTranslators}</button>
        </div>
      </div>
    );
  }

  const formattedDate = state.date
    ? new Date(state.date).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="rr-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="rr-container">
        {/* Header */}
        <div className="rr-header">
          <h1 className="rr-header__title">{t.title}</h1>
          <p className="rr-header__subtitle">
            {t.subtitle}
          </p>
        </div>

        {/* Two-column grid */}
        <div className="rr-grid">
          <RequestDetailsCard
            serviceLabel={state.serviceLabel}
            date={formattedDate}
            timeStart={state.timeStart}
            hours={state.hours}
            translatorId={state.translatorId}
            language={language}
          />
          <SummaryCard
            translatorName={state.translatorName}
            translatorPhoto={state.translatorPhoto}
            translatorRating={state.translatorRating}
            translatorReviews={state.translatorReviews}
            serviceLabel={state.serviceLabel}
            servicePrice={state.servicePrice}
            selectedService={state.selectedService}
            hours={state.hours}
            subtotal={state.subtotal}
            serviceFee={state.serviceFee}
            total={state.total}
            translatorId={state.translatorId}
            date={state.date}
            timeStart={state.timeStart}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}

export default ReviewRequest;
