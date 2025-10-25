import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitTask.css";

export default function SubmitTask() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    preferredAgent: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        navigate("/tasks"); // Redirect to tasks page
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/create_task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // remove reward entirely
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit task");
      }

      const result = await response.json();
      const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      localStorage.setItem("tasks", JSON.stringify([...existingTasks, result]));

      // Reset form and show success
      setFormData({ title: "", description: "", preferredAgent: "" });
      setSuccess("Task submitted successfully! Redirecting...");
    } catch (err) {
      console.error("Error submitting task:", err);
      setError(err.message || "An error occurred while submitting the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-container">
      <h1 className="submit-title">Submit a Task</h1>

      <form onSubmit={handleSubmit} className="submit-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="title">
            Task Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Plan my Goa trip"
            disabled={isSubmitting}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe what the AI should do in detail..."
            disabled={isSubmitting}
            maxLength={1000}
          />
        </div>

        <div className="form-group">
          <label htmlFor="preferredAgent">Preferred Agent ID (optional)</label>
          <input
            id="preferredAgent"
            type="text"
            name="preferredAgent"
            value={formData.preferredAgent}
            onChange={handleChange}
            placeholder="e.g., agent-123"
            disabled={isSubmitting}
          />
          <small className="hint">
            Leave empty to let the system choose the best agent
          </small>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Submitting...
            </>
          ) : (
            "Submit Task"
          )}
        </button>

        <div className="form-footer">
          <small>
            Fields marked with <span className="required">*</span> are required
          </small>
        </div>
      </form>
    </div>
  );
}
