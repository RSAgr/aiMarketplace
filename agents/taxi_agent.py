# flight_agent.py
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDr4E-qLuYvOUemP5mjyCPmp8TCY05iguQ"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def solve_task(task):
    prompt = f"You are a demo model for my AI marketplace. Act as a Cab finding agent. If asked to book a ticket response with a fake confirmation number\nTask: {task}"
    response = model.generate_content(prompt)
    return {
        "agent": "TaxiAgent",
        "subtask": "Find taxi",
        "result": response
    }

if __name__ == "__main__":
    print(solve_task("Book a flight for the trip to Goa"))

