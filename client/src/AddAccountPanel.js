import React, { useState } from "react";

function AddAccountPanel({ onClose, onSuccess }) {
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: login, password: pass }),
    });
    const data = await res.json();
    if (data.success) {
      let accs = [];
      try {
        accs = JSON.parse(localStorage.getItem("accounts") || "[]");
      } catch {
        accs = [];
      }
      if (!accs.includes(login)) {
        if (accs.length >= 2) accs = accs.slice(1);
        accs.push(login);
        localStorage.setItem("accounts", JSON.stringify(accs));
      }
      localStorage.setItem("username", login);
      onSuccess && onSuccess();
      window.location.reload();
    } else {
      setErr(data.message || "Ошибка входа");
    }
  };

  return (
    <div style={{
      position: "fixed",
      left: 0, top: 0, right: 0, bottom: 0,
      background: "rgba(30,32,38,0.85)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#232c3b",
        borderRadius: 16,
        minWidth: 320,
        maxWidth: 340,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        padding: 32,
        color: "#fff",
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
        <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16, color: "#8c55aa" }}>
          Добавить аккаунт
        </div>
        <form onSubmit={handleLogin}>
          <input
            value={login}
            onChange={e => setLogin(e.target.value)}
            placeholder="Логин"
            style={{ marginBottom: 8, width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Пароль"
            style={{ marginBottom: 8, width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
<button
  type="submit"
  style={{
    background: "#8c55aa",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "60%",
    display: "block",
    margin: "16px auto 0 auto" // центрирование
  }}
>
  Войти
</button>
          {err && <div style={{ color: "red", marginTop: 8 }}>{err}</div>}
        </form>
      </div>
    </div>
  );
}

export default AddAccountPanel;