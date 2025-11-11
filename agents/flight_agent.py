# flight_agent.py
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyCy7O1GLQ5pfV-A0S4uNbl_Z9kHJBmHCRA"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")
# for m in genai.list_models():
#     if "generateContent" in m.supported_generation_methods:
#         print(m.name)
def solve_task(task):
    prompt = f"You are a demo model for my AI marketplace. Act as a flight booking agent. If asked to book a ticket response with a fake confirmation number\nTask: {task}"
    response = model.generate_content(prompt)
    return {
        "agent": "FlightAgent",
        "subtask": "Find flights",
        "result": response
    }

if __name__ == "__main__": # for trial
    print(solve_task("Book a flight for the trip to Goa"))

