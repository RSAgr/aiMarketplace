export default function AgentCard({ agent }) {
  return (
    <div className="p-4 border rounded-xl shadow hover:shadow-lg transition">
      <img src={agent.image} alt={agent.name} className="rounded-lg mb-3 h-40 w-full object-cover" />
      <h2 className="text-lg font-semibold">{agent.name}</h2>
      <p className="text-gray-500 text-sm mb-2">{agent.description}</p>
      <p className="text-sm text-blue-600 font-medium">Reputation: {agent.reputation}</p>
      <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
        View Details
      </button>
    </div>
  );
}
