import React, { useState } from "react";

function AddFriend({ currentUser, onRequestSent }) {
  const [login, setLogin] = useState("");
  const [msg, setMsg] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!login.trim()) return;
    const res = await fetch("http://localhost:5000/api/friend-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUser: currentUser, toUser: login }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Заявка отправлена!");
      setLogin("");
      onRequestSent && onRequestSent();
    } else {
      setMsg(data.message || "Ошибка или заявка уже отправлена");
    }
  };

  return (
    <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Логин друга"
        value={login}
        onChange={e => setLogin(e.target.value)}
        style={{
          flex: 1,
          borderRadius: 8,
          border: "1px solid #ccc",
          padding: "8px 12px",
        }}
      />
      <button type="submit" style={{
        borderRadius: 8,
        background: "#8c55aa",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        fontWeight: "bold",
        cursor: "pointer"
      }}>
        Добавить
      </button>
      {msg && <span style={{ color: "#8c55aa", marginLeft: 8 }}>{msg}</span>}
    </form>
  );
}

export default AddFriend;