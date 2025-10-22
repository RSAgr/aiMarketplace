import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
    return (
         <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">AI Agent Market</Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/agents" className="hover:text-blue-600">Agents</Link>
          <Link to="/submit" className="hover:text-blue-600">Submit Task</Link>
        </div>
        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}