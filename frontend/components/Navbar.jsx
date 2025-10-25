import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { connectWallet, disconnectWallet } from "../src/utils/algorand";
import { FiMenu, FiX, FiZap } from "react-icons/fi";
import "./Navbar.css";

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleConnect = async () => {
    if (walletAddress) {
      await disconnectWallet();
      setWalletAddress(null);
      return;
    }
    const address = await connectWallet();
    if (address) setWalletAddress(address);
  };

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)
    : null;

  // Navbar links data
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/submitagent", label: "Submit Agent" },
    { to: "/submittask", label: "Submit Task" },
    { to: "/tasks", label: "Tasks' Results" },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FiZap className="logo-icon" />
          <span>AI Agent Market</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          
          <button 
            onClick={handleConnect} 
            className="wallet-button"
            aria-label={walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
          >
            {walletAddress ? (
              <span className="wallet-address">
                <span className="wallet-dot"></span>
                {shortAddress}
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}
