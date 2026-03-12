import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/L2.png";
import "./MyRequests.css";

const text = {
  en: {
    title: "My Requests",
    subtitle: "Track and manage your sent requests.",
    searchPlaceholder: "Search...",
    sortNewest: "Sort by Date ↓",
    sortOldest: "Sort by Date ↑",
    loading: "Loading requests...",
    empty: "No requests found.",
    translator: "Translator",
    tourGuide: "Tour Guide",
    emergency: "Emergency",
    dailyAssistance: "Daily Assistance",
    completed: "Completed",
    accepted: "In Progress",
    pending: "Pending",
    hours: "Hours",
    timeRemaining: "Time Remaining",
    expired: "Time Expired",
    openChat: "Open Chat",
    displaying: (start, end, total) => `Displaying ${start}-${end} of ${total} requests`,
  },
  zh: {
    title: "我的请求",
    subtitle: "跟踪和管理您发送的请求。",
    searchPlaceholder: "搜索...",
    sortNewest: "按日期排序 ↓",
    sortOldest: "按日期排序 ↑",
    loading: "正在加载请求...",
    empty: "未找到请求。",
    translator: "翻译员",
    tourGuide: "导游",
    emergency: "紧急援助",
    dailyAssistance: "日常翻译",
    completed: "已完成",
    accepted: "进行中",
    pending: "待处理",
    hours: "小时",
    timeRemaining: "剩余时间",
    expired: "已超时",
    openChat: "打开聊天",
    displaying: (start, end, total) => `显示第${start}-${end}条，共${total}条请求`,
  },
};

function getServiceLabels(t) {
  return {
    tourGuide: t.tourGuide,
    emergency: t.emergency,
    daily: t.dailyAssistance,
  };
}

function getStatusInfo(booking, t) {
  if (booking.isCompleted) return { label: t.completed, className: "mr-badge--completed" };
  if (booking.isAccepted) return { label: t.accepted, className: "mr-badge--accepted" };
  return { label: t.pending, className: "mr-badge--pending" };
}

