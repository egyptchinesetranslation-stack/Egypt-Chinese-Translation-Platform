import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import {
  Camera,
  DollarSign,
  Award,
  Upload,
  Eye,
  Trash2,
  FileText,
  Loader2,
  Star,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import "./Profile.css";

const text = {
  en: {
    profileInfo: "Profile Information",
    fullName: "FULL NAME",
    experience: "YEARS OF EXPERIENCE",
    years: "Years",
    bio: "PROFESSIONAL BIO",
    characters: "characters",
    servicePricing: "Service Pricing",
    emergencyRate: "EMERGENCY RATE",
    tourGuideRate: "TOUR GUIDE RATE",
    dailyRate: "DAILY ASSISTANT RATE",
    certTitle: "Certifications & Identity",
    uploadNew: "Upload New",
    viewFull: "View Full",
    remove: "Remove",
    discard: "Discard Changes",
    save: "Save Profile Updates",
    saving: "Saving…",
    saved: "Profile updated!",
    errorLoad: "Failed to load profile.",
    errorSave: "Failed to save profile.",
    translatorBadge: "Translator",
    noCerts: "No documents uploaded yet.",
    perHour: "/ hr",
    statsTitle: "Performance Overview",
    avgRating: "Average Rating",
    totalReviews: "Total Reviews",
    totalEarnings: "Total Earnings",
    reviewsTitle: "Client Reviews",
    noReviews: "No reviews yet.",
    anonymous: "Client",
  },
  zh: {
    profileInfo: "个人资料",
    fullName: "全名",
    experience: "经验年数",
    years: "年",
    bio: "专业简介",
    characters: "字符",
    servicePricing: "服务定价",
    emergencyRate: "紧急费率",
    tourGuideRate: "导游费率",
    dailyRate: "日常助理费率",
    certTitle: "证书与身份",
    uploadNew: "上传新文件",
    viewFull: "查看完整",
    remove: "删除",
    discard: "放弃更改",
    save: "保存更新",
    saving: "保存中…",
    saved: "个人资料已更新！",
    errorLoad: "加载个人资料失败。",
    errorSave: "保存个人资料失败。",
    translatorBadge: "翻译员",
    noCerts: "尚未上传任何文件。",
    perHour: "/ 小时",
    statsTitle: "绩效概览",
    avgRating: "平均评分",
    totalReviews: "总评论数",
    totalEarnings: "总收入",
    reviewsTitle: "客户评价",
    noReviews: "暂无评价。",
    anonymous: "客户",
  },
};

const BIO_MAX = 500;

function Profile() {
  const { currentUser, setUserDataManually, userData } = useAuth();
  const { language } = useLanguage();
  const t = text[language] || text.en;

  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  /* ---------- state ---------- */
  const [form, setForm] = useState({
    name: "",
    experienceYears: 0,
    bio: "",
    emergency: 0,
    tourGuide: 0,
    daily: 0,
  });
  const [photoURL, setPhotoURL] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [pendingCertFile, setPendingCertFile] = useState(null);
  const [removedCerts, setRemovedCerts] = useState([]);
  const [userId, setUserId] = useState("");

  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, totalEarnings: 0 });
  const [reviews, setReviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);

  /* ---------- load data ---------- */
  useEffect(() => {
    if (!currentUser) return;
    setUserId(currentUser.uid);

    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            name: d.name || "",
            experienceYears: d.experienceYears ?? 0,
            bio: d.bio || "",
            emergency: d.pricing?.emergency ?? 0,
            tourGuide: d.pricing?.tourGuide ?? 0,
            daily: d.pricing?.daily ?? 0,
          });
          setPhotoURL(d.photoURL || "");
          setCertifications(d.certifications || []);
          setStats({
            avgRating: d.avgRating ?? 0,
            totalReviews: d.totalReviews ?? 0,
            totalEarnings: d.totalEarnings ?? 0,
          });
        }

        // Fetch reviews for this translator (separate try so profile still loads on failure)
        try {
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("translatorId", "==", currentUser.uid)
          );
          const reviewSnaps = await getDocs(reviewsQuery);
          const reviewList = [];
          for (const rDoc of reviewSnaps.docs) {
            const r = rDoc.data();
            let clientName = t.anonymous;
            try {
              const clientSnap = await getDoc(doc(db, "users", r.clientId));
              if (clientSnap.exists()) clientName = clientSnap.data().name || clientName;
            } catch { /* ignore */ }
            reviewList.push({ id: rDoc.id, ...r, clientName });
          }
          // Sort newest first (client-side to avoid composite index)
          reviewList.sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
          });
          setReviews(reviewList);
        } catch (err) {
          console.error("Error fetching reviews:", err);
        }
      } catch {
        showToast(t.errorLoad, "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  /* ---------- helpers ---------- */
  const showToast = (msg, type = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------- avatar ---------- */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ---------- cert upload ---------- */
  const handleCertSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingCertFile(file);
  };

  /* ---------- cert remove ---------- */
  const handleRemoveCert = (index) => {
    const cert = certifications[index];
    setRemovedCerts((prev) => [...prev, cert]);
    setCertifications((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- discard ---------- */
  const handleDiscard = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        setForm({
          name: d.name || "",
          experienceYears: d.experienceYears ?? 0,
          bio: d.bio || "",
          emergency: d.pricing?.emergency ?? 0,
          tourGuide: d.pricing?.tourGuide ?? 0,
          daily: d.pricing?.daily ?? 0,
        });
        setPhotoURL(d.photoURL || "");
        setCertifications(d.certifications || []);
      }
      setAvatarFile(null);
      setAvatarPreview("");
      setPendingCertFile(null);
      setRemovedCerts([]);
    } catch {
      showToast(t.errorLoad, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- save ---------- */
  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      let newPhotoURL = photoURL;

      // Upload new avatar if changed
      if (avatarFile) {
        const avatarRef = ref(storage, `users/${currentUser.uid}/profilePhoto`);
        await uploadBytes(avatarRef, avatarFile);
        newPhotoURL = await getDownloadURL(avatarRef);
      }

      // Upload pending cert
      let updatedCerts = [...certifications];
      if (pendingCertFile) {
        const certRef = ref(
          storage,
          `users/${currentUser.uid}/certifications/${pendingCertFile.name}`
        );
        await uploadBytes(certRef, pendingCertFile);
        const certURL = await getDownloadURL(certRef);
        updatedCerts.push({ name: pendingCertFile.name, fileURL: certURL });
      }

      // Delete removed certs from storage
      for (const cert of removedCerts) {
        try {
          const certRef = ref(
            storage,
            `users/${currentUser.uid}/certifications/${cert.name}`
          );
          await deleteObject(certRef);
        } catch {
          // file might not exist, ignore
        }
      }

      const updates = {
        name: form.name,
        experienceYears: parseInt(form.experienceYears) || 0,
        bio: form.bio,
        photoURL: newPhotoURL,
        pricing: {
          emergency: parseFloat(form.emergency) || 0,
          tourGuide: parseFloat(form.tourGuide) || 0,
          daily: parseFloat(form.daily) || 0,
        },
        certifications: updatedCerts,
      };

      await updateDoc(doc(db, "users", currentUser.uid), updates);

      // Sync AuthContext
      if (userData) {
        setUserDataManually({ ...userData, ...updates });
      }

      setPhotoURL(newPhotoURL);
      setCertifications(updatedCerts);
      setAvatarFile(null);
      setAvatarPreview("");
      setPendingCertFile(null);
      setRemovedCerts([]);
      showToast(t.saved, "success");
    } catch (err) {
      console.error("Profile save error:", err);
      showToast(t.errorSave, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- render ---------- */
  if (loading) {
    return (
      <div className="tp-page">
        <div className="tp-loading">
          <Loader2 size={32} className="tp-spin" />
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || photoURL;

  return (
    <div className="tp-page">
      <div className="tp-container">
        {/* ===== Toast ===== */}
        {toast && (
          <div className={`tp-toast tp-toast--${toastType}`}>{toast}</div>
        )}

        {/* ===== SECTION 1 — Profile Information ===== */}
        <div className="tp-card">
          <div className="tp-profile-grid">
            {/* Left — avatar */}
            <div className="tp-avatar-col">
              <div className="tp-avatar-wrap">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="tp-avatar-img" />
                ) : (
                  <div className="tp-avatar-placeholder" />
                )}
                <button
                  className="tp-avatar-edit"
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="tp-badge">
                <span className="tp-badge__role">{t.translatorBadge}</span>
                <span className="tp-badge__id">
                  #SA-{userId.slice(0, 5).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Right — fields */}
            <div className="tp-fields-col">
              <div className="tp-row-2">
                <div className="tp-field">
                  <label className="tp-label">{t.fullName}</label>
                  <input
                    className="tp-input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="tp-field tp-field--exp">
                  <label className="tp-label">{t.experience}</label>
                  <div className="tp-exp-wrap">
                    <input
                      className="tp-input"
                      type="number"
                      min="0"
                      value={form.experienceYears}
                      onChange={(e) =>
                        handleChange("experienceYears", e.target.value)
                      }
                    />
                    <span className="tp-exp-suffix">{t.years}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="tp-field">
                <label className="tp-label">{t.bio}</label>
                <textarea
                  className="tp-textarea"
                  maxLength={BIO_MAX}
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                />
                <span className="tp-char-count">
                  {form.bio.length} / {BIO_MAX} {t.characters}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2 — Service Pricing ===== */}
        <div className="tp-card">
          <div className="tp-section-header">
            <div className="tp-icon-circle tp-icon-circle--orange">
              <DollarSign size={18} />
            </div>
            <h2 className="tp-section-title">{t.servicePricing}</h2>
          </div>

          <div className="tp-pricing-grid">
            {[
              { key: "emergency", label: t.emergencyRate },
              { key: "tourGuide", label: t.tourGuideRate },
              { key: "daily", label: t.dailyRate },
            ].map((item) => (
              <div className="tp-price-box" key={item.key}>
                <span className="tp-price-label">{item.label}</span>
                <div className="tp-price-value-wrap">
                  <span className="tp-price-dollar">$</span>
                  <input
                    className="tp-price-input"
                    type="number"
                    min="0"
                    value={form[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                  />
                </div>
                <span className="tp-price-unit">{t.perHour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 3 — Certifications & Identity ===== */}
        <div className="tp-card">
          <div className="tp-section-header">
            <div className="tp-icon-circle tp-icon-circle--blue">
              <Award size={18} />
            </div>
            <h2 className="tp-section-title">{t.certTitle}</h2>
            <button
              className="tp-upload-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              {t.uploadNew}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              hidden
              onChange={handleCertSelect}
            />
          </div>

          {/* Pending file indicator */}
          {pendingCertFile && (
            <div className="tp-pending-cert">
              <FileText size={16} />
              <span>{pendingCertFile.name}</span>
              <button
                className="tp-pending-remove"
                onClick={() => setPendingCertFile(null)}
              >
                ×
              </button>
            </div>
          )}

          {/* Uploaded documents */}
          <div className="tp-cert-list">
            {certifications.length === 0 && !pendingCertFile && (
              <p className="tp-no-certs">{t.noCerts}</p>
            )}
            {certifications.map((cert, i) => (
              <div className="tp-cert-item" key={i}>
                <div className="tp-cert-left">
                  {cert.fileURL &&
                  (cert.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                    cert.fileURL.match(/\.(jpg|jpeg|png|gif|webp)/i)) ? (
                    <img
                      src={cert.fileURL}
                      alt={cert.name}
                      className="tp-cert-thumb"
                    />
                  ) : (
                    <div className="tp-cert-file-icon">
                      <FileText size={24} />
                    </div>
                  )}
                  <span className="tp-cert-name">{cert.name}</span>
                </div>

                <div className="tp-cert-actions">
                  <a
                    href={cert.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tp-cert-view"
                  >
                    <Eye size={14} /> {t.viewFull}
                  </a>
                  <button
                    className="tp-cert-remove"
                    onClick={() => handleRemoveCert(i)}
                  >
                    <Trash2 size={14} /> {t.remove}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 4 — Performance Overview (read-only) ===== */}
        <div className="tp-card">
          <div className="tp-section-header">
            <div className="tp-icon-circle tp-icon-circle--green">
              <TrendingUp size={18} />
            </div>
            <h2 className="tp-section-title">{t.statsTitle}</h2>
          </div>

          <div className="tp-stats-grid">
            <div className="tp-stat-box tp-stat-box--rating">
              <Star size={22} className="tp-stat-icon tp-stat-icon--yellow" />
              <span className="tp-stat-value">{stats.avgRating.toFixed(1)}</span>
              <span className="tp-stat-label">{t.avgRating}</span>
            </div>
            <div className="tp-stat-box tp-stat-box--reviews">
              <MessageSquare size={22} className="tp-stat-icon tp-stat-icon--blue" />
              <span className="tp-stat-value">{stats.totalReviews}</span>
              <span className="tp-stat-label">{t.totalReviews}</span>
            </div>
            <div className="tp-stat-box tp-stat-box--earnings">
              <DollarSign size={22} className="tp-stat-icon tp-stat-icon--green" />
              <span className="tp-stat-value">${stats.totalEarnings.toFixed(2)}</span>
              <span className="tp-stat-label">{t.totalEarnings}</span>
            </div>
          </div>
        </div>

        {/* ===== SECTION 5 — Client Reviews (read-only) ===== */}
        <div className="tp-card">
          <div className="tp-section-header">
            <div className="tp-icon-circle tp-icon-circle--yellow">
              <Star size={18} />
            </div>
            <h2 className="tp-section-title">{t.reviewsTitle}</h2>
            <span className="tp-review-count">{reviews.length}</span>
          </div>

          <div className="tp-review-list">
            {reviews.length === 0 && (
              <p className="tp-no-reviews">{t.noReviews}</p>
            )}
            {reviews.map((rev) => (
              <div className="tp-review-item" key={rev.id}>
                <div className="tp-review-top">
                  <span className="tp-review-author">{rev.clientName}</span>
                  <div className="tp-review-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= rev.rating ? "tp-star--filled" : "tp-star--empty"}
                      />
                    ))}
                  </div>
                  <span className="tp-review-date">
                    {rev.createdAt?.toDate
                      ? rev.createdAt.toDate().toLocaleDateString()
                      : ""}
                  </span>
                </div>
                {rev.comment && (
                  <p className="tp-review-comment">{rev.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOTTOM ACTION BAR ===== */}
        <div className="tp-actions">
          <button
            className="tp-btn-discard"
            type="button"
            onClick={handleDiscard}
            disabled={saving}
          >
            {t.discard}
          </button>
          <button
            className="tp-btn-save"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;