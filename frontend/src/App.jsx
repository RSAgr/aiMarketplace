import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "D:/AImarket/frontend/components/Navbar.jsx";
import Home from "./Home";
import SubmitTask from "./SubmitTask";
import Tasks from "./Tasks";



export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitTask />} />
          <Route path="/tasks" element={< Tasks />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
