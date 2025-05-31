import React, { useState, useEffect } from "react";

function ProfileModal({ currentUser, avatar, onClose, onAvatarChanged }) {
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [showCloud, setShowCloud] = useState(false);
  const [cloudPassword, setCloudPassword] = useState("");
  const [cloudMsg, setCloudMsg] = useState("");

  // Сбросить preview и сообщения при смене пользователя или avatar
  useEffect(() => {
    setPreview("");
    setMsg("");
    setShowPassword(false);
    setOldPass("");
    setNewPass("");
    setPassMsg("");
    setShowCloud(false);
    setCloudPassword("");
    setCloudMsg("");
  }, [currentUser, avatar]);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    const res = await fetch("http://localhost:5000/api/set-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, avatar: preview || avatar || "" }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Аватар обновлён!");
      // Получаем актуальный avatar с сервера
      const userRes = await fetch("http://localhost:5000/api/users");
      const users = await userRes.json();
      const updatedUser = users.find(u => u.username === currentUser);
      if (updatedUser && onAvatarChanged) {
        onAvatarChanged(updatedUser.avatar || "/logo.png");
      }
      setPreview("");
    } else {
      setMsg(data.message || "Ошибка");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    if (!oldPass || !newPass) {
      setPassMsg("Заполните все поля");
      return;
    }
    const res = await fetch("http://localhost:5000/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, oldPassword: oldPass, newPassword: newPass }),
    });
    const data = await res.json();
    if (data.success) {
      setPassMsg("Пароль изменён!");
      setOldPass("");
      setNewPass("");
      setTimeout(() => setShowPassword(false), 1200);
    } else {
      setPassMsg(data.message || "Ошибка");
    }
  };

  const handleSetCloudPassword = async (e) => {
    e.preventDefault();
    setCloudMsg("");
    if (!cloudPassword) {
      setCloudMsg("Введите облачный пароль");
      return;
    }
    const res = await fetch("http://localhost:5000/api/set-cloud-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, cloud_password: cloudPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setCloudMsg("Облачный пароль сохранён!");
      setTimeout(() => setShowCloud(false), 1200);
    } else {
      setCloudMsg(data.message || "Ошибка");
    }
  };

  return (
    <div style={{
      position: "fixed",
      zIndex: 1000,
      left: 0, top: 0, right: 0, bottom: 0,
      background: "rgba(30,32,38,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#232c3b",
        color: "#fff",
        borderRadius: 16,
        minWidth: 340,
        maxWidth: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        padding: 0,
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

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 32, paddingTop: 36 }}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <label style={{ cursor: "pointer" }}>
              <img
                src={preview || avatar || "/logo.png"}
                alt="avatar"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #8c55aa",
                  background: "#fff",
                  transition: "box-shadow 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}
                title="Нажмите, чтобы сменить аватар"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <span style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#8c55aa",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #232c3b",
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                ✏️
              </span>
            </label>
          </div>
          <div style={{ marginTop: 8, marginBottom: 8, fontWeight: "bold", fontSize: 20 }}>
            {currentUser}
          </div>
          <button
            onClick={handleSaveAvatar}
            style={{
              background: "#8c55aa",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 32px",
              fontWeight: "bold",
              fontSize: 16,
              marginTop: 8,
              marginBottom: 8,
              cursor: "pointer"
            }}
          >
            Сохранить аватар
          </button>
          {msg && <div style={{ color: "#8c55aa", marginTop: 8 }}>{msg}</div>}

          <button
            onClick={() => setShowPassword(v => !v)}
            style={{
              background: "#fff",
              color: "#8c55aa",
              border: "1px solid #8c55aa",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: "bold",
              marginTop: 18,
              marginBottom: showPassword ? 0 : 8,
              cursor: "pointer"
            }}
          >
            {showPassword ? "Отмена" : "Сменить пароль"}
          </button>

          {showPassword && (
            <form onSubmit={handleChangePassword} style={{ width: "100%", marginTop: 16 }}>
              <input
                type="password"
                placeholder="Старый пароль"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc"
                }}
              />
              <input
                type="password"
                placeholder="Новый пароль"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc"
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#8c55aa",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 24px",
                  fontWeight: "bold",
                  width: "100%",
                  cursor: "pointer"
                }}
              >
                Сменить пароль
              </button>
              {passMsg && <div style={{ color: "#8c55aa", marginTop: 8 }}>{passMsg}</div>}
            </form>
          )}

          <button
            onClick={() => setShowCloud(v => !v)}
            style={{
              background: "#fff",
              color: "#8c55aa",
              border: "1px solid #8c55aa",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: "bold",
              marginTop: 12,
              marginBottom: showCloud ? 0 : 8,
              cursor: "pointer"
            }}
          >
            {showCloud ? "Отмена" : "Установить облачный пароль"}
          </button>

          {showCloud && (
            <form onSubmit={handleSetCloudPassword} style={{ width: "100%", marginTop: 16 }}>
              <input
                type="password"
                placeholder="Облачный пароль"
                value={cloudPassword}
                onChange={e => setCloudPassword(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc"
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#8c55aa",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 24px",
                  fontWeight: "bold",
                  width: "100%",
                  cursor: "pointer"
                }}
              >
                Сохранить облачный пароль
              </button>
              {cloudMsg && <div style={{ color: "#8c55aa", marginTop: 8 }}>{cloudMsg}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function UserProfileModal({ user, isFriend, isPending, onAdd, onRemove, onClose }) {
  if (!user) return null;
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
}

export default ProfileModal;