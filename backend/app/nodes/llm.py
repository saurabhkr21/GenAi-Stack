import os
import openai
import google.generativeai as genai
import requests
from typing import Dict, Any

async def perform_web_search(query: str, api_key: str) -> str:
    """
    Performs a web search using SerpAPI.
    """
    if not api_key:
        return "Error: No SerpAPI Key provided for Web Search."
    
    print(f"[DEBUG] Performing Web Search for: {query}")
    try:
        url = "https://serpapi.com/search"
        params = {
            "q": query,
            "api_key": api_key,
            "engine": "google"
        }
        response = requests.get(url, params=params)
        results = response.json()
        
        if "error" in results:
            return f"SerpAPI Error: {results['error']}"

        # Extract organic results
        organic_results = results.get("organic_results", [])
        if not organic_results:
            return "No web search results found."

        # Format snippet
        formatted_results = "Web Search Results:\n"
        for res in organic_results[:3]: # Top 3 results
            formatted_results += f"- {res.get('title')}: {res.get('snippet')}\n"
        
        return formatted_results.strip()

    except Exception as e:
        return f"Web Search connection error: {str(e)}"

async def execute_llm_node(prompt: str, model_name: str, web_search: bool = False, serp_key: str = None) -> Dict[str, Any]:
    
    # Inject Web Search context if enabled
    if web_search:
        search_context = await perform_web_search(prompt, serp_key)
        prompt = f"{search_context}\n\nUser Prompt: {prompt}"

    try:
        if "gpt" in model_name.lower():
            return await run_openai(prompt, model_name)
        elif "gemini" in model_name.lower():
            return await run_gemini(prompt, model_name)
        else:
            return {"output": "Error: Unsupported model"}
    except Exception as e:
        return {"output": f"Error generating response: {str(e)}"}

async def run_openai(prompt: str, model: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"output": "Error: OPENAI_API_KEY not found"}
    
    client = openai.AsyncOpenAI(api_key=api_key)
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )
        return {"output": response.choices[0].message.content}
    except Exception as e:
        return {"output": f"OpenAI Error: {str(e)}"}

async def run_gemini(prompt: str, model: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"output": "Error: GOOGLE_API_KEY not found"}
    
    genai.configure(api_key=api_key)
    try:
        # Gemini model names are usually 'gemini-pro' or 'gemini-1.5-flash'
        # Ensure the model name is correct for the API
        gemini_model = genai.GenerativeModel(model) 
        response = await gemini_model.generate_content_async(prompt)
        return {"output": response.text}
    except Exception as e:
        return {"output": f"Gemini Error: {str(e)}"}
