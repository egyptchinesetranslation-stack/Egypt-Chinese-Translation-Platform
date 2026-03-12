import React, { useState, useEffect, useMemo } from "react";
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
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import {
  DollarSign,
  Briefcase,
  Star,
  Clock,
  Search,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import "./TranslatorDashboard.css";

/* ───── i18n ───── */
const text = {
  en: {
    totalEarnings: "TOTAL EARNINGS",
    activeJobs: "ACTIVE JOBS",
    avgRating: "AVG. RATING",
    pendingClearance: "PENDING CLEARANCE",
    jobManagement: "Job Management",
    searchPlaceholder: "Client name...",
    tabIncoming: "Incoming",
    tabActive: "Active Jobs",
    tabCompleted: "Completed",
    responseTime: "RESPONSE TIME LEFT",
    reject: "Reject",
    accept: "Accept",
    accepting: "Accepting…",
    complete: "Complete",
    completing: "Completing…",
    noJobs: "No jobs in this category.",
    activeServices: "Active Services",
    sessions: "Sessions",
    openChat: "Open Chat",
    noActive: "No active sessions right now.",
    quickEarnings: "Quick Earnings Actions",
    withdraw: "Withdraw",
    earningsMonth: "Earnings",
    completedMonth: "Completed",
    tourGuide: "Tour Guide",
    emergency: "Emergency Assistance",
    daily: "Daily Assistant",
    hours: "hours",
    est: "Est.",
    expired: "Expired",
    inMeeting: "In meeting",
    startsAt: "Starts at",
    startedAgo: "Started",
    ago: "ago",
  },
  zh: {
    totalEarnings: "总收入",
    activeJobs: "进行中",
    avgRating: "平均评分",
    pendingClearance: "待结算",
    jobManagement: "工作管理",
    searchPlaceholder: "客户姓名...",
    tabIncoming: "新请求",
    tabActive: "进行中",
    tabCompleted: "已完成",
    responseTime: "剩余响应时间",
    reject: "拒绝",
    accept: "接受",
    accepting: "接受中…",
    complete: "完成",
    completing: "完成中…",
    noJobs: "此类别没有工作。",
    activeServices: "活跃服务",
    sessions: "会话",
    openChat: "打开聊天",
    noActive: "目前没有活跃会话。",
    quickEarnings: "快速收入操作",
    withdraw: "提现",
    earningsMonth: "收入",
    completedMonth: "已完成",
    tourGuide: "导游",
    emergency: "紧急援助",
    daily: "日常助理",
    hours: "小时",
    est: "预估",
    expired: "已过期",
    inMeeting: "会议中",
    startsAt: "开始于",
    startedAgo: "已开始",
    ago: "前",
  },
};

const SERVICE_MAP = { tourGuide: "tourGuide", emergency: "emergency", daily: "daily" };
const SERVICE_COLORS = {
  tourGuide: { bg: "#E6F0FF", color: "#2E5BFF" },
  emergency: { bg: "#FFEAEA", color: "#FF4D4F" },
  daily: { bg: "#ECFDF5", color: "#10B981" },
};

/* ───── Sub-components ───── */
function StatCard({ icon, label, value, badge, badgeColor }) {
  return (
    <div className="td-stat-card">
      <div className="td-stat-card__top">
        <div className="td-stat-icon-box">{icon}</div>
        {badge && (
          <span className="td-stat-badge" style={{ background: badgeColor || "#ECFDF5", color: badgeColor ? "#fff" : "#22c55e" }}>
            {badge}
          </span>
        )}
      </div>
      <span className="td-stat-label">{label}</span>
      <span className="td-stat-value">{value}</span>
    </div>
  );
}

function JobItem({ booking, client, t, actionLoading, onAccept, onComplete }) {
  const serviceKey = booking.serviceType || "tourGuide";
  const serviceLabel = t[serviceKey] || t.tourGuide;
  const colors = SERVICE_COLORS[serviceKey] || SERVICE_COLORS.tourGuide;

  const timeLeft = getResponseTimeLeft(booking);

  return (
    <div className="td-job-item">
      <div className="td-job-left">
        {client?.photoURL ? (
          <img src={client.photoURL} alt="" className="td-job-avatar" />
        ) : (
          <div className="td-job-avatar td-job-avatar--placeholder">
            {(client?.name || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="td-job-info">
          <span className="td-job-name">{client?.name || "Client"}</span>
          <span className="td-job-service" style={{ background: colors.bg, color: colors.color }}>
            {serviceLabel.toUpperCase()}
          </span>
          <span className="td-job-meta">
            {booking.serviceDuration || 0} {t.hours} • ${(booking.price || 0).toFixed(2)} {t.est}
          </span>
        </div>
      </div>
      <div className="td-job-right">
        {!booking.isAccepted && !booking.isCompleted && timeLeft && (
          <div className="td-job-timer">
            <span className="td-job-timer-label">{t.responseTime}</span>
            <span className={`td-job-timer-value ${timeLeft.expired ? "td-job-timer-value--expired" : ""}`}>
              {timeLeft.expired ? t.expired : timeLeft.text}
            </span>
          </div>
        )}
        <div className="td-job-actions">
          {!booking.isAccepted && !booking.isCompleted && (
            <>
              <button className="td-btn-reject">{t.reject}</button>
              <button
                className="td-btn-accept"
                disabled={actionLoading[booking.id]}
                onClick={() => onAccept(booking.id)}
              >
                {actionLoading[booking.id] === "accepting" ? t.accepting : t.accept}
              </button>
            </>
          )}
          {booking.isAccepted && !booking.isCompleted && (
            <button
              className="td-btn-accept"
              disabled={actionLoading[booking.id]}
              onClick={() => onComplete(booking)}
            >
              {actionLoading[booking.id] === "completing" ? t.completing : t.complete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveServiceItem({ booking, client, t }) {
  const initials = (client?.name || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusText = getActiveStatusText(booking, t);

  return (
    <div className="td-active-item">
      <div className="td-active-left">
        {client?.photoURL ? (
          <img src={client.photoURL} alt="" className="td-active-avatar" />
        ) : (
          <div className="td-active-avatar td-active-avatar--initials">{initials}</div>
        )}
        <div className="td-active-info">
          <span className="td-active-name">{client?.name || "Client"}</span>
          <span className="td-active-sub">{statusText}</span>
        </div>
      </div>
      <span className="td-active-chat">{t.openChat}</span>
    </div>
  );
}

/* ───── Helpers ───── */
function getResponseTimeLeft(booking) {
  if (booking.isAccepted || booking.isCompleted) return null;
  const created = booking.createdAt?.toDate ? booking.createdAt.toDate() : null;
  if (!created) return null;
  const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);
  const diff = deadline - new Date();
  if (diff <= 0) return { text: "", expired: true };
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { text: `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`, expired: false };
}

function getActiveStatusText(booking, t) {
  if (!booking.startTime) return `${t.inMeeting}`;
  const start = booking.startTime.toDate ? booking.startTime.toDate() : new Date(booking.startTime);
  const now = new Date();
  if (start > now) {
    return `${t.startsAt} ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const minsAgo = Math.floor((now - start) / 60000);
  if (minsAgo < 60) return `${t.startedAgo} ${minsAgo}m ${t.ago}`;
  return `${t.startedAgo} ${Math.floor(minsAgo / 60)}h ${t.ago}`;
}

function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "short" });
}

/* ───── Main Component ───── */
function TranslatorDashboard() {
  const { currentUser, userData } = useAuth();
  const { language } = useLanguage();
  const t = text[language] || text.en;

  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("incoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  /* ── Fetch bookings ── */
  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    const q = query(collection(db, "bookings"), where("translatorId", "==", currentUser.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(items);
      const uids = [...new Set(items.map((b) => b.clientId))];
      const profiles = {};
      await Promise.all(
        uids.map(async (uid) => {
          try {
            const s = await getDoc(doc(db, "users", uid));
            if (s.exists()) profiles[uid] = s.data();
          } catch { /* */ }
        })
      );
      setClients(profiles);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [currentUser]);

  /* ── Derived data ── */
  const totalEarnings = userData?.totalEarnings ?? 0;
  const avgRating = userData?.avgRating ?? 0;
  const totalReviews = userData?.totalReviews ?? 0;

  const incoming = useMemo(() => bookings.filter((b) => !b.isAccepted && !b.isCompleted), [bookings]);
  const active = useMemo(() => bookings.filter((b) => b.isAccepted && !b.isCompleted), [bookings]);
  const completed = useMemo(() => bookings.filter((b) => b.isCompleted), [bookings]);

  const pendingClearance = useMemo(() => {
    return active.reduce((sum, b) => sum + (b.price || 0), 0);
  }, [active]);

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return completed.filter((b) => {
      const d = b.createdAt?.toDate ? b.createdAt.toDate() : null;
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [completed]);

  const earningsThisMonth = useMemo(() => {
    const now = new Date();
    return completed
      .filter((b) => {
        const d = b.createdAt?.toDate ? b.createdAt.toDate() : null;
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);
  }, [completed]);

  const tabList = useMemo(() => {
    const map = { incoming, active, completed };
    let list = map[tab] || incoming;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b) => {
        const name = clients[b.clientId]?.name || "";
        return name.toLowerCase().includes(q);
      });
    }
    return list;
  }, [tab, incoming, active, completed, searchTerm, clients]);

  /* ── Actions ── */
  const handleAccept = async (bookingId) => {
    setActionLoading((p) => ({ ...p, [bookingId]: "accepting" }));
    try { await updateDoc(doc(db, "bookings", bookingId), { isAccepted: true }); } catch { /* */ }
    setActionLoading((p) => ({ ...p, [bookingId]: null }));
  };

  const handleComplete = async (booking) => {
    setActionLoading((p) => ({ ...p, [booking.id]: "completing" }));
    try {
      await updateDoc(doc(db, "bookings", booking.id), { isCompleted: true });
      await updateDoc(doc(db, "users", currentUser.uid), { totalEarnings: increment(booking.price || 0) });
    } catch { /* */ }
    setActionLoading((p) => ({ ...p, [booking.id]: null }));
  };

  const month = getCurrentMonthName();

  if (loading) {
    return <div className="td-page"><div className="td-loading"><div className="td-spinner" /></div></div>;
  }

  return (
    <div className="td-page">
      <div className="td-container">
        {/* ═══ TOP STATS ═══ */}
        <div className="td-stats-row">
          <StatCard
            icon={<DollarSign size={18} />}
            label={t.totalEarnings}
            value={`$${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            badge={completedThisMonth > 0 ? `+${completedThisMonth}` : null}
            badgeColor="#22c55e"
          />
          <StatCard
            icon={<Briefcase size={18} />}
            label={t.activeJobs}
            value={String(active.length).padStart(2, "0")}
          />
          <StatCard
            icon={<Star size={18} />}
            label={t.avgRating}
            value={`${avgRating.toFixed(1)} / 5.0`}
          />
          <StatCard
            icon={<Clock size={18} />}
            label={t.pendingClearance}
            value={`$${pendingClearance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
        </div>

        {/* ═══ JOB MANAGEMENT ═══ */}
        <div className="td-card td-jobs-card">
          <div className="td-jobs-header">
            <h2 className="td-jobs-title">{t.jobManagement}</h2>
            <div className="td-search">
              <Search size={14} className="td-search-icon" />
              <input
                className="td-search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="td-tabs">
            <button className={`td-tab ${tab === "incoming" ? "td-tab--active" : ""}`} onClick={() => setTab("incoming")}>
              {t.tabIncoming}
              {incoming.length > 0 && <span className="td-tab-badge">{incoming.length}</span>}
            </button>
            <button className={`td-tab ${tab === "active" ? "td-tab--active" : ""}`} onClick={() => setTab("active")}>
              {t.tabActive}
            </button>
            <button className={`td-tab ${tab === "completed" ? "td-tab--active" : ""}`} onClick={() => setTab("completed")}>
              {t.tabCompleted}
            </button>
          </div>

          <div className="td-jobs-list">
            {tabList.length === 0 && <p className="td-empty">{t.noJobs}</p>}
            {tabList.map((b) => (
              <JobItem
                key={b.id}
                booking={b}
                client={clients[b.clientId]}
                t={t}
                actionLoading={actionLoading}
                onAccept={handleAccept}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>

        {/* ═══ BOTTOM GRID ═══ */}
        <div className="td-bottom-grid">
          {/* Active Services */}
          <div className="td-card td-active-card">
            <div className="td-active-header">
              <h3 className="td-active-title">{t.activeServices}</h3>
              <span className="td-active-count">{active.length} {t.sessions}</span>
            </div>
            {active.length === 0 && <p className="td-empty">{t.noActive}</p>}
            {active.map((b) => (
              <ActiveServiceItem key={b.id} booking={b} client={clients[b.clientId]} t={t} />
            ))}
          </div>

          {/* Quick Earnings */}
          <div className="td-earnings-card">
            <span className="td-earnings-label">{t.quickEarnings}</span>
            <span className="td-earnings-amount">
              ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <button className="td-earnings-withdraw">
              {t.withdraw} <ArrowUpRight size={14} />
            </button>

            <div className="td-earnings-panels">
              <div className="td-earnings-panel">
                <span className="td-earnings-panel-label">{t.earningsMonth} {month}</span>
                <span className="td-earnings-panel-value">${earningsThisMonth.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="td-earnings-panel">
                <span className="td-earnings-panel-label">{t.completedMonth} {month}</span>
                <span className="td-earnings-panel-value">{completedThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranslatorDashboard;