import React, { useState, useEffect } from "react";
import Notifications from "./Notifications";
import { applyTheme } from "./Themes";

const THEME_KEY = "theme";
const NOTIFY_KEY = "notifications_enabled";

export default function Settings({ onClose }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "default");
  const [notifications, setNotifications] = useState(() =>
    localStorage.getItem(NOTIFY_KEY) === "true"
  );
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(NOTIFY_KEY, notifications ? "true" : "false");
  }, [notifications]);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          color: "var(--text-main)",
          borderRadius: 16,
          padding: 32,
          minWidth: 340,
          maxWidth: 420,
          boxShadow: "0 8px 32px #000a",
        }}
      >
        <h2 style={{ marginBottom: 20, color: "var(--accent)", fontWeight: "bold" }}>
          Настройки
        </h2>
        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: "bold", color: "var(--accent)" }}>
              Тема оформления:
            </label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              style={{
                marginLeft: 12,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid var(--accent)",
                background: "var(--bg-main)",
                color: "var(--text-main)",
                fontWeight: "bold",
                outline: "none",
              }}
            >
              <option value="default">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: "bold", color: "var(--accent)" }}>
              Уведомления:
            </label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
              style={{
                marginLeft: 12,
                accentColor: "var(--accent)",
                width: 18,
                height: 18,
                verticalAlign: "middle",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => setShowNotifications(true)}
              style={{
                marginLeft: 16,
                background: "var(--button-bg)",
                color: "var(--accent)",
                border: "2px solid var(--accent)",
                borderRadius: 8,
                padding: "6px 18px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <span style={{ fontSize: 18, verticalAlign: "middle" }}>🔔</span>
              Управление
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "var(--button-bg)",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            borderRadius: 10,
            padding: "18px 0",
            fontWeight: "bold",
            fontSize: 18,
            cursor: "pointer",
            textAlign: "center",
            marginBottom: 0,
            transition: "background 0.2s, color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 0 0 2px #b97cff33",
          }}
        >
          <span style={{ fontSize: 22, color: "var(--accent)", marginRight: 8, verticalAlign: "middle" }}>✖</span>
          <span style={{ color: "var(--accent)" }}>ЗАКРЫТЬ</span>
        </button>
      </div>
      {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}