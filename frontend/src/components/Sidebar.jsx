import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, PlusCircle, Users, Menu, X, Zap } from 'lucide-react';
import { connectWallet, disconnectWallet } from '../utils/algorand';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Marketplace', path: '/', icon: LayoutDashboard },
  { name: 'Chats', path: '/chats', icon: MessageSquare },
  { name: 'Submit Task', path: '/submittask', icon: PlusCircle },
  { name: 'Submit Agent', path: '/submitagent', icon: Users },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const connected = localStorage.getItem('walletConnected') === 'true';
    const address = localStorage.getItem('walletAddress') || '';
    setIsConnected(connected);
    setWalletAddress(address);
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (isConnected) return;
      
      // In a real app, you would connect to the user's wallet here
      // For now, we'll just simulate a successful connection
      const mockAddress = '0x1234...abcd';
      setWalletAddress(mockAddress);
      setIsConnected(true);
      // You would typically store this in a global state (like Context or Redux)
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

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

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={styles.mobileMenuButton}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && isMobile && (
        <div 
          className={styles.overlay}
          onClick={toggleSidebar}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>AI Marketplace</h1>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => isMobile && setIsOpen(false)}
            >
              <item.icon className={styles.navIcon} />
              <span className={styles.navText}>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button 
            onClick={handleConnect}
            className={`${styles.walletButton} ${walletAddress ? styles.connected : ''}`}
          >
            <Zap className={styles.walletIcon} />
            {walletAddress ? shortAddress : 'Connect Wallet'}
          </button>
          
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>U</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>User</p>
              <p className={styles.userPlan}>Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
