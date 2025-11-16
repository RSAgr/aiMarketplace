import json
import sys
import importlib
import time
import hashlib
from typing import TypedDict, Dict, Annotated

import google.generativeai as genai
from algosdk import mnemonic, account
from algosdk.transaction import ApplicationNoOpTxn, wait_for_confirmation
from algosdk.v2client import algod
from langgraph.graph import StateGraph, END

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
APP_ID = 749534825 

EXPERT_MN = "father eye direct lava stay process tuna anger picture ahead differ hand habit hobby curious local book history trust arrow hidden broken bench abstract forward"
expert_pk = mnemonic.to_private_key(EXPERT_MN)
expert_addr = account.address_from_private_key(expert_pk)

AGENT_MN = "fluid vintage inspire matrix quarter paddle crater matrix wreck cube buddy opinion guess split erode teach base horse oxygen mouse decrease session icon absent memory"
agent_pk = mnemonic.to_private_key(AGENT_MN)
agent_addr = account.address_from_private_key(agent_pk)

client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

GEMINI_API_KEY = "AIzaSyCy7O1GLQ5pfV-A0S4uNbl_Z9kHJBmHCRA"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash-latest")

def merge_dicts(left: Dict[str, str], right: Dict[str, str]) -> Dict[str, str]:
    return {**(left or {}), **(right or {})}

class ExpertState(TypedDict, total=False):
    task: str
    understanding: str
    chosen_agents: list[str]
    agent_results: Annotated[Dict[str, str], merge_dicts]
    result: str
    verdict: str
    feedback: str
    approved: bool
    result_hash: str
    blockchain_registered: bool
    payment_released: bool

AGENT_MAP: Dict[str, str] = {
    "hotel": "hotel_agent",
    "flight": "flight_agent",
    "taxi": "taxi_agent",
    "food": "food_agent"
}

def register_task_on_chain(hash_value: str) -> dict:
    print(f"\nRegistering on blockchain...")
    print(f"   Hash: {hash_value}")
    
    txn = ApplicationNoOpTxn(
        sender=agent_addr,
        sp=client.suggested_params(),
        index=APP_ID,
        app_args=[b"register_task", hash_value.encode()],
    )
    
    signed = txn.sign(agent_pk)
    txid = client.send_transaction(signed)
    result = wait_for_confirmation(client, txid, 4)
    
    print(f"Registered in round {result['confirmed-round']}")
    print(f"https://lora.algokit.io/testnet/transaction/{txid}")
    return result

def approve_and_release_payment() -> dict:
    print("\nReleasing payment...")
    
    initial_balance = client.account_info(agent_addr)['amount'] / 1_000_000
    
    txn = ApplicationNoOpTxn(
        sender=expert_addr,
        sp=client.suggested_params(),
        index=APP_ID,
        app_args=[b"approve_and_release"],
        accounts=[agent_addr]
    )
    
    signed = txn.sign(expert_pk)
    txid = client.send_transaction(signed)
    result = wait_for_confirmation(client, txid, 4)
    
    final_balance = client.account_info(agent_addr)['amount'] / 1_000_000
    payment = final_balance - initial_balance
    
    print(f"Payment: {payment:.4f} ALGO")
    print(f"New balance: {final_balance} ALGO")
    print(f"https://lora.algokit.io/testnet/transaction/{txid}")
    return result

def understand_task(state: ExpertState):
    print(f"\nUnderstanding task...")
    try:
        prompt = f"Briefly summarize this task: {state['task']}"
        understanding = model.generate_content(prompt).text.strip()
        print(f"   {understanding[:80]}...")
        return {"understanding": understanding}
    except:
        print(f"   Using fallback")
        return {"understanding": f"Task: {state['task']}"}

def decide_agents(state: ExpertState):
    print(f"\nSelecting agents...")
    try:
        prompt = f"""Task: {state['task']}
Available agents: {', '.join(AGENT_MAP.keys())}
Which agents are needed? Respond with comma-separated list."""
        
        response = model.generate_content(prompt).text.lower()
        chosen = [x.strip() for x in response.split(",") if x.strip()]
        chosen = [c for c in chosen if c in AGENT_MAP]
        
        if not chosen:
            chosen = list(AGENT_MAP.keys())
        
        print(f"   {', '.join(chosen)}")
        return {"chosen_agents": chosen, "agent_results": {}}
    except:
        print(f"   Using all agents")
        return {"chosen_agents": list(AGENT_MAP.keys()), "agent_results": {}}

def make_agent_node(agent_key: str):
    def agent_node(state: ExpertState):
        if agent_key not in state.get("chosen_agents", []):
            return {}
        
        print(f"\nRunning {agent_key}_agent...")
        
        try:
            mod = importlib.import_module(AGENT_MAP[agent_key])
            agent_out = mod.solve_task(state["task"])
            output = agent_out.get("result", "") if isinstance(agent_out, dict) else str(agent_out)
            print(f"   {agent_key} done")
            return {"agent_results": {agent_key: output}}
            
        except Exception as e:
            error_msg = str(e)[:50]
            print(f"   {agent_key} error: {error_msg}")
            return {"agent_results": {agent_key: f"Error: {error_msg}"}}
    
    return agent_node

