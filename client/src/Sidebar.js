import React, { useState, useEffect } from "react";
import ProfileModal from "./ProfileModal";
import AddAccountPanel from "./AddAccountPanel";

function Sidebar({
  currentUser,
  onFriendAdded,
  onSelectFriend,
  onProfile,
  onShowFavourites,
  onShowSettings,
}) {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [accounts, setAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("accounts") || "[]");
    } catch {
      return [];
    }
  });
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("/logo.png");
  const [showAddAccountPanel, setShowAddAccountPanel] = useState(false);
  const [search, setSearch] = useState("");

  // Синхронизировать аккаунты и удалять несуществующие
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(users => {
        const usernames = users.map(u => u.username);
        let accs;
        try {
          accs = JSON.parse(localStorage.getItem("accounts") || "[]");
        } catch {
          accs = [];
        }
        // Оставляем только существующих пользователей
        const filtered = accs.filter(acc => usernames.includes(acc));
        if (!filtered.includes(currentUser)) {
          if (filtered.length >= 2) filtered.shift();
          filtered.push(currentUser);
        }
        localStorage.setItem("accounts", JSON.stringify(filtered));
        setAccounts(filtered);
      });
  }, [currentUser]);

  // Получить свою аватарку (и обновлять после закрытия ProfileModal)
  useEffect(() => {
    if (!currentUser) return;
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(users => {
        const me = users.find(u => u.username === currentUser);
        setCurrentUserAvatar(me?.avatar || "/logo.png");
      });
  }, [currentUser, profileModalOpen]);

  // Получить всех пользователей
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(setUsers);
  }, []);

  // Получить друзей (сортировка по алфавиту)
  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/friends/${currentUser}`)
      .then(res => res.json())
      .then(data => setFriends(data.sort((a, b) => a.username.localeCompare(b.username))));
  }, [currentUser, onFriendAdded, msg, profileModalOpen]);

  // Получить отправленные заявки
  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/sent-requests/${currentUser}`)
      .then(res => res.json())
      .then(data => setPending(data.map(r => r.toUser)));
  }, [currentUser, msg, onFriendAdded]);

  const handleAdd = async (username) => {
    if (username === currentUser) {
      setMsg("Нельзя добавить себя в друзья");
      return;
    }
    const res = await fetch("http://localhost:5000/api/friend-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUser: currentUser, toUser: username }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Заявка отправлена!");
      setPending(prev => [...prev, username]);
      onFriendAdded && onFriendAdded();
    } else {
      setMsg(data.message || "Ошибка или заявка уже отправлена");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  const handleRemoveFriend = async (username) => {
    if (!window.confirm(`Удалить ${username} из друзей?`)) return;
    const res = await fetch("http://localhost:5000/api/remove-friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentUser, friend: username }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Друг удалён");
      setFriends(friends.filter(f => f.username !== username));
      onFriendAdded && onFriendAdded();
    } else {
      setMsg(data.message || "Ошибка удаления");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  // Фильтрация пользователей по поиску
  const filtered = users.filter(
    u =>
      u.username !== currentUser &&
      u.username.toLowerCase().includes(search.trim().toLowerCase())
  );
    // Фильтрация друзей по поиску (для быстрого списка)
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div style={{
      width: 350,
      background: "#232c3b",
      color: "#bdbdbd",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      borderRight: "1px solid #181f2a",
      position: "relative",
      minWidth: 260,
      maxWidth: 400,
      padding: 0
    }}>
      {/* Профиль и кнопка */}
      <div style={{ display: "flex", alignItems: "center", padding: 16 }}>
        <img
          src={currentUserAvatar || "/logo.png"}
          alt="avatar"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            marginRight: 12,
            objectFit: "cover",
            border: "2px solid #8c55aa"
          }}
        />
        <button
          onClick={() => setProfileModalOpen(true)}
          style={{
            background: "#8c55aa",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            marginRight: 8,
            flex: 1
          }}
        >
          {currentUser} / Профиль
        </button>
        <button
          onClick={() => setShowAddAccountPanel(true)}
          style={{
            background: "#fff",
            color: "#8c55aa",
            border: "1px solid #8c55aa",
            borderRadius: 8,
            padding: "6px 14px",
            fontWeight: "bold",
            fontSize: 22,
            cursor: "pointer"
          }}
          title="Добавить аккаунт"
        >+</button>
      </div>
      {profileModalOpen && (
        <ProfileModal
          currentUser={currentUser}
          avatar={currentUserAvatar}
          onClose={() => setProfileModalOpen(false)}
          onAvatarChanged={avatar => setCurrentUserAvatar(avatar)}
        />
      )}

      {/* Переключение между аккаунтами */}
      {accounts.length > 0 && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <div style={{ color: "#b97cff", fontWeight: "bold", marginBottom: 6 }}>Аккаунты:</div>
          {accounts.map(acc => (
            <div
              key={acc}
              onClick={() => {
                if (acc !== currentUser) {
                  localStorage.setItem("username", acc);
                  window.location.reload();
                }
              }}
              style={{
                background: acc === currentUser ? "#8c55aa" : "#fff",
                color: acc === currentUser ? "#fff" : "#8c55aa",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 6,
                fontWeight: acc === currentUser ? "bold" : "normal",
                cursor: acc === currentUser ? "default" : "pointer",
                border: acc === currentUser ? "none" : "1px solid #8c55aa",
                textAlign: "center",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              {acc === currentUser ? `${acc} (текущий)` : acc}
            </div>
          ))}
        </div>
      )}

      {/* Кнопка "Друзья" */}
      <button
        onClick={() => setShowFriendsPanel(v => !v)}
        style={{
          margin: "0 16px 16px 16px",
          background: showFriendsPanel ? "#fff" : "#8c55aa",
          color: showFriendsPanel ? "#8c55aa" : "#fff",
          border: "1px solid #8c55aa",
          borderRadius: 8,
          padding: "10px 0",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Друзья
      </button>

      {/* Панель управления друзьями и поиск */}
      {showFriendsPanel && (
        <div style={{ marginBottom: 16, padding: "0 16px" }}>
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "8px 12px",
              marginBottom: 12,
              width: "100%",
              background: "#232c3b",
              color: "#fff",
              outline: "none"
            }}
          />
          {search.trim() && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#8c55aa", fontWeight: "bold", marginBottom: 4 }}>
                Результаты поиска:
              </div>
              {filtered.length === 0 && (
                <div style={{ color: "#bdbdbd", fontStyle: "italic" }}>Никого не найдено</div>
              )}
              {filtered.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#2d3140",
                    borderRadius: 8,
                    padding: "6px 10px",
                    marginBottom: 6,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={user.avatar || "/logo.png"}
                      alt="avatar"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        marginRight: 10,
                        objectFit: "cover",
                        border: "2px solid #8c55aa"
                      }}
                    />
                    <span style={{ color: "#fff", fontWeight: "bold" }}>{user.username}</span>
                  </div>
                  {friends.some(f => f.username === user.username) ? (
                    <span style={{
                      color: "#8c55aa",
                      fontWeight: "bold",
                      fontSize: 13,
                      marginLeft: 8
                    }}>
                      Уже в друзьях
                    </span>
                  ) : pending.includes(user.username) ? (
                    <span style={{
                      background: "#bdbdbd",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "4px 12px",
                      fontSize: 13,
                      marginLeft: 8
                    }}>
                      Отправлено
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAdd(user.username)}
                      style={{
                        background: "#8c55aa",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginLeft: 8,
                        fontSize: 13
                      }}
                    >
                      Добавить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ color: "#8c55aa", fontWeight: "bold", marginBottom: 8 }}>Ваши друзья:</div>
            {friends.length === 0 && <div style={{ color: "#bdbdbd" }}>Нет друзей</div>}
            {friends.map(friend => (
              <div
                key={friend.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#f3ebf6",
                  color: "#8c55aa",
                  marginBottom: 4,
                  fontWeight: "bold"
                }}
              >
                <div
                  onClick={() => onSelectFriend(friend)}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1 }}
                >
                  <img
                    src={friend.avatar || "/logo.png"}
                    alt="avatar"
                    style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8, objectFit: "cover" }}
                  />
                  {friend.username}
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.username)}
                  style={{
                    marginLeft: 8,
                    background: "#fff",
                    color: "#8c55aa",
                    border: "1px solid #8c55aa",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && <div style={{ color: "#8c55aa", marginBottom: 8, paddingLeft: 16 }}>{msg}</div>}

      {/* Быстрый просмотр друзей (алфавитный порядок) */}
      {!showFriendsPanel && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ color: "#8c55aa", fontWeight: "bold", marginBottom: 8 }}>Друзья:</div>
          {filteredFriends.length === 0 && <div style={{ color: "#bdbdbd" }}>Нет друзей</div>}
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                cursor: "pointer",
                borderRadius: 8,
                background: "#f3ebf6",
                color: "#8c55aa",
                marginBottom: 4,
                fontWeight: "bold",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              <img
                src={friend.avatar || "/logo.png"}
                alt="avatar"
                style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8, objectFit: "cover" }}
              />
              {friend.username}
            </div>
          ))}
        </div>
      )}

      {/* Кнопки Избранное и Настройки */}
      <div style={{
        marginTop: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div
          onClick={() =>
            onSelectFriend({
              username: currentUser,
              id: currentUser,
              isFavourites: true,
              avatar: "/logo.png",
            })
          }
          style={{
            width: "100%",
            background: "#f3ebf6",
            color: "#8c55aa",
            border: "2px solid #8c55aa",
            borderRadius: 8,
            padding: "18px 0",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            textAlign: "center",
            marginBottom: 0,
            transition: "background 0.2s, color 0.2s"
          }}
        >
          <span style={{ marginRight: 8, fontSize: 18, verticalAlign: "middle" }}>★</span>
          ИЗБРАННОЕ
        </div>
        <button
          onClick={onShowSettings}
          style={{
            width: "100%",
            background: "transparent",
            color: "red",
            border: "2px solid red",
            borderRadius: 8,
            padding: "14px 0",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          НАСТРОЙКИ
        </button>
      </div>

      {/* Модальная панель добавления аккаунта */}
      {showAddAccountPanel && (
        <AddAccountPanel
          onClose={() => setShowAddAccountPanel(false)}
          onSuccess={() => setShowAddAccountPanel(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;