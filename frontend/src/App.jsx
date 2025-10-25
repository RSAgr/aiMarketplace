import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from "./components/Sidebar";
import Marketplace from "./Marketplace";
import SubmitTask from "./SubmitTask";
import Tasks from "./Tasks";
import SubmitAgent from "../components/SubmitAgent";
import Chats from "./Chats";

import './App.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        
        <main className="main-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/marketplace" replace />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/submitagent" element={<SubmitAgent />} />
              <Route path="/submittask" element={<SubmitTask />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/chats" element={<Chats />} />
            </Routes>
          </div>
        </main>
        
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}
