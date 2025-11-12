import os
import json
import sys
import google.generativeai as genai
from langgraph.graph import StateGraph, END
import importlib
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ===========================
# 🔹 Setup
# ===========================
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = "AIzaSyCy7O1GLQ5pfV-A0S4uNbl_Z9kHJBmHCRA"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

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

    # Step 1: Ask Gemini which agent
    AGENT_MAP = {
        "hotel": "hotel_agent",
        "flight": "flight_agent",
        "taxi": "taxi_agent",
        "food": "food_agent"
    }

    prompt = f"""Task: {task}
    Available agents: {', '.join(AGENT_MAP.keys())}
    Which agent should handle this task? Respond with only the agent name."""
    response = model.generate_content(prompt)
    chosen = response.text.strip().lower()

    agent_module = AGENT_MAP.get(chosen)
    if not agent_module:
        state["result"] = "No suitable agent found."
        return state

    # Step 2: Ask Gemini if more info is needed
    info_prompt = f"""
    You are an expert system managing task routing.
    Task: "{task}"
    If this is a {chosen} task, list any missing details
    required to complete it (like date, destination, budget, etc.).
    Respond with a comma-separated list or 'none' if all info present.
    """
    missing_info = model.generate_content(info_prompt).text.strip().lower()

    user_inputs = {}
    if missing_info != "none":
        print(f"🔍 Missing info: {missing_info}")
        for item in [m.strip() for m in missing_info.split(",") if m.strip()]:
            user_inputs[item] = input(f"Please enter {item}: ")

        # Combine original task with new info
        task += " " + ", ".join([f"{k}: {v}" for k, v in user_inputs.items()])

    # Step 3: Call the agent
    try:
        mod = importlib.import_module(agent_module)
        agent_result = mod.solve_task(task)
        state["result"] = agent_result.get("result", "No result returned.")
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
    if not state["approved"]:
        state["task"] += f"\nFeedback for improvement: {state['feedback']}"
        
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

    # Edges
    graph.add_edge("understand_task", "route_to_agent")
    graph.add_edge("route_to_agent", "evaluate_result")
    graph.add_edge("evaluate_result", "generate_feedback")

    # Conditional branch: if not approved → rerun agent
    graph.add_conditional_edges(
        "generate_feedback",
        lambda state: "improve" if not state.get("approved") else END,
        {
            "improve": "route_to_agent",
            END: END
        }
    )

    graph.set_entry_point("understand_task")
    return graph.compile()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        task_json = json.loads(sys.argv[1])
    else:
        # Simulate getting data from an agent
        try:
           task_json = json.load(sys.stdin)
        except Exception as e:
            task_json = {
            "task": "Book a car in Goa",
            "result": None  # None for now — will be filled later by an agent
        }
    task = task_json.get("task")
    #task = "Plan the complete iternary for my trip to Goa"
    result = task_json.get("result")
    #result = None

    graph = build_graph()
    final_state = graph.invoke({"task": task, "result": result})
    # for k, v in final_state.items():
    #     print(k, type(v))
    final_state["result"] = str(final_state["result"])
    print(json.dumps(final_state, indent=2))
