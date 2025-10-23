import os
import requests
import google.generativeai as genai
import json
import sys

def evaluate(task, result):
    """
    Simulates an expert system evaluating the task and its result.
    In a real-world scenario, this could involve complex logic or AI models.
    Here, we use a simple placeholder that approves if the result matches a predefined answer.
    Currently, we are using Google Gemini via the google.generativeai library to evaluate the result but later it would be
    replaced with a more sophisticated expert system logic with multiple checks and balances (AI voting for Truthness)
    """
    # Placeholder logic for evaluation
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = f"Evaluate the following result for the task:\nTask: {task}\nResult: {result}\nIs the result correct? Answer with 'yes' or 'no'."
    
    response = model.generate_content(prompt)
    
    verdict = response.text.strip().upper()
    if verdict == "YES":
        return True
    return False

## for testing purposes
if __name__ == "__main__":
    # Example usage
    taskJson = json.loads(sys.argv[1])  # Expecting a JSON string input
    task = taskJson['task']
    result = taskJson['result']
    is_approved = evaluate(task, result)
    print(f"Task approved: {is_approved}")