function getTimeRemaining(booking, t) {
  if (!booking.startTime || !booking.serviceDuration || !booking.isAccepted || booking.isCompleted) return null;
  const start = booking.startTime.toDate ? booking.startTime.toDate() : new Date(booking.startTime);
  const deadline = new Date(start.getTime() + booking.serviceDuration * 60 * 60 * 1000);
  const now = new Date();
  const diff = deadline - now;
  if (diff <= 0) return { text: t.expired, expired: true };
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${hrs}h ${mins}m`, expired: false };
}

function formatDate(timestamp, language) {
  if (!timestamp) return "—";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MyRequests() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = text[language];
  const SERVICE_LABELS = getServiceLabels(t);
  const [bookings, setBookings] = useState([]);
  const [translators, setTranslators] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setTick] = useState(0);
  const ITEMS_PER_PAGE = 4;

  // Refresh time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "bookings"),
      where("clientId", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, async (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(items);

      // Fetch translator profiles
      const uniqueIds = [...new Set(items.map((b) => b.translatorId))];
      const profiles = {};
      await Promise.all(
        uniqueIds.map(async (tid) => {
          const userSnap = await getDoc(doc(db, "users", tid));
          if (userSnap.exists()) profiles[tid] = userSnap.data();
        })
      );
      setTranslators(profiles);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching bookings:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((b) => {
        const name = translators[b.translatorId]?.name?.toLowerCase() || "";
        const service = (SERVICE_LABELS[b.serviceType] || "").toLowerCase();
        return name.includes(term) || service.includes(term);
      });
    }
    list.sort((a, b) => {
      const tA = a.createdAt?.toDate?.() || new Date(0);
      const tB = b.createdAt?.toDate?.() || new Date(0);
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });
    return list;
  }, [bookings, searchTerm, sortOrder, translators]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  return (
    <div className="mr-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="mr-overlay" />

      <div className="mr-container">
        {/* Header */}
        <div className="mr-header">
          <div className="mr-header__left">
            <h1 className="mr-header__title">{t.title}</h1>
            <p className="mr-header__subtitle">{t.subtitle}</p>
          </div>
          <div className="mr-header__right">
            {searchOpen && (
              <input
                className="mr-search-input"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            )}
            <button
              className="mr-search-btn"
              onClick={() => { setSearchOpen((p) => !p); if (searchOpen) setSearchTerm(""); }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <div className="mr-sort-wrapper">
              <select
                className="mr-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="oldest">{t.sortOldest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="mr-loading">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="mr-empty">{t.empty}</div>
        ) : (
          <>
            <div className="mr-grid">
              {paginatedItems.map((booking) => {
                const tr = translators[booking.translatorId] || {};
                const status = getStatusInfo(booking, t);
                const timeLeft = getTimeRemaining(booking, t);
                const avatarSrc = tr.photoURL
                  || `https://ui-avatars.com/api/?name=${encodeURIComponent(tr.name || "T")}&background=e0e7ff&color=3730a3&size=96&bold=true`;

                return (
                  <div className="mr-card" key={booking.id}>
                    {/* Card Header */}
                    <div className="mr-card__header">
                      <div className="mr-card__profile">
                        <img className="mr-card__avatar" src={avatarSrc} alt={tr.name} />
                        <span className="mr-card__name">
                          {tr.name || t.translator}
                          <svg className="mr-verified" width="16" height="16" viewBox="0 0 24 24" fill="#1E88E5">
                            <path d="M12 2L9.19 4.47 5.5 4.35 4.35 7.94 1.54 10.27 2.92 13.77 1.54 17.27 4.35 19.6 5.5 23.19 9.19 23.07 12 25.54 14.81 23.07 18.5 23.19 19.65 19.6 22.46 17.27 21.08 13.77 22.46 10.27 19.65 7.94 18.5 4.35 14.81 4.47z" transform="scale(0.85) translate(2,2)" />
                            <path d="M10 15.5L7.5 13l-1.4 1.4L10 18.3l8-8-1.4-1.4z" fill="#fff" transform="scale(0.85) translate(2,2)" />
                          </svg>
                        </span>
                      </div>
                      <div className="mr-card__right-top">
                        <span className="mr-card__price">${booking.price?.toFixed?.(2) ?? booking.price}</span>
                        <span className={`mr-badge ${status.className}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="mr-card__info">
                      <div className="mr-card__info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-8v4h8V3z" /></svg>
                        <span>{SERVICE_LABELS[booking.serviceType] || booking.serviceType}</span>
                      </div>
                      <div className="mr-card__info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>{formatDate(booking.createdAt, language)}</span>
                      </div>
                      <div className="mr-card__info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>{booking.serviceDuration} {t.hours}</span>
                      </div>
                      {timeLeft && (
                        <div className="mr-card__info-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={timeLeft.expired ? "#d32f2f" : "#2e7d32"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          <span style={{ color: timeLeft.expired ? "#d32f2f" : "#2e7d32", fontWeight: 600 }}>
                            {t.timeRemaining}: {timeLeft.text}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mr-card__actions">
                      <button
                        className={`mr-btn mr-btn--chat ${booking.isCompleted ? "mr-btn--disabled" : ""}`}
                        disabled={booking.isCompleted}
                        onClick={() => navigate(`/dashboard?chat=${booking.translatorId}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        {t.openChat}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mr-pagination">
                <button
                  className="mr-pagination__arrow"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`mr-pagination__num ${currentPage === page ? "mr-pagination__num--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="mr-pagination__arrow"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            )}

            <p className="mr-footer-text">
              {t.displaying(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                Math.min(currentPage * ITEMS_PER_PAGE, filtered.length),
                filtered.length
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default MyRequests;