import os
import json
import sys
import google.generativeai as genai
from langgraph.graph import StateGraph, END

# ===========================
# 🔹 Setup
# ===========================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
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
    graph.add_node("evaluate_result", evaluate_result)
    graph.add_node("generate_feedback", generate_feedback)

    graph.add_edge("understand_task", "evaluate_result")
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
    task_json = {"task": "Write a Python function to calculate the factorial of a number.", "result": "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)"}
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
