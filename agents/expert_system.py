import os
import json
import sys
import google.generativeai as genai
from langgraph.graph import StateGraph, END
import importlib

# ===========================
# 🔹 Setup
# ===========================
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = "AIzaSyDr4E-qLuYvOUemP5mjyCPmp8TCY05iguQ"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# ===========================
# 🔹 Define State
# ===========================
from typing import TypedDict

class ExpertState(TypedDict, total=False):
    task: str
    result: str
    understanding: str
    verdict: str
    feedback: str
    approved: bool

# ===========================
# 🔹 Step 1: Task Understanding
# ===========================
def understand_task(state: ExpertState):
    task = state["task"]
    prompt = f"Understand this user task and summarize what needs to be verified.\nTask: {task}"
    response = model.generate_content(prompt)
    state["understanding"] = response.text.strip()
    return state

def route_to_agent(state: ExpertState):
    task = state["task"]

    # Simple agent registry (can later load from JSON or folder)
    AGENT_MAP = {
        "hotel": "hotel_agent",
        "flight": "flight_agent",
        "weather": "weather_agent"
    }

    # Ask Gemini to choose which agent should handle the task
    prompt = f"""Task: {task}
    Available agents: {', '.join(AGENT_MAP.keys())}
    Which agent should handle this task? Respond with only the agent name."""
    response = model.generate_content(prompt)
    chosen = response.text.strip().lower()

    # Load and call the chosen agent
    agent_module = AGENT_MAP.get(chosen)
    if not agent_module:
        state["result"] = "No suitable agent found."
        return state

    try:
        mod = importlib.import_module(agent_module)
        agent_result = mod.solve_task(task)
        state["result"] = agent_result["result"]
    except Exception as e:
        state["result"] = f"Error running agent: {e}"

    return state

# ===========================
# 🔹 Step 2: Evaluate Result
# ===========================
def evaluate_result(state: ExpertState):
    task = state["task"]
    result = state["result"]
    prompt = f"Evaluate the following result for the given task:\nTask: {task}\nResult: {result}\n\nDecide whether the result is correct. Respond only with 'yes' or 'no'."
    response = model.generate_content(prompt)
    verdict = response.text.strip().lower()
    state["verdict"] = verdict
    return state


# ===========================
# 🔹 Step 3: Generate Feedback
# ===========================
def generate_feedback(state: ExpertState):
    task = state["task"]
    result = state["result"]
    prompt = f"Provide a short feedback on how well the result solves the task.\nTask: {task}\nResult: {result}"
    response = model.generate_content(prompt)
    state["feedback"] = response.text.strip()
    state["approved"] = state["verdict"].startswith("y")
    return state


# ===========================
# 🔹 Build LangGraph Flow
# ===========================
def build_graph():
    graph = StateGraph(ExpertState)
    graph.add_node("understand_task", understand_task)
    graph.add_node("route_to_agent", route_to_agent)
    graph.add_node("evaluate_result", evaluate_result)
    graph.add_node("generate_feedback", generate_feedback)

    graph.add_edge("understand_task", "route_to_agent")
    graph.add_edge("route_to_agent", "evaluate_result")
    graph.add_edge("evaluate_result", "generate_feedback")
    graph.add_edge("generate_feedback", END)
    graph.set_entry_point("understand_task")

    return graph.compile()


# ===========================
# 🔹 Entry Point
# ===========================
if __name__ == "__main__":
    # Load task data from CLI
    #task_json = json.loads(sys.argv[1])
    task_json = {"task": "Book a flight to Delhi", "result": "Flight booked for ₹4500 via Air India."}
    task = task_json.get("task")
    result = task_json.get("result")

    # Initialize graph and run
    graph = build_graph()
    final_state = graph.invoke({"task": task, "result": result})

    # Output final decision
    output = {
        "understanding": final_state.get("understanding"),
        "feedback": final_state.get("feedback"),
        "approved": final_state.get("approved"),
    }

    print(json.dumps(output))
