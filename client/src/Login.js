import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleUserClick = (user) => {
    setForm({ username: user.username, password: "" });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("username", form.username); // Сохраняем логин
        setSuccess("Вход выполнен! Перенаправление...");
        setTimeout(() => navigate("/message"), 500); // Переход на /message
        setForm({ username: "", password: "" });
      } else {
        setError(data.message || "Ошибка входа");
      }
    } catch (err) {
      setError("Ошибка сервера");
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-title">Вход</div>
      <div style={{ marginBottom: 10 }}>
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            style={{
              margin: "0 5px 5px 0",
              padding: "5px 10px",
              borderRadius: "10px",
              border: "1px solid #8C55AA",
              background: "#f3ebf6",
              color: "#8C55AA",
              cursor: "pointer",
            }}
            onClick={() => handleUserClick(user)}
          >
            {user.username}
          </button>
        ))}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
        />
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button className="auth-submit" type="submit">
          Войти
        </button>
      </form>
      <Link className="auth-link" to="/register">
        Нет аккаунта? Зарегистрироваться
      </Link>
    </div>
  );
}

export default Login;