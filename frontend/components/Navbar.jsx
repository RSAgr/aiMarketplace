import { useState } from "react";
import { Link } from "react-router-dom";
import { connectWallet, disconnectWallet } from "../src/utils/algorand";
import "./Navbar.css"; // <-- import the CSS file

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState(null);

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
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          AI Agent Market
        </Link>

        <div className="navbar-links">
          <Link to="/agents" className="nav-link">
            Submit Agent
          </Link>
          <Link to="/submit" className="nav-link">
            Submit Task
          </Link>
        </div>

        <button onClick={handleConnect} className="wallet-button">
          {walletAddress ? shortAddress : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
