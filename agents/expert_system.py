import os
import json
import sys
import importlib
import io
import google.generativeai as genai
from langgraph.graph import StateGraph, END
from typing import TypedDict, Dict, Annotated, List, Tuple
import operator

# ensure stdout uses utf-8 on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ===========================
# 🔹 Setup
# ===========================
GEMINI_API_KEY = "AIzaSyCy7O1GLQ5pfV-A0S4uNbl_Z9kHJBmHCRA"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ===========================
# 🔹 State definition
# ===========================
class ExpertState(TypedDict, total=False):
    task: str
    understanding: str
    chosen_agents: List[str]
    # partial_results is a mergeable list of tuples (agent_key, output)
    partial_results: Annotated[List[Tuple[str, str]], operator.add]
    result: str
    verdict: str
    feedback: str
    approved: bool

# ===========================
# 🔹 Agent map (available modules)
# ===========================
AGENT_MAP: Dict[str, str] = {
    "hotel": "hotel_agent",
    "flight": "flight_agent",
    "taxi": "taxi_agent",
    "food": "food_agent"
}

# ===========================
# 🔹 1. Understand task
#    (returns only the 'understanding' key)
# ===========================
def understand_task(state: ExpertState):
    task = state["task"]
    prompt = f"Summarize the user task:\n{task}"
    understanding = model.generate_content(prompt).text.strip()
    return {"understanding": understanding}

# ===========================
# 🔹 2. Decide which agents are needed
#    (returns only 'chosen_agents' and initializes 'partial_results' as an empty list)
# ===========================
def decide_agents(state: ExpertState):
    task = state["task"]
    prompt = f"""
Task: {task}
Agents available: {', '.join(AGENT_MAP.keys())}

Which agents should contribute?
Respond with comma-separated values like:
hotel, flight, taxi
"""
    response = model.generate_content(prompt).text.lower()
    chosen = [x.strip() for x in response.split(",") if x.strip()]

    # fallback: if model returns nothing valid, default to all agents
    chosen = [c for c in chosen if c in AGENT_MAP]
    if not chosen:
        chosen = list(AGENT_MAP.keys())

    # initialize partial_results as an empty list (mergeable channel)
    return {"chosen_agents": chosen, "partial_results": []}

# ===========================
# 🔹 3. Individual agent nodes (fan-out)
#    Each agent node returns only {"partial_results": [(agent_key, output)]}
# ===========================
def make_agent_node(agent_key: str):
    def agent_node(state: ExpertState):
        chosen = state.get("chosen_agents", [])
        if agent_key not in chosen:
            # do not write anything if skipped
            return {}

        module_name = AGENT_MAP[agent_key]
        try:
            mod = importlib.import_module(module_name)
            # agent can return dict-like or string; normalize
            agent_out = mod.solve_task(state["task"])
            output = agent_out.get("result", "") if isinstance(agent_out, dict) else str(agent_out)
        except Exception as e:
            output = f"Error running {module_name}: {e}"

        # return a list of one tuple — langgraph's operator.add will merge lists across nodes
        return {"partial_results": [(agent_key, output)]}

    return agent_node

# ===========================
# 🔹 4. Merge agent outputs (fan-in)
#    Return only the 'result' key
# ===========================
def merge_results(state: ExpertState):
    merged = []
    # partial_results is a list of (agent_key, output) tuples
    for agent_tuple in state.get("partial_results", []) or []:
        if not isinstance(agent_tuple, (list, tuple)) or len(agent_tuple) != 2:
            # skip malformed entries
            continue
        agent, result = agent_tuple
        merged.append(f"### {agent.upper()} AGENT RESULT\n{result}\n")
    joined = "\n".join(merged)
    return {"result": joined}

# ===========================
# 🔹 5. Evaluate result
#    Returns only 'verdict'
# ===========================
def evaluate_result(state: ExpertState):
    prompt = f"""
Evaluate if the merged multi-agent result solves this task.

Task: {state['task']}
Result: {state.get('result', '')}

Respond only: yes or no.
"""
    verdict = model.generate_content(prompt).text.strip().lower()
    verdict = "yes" if verdict.startswith("y") else "no"
    return {"verdict": verdict}

# ===========================
# 🔹 6. Feedback + Improvement loop
#    Returns 'feedback' and 'approved', and updates 'task' only when improvement is needed.
#    Only this node updates 'task', so no concurrent-write occurs.
# ===========================
def generate_feedback(state: ExpertState):
    prompt = f"""
Provide concise feedback on this result.

Task: {state['task']}
Result: {state.get('result', '')}
"""
    feedback = model.generate_content(prompt).text.strip()
    approved = state.get("verdict", "").startswith("y")

    if not approved:
        new_task = state["task"] + "\nFix the result based on this feedback: " + feedback
        return {"feedback": feedback, "approved": approved, "task": new_task}
    else:
        return {"feedback": feedback, "approved": approved}

# ===========================
# 🔹 Build LangGraph Pipeline
# ===========================
def build_graph():
    graph = StateGraph(ExpertState)

    graph.add_node("understand_task", understand_task)
    graph.add_node("decide_agents", decide_agents)

    # create agent nodes
    for agent_key in AGENT_MAP.keys():
        graph.add_node(f"{agent_key}_agent", make_agent_node(agent_key))

    graph.add_node("merge_results", merge_results)
    graph.add_node("evaluate_result", evaluate_result)
    graph.add_node("generate_feedback", generate_feedback)

    # flow
    graph.add_edge("understand_task", "decide_agents")

    # fan-out: decide_agents -> each agent node
    for agent_key in AGENT_MAP:
        graph.add_edge("decide_agents", f"{agent_key}_agent")

    # fan-in: each agent node -> merge_results
    for agent_key in AGENT_MAP:
        graph.add_edge(f"{agent_key}_agent", "merge_results")

    graph.add_edge("merge_results", "evaluate_result")
    graph.add_edge("evaluate_result", "generate_feedback")

    # feedback loop: if not approved -> back to decide_agents (retry)
    graph.add_conditional_edges(
        "generate_feedback",
        lambda state: "retry" if not state.get("approved") else END,
        {
            "retry": "decide_agents",
            END: END
        }
    )

    graph.set_entry_point("understand_task")
    return graph.compile()

# ===========================
# 🔹 Run
# ===========================
if __name__ == "__main__":
    #Accept JSON task via argv or stdin as before (fallback to example)
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
    
    result = task_json.get("result")
    result = None

    graph = build_graph()
    final_state = graph.invoke({"task": task})

    # final_state contains merged fields — print friendly output
    print("\n\n===== FINAL MERGED RESULT =====")
    print(final_state.get("result", "No result"))
    print("\n===== VERDICT =====")
    print(final_state.get("verdict"))
    print("\n===== FEEDBACK =====")
    print(final_state.get("feedback"))
