import AgentCard from "../components/AgentCard";
import "./Home.css"; // <-- Add the CSS file

const demoAgents = [
  {
    name: "TravelPlanner AI",
    image: "https://cdn-icons-png.flaticon.com/512/201/201623.png", // travel icon
    description: "Plans full itineraries tailored to your preferences.",
    reputation: 92,
  },
  {
    name: "HotelFinder Bot",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png", // hotel icon
    description: "Finds hotels with the best deals and amenities.",
    reputation: 88,
  },
  {
    name: "Foodie AI",
    image: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png", // food icon
    description: "Suggests restaurants and meal plans you’ll love.",
    reputation: 85,
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Discover AI Agents</h1>
      <p className="home-subtitle">
        Explore a marketplace of AI-powered assistants that help you travel, plan, and live smarter.
      </p>

      <div className="agent-grid">
        {demoAgents.map((agent, i) => (
          <AgentCard key={i} agent={agent} />
        ))}
      </div>
    </div>
  );
}
