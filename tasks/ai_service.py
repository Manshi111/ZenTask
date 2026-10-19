import os
import json
from groq import Groq

# Groq Client ko hamari chhupi hui .env file se key mil jayegi
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def get_ai_suggestions(title, description):
    """
    Yeh function Task ka Title aur Description lega, 
    Groq AI ko bhejega, aur wahan se JSON format mein Priority aur Tags layega.
    """
    
    # PROMPT ENGINEERING: AI ko strictly batana ki humein kya chahiye
    prompt = f"""
    You are an advanced AI Task Assistant for 'ZenTask'.
    Analyze the following task and return the result STRICTLY in JSON format.
    
    Task Title: {title}
    Task Description: {description}

    Return ONLY a JSON object with exactly these 3 keys:
    1. "priority": You must choose exactly one from ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
    2. "tags": An array of 2 to 4 relevant one-word tags (e.g., ["design", "urgent"]).
    3. "next_action": A short one-line sentence advising the user on what to do first.
    """

    try:
        # Groq (Llama-3 model) ko call karna
        response = client.chat.completions.create(
             model="qwen/qwen3.8-27b",# Meta ka fast AI model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, # Logic ke liye low temperature best hai
            response_format={"type": "json_object"} # Yeh API ko sirf JSON dene pe majboor karega
        )
        
        # AI ne jo text diya, usko Python Dictionary mein convert karna
        ai_result = response.choices[0].message.content
        return json.loads(ai_result)
        
    except Exception as e:
        print(f"AI Service Error: {e}")
        return None