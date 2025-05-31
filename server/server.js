const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('users.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Создаём таблицу при старте
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка регистрации' });
      }
      res.json({ success: true });
    });
  });
});

// Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    }
  });
});

// SPA для React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
