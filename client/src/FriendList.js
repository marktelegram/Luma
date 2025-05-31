import React, { useEffect, useState } from "react";

function FriendList({ currentUser, onSelect }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/friends/${currentUser}`)
      .then(res => res.json())
      .then(setFriends);
  }, [currentUser]);

  return (
    <div>
      <div style={{ color: "#8c55aa", fontWeight: "bold", marginBottom: 8 }}>Друзья:</div>
      {friends.map(friend => (
        <div
          key={friend.id}
          onClick={() => onSelect(friend)}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: 8,
            background: "#f3ebf6",
            color: "#8c55aa",
            marginBottom: 4,
            fontWeight: "bold"
          }}
        >
          {friend.username}
        </div>
      ))}
    </div>
  );
}

export default FriendList;