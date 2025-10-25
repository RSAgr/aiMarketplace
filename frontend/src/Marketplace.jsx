import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Zap } from 'lucide-react';
import './Marketplace.css';

const demoAgents = [
  {
    id: 1,
    name: "Global Travel Agent",
    image: "https://images.unsplash.com/photo-1436491865339-fbd079c9cf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Expert travel assistant that plans complete itineraries, books flights and hotels, and provides real-time travel updates and local insights for your perfect vacation.",
    reputation: 96,
    tags: ["Travel", "Planning", "Booking"],
    price: "0.7 ALGO",
    tasksCompleted: 2450
  },
  {
    id: 2,
    name: "Financial Advisor Pro",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Professional financial guidance for investments, savings, and wealth management. Get personalized advice for your financial goals and portfolio optimization.",
    reputation: 95,
    tags: ["Finance", "Investing", "Wealth"],
    price: "1.2 ALGO",
    tasksCompleted: 1870
  },
  {
    id: 3,
    name: "Academic Research Assistant",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Specialized in academic research, paper writing, and citation management. Helps students and researchers with literature reviews and thesis development.",
    reputation: 93,
    tags: ["Education", "Research", "Writing"],
    price: "0.9 ALGO",
    tasksCompleted: 3210
  },
  {
    id: 4,
    name: "Business Consultant AI",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Strategic business advisor offering market analysis, business planning, and growth strategies for startups and established companies.",
    reputation: 94,
    tags: ["Business", "Strategy", "Consulting"],
    price: "1.5 ALGO",
    tasksCompleted: 1560
  },
  {
    id: 5,
    name: "Tech Support Specialist",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "24/7 technical support for all your devices and software issues. Troubleshooting, setup assistance, and tech advice from certified experts.",
    reputation: 92,
    tags: ["Technology", "Support", "Troubleshooting"],
    price: "0.8 ALGO",
    tasksCompleted: 2890
  },
  {
    id: 6,
    name: "Health & Wellness Coach",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    description: "Personalized health and wellness plans including nutrition, exercise, and mental wellbeing strategies for a balanced lifestyle.",
    reputation: 94,
    tags: ["Health", "Fitness", "Wellness"],
    price: "0.9 ALGO",
    tasksCompleted: 2100
  }
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'travel', name: 'Travel' },
  { id: 'food', name: 'Food & Dining' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'culture', name: 'Culture' },
  { id: 'finance', name: 'Finance' },
  { id: 'planning', name: 'Planning' },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredAgents = demoAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      agent.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'reputation') {
      return b.reputation - a.reputation;
    } else if (sortBy === 'price-low') {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (sortBy === 'price-high') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    // Default: sort by popularity (tasks completed)
    return b.tasksCompleted - a.tasksCompleted;
  });

  const handleAgentClick = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <div className={`marketplace-container ${isLoaded ? 'loaded' : ''}`}>
      <div className="marketplace-header">
        <h1>AI Agents Marketplace</h1>
        <p>Discover and hire specialized AI agents to assist with your tasks</p>
        
        <div className="search-bar">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search agents by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <Filter className="filter-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popularity">Sort by: Popularity</option>
              <option value="reputation">Sort by: Highest Rating</option>
              <option value="price-low">Sort by: Price (Low to High)</option>
              <option value="price-high">Sort by: Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="agent-grid">
        {sortedAgents.length > 0 ? (
          sortedAgents.map((agent, index) => (
            <div 
              key={agent.id} 
              className="agent-card" 
              onClick={() => handleAgentClick(agent.id)}
              style={{ '--delay': `${index * 0.05}s` }}
            >
              <div className="agent-image" style={{ backgroundImage: `url(${agent.image})` }}>
                <div className="agent-rating">
                  <Star fill="#FBBF24" stroke="#F59E0B" size={16} />
                  <span>{agent.reputation}%</span>
                </div>
                <div className="agent-price">{agent.price}</div>
              </div>
              <div className="agent-details">
                <h3>{agent.name}</h3>
                <p className="agent-description">{agent.description}</p>
                <div className="agent-tags">
                  {agent.tags.map((tag, i) => (
                    <span key={i} className="agent-tag">{tag}</span>
                  ))}
                </div>
                <div className="agent-stats">
                  <span className="tasks-completed">
                    <Zap size={14} className="zap-icon" />
                    {agent.tasksCompleted.toLocaleString()} tasks
                  </span>
                </div>
                <button 
                  className="hire-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle hire action
                  }}
                >
                  Hire Agent
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>No agents found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
