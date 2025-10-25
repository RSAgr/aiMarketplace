import { useEffect, useState } from 'react';
import AgentCard from "../components/AgentCard";
import "./Home.css";

const demoAgents = [
  {
    name: "TravelPlanner Pro",
    image: "https://images.unsplash.com/photo-1436491865339-fbd079c9cf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Creates personalized travel itineraries with local insights, hidden gems, and real-time updates for the perfect trip.",
    reputation: 94,
    tags: ["Travel", "Planning", "Itinerary"]
  },
  {
    name: "Luxury Stays AI",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Discovers and books premium accommodations with exclusive deals and personalized recommendations.",
    reputation: 92,
    tags: ["Hotels", "Luxury", "Booking"]
  },
  {
    name: "Culinary Guide",
    image: "https://images.unsplash.com/photo-1504674900247-087703934569?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Your personal food expert suggesting restaurants, recipes, and culinary experiences based on your taste.",
    reputation: 91,
    tags: ["Food", "Restaurants", "Recipes"]
  },
  {
    name: "Adventure Scout",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Finds thrilling outdoor activities and adventure sports tailored to your fitness level and interests.",
    reputation: 89,
    tags: ["Adventure", "Outdoors", "Sports"]
  },
  {
    name: "Cultural Compass",
    image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Immerses you in local cultures with authentic experiences, events, and historical insights.",
    reputation: 93,
    tags: ["Culture", "History", "Local"]
  },
  {
    name: "Budget Tracker",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Helps you manage travel expenses and find the best deals to maximize your travel budget.",
    reputation: 90,
    tags: ["Budget", "Finance", "Deals"]
  }
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to trigger the animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`home-container ${isLoaded ? 'loaded' : ''}`}>
      <div className="hero-section">
        <h1 className="home-title">Discover AI Agents</h1>
        <p className="home-subtitle">
          Explore a marketplace of AI-powered assistants that help you travel, plan, and live smarter.
          Find the perfect companion for your next adventure.
        </p>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search AI agents..." 
            className="search-input"
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="section-header">
        <h2>Featured AI Agents</h2>
        <div className="filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Popular</button>
          <button className="filter-btn">New</button>
          <button className="filter-btn">Top Rated</button>
        </div>
      </div>

      <div className="agent-grid">
        {demoAgents.map((agent, i) => (
          <AgentCard key={i} agent={agent} style={{ '--delay': `${i * 0.1}s` }} />
        ))}
      </div>

      <div className="cta-section">
        <h2>Can't find what you're looking for?</h2>
        <p>Submit a custom request and we'll help you find or create the perfect AI agent for your needs.</p>
        <button className="cta-button">Request Custom Agent</button>
      </div>
    </div>
  );
}
