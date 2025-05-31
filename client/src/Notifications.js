import React from "react";

export default function Notifications({ onClose }) {
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
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          color: "var(--text-main)",
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          maxWidth: 420,
          boxShadow: "0 8px 32px #000a",
        }}
      >
        <h2 style={{ marginBottom: 20, color: "var(--accent)", fontWeight: "bold" }}>
          Уведомления
        </h2>
        <div style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 16 }}>
          Здесь можно будет управлять уведомлениями (например, разрешить/запретить push-уведомления, выбрать звук и т.д.).
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "var(--button-bg)",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            borderRadius: 10,
            padding: "14px 0",
            fontWeight: "bold",
            fontSize: 16,
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
          <span style={{ fontSize: 18, color: "var(--accent)", marginRight: 8, verticalAlign: "middle" }}>✖</span>
          <span style={{ color: "var(--accent)" }}>ЗАКРЫТЬ</span>
        </button>
      </div>
    </div>
  );
}