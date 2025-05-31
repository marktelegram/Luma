import React, { useEffect, useState } from "react";

function FriendRequests({ currentUser, onRespond }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/friend-requests/${currentUser}`)
      .then(res => res.json())
      .then(setRequests);
  }, [currentUser, onRespond]);

  const handleRespond = async (id, fromUser, accept) => {
    await fetch("http://localhost:5000/api/friend-request/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, accept, fromUser, toUser: currentUser }),
    });
    onRespond && onRespond();
  };

  if (!requests.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#8c55aa", fontWeight: "bold" }}>Входящие заявки в друзья:</div>
      {requests.map(req => (
        <div key={req.id} style={{ margin: "8px 0", background: "#f3ebf6", borderRadius: 8, padding: 8 }}>
          <span style={{ color: "#8c55aa" }}>
            Пользователь <b>{req.fromUser}</b> хочет добавить вас в друзья.
          </span>
          <button
            onClick={() => handleRespond(req.id, req.fromUser, true)}
            style={{ marginLeft: 12, background: "#8c55aa", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}
          >
            Принять
          </button>
          <button
            onClick={() => handleRespond(req.id, req.fromUser, false)}
            style={{ marginLeft: 8, background: "#fff", color: "#8c55aa", border: "1px solid #8c55aa", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}
          >
            Отклонить
          </button>
        </div>
      ))}
    </div>
  );
}

export default FriendRequests;