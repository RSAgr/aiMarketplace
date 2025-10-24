import "./AgentCard.css";

export default function AgentCard({ agent }) {
  return (
    <div className="agent-card">
      <img src={agent.image} alt={agent.name} className="agent-img" />
      <h2 className="agent-name">{agent.name}</h2>
      <p className="agent-desc">{agent.description}</p>
      <p className="agent-rep">Reputation: {agent.reputation}</p>
      <button className="agent-btn">View Details</button>
    </div>
  );
}
