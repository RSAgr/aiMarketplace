import { useState } from "react";
import "./SubmitTask.css"; // 👈 add this

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch("http://localhost:5000/create_task", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      if(response.ok){
        console.log("Task Submitted:", formData);
        
        setFormData({ title: "", description: "", reward: "", preferredAgent: "" });
        const result = await response.json();
        const existingTasks = JSON.parse(localStorage.getItem("tasks"))||[]
        existingTasks.push(result);

        // Save updated list
        localStorage.setItem("tasks", JSON.stringify(existingTasks));
        alert("Submitted");
      }
      else{
        console.log(await response.text);
      }
    }
    catch(err){
      console.error("Error submitting task:", err);
    }
  };

  return (
    <div className="submit-container">
      <h1 className="submit-title">Submit a Task</h1>

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-group">
          <label>Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Plan my Goa trip"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what the AI should do..."
            required
          />
        </div>

        <div className="form-group">
          <label>Reward (in ALGO)</label>
          <input
            type="number"
            name="reward"
            value={formData.reward}
            onChange={handleChange}
            placeholder="e.g., 5"
            required
          />
        </div>

        <div className="form-group">
          <label>Preferred AgentID (optional)</label>
          <input
            type="number"
            name="preferredAgent"
            value={formData.preferredAgent}
            onChange={handleChange}
            placeholder="e.g., TravelPlanner AI"
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit Task
        </button>
      </form>
    </div>
  );
}
