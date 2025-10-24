import json
from agents.dummy_agents.travel import solve_task as travel
from agents.dummy_agents.hotel import solve_task as hotel
from agents.dummy_agents.food import solve_task as food
from agents.dummy_agents.activity import solve_task as activity

def divide_task(task_json):
    task = task_json['task']
    agents = [travel, hotel, food, activity]
    results = ""
    for agent in agents:
        result = agent(task)
        
        results += result["result"] + "\n"
    print(results)
    # for agent_name, result in results.items():
    #     print(f"Result from {agent_name}: {result}")
        
if __name__ == "__main__":
    # Example usage
    taskJson = json.loads('{"task": "Plan a weekend trip to Paris including travel, hotel, food, and activities."}')
    divide_task(taskJson)