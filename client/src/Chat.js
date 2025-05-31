import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import FriendRequests from "./FriendRequests";
import ChangePassword from "./ChangePassword";
import Favourites from "./Favourites";
import Settings from "./Settings";
import "./App.css";

const getCurrentUser = () => localStorage.getItem("username") || "";
const getAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem("accounts") || "[]");
  } catch {
    return [];
  }
};
const saveAccounts = (accounts) => {
  localStorage.setItem("accounts", JSON.stringify(accounts));
};

function Chat() {
  const messagesEndRef = useRef(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentUser = getCurrentUser();
  const [refresh, setRefresh] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [accounts, setAccounts] = useState(getAccounts());
  const [allUsers, setAllUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [input, setInput] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Избранное
  useEffect(() => {
    const fav = localStorage.getItem(`favorite_${currentUser}`);
    setFavorite(fav ? JSON.parse(fav) : []);
  }, [currentUser]);
  const saveFavorite = (fav) => {
    setFavorite(fav);
    localStorage.setItem(`favorite_${currentUser}`, JSON.stringify(fav));
  };

  // Добавить текущий аккаунт в список, если его нет
  useEffect(() => {
    if (!currentUser) return;
    let accs = getAccounts();
    if (!accs.includes(currentUser)) {
      if (accs.length >= 2) accs = accs.slice(1); // максимум 2
      accs.push(currentUser);
      saveAccounts(accs);
      setAccounts(accs);
    }
  }, [currentUser]);

  // Получить всех пользователей для поиска
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(users => setAllUsers(users.filter(u => u.username !== currentUser)));
  }, [currentUser]);

  // Поиск пользователей по базе (не только друзей)
  useEffect(() => {
    if (!searchUser.trim()) {
      setSearchResults([]);
      return;
    }
    const results = allUsers.filter(u =>
      u.username.toLowerCase().includes(searchUser.trim().toLowerCase())
    );
    setSearchResults(results);
  }, [searchUser, allUsers]);

  // Получить друзей и pending
  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/friends/${currentUser}`)
      .then(res => res.json())
      .then(data => setFriends(data));
    fetch(`http://localhost:5000/api/sent-requests/${currentUser}`)
      .then(res => res.json())
      .then(data => setPending(data.map(r => r.toUser)));
  }, [currentUser, refresh, showUserProfile]);

  // Получить сообщения с выбранным пользователем
  useEffect(() => {
    if (!activeUser) return;
    // "Избранное" как чат с собой (локально)
    if (activeUser.isFavourites) {
      setMessages(favorite);
      return;
    }
    fetch(`http://localhost:5000/api/messages/${activeUser.username}?from=${currentUser}`)
      .then(res => res.json())
      .then(setMessages);
  }, [activeUser, currentUser, refresh, favorite]);

  useEffect(() => {
    if (messages.length && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Сменить аккаунт
  const handleSwitchAccount = (username) => {
    localStorage.setItem("username", username);
    window.location.reload();
  };

  // Удалить аккаунт из списка
  const handleRemoveAccount = (username) => {
    let accs = getAccounts().filter(u => u !== username);
    saveAccounts(accs);
    setAccounts(accs);
    if (username === currentUser) {
      localStorage.removeItem("username");
      window.location.reload();
    }
  };

  // Открыть профиль собеседника
  const handleOpenUserProfile = () => {
    if (activeUser && !activeUser.isFavourites && activeUser.username !== currentUser) setShowUserProfile(true);
  };

  // Быстрый выбор собеседника из поиска (можно писать любому)
  const handleSelectUser = (user) => {
    setActiveUser(user);
    setSearchUser("");
    setSearchResults([]);
  };

  // Добавить/удалить из друзей
  const handleAddFriend = async () => {
    if (!activeUser) return;
    await fetch("http://localhost:5000/api/friend-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUser: currentUser, toUser: activeUser.username }),
    });
    setRefresh(r => r + 1);
  };
  const handleRemoveFriend = async () => {
    if (!activeUser) return;
    await fetch("http://localhost:5000/api/remove-friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentUser, friend: activeUser.username }),
    });
    setRefresh(r => r + 1);
  };

  // Добавить в избранное
  const handleFavorite = (msg) => {
    if (!favorite.find(m => m.id === msg.id)) {
      const fav = [...favorite, msg];
      saveFavorite(fav);
    }
  };
  const handleRemoveFavorite = (msgId) => {
    const fav = favorite.filter(m => m.id !== msgId);
    saveFavorite(fav);
  };

  // Отправка голосового сообщения (заглушка)
  const handleRecord = async () => {
    alert("Recording not implemented in this snippet.");
  };

  // Файл
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Отправка сообщения (текст, файл, голос)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file && !audioBlob) return;
    // "Избранное" — сохраняем локально
    if (activeUser && activeUser.isFavourites) {
      const favMsg = {
        id: Date.now(),
        text: input.trim(),
        created_at: new Date().toLocaleString(),
        fromUser: currentUser,
        isFavourite: true
      };
      saveFavorite([...favorite, favMsg]);
      setInput("");
      setFile(null);
      setAudioBlob(null);
      return;
    }
    let formData = new FormData();
    formData.append("from", currentUser);
    formData.append("to", activeUser.username);
    if (input.trim()) formData.append("text", input.trim());
    if (file) formData.append("file", file);
    if (audioBlob) formData.append("audio", audioBlob);
    await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      body: formData,
    });
    setInput("");
    setFile(null);
    setAudioBlob(null);
    setRefresh(r => r + 1);
  };

  // Profile modal
  const ProfileModal = () => (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", color: "#232c3b", borderRadius: 12, padding: 32, minWidth: 320
      }}>
        <h2>Профиль</h2>
        <div>Логин: <b>{currentUser}</b></div>
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Сохранённые аккаунты:</div>
          {accounts.map(acc => (
            <div key={acc} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{
                color: acc === currentUser ? "#8c55aa" : "#232c3b",
                fontWeight: acc === currentUser ? "bold" : "normal"
              }}>{acc}</span>
              {acc !== currentUser && (
                <button
                  onClick={() => handleSwitchAccount(acc)}
                  style={{
                    marginLeft: 8, background: "#8c55aa", color: "#fff", border: "none",
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer"
                  }}
                >
                  Переключить
                </button>
              )}
              <button
                onClick={() => handleRemoveAccount(acc)}
                style={{
                  marginLeft: 8, background: "#fff", color: "#8c55aa", border: "1px solid #8c55aa",
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer"
                }}
              >
                Удалить
              </button>
            </div>
          ))}
          {accounts.length < 2 && (
            <div style={{ color: "#bdbdbd", fontSize: 12, marginTop: 8 }}>
              Можно добавить ещё {2 - accounts.length} аккаунт(а)
            </div>
          )}
        </div>
        <button
          onClick={() => setShowProfile(false)}
          style={{
            marginTop: 24, background: "#8c55aa", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 24px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );

  // User profile modal
  const UserProfileModal = ({ user, isFriend, isPending, onAdd, onRemove, onClose }) => {
    if (!user || user.isFavourites || user.username === currentUser) return null;
    return (
      <div style={{
        position: "fixed",
        left: 0, top: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: "#232c3b",
          color: "#fff",
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          boxShadow: "0 4px 24px #0008",
          position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              background: "transparent",
              border: "none",
              color: "#8c55aa",
              fontSize: 22,
              cursor: "pointer",
              fontWeight: "bold"
            }}
            aria-label="Закрыть"
          >×</button>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <img
              src={user.avatar || "/logo.png"}
              alt="avatar"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                marginRight: 20,
                objectFit: "cover",
                border: "2px solid #8c55aa"
              }}
            />
            <div>
              <div style={{ fontWeight: "bold", fontSize: 22 }}>{user.username}</div>
            </div>
          </div>
          {isFriend ? (
            <button
              onClick={onRemove}
              style={{
                background: "#fff",
                color: "#8c55aa",
                border: "1px solid #8c55aa",
                borderRadius: 8,
                padding: "10px 24px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: 8
              }}
            >
              Удалить из друзей
            </button>
          ) : isPending ? (
            <button
              disabled
              style={{
                background: "#bdbdbd",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontWeight: "bold",
                marginBottom: 8
              }}
            >
              Заявка отправлена
            </button>
          ) : (
            <button
              onClick={onAdd}
              style={{
                background: "#8c55aa",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: 8
              }}
            >
              Добавить в друзья
            </button>
          )}
        </div>
      </div>
    );
  };

  // Определяем, открыт ли чат "Избранное"
  const isFavouritesChat = activeUser && activeUser.isFavourites;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#181f2a",
      overflow: "hidden"
    }}>
      <Sidebar
        currentUser={currentUser}
        onFriendAdded={() => setRefresh(r => r + 1)}
        onSelectFriend={setActiveUser}
        onProfile={() => setShowProfile(true)}
        onShowFavourites={() =>
          setActiveUser({
            username: currentUser,
            id: currentUser,
            isFavourites: true,
            avatar: "/logo.png"
          })
        }
        onShowSettings={() => setShowSettings(true)}
      />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#181f2a",
        color: "#fff",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden"
      }}>
        <FriendRequests currentUser={currentUser} onRespond={() => setRefresh(r => r + 1)} />
        <div style={{
          padding: 16,
          borderBottom: "1px solid #222",
          fontWeight: "bold",
          fontSize: 18,
          background: "#232c3b",
          display: "flex",
          alignItems: "center",
          cursor: activeUser && !isFavouritesChat && activeUser.username !== currentUser ? "pointer" : "default",
          flexShrink: 0
        }}
          onClick={handleOpenUserProfile}
        >
          {activeUser ? (
            <>
              <img
                src={isFavouritesChat ? "/logo.png" : (activeUser.avatar || "/logo.png")}
                alt="avatar"
                style={{
                  width: 32, height: 32, borderRadius: "50%", marginRight: 12, objectFit: "cover", border: "2px solid #8c55aa"
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: 18 }}>
                {isFavouritesChat ? "Избранное" : activeUser.username}
              </span>
            </>
          ) : (
            "Выберите собеседника"
          )}
        </div>
        {/* Поиск по всем пользователям */}
        <div style={{
          padding: "12px 16px 0 16px",
          background: "#232c3b",
          borderBottom: "1px solid #222",
          flexShrink: 0
        }}>
          <input
            type="text"
            placeholder="Найти пользователя по логину..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "8px 12px",
              width: "100%",
              background: "#181f2a",
              color: "#fff",
              outline: "none"
            }}
          />
          {searchUser.trim() && (
            <div style={{
              marginTop: 8,
              background: "#232c3b",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxHeight: 200,
              overflowY: "auto"
            }}>
              {searchResults.length === 0 && (
                <div style={{ color: "#bdbdbd", padding: 8 }}>Никого не найдено</div>
              )}
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #232c3b",
                    color: "#8c55aa",
                    fontWeight: "bold"
                  }}
                >
                  <img
                    src={user.avatar || "/logo.png"}
                    alt="avatar"
                    style={{
                      width: 28, height: 28, borderRadius: "50%", marginRight: 8, objectFit: "cover"
                    }}
                  />
                  {user.username}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Сообщения */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "24px 0 0 0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 24px",
            gap: 4
          }}>
            {(!activeUser || messages.length === 0) ? (
              <div style={{
                textAlign: "center",
                color: "#bdbdbd",
                opacity: 0.7,
                marginTop: 40
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🦉</div>
                Нет сообщений
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id || msg.created_at || Math.random()}
                  style={{
                    alignSelf: msg.fromUser === currentUser ? "flex-end" : "flex-start",
                    background: msg.fromUser === currentUser ? "#8c55aa" : "#232c3b",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "8px 16px",
                    margin: "2px 0",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    fontSize: 15,
                    lineHeight: 1.4
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: 10, color: "#bdbdbd", textAlign: "right" }}>{msg.created_at || ""}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Форма отправки всегда внизу */}
        {activeUser && (
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              padding: 20,
              borderTop: "1px solid #222",
              background: "#232c3b",
              alignItems: "center",
              flexShrink: 0
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isFavouritesChat ? "Добавьте заметку или ссылку в избранное..." : "Введите сообщение..."}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 12,
                padding: "16px 18px",
                fontSize: 18,
                background: "#181f2a",
                color: "#fff",
                outline: "none",
                marginRight: 12,
                minHeight: 0,
                boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#8c55aa",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Отправить
            </button>
            {!isFavouritesChat && (
              <input
                type="file"
                onChange={handleFileChange}
                style={{ marginLeft: 12 }}
              />
            )}
          </form>
        )}
        {showUserProfile && (
          <UserProfileModal
            user={activeUser}
            isFriend={friends.some(f => f.username === activeUser?.username)}
            isPending={pending.includes(activeUser?.username)}
            onAdd={handleAddFriend}
            onRemove={handleRemoveFriend}
            onClose={() => setShowUserProfile(false)}
          />
        )}
      </div>
      {showProfile && !showChangePassword && <ProfileModal />}
      {showChangePassword && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", color: "#232c3b", borderRadius: 12, padding: 32, minWidth: 320
          }}>
            <ChangePassword
              currentUser={currentUser}
              onClose={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
      {showFavourites && (
        <Favourites favourite={favorite} onClose={() => setShowFavourites(false)} />
      )}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default Chat;