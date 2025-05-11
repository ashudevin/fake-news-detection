import os
import uvicorn
import sys

def check_and_create_env_file():
    """Check if .env file exists and create it if it doesn't"""
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    env_example = os.path.join(os.path.dirname(__file__), ".env.example")
    
    if not os.path.exists(env_file):
        print("No .env file found. Creating from template...")
        with open(env_file, "w") as f:
            f.write("""# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# FastAPI settings
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True""")
        print(f".env file created at {env_file}")
        print("Please edit the file and add your Gemini API key before running the application.")
        sys.exit(1)

def run_app():
    """Run the FastAPI application"""
    check_and_create_env_file()
    
    # Import .env variables
    from dotenv import load_dotenv
    load_dotenv()
    
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"Starting Fake News Detection API on http://{host}:{port}")
    # Run the app using the absolute import path
    uvicorn.run("app.main:app", host=host, port=port, reload=debug)

if __name__ == "__main__":
    run_app() 