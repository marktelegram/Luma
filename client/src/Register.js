import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Регистрация успешна!");
        setForm({ username: "", password: "" });
      } else {
        setError(data.message || "Ошибка регистрации");
      }
    } catch (err) {
      setError("Ошибка сервера");
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-title">Регистрация</div>
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
          Зарегистрироваться
        </button>
      </form>
      <Link className="auth-link" to="/login">
        Уже есть аккаунт? Войти
      </Link>
    </div>
  );
}

export default Register;