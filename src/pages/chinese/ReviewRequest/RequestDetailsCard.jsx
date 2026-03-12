import { useNavigate } from "react-router-dom";
import InfoBox from "./InfoBox";

const text = {
  en: {
    serviceType: "SERVICE TYPE",
    date: "DATE",
    timeStart: "START TIME",
    duration: "DURATION",
    hoursUnit: "Hours",
    meetingLabel: "Meeting Point / Requirements",
    meetingPlaceholder: "Enter specific location or any special translation requirements (e.g. medical terminology, business niche)...",
    noteText: "Emergency services are billed at a higher rate. For tour guides, please ensure you have arranged transportation separately or discuss it in the chat after confirmation.",
    backToProfile: "Back to Profile",
  },
  zh: {
    serviceType: "服务类型",
    date: "日期",
    timeStart: "开始时间",
    duration: "时长",
    hoursUnit: "小时",
    meetingLabel: "会面地点 / 要求",
    meetingPlaceholder: "请输入具体地点或任何特殊翻译要求（例如医学术语、商务领域）...",
    noteText: "紧急服务将按较高费率计费。如需导游服务，请确保您已单独安排交通，或在确认后通过聊天进行讨论。",
    backToProfile: "返回个人资料",
  },
};

function RequestDetailsCard({ serviceLabel, date, timeStart, hours, translatorId, language = "en" }) {
  const navigate = useNavigate();
  const t = text[language];

  return (
    <div className="rr-left">
      <div className="rr-card">
        {/* Info Boxes */}
        <div className="rr-info-grid">
          <InfoBox
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            label={t.serviceType}
            value={serviceLabel}
          />
          <InfoBox
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            label={t.date}
            value={date}
          />
          <InfoBox
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label={t.timeStart}
            value={timeStart || "—"}
          />
          <InfoBox
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label={t.duration}
            value={`${hours} ${t.hoursUnit}`}
          />
        </div>

        {/* Textarea */}
        <div className="rr-textarea-section">
          <label className="rr-textarea-label">{t.meetingLabel}</label>
          <textarea
            className="rr-textarea"
            placeholder={t.meetingPlaceholder}
          />
        </div>

        {/* Note Box */}
        <div className="rr-note-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A6B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p>{t.noteText}</p>
        </div>
      </div>

      {/* Back Link */}
      <button className="rr-back-link" onClick={() => navigate(`/translator/${translatorId}`)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t.backToProfile}
      </button>
    </div>
  );
}

export default RequestDetailsCard;
