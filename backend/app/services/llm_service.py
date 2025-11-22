import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Optional: Allow configuration from .env
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost")
OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma:2b")

OLLAMA_URL = f"{OLLAMA_HOST}:{OLLAMA_PORT}/api/generate"

def generate_content(prompt: str, context: str = "") -> str:
    """Generate content using Ollama gemma-2b locally."""
    try:
        full_prompt = f"{context}\n\n{prompt}" if context else prompt
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": full_prompt,
            "stream": False
        }
        response = requests.post(OLLAMA_URL, json=payload)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
        else:
            return f"Error from Ollama: {response.status_code}\n{response.text}"
    except Exception as e:
        return f"Error generating content: {str(e)}"

def generate_outline(topic: str, document_type: str) -> list:
    """Generate document outline/slide titles"""
    if document_type == "docx":
        prompt = (
            f"Generate 5-7 section headings for a professional document about: {topic}. "
            f"Return only the headings, one per line."
        )
    else:  # pptx
        prompt = (
            f"Generate 8-10 slide titles for a professional presentation about: {topic}. "
            f"Return only the titles, one per line."
        )
    response = generate_content(prompt)
    headings = [line.strip() for line in response.split('\n') if line.strip()]
    return headings

def refine_section(original_content: str, refinement_prompt: str) -> str:
    """Refine existing content based on user prompt"""
    prompt = (
        f"Original content:\n{original_content}\n\nUser request: {refinement_prompt}\n\nPlease provide the refined version:"
    )
    return generate_content(prompt)
