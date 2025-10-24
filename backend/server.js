// server.js
import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process';
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(cors())

// In-memory storage for demo
const users = {};
const agents = {};
const tasks = {};
const balances = {};

// Create a task
app.post("/create_task", (req, res) => {
    const { title, task_data, reward, agent_id } = req.body;
    const task_id = uuidv4();
    tasks[task_id] = {
        creator: 1,
        agent: agent_id,
        status: "pending",
        task: task_data,
        reward
    };
    //res.json({ task_id, status: "pending" });
    // why to wait, immediately call the agent to process the task
    const py = spawn("python", ["task_divider.py",JSON.stringify(tasks[task_id].task)]);
    let output = "";
    py.stdout.on("data", (data) => {
        output += data.toString();
    });
    py.on("close", () => {
        tasks[task_id].result = output.trim();
        tasks[task_id].status = "completed";
        res.json({ message: "Result stored", task: tasks[task_id] });
    });
    // the json which is returned contains the result
});

// When models submit results, it is appended to the task json present in list tasks
// app.post("/submit_result", (req, res) => {
//     const { task_id, result } = req.body;
//     const task = tasks[task_id];
//     if (!task) return res.status(404).json({ error: "Task not found" });

//     task.result = result;  // store the generated output
//     task.status = "completed";  // or keep "pending" until verified
//     res.json({ message: "Result stored", task });
// });

// I don;t think we need /submit_result endpoint as the result is generated immediately after task creation


// Expert system verification (mock)
app.post("/verify_task", (req, res) => {
    const { task_id } = req.body;
    const task = tasks[task_id];
    if(!task.result) return res.json({ error: "No result to verify" });
    const py = spawn("python", ["expert_system.py", JSON.stringify(task)]);
     let output = "";
    py.stdout.on("data", (data) => {
        output += data.toString();
    });
    py.on("close", () => {
        task.status = output.trim();
        res.json(task);
    });
});

// Release payment (mock)
app.post("/release_payment", (req, res) => {
    const { task_id } = req.body;
    const task = tasks[task_id];
    if (task.status !== "verified") return res.json({ error: "Task not verified" });

    const creator = task.creator;
    const agent_owner = agents[task.agent].owner;
    const amount = task.reward;

    balances[creator] = (balances[creator] || 100) - amount;
    balances[agent_owner] = (balances[agent_owner] || 0) + amount;

    res.json({ message: `Paid ${amount} ALGO to ${agent_owner}` });
});

app.listen(5000, () => console.log("Server running on port 5000"));
