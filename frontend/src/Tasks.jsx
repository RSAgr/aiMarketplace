const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

export default function Tasks() {
  return (
    <div>
      <h2>Submitted Task(s)</h2>
      {tasks.map((t, i) => (
        <div key={i}>
          <h3>
            {typeof t.task === "object" ? JSON.stringify(t.task) : t.task}
          </h3>
          <p>Status: {t.status}</p>
          <p>Agent: {t.agent}</p>
          <p>Reward: {t.reward}</p>
          <p>Output: {t.output || "Processing..."}</p>
        </div>
      ))}
    </div>
  );
}

