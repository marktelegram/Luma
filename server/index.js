import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { initTheme } from "./Themes";

initTheme();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '1024mb' }));

// --- Таблицы ---
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    avatar TEXT,
    cloud_password TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    friend TEXT,
    UNIQUE(user, friend)
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fromUser TEXT,
    toUser TEXT,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS friend_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fromUser TEXT,
    toUser TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// --- Регистрация ---
app.post('/api/register', async (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password) return res.json({ success: false, message: 'Все поля обязательны' });
  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)`,
    [username, hashedPassword, avatar || "/logo.png"],
    (err) => {
      if (err) return res.json({ success: false, message: 'Пользователь уже существует' });
      res.json({ success: true });
    }
  );
});

// --- Вход ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.json({ success: false, message: 'Пользователь не найден' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Неверный пароль' });
    res.json({ success: true, user: { id: user.id, username: user.username, avatar: user.avatar || "/logo.png" } });
  });
});

// --- Получить всех пользователей ---
app.get('/api/users', (_, res) => {
  db.all(`SELECT id, username, avatar FROM users`, [], (err, rows) => {
    if (err) return res.json([]);
    rows.forEach(u => { if (!u.avatar) u.avatar = "/logo.png"; });
    res.json(rows);
  });
});

// --- Получить друзей пользователя ---
app.get('/api/friends/:user', (req, res) => {
  db.all(
    `SELECT users.id, users.username, users.avatar FROM friends
     JOIN users ON users.username = friends.friend
     WHERE friends.user = ?`,
    [req.params.user],
    (err, rows) => {
      if (err) return res.json([]);
      rows.forEach(u => { if (!u.avatar) u.avatar = "/logo.png"; });
      res.json(rows);
    }
  );
});

// --- Смена аватара ---
app.post('/api/set-avatar', express.json(), (req, res) => {
  const { username, avatar } = req.body;
  if (!username) return res.json({ success: false, message: "Нет пользователя" });
  db.run(
    `UPDATE users SET avatar = ? WHERE username = ?`,
    [avatar || "/logo.png", username],
    function (err) {
      if (err) return res.json({ success: false, message: "Ошибка обновления" });
      res.json({ success: true });
    }
  );
});

// --- Установить или изменить облачный пароль ---
app.post('/api/set-cloud-password', express.json(), (req, res) => {
  const { username, cloud_password } = req.body;
  if (!username || !cloud_password) return res.json({ success: false, message: "Все поля обязательны" });
  db.run(
    `UPDATE users SET cloud_password = ? WHERE username = ?`,
    [cloud_password, username],
    function (err) {
      if (err) return res.json({ success: false, message: "Ошибка обновления" });
      res.json({ success: true });
    }
  );
});

// --- Восстановление пароля через облачный пароль ---
app.post('/api/recover', express.json(), async (req, res) => {
  const { username, cloud_password, newPassword } = req.body;
  if (!username || !cloud_password || !newPassword) {
    return res.json({ success: false, message: "Все поля обязательны" });
  }
  db.get(`SELECT * FROM users WHERE LOWER(username) = LOWER(?)`, [username], async (err, user) => {
    if (err || !user) return res.json({ success: false, message: "Пользователь не найден" });
    if (!user.cloud_password || user.cloud_password !== cloud_password) {
      return res.json({ success: false, message: "Неверный облачный пароль" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashed, user.username], (err2) => {
      if (err2) return res.json({ success: false, message: "Ошибка обновления" });
      res.json({ success: true });
    });
  });
});

// --- Отправить заявку в друзья ---
app.post('/api/friend-request', express.json(), (req, res) => {
  const { fromUser, toUser } = req.body;
  if (!fromUser || !toUser || fromUser === toUser) return res.json({ success: false, message: "Некорректные данные" });
  db.get(
    `SELECT * FROM friend_requests WHERE fromUser = ? AND toUser = ? AND status = 'pending'`,
    [fromUser, toUser],
    (_, row) => {
      if (row) return res.json({ success: false, message: "Заявка уже отправлена" });
      db.get(
        `SELECT * FROM friends WHERE user = ? AND friend = ?`,
        [fromUser, toUser],
        (_, row2) => {
          if (row2) return res.json({ success: false, message: "Пользователь уже в друзьях" });
          db.run(
            `INSERT INTO friend_requests (fromUser, toUser, status) VALUES (?, ?, 'pending')`,
            [fromUser, toUser],
            function (err3) {
              if (err3) return res.json({ success: false, message: "Ошибка" });
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

// --- Получить входящие заявки ---
app.get('/api/friend-requests/:user', (req, res) => {
  db.all(
    `SELECT * FROM friend_requests WHERE toUser = ? AND status = 'pending'`,
    [req.params.user],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// --- Получить отправленные заявки ---
app.get('/api/sent-requests/:user', (req, res) => {
  db.all(
    `SELECT toUser FROM friend_requests WHERE fromUser = ? AND status = 'pending'`,
    [req.params.user],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// --- Принять или отклонить заявку ---
app.post('/api/friend-request/respond', express.json(), (req, res) => {
  const { requestId, accept, fromUser, toUser } = req.body;
  if (typeof accept !== "boolean") return res.status(400).json({ success: false });
  const status = accept ? 'accepted' : 'rejected';
  db.run(
    `UPDATE friend_requests SET status = ? WHERE id = ?`,
    [status, requestId],
    function (err) {
      if (err) return res.status(500).json({ success: false });
      if (accept) {
        db.run(
          `INSERT OR IGNORE INTO friends (user, friend) VALUES (?, ?), (?, ?)`,
          [fromUser, toUser, toUser, fromUser]
        );
      }
      res.json({ success: true });
    }
  );
});

// --- Удалить друга ---
app.post('/api/remove-friend', express.json(), (req, res) => {
  const { user, friend } = req.body;
  db.run(
    `DELETE FROM friends WHERE (user = ? AND friend = ?) OR (user = ? AND friend = ?)`,
    [user, friend, friend, user],
    function (err) {
      if (err) return res.json({ success: false, message: "Ошибка" });
      res.json({ success: true });
    }
  );
});

// --- Получить сообщения между двумя пользователями ---
app.get('/api/messages/:withUser', (req, res) => {
  const from = req.query.from;
  const to = req.params.withUser;
  db.all(
    `SELECT * FROM messages WHERE 
      (fromUser = ? AND toUser = ?) OR (fromUser = ? AND toUser = ?)
      ORDER BY created_at ASC`,
    [from, to, to, from],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// --- Отправить сообщение (универсально: поддержка FormData и JSON) ---
app.post('/api/messages', (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.none()(req, res, () => next());
  } else {
    express.json()(req, res, () => next());
  }
}, (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) return res.status(400).json({ success: false, message: "Все поля обязательны" });
  db.run(
    `INSERT INTO messages (fromUser, toUser, text, created_at) VALUES (?, ?, ?, datetime('now'))`,
    [from, to, text],
    function (err) {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// --- Смена пароля (по старому паролю) ---
app.post('/api/change-password', express.json(), async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) {
    return res.json({ success: false, message: "Все поля обязательны" });
  }
  db.get(`SELECT * FROM users WHERE LOWER(username) = LOWER(?)`, [username], async (err, user) => {
    if (err || !user) return res.json({ success: false, message: "Пользователь не найден" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.json({ success: false, message: "Старый пароль неверный" });
    const hashed = await bcrypt.hash(newPassword, 10);
    db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashed, user.username], (err2) => {
      if (err2) return res.json({ success: false, message: "Ошибка обновления" });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});