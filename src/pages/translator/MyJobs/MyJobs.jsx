import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./MyJobs.css";

const text = {
  en: {
    title: "My Jobs",
    subtitle: "Manage incoming and active translation jobs.",
    loading: "Loading jobs...",
    empty: "No jobs found.",
    tourGuide: "Tour Guide",
    emergency: "Emergency",
    dailyAssistance: "Daily Assistance",
    client: "Client",
    completed: "Completed",
    inProgress: "In Progress",
    pending: "Pending Acceptance",
    hours: "Hours",
    timeRemaining: "Time Remaining",
    expired: "Time Expired",
    accept: "Accept Job",
    markComplete: "Mark Complete",
    accepting: "Accepting...",
    completing: "Completing...",
    openChat: "Open Chat",
    filterAll: "All",
    filterPending: "Pending",
    filterActive: "Active",
    filterCompleted: "Completed",
  },
  zh: {
    title: "我的工作",
    subtitle: "管理收到的和进行中的翻译工作。",
    loading: "正在加载工作...",
    empty: "未找到工作。",
    tourGuide: "导游",
    emergency: "紧急援助",
    dailyAssistance: "日常翻译",
    client: "客户",
    completed: "已完成",
    inProgress: "进行中",
    pending: "等待接受",
    hours: "小时",
    timeRemaining: "剩余时间",
    expired: "已超时",
    accept: "接受工作",
    markComplete: "标记完成",
    accepting: "接受中...",
    completing: "完成中...",
    openChat: "打开聊天",
    filterAll: "全部",
    filterPending: "待处理",
    filterActive: "进行中",
    filterCompleted: "已完成",
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
  if (booking.isCompleted) return { label: t.completed, className: "mj-badge--completed", key: "completed" };
  if (booking.isAccepted) return { label: t.inProgress, className: "mj-badge--active", key: "active" };
  return { label: t.pending, className: "mj-badge--pending", key: "pending" };
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
  return d.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function MyJobs() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = text[language];
  const SERVICE_LABELS = getServiceLabels(t);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [, setTick] = useState(0);

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
      where("translatorId", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, async (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(items);

      const uniqueIds = [...new Set(items.map((b) => b.clientId))];
      const profiles = {};
      await Promise.all(
        uniqueIds.map(async (cid) => {
          const userSnap = await getDoc(doc(db, "users", cid));
          if (userSnap.exists()) profiles[cid] = userSnap.data();
        })
      );
      setClients(profiles);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching jobs:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleAccept = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: "accepting" }));
    try {
      await updateDoc(doc(db, "bookings", bookingId), { isAccepted: true });
    } catch (err) {
      console.error("Error accepting job:", err);
    }
    setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
  };

  const handleComplete = async (booking) => {
    setActionLoading((prev) => ({ ...prev, [booking.id]: "completing" }));
    try {
      await updateDoc(doc(db, "bookings", booking.id), { isCompleted: true });
      // Add booking price to translator's totalEarnings
      await updateDoc(doc(db, "users", currentUser.uid), {
        totalEarnings: increment(booking.price || 0),
      });
    } catch (err) {
      console.error("Error completing job:", err);
    }
    setActionLoading((prev) => ({ ...prev, [booking.id]: null }));
  };

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (filter !== "all") {
      list = list.filter((b) => {
        const s = getStatusInfo(b, t);
        return s.key === filter;
      });
    }
    list.sort((a, b) => {
      const tA = a.createdAt?.toDate?.() || new Date(0);
      const tB = b.createdAt?.toDate?.() || new Date(0);
      return tB - tA;
    });
    return list;
  }, [bookings, filter, t]);

  return (
    <div className="mj-page">
      <div className="mj-container">
        {/* Header */}
        <div className="mj-header">
          <div>
            <h1 className="mj-header__title">{t.title}</h1>
            <p className="mj-header__subtitle">{t.subtitle}</p>
          </div>
          <div className="mj-filters">
            {["all", "pending", "active", "completed"].map((f) => (
              <button
                key={f}
                className={`mj-filter-btn ${filter === f ? "mj-filter-btn--active" : ""}`}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
              >
                {t[`filter${f.charAt(0).toUpperCase() + f.slice(1)}`]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mj-loading">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="mj-empty">{t.empty}</div>
        ) : (
          <>
          <div className="mj-grid">
            {filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => {
              const cl = clients[booking.clientId] || {};
              const status = getStatusInfo(booking, t);
              const timeLeft = getTimeRemaining(booking, t);
              const isAccepting = actionLoading[booking.id] === "accepting";
              const isCompleting = actionLoading[booking.id] === "completing";

              return (
                <div className={`mj-card ${status.key === "pending" ? "mj-card--pending" : ""}`} key={booking.id}>
                  {/* Card Header */}
                  <div className="mj-card__header">
                    <div className="mj-card__client">
                      <div className="mj-card__avatar-wrapper">
                        <img
                          className="mj-card__avatar"
                          src={cl.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(cl.name || "C")}&background=e0e7ff&color=3730a3&size=96&bold=true`}
                          alt={cl.name}
                        />
                      </div>
                      <div>
                        <span className="mj-card__name">{cl.name || t.client}</span>
                        <span className="mj-card__date">{formatDate(booking.createdAt, language)}</span>
                      </div>
                    </div>
                    <div className="mj-card__right-top">
                      <span className="mj-card__price">${booking.price?.toFixed?.(2) ?? booking.price}</span>
                      <span className={`mj-badge ${status.className}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mj-card__info">
                    <div className="mj-card__info-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-8v4h8V3z" /></svg>
                      <span>{SERVICE_LABELS[booking.serviceType] || booking.serviceType}</span>
                    </div>
                    <div className="mj-card__info-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      <span>{booking.serviceDuration} {t.hours}</span>
                    </div>
                    {timeLeft && (
                      <div className="mj-card__info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={timeLeft.expired ? "#d32f2f" : "#2e7d32"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span style={{ color: timeLeft.expired ? "#d32f2f" : "#2e7d32", fontWeight: 600 }}>
                          {t.timeRemaining}: {timeLeft.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mj-card__actions">
                    {!booking.isAccepted && !booking.isCompleted && (
                      <button
                        className="mj-btn mj-btn--accept"
                        onClick={() => handleAccept(booking.id)}
                        disabled={isAccepting}
                      >
                        {isAccepting ? t.accepting : t.accept}
                      </button>
                    )}
                    {booking.isAccepted && !booking.isCompleted && (
                      <>
                        <button
                          className="mj-btn mj-btn--complete"
                          onClick={() => handleComplete(booking)}
                          disabled={isCompleting}
                        >
                          {isCompleting ? t.completing : t.markComplete}
                        </button>
                        <button className="mj-btn mj-btn--chat" onClick={() => navigate(`/translator/messages?chat=${booking.clientId}`)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          {t.openChat}
                        </button>
                      </>
                    )}
                    {booking.isCompleted && (
                      <span className="mj-completed-text">{t.completed}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {Math.ceil(filtered.length / ITEMS_PER_PAGE) > 1 && (
            <div className="mj-pagination">
              <button
                className="mj-pagination__arrow"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="mj-pagination__nums">
                {Array.from({ length: Math.ceil(filtered.length / ITEMS_PER_PAGE) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`mj-pagination__num ${currentPage === i + 1 ? "mj-pagination__num--active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="mj-pagination__arrow"
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filtered.length / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}

export default MyJobs;