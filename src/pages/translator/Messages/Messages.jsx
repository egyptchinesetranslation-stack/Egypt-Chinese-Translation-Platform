import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { Search, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import backgroundImage from "../../../assets/L2.png";
import "./Messages.css";

const text = {
  en: {
    messages: "Messages",
    searchPlaceholder: "Search messages...",
    inputPlaceholder: "Type your message here...",
    today: "TODAY",
    yesterday: "YESTERDAY",
    noChat: "Select a conversation",
    noChatSub: "Choose a client from the list to start chatting",
    noConversations: "No conversations yet",
  },
  zh: {
    messages: "消息",
    searchPlaceholder: "搜索消息...",
    inputPlaceholder: "在此输入消息...",
    today: "今天",
    yesterday: "昨天",
    noChat: "选择一个对话",
    noChatSub: "从列表中选择客户开始聊天",
    noConversations: "暂无对话",
  },
};

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDate.getTime() === today.getTime()) return "";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Messages() {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const t = text[language];

  const [chats, setChats] = useState([]);
  const [chatUsers, setChatUsers] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open a chat from URL param ?chat=clientId
  useEffect(() => {
    const chatWith = searchParams.get("chat");
    if (!chatWith || !currentUser) return;
    (async () => {
      const chatId = getChatId(currentUser.uid, chatWith);
      const chatRef = doc(db, "chats", chatId);
      // merge:true → creates doc if missing, no-op if exists (avoids read-rule error on non-existent doc)
      await setDoc(chatRef, {
        participants: [currentUser.uid, chatWith],
      }, { merge: true });
      // Fetch the other user's profile so the chat header renders immediately
      const userSnap = await getDoc(doc(db, "users", chatWith));
      if (userSnap.exists()) {
        setChatUsers((prev) => ({ ...prev, [chatWith]: userSnap.data() }));
      }
      setActiveChat(chatId);
      setShowChat(true);
    })();
  }, [searchParams, currentUser]);

  // Auto-create chat docs for all booking clients (so every job partner shows up)
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const bSnap = await getDocs(
        query(collection(db, "bookings"), where("translatorId", "==", currentUser.uid))
      );
      const clientIds = [...new Set(bSnap.docs.map((d) => d.data().clientId))];
      await Promise.all(
        clientIds.map(async (cid) => {
          const chatId = getChatId(currentUser.uid, cid);
          const chatRef = doc(db, "chats", chatId);
          await setDoc(chatRef, {
            participants: [currentUser.uid, cid],
          }, { merge: true });
        })
      );
    })();
  }, [currentUser]);

  // Listen for all chats where current user is a participant
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const chatList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      chatList.sort((a, b) => {
        const tA = a.lastMessageTime?.toDate?.() || new Date(0);
        const tB = b.lastMessageTime?.toDate?.() || new Date(0);
        return tB - tA;
      });
      setChats(chatList);

      // Fetch user profiles for all participants
      const allUserIds = new Set();
      chatList.forEach((c) => c.participants?.forEach((p) => {
        if (p !== currentUser.uid) allUserIds.add(p);
      }));
      const fetched = {};
      await Promise.all(
        [...allUserIds].map(async (uid) => {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) fetched[uid] = userSnap.data();
        })
      );
      if (Object.keys(fetched).length > 0) {
        setChatUsers((prev) => ({ ...prev, ...fetched }));
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Listen for messages in the active chat
  useEffect(() => {
    if (!activeChat) { setChatMessages([]); return; }
    const q = query(
      collection(db, "chats", activeChat, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const getOtherUserId = (chat) => chat.participants?.find((p) => p !== currentUser?.uid);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const otherId = getOtherUserId(chat);
    const otherUser = chatUsers[otherId];
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeChatData = chats.find((c) => c.id === activeChat);
  const activeOtherUserId = activeChat && currentUser
    ? activeChat.split("_").find((id) => id !== currentUser.uid)
    : null;
  const activeOtherUser = activeOtherUserId ? chatUsers[activeOtherUserId] : null;

  const handleSend = async () => {
    if (!messageInput.trim() || !activeChat || !currentUser) return;
    const msgText = messageInput.trim();
    setMessageInput("");

    await addDoc(collection(db, "chats", activeChat, "messages"), {
      senderId: currentUser.uid,
      text: msgText,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "chats", activeChat), {
      lastMessage: msgText,
      lastMessageTime: serverTimestamp(),
    }, { merge: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAvatarUrl = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=e0e7ff&color=2F4FA2&size=96&bold=true&font-size=0.38`;

  return (
    <div className="msg-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* LEFT SIDEBAR */}
      <aside className={`msg-sidebar ${showChat ? "msg-sidebar--hidden" : ""}`}>
        <h2 className="msg-sidebar__title">{t.messages}</h2>

        <div className="msg-search">
          <Search size={16} className="msg-search__icon" />
          <input
            className="msg-search__input"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ul className="msg-user-list">
          {filteredChats.length === 0 && (
            <li style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              {t.noConversations}
            </li>
          )}
          {filteredChats.map((chat) => {
            const otherId = getOtherUserId(chat);
            const other = chatUsers[otherId] || {};
            return (
              <li
                key={chat.id}
                className={`msg-user-item ${activeChat === chat.id ? "msg-user-item--active" : ""}`}
                onClick={() => { setActiveChat(chat.id); setShowChat(true); }}
              >
                <div className="msg-user-item__avatar-wrap">
                  <img
                    className="msg-user-item__avatar"
                    src={other.photoURL || getAvatarUrl(other.name)}
                    alt={other.name || "User"}
                  />
                </div>
                <div className="msg-user-item__info">
                  <div className="msg-user-item__row">
                    <span className="msg-user-item__name">{other.name || "User"}</span>
                    <span className="msg-user-item__time">
                      {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ""}
                    </span>
                  </div>
                  <p className="msg-user-item__msg">{chat.lastMessage || ""}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* CENTER CHAT */}
      <main className={`msg-chat ${!showChat ? "msg-chat--hidden" : ""}`}>
        {activeOtherUser ? (
          <>
            {/* Chat Header */}
            <div className="msg-chat__header">
              <div className="msg-chat__header-left">
                <button className="msg-chat__back-btn" onClick={() => setShowChat(false)} aria-label="Back">
                  <ArrowLeft size={20} />
                </button>
                <div className="msg-chat__header-avatar-wrap">
                  <img
                    className="msg-chat__header-avatar"
                    src={activeOtherUser.photoURL || getAvatarUrl(activeOtherUser.name)}
                    alt={activeOtherUser.name}
                  />
                </div>
                <div>
                  <div className="msg-chat__header-name">
                    {activeOtherUser.name}
                    <CheckCircle2 size={14} className="msg-chat__verified" />
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="msg-chat__messages">
              {chatMessages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser?.uid;
                let dateSep = null;
                if (idx === 0 && msg.createdAt) {
                  const label = formatDateLabel(msg.createdAt);
                  if (label) dateSep = label;
                } else if (idx > 0 && msg.createdAt && chatMessages[idx - 1].createdAt) {
                  const prev = chatMessages[idx - 1].createdAt.toDate ? chatMessages[idx - 1].createdAt.toDate() : new Date(chatMessages[idx - 1].createdAt);
                  const curr = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
                  if (prev.toDateString() !== curr.toDateString()) {
                    dateSep = formatDateLabel(msg.createdAt);
                  }
                }

                return (
                  <div key={msg.id}>
                    {dateSep && (
                      <div className="msg-chat__separator">
                        <span>{dateSep}</span>
                      </div>
                    )}
                    <div className={`msg-chat__bubble-wrap ${isMe ? "msg-chat__bubble-wrap--right" : ""}`}>
                      <div className={`msg-chat__bubble ${isMe ? "msg-chat__bubble--me" : "msg-chat__bubble--them"}`}>
                        {msg.text && <p className="msg-chat__bubble-text">{msg.text}</p>}
                      </div>
                      <span className={`msg-chat__bubble-time ${isMe ? "msg-chat__bubble-time--right" : ""}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="msg-chat__input-bar">
              <input
                className="msg-chat__input"
                placeholder={t.inputPlaceholder}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="msg-chat__send-btn"
                onClick={handleSend}
                disabled={!messageInput.trim()}
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="msg-chat__empty">
            <h3>{t.noChat}</h3>
            <p>{t.noChatSub}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Messages;