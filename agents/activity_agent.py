# flight_agent.py
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDr4E-qLuYvOUemP5mjyCPmp8TCY05iguQ"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def solve_task(task):
    prompt = f"You are a demo model for my AI marketplace. Act as an activity finding and act like you booked if booking was also asked for.\nTask: {task}"
    response = model.generate_content(prompt)
    return {
        "agent": "Activity_Agent",
        "subtask": "Find and Book Activities",
        "result": response
    }

if __name__ == "__main__":
    print(solve_task("Book eating spots for the trip to Goa"))

