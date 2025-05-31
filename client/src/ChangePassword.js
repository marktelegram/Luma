import React, { useState } from "react";

function ChangePassword({ currentUser, onClose }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      setMsg("Заполните все поля");
      return;
    }
    const res = await fetch("http://localhost:5000/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, oldPassword: oldPass, newPassword: newPass }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Пароль успешно изменён!");
      setOldPass("");
      setNewPass("");
    } else {
      setMsg(data.message || "Ошибка смены пароля");
    }
  };

  return (
    <form onSubmit={handleChange} style={{ marginTop: 24 }}>
      <div>
        <input
          type="password"
          placeholder="Старый пароль"
          value={oldPass}
          onChange={e => setOldPass(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Новый пароль"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>
      <button
        type="submit"
        style={{
          background: "#8c55aa", color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 24px", fontWeight: "bold", cursor: "pointer"
        }}
      >
        Сменить пароль
      </button>
      {msg && <div style={{ marginTop: 8, color: "#8c55aa" }}>{msg}</div>}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 16, background: "#fff", color: "#8c55aa", border: "1px solid #8c55aa",
          borderRadius: 8, padding: "8px 24px", fontWeight: "bold", cursor: "pointer"
        }}
      >
        Назад
      </button>
    </form>
  );
}

export default ChangePassword;