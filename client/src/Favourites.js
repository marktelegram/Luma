import React from "react";

export default function Favourites({ favourite = [], onClose, onRemove }) {
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
          background: "#232c3b",
          color: "#fff",
          borderRadius: 16,
          padding: 0,
          minWidth: 340,
          maxWidth: 520,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px #000a",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: "1px solid #2d3140",
            background: "#181f2a",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <img
            src="/logo.png"
            alt="Избранное"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              marginRight: 14,
              objectFit: "cover",
              border: "2px solid #8c55aa",
              background: "#fff",
            }}
          />
          <span style={{ fontWeight: "bold", fontSize: 22, flex: 1 }}>
            Избранное
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#b97cff",
              fontSize: 28,
              cursor: "pointer",
              marginLeft: 8,
              fontWeight: "bold",
              lineHeight: 1,
            }}
            aria-label="Закрыть"
            title="Закрыть"
          >
            ×
          </button>
        </div>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 0 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            background: "#232c3b",
          }}
        >
          {favourite.length === 0 ? (
            <div
              style={{
                color: "#bdbdbd",
                textAlign: "center",
                marginTop: 40,
                fontSize: 18,
              }}
            >
              Нет избранных сообщений
            </div>
          ) : (
            favourite
              .slice()
              .reverse()
              .map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: "flex-end",
                    background: "#8c55aa",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "12px 18px",
                    margin: "0 24px 18px 80px",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    fontSize: 16,
                    lineHeight: 1.5,
                    position: "relative",
                  }}
                >
                  <div style={{ marginBottom: 4 }}>{msg.text}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#e1cfff",
                      opacity: 0.7,
                      textAlign: "right",
                    }}
                  >
                    {msg.created_at ||
                      (msg.date &&
                        new Date(msg.date).toLocaleString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        }))}
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(msg.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: 18,
                        cursor: "pointer",
                        opacity: 0.7,
                        transition: "opacity 0.2s",
                      }}
                      title="Удалить из избранного"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))
          )}
        </div>
        {/* Footer */}
        <div
          style={{
            padding: "18px 24px",
            borderTop: "1px solid #2d3140",
            background: "#181f2a",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#8c55aa",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 32px",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}