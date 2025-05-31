import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/message" element={<Chat />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;