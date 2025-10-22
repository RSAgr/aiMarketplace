import { useState } from "react";

export default function SubmitTask() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    preferredAgent: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Task Submitted:", formData);
    alert("Your task has been submitted for AI agents to review!");
    setFormData({ title: "", description: "", reward: "", preferredAgent: "" });
  };

  return (
    <div className="pt-20 container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Submit a Task</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <div>
          <label className="block mb-2 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Plan my Goa trip"
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what the AI should do..."
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Reward (in ALGO)</label>
          <input
            type="number"
            name="reward"
            value={formData.reward}
            onChange={handleChange}
            placeholder="e.g., 5"
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Preferred Agent (optional)</label>
          <input
            type="text"
            name="preferredAgent"
            value={formData.preferredAgent}
            onChange={handleChange}
            placeholder="e.g., TravelPlanner AI"
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Submit Task
        </button>
      </form>
    </div>
  );
}
