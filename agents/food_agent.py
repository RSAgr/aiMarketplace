# flight_agent.py
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDr4E-qLuYvOUemP5mjyCPmp8TCY05iguQ"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def solve_task(task):
    prompt = f"You are a demo model for my AI marketplace. Act as a food spots finding and book if asked for.\nTask: {task}"
    response = model.generate_content(prompt)
    return {
        "agent": "FoodAgent",
        "subtask": "Find food spots",
        "result": response
    }

if __name__ == "__main__":
    print(solve_task("Book eating spots for the trip to Goa"))