def merge_results(state: ExpertState):
    print("\nMerging results...")
    
    agent_results = state.get("agent_results", {})
    if not agent_results:
        print("   No results to merge!")
        return {"result": "No agent results available"}
    
    result = "\n".join(
        f"### {key.upper()} AGENT\n{val}\n"
        for key, val in agent_results.items()
    )
    
    print(f"   Merged {len(agent_results)} results")
    return {"result": result}

def evaluate_result(state: ExpertState):
    print("\nEvaluating...")
    try:
        prompt = (
            f"Does this solve the task? Answer yes or no.\n"
            f"Task: {state['task']}\n"
            f"Result: {state.get('result', '')}"
        )
        response = model.generate_content(prompt).text.strip().lower()
        verdict = "yes" if "yes" in response else "no"
        print(f"   {verdict}")
        return {"verdict": verdict}
    except Exception:
        print("   Defaulting to yes")
        return {"verdict": "yes"}

def generate_feedback(state: ExpertState):
    print("\nGenerating feedback...")
    
    try:
        prompt = (
            "Short feedback (20 words max):\n"
            f"Task: {state['task']}\n"
            f"Result: {state.get('result', '')}"
        )
        feedback = model.generate_content(prompt).text.strip()
    except Exception:
        feedback = "Result appears satisfactory."
    
    approved = state.get("verdict", "").startswith("y")
    print(f"   Approved: {approved}")
    print(f"   {feedback[:60]}...")
    
    if not approved:
        return {
            "feedback": feedback,
            "approved": approved,
            "task": f"{state['task']}\n[Improve based on: {feedback}]"
        }
    
    return {"feedback": feedback, "approved": approved}

def blockchain_integration(state: ExpertState):
    if not state.get("approved"):
        return {}
    
    print("\n" + "="*60)
    print("TASK APPROVED - BLOCKCHAIN INTEGRATION")
    print("="*60)
    
    result_hash = hashlib.sha256(
        str(state.get("result", "")).encode()
    ).hexdigest()[:32]
    
    print(f"Result hash: {result_hash}")
    
    try:
        register_task_on_chain(result_hash)
        approve_and_release_payment()
        
        print("\n" + "="*60)
        print("COMPLETE!")
        print("="*60)
        print("Task registered on-chain")
        print("Payment released to agent")
        print("\nView contract:")
        print(f"   https://lora.algokit.io/testnet/application/{APP_ID}")
        
        return {
            "result_hash": result_hash,
            "blockchain_registered": True,
            "payment_released": True
        }
        
    except Exception as e:
        error_msg = str(e)[:100]
        print(f"\nBlockchain error: {error_msg}")
        
        if "overspend" in error_msg:
            print("Contract needs funding")
        
        return {
            "result_hash": result_hash,
            "blockchain_registered": False,
            "payment_released": False
        }

def build_graph():
    graph = StateGraph(ExpertState)
    
    graph.add_node("understand", understand_task)
    graph.add_node("decide", decide_agents)
    
    for agent_key in AGENT_MAP:
        graph.add_node(f"{agent_key}_agent", make_agent_node(agent_key))
    
    graph.add_node("merge", merge_results)
    graph.add_node("evaluate", evaluate_result)
    graph.add_node("feedback", generate_feedback)
    graph.add_node("blockchain", blockchain_integration)
    
    graph.add_edge("understand", "decide")
    
    for agent_key in AGENT_MAP:
        graph.add_edge("decide", f"{agent_key}_agent")
        graph.add_edge(f"{agent_key}_agent", "merge")
    
    graph.add_edge("merge", "evaluate")
    graph.add_edge("evaluate", "feedback")
    
    graph.add_conditional_edges(
        "feedback",
        lambda s: "blockchain" if s.get("approved") else "retry",
        {"retry": "decide", "blockchain": "blockchain"}
    )
    
    graph.add_edge("blockchain", END)
    graph.set_entry_point("understand")
    
    return graph.compile()

def make_serializable(obj):
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [make_serializable(item) for item in obj]
    return str(obj)

def main():
    print("\n" + "="*60)
    print("MULTI-AGENT SYSTEM + BLOCKCHAIN")
    print("="*60)
    print(f"Expert: {expert_addr[:10]}...")
    print(f"Agent: {agent_addr[:10]}...")
    print(f"Contract: {APP_ID}")
    print("="*60 + "\n")
    
    task = (
        json.loads(sys.argv[1]).get("task")
        if len(sys.argv) > 1
        else input("Task: ") or "Book flight Delhi to Mumbai and taxi from airport"
    )
    
    print(f"Task: {task}\n")
    
    try:
        graph = build_graph()
        final_state = graph.invoke({"task": task})
        
        print("\n" + "="*60)
        print("FINAL RESULTS")
        print("="*60)
        print("\n===== COMBINED RESULT =====")
        print(final_state.get('result', 'No result'))
        
        print("\n===== STATUS =====")
        print(f"Verdict: {final_state.get('verdict')}")
        print(f"Feedback: {final_state.get('feedback')}")
        print(f"Approved: {final_state.get('approved')}")
        print(f"Blockchain registered: {final_state.get('blockchain_registered', False)}")
        print(f"Payment released: {final_state.get('payment_released', False)}")
        
        if final_state.get('result_hash'):
            print(f"Result hash: {final_state.get('result_hash')}")
        
        with open("multi_agent_result.json", "w", encoding='utf-8') as f:
            json.dump(
                make_serializable(final_state),
                f,
                indent=2,
                ensure_ascii=False
            )
        
        print("\nSaved to: multi_agent_result.json")
        
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
