import { FiArrowRight, FiStar } from 'react-icons/fi';
import './AgentCard.css';

export default function AgentCard({ agent }) {
  return (
    <div className="agent-card">
      <div className="card-image-container">
        <img 
          src={agent.image} 
          alt={agent.name} 
          className="agent-image"
          loading="lazy"
        />
        <div className="image-overlay"></div>
        <div className="reputation-badge">
          <FiStar className="star-icon" />
          <span>{agent.reputation}</span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="agent-name">{agent.name}</h3>
        <p className="agent-description">{agent.description}</p>
        
        <div className="card-footer">
          <div className="tags">
            {agent.tags?.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          
          <button className="view-button">
            View Details
            <FiArrowRight className="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
