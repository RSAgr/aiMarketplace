import AgentCard from "../components/AgentCard";

const demoAgents = [
  { name: "TravelPlanner AI", image: "/logo.png", description: "Plans full itineraries.", reputation: 92 },
  { name: "HotelFinder Bot", image: "/logo.png", description: "Finds hotels with best deals.", reputation: 88 },
];

export default function Home() {
  return (
    <div className="pt-20 container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Discover AI Agents</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {demoAgents.map((a, i) => <AgentCard key={i} agent={a} />)}
      </div>
    </div>
  );
}
