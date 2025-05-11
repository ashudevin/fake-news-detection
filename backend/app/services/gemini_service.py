import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import asyncio
import time
import random

# Load environment variables
load_dotenv()

# Configure Gemini API with multiple keys if available
def get_api_keys():
    """Get all available API keys from environment variables"""
    primary_key = os.getenv("GEMINI_API_KEY")
    if not primary_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    # Check for additional keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
    additional_keys = []
    for i in range(1, 10):  # Check for up to 9 additional keys
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            additional_keys.append(key)
    
    all_keys = [primary_key] + additional_keys
    print(f"Found {len(all_keys)} Gemini API key(s)")
    return all_keys

API_KEYS = get_api_keys()
CURRENT_KEY_INDEX = 0

def get_next_api_key():
    """Rotate to the next available API key"""
    global CURRENT_KEY_INDEX
    CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(API_KEYS)
    return API_KEYS[CURRENT_KEY_INDEX]

# Set initial API key
genai.configure(api_key=API_KEYS[CURRENT_KEY_INDEX])

# Initialize Gemini model
generation_config = {
    "temperature": 0.2,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2048,
    "candidate_count": 1
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

def get_model():
    """Get a model instance with the current API key"""
    return genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=generation_config,
        safety_settings=safety_settings
    )

# Fallback mechanism when rate limit is exceeded
def get_fallback_classification(title, content):
    """
    Provide a simple rule-based classification when AI is unavailable
    """
    # List of suspicious words that might indicate fake news
    suspicious_words = [
        "shocking", "conspiracy", "secret", "they don't want you to know",
        "mainstream media won't tell you", "miracle", "shocking truth",
        "government cover-up", "what they're hiding", "doctors hate this",
        "one weird trick", "you won't believe", "unbelievable", "sensational"
    ]
    
    # Convert to lowercase for case-insensitive matching
    combined_text = (title + " " + content).lower()
    
    # Count suspicious words
    count = sum(1 for word in suspicious_words if word.lower() in combined_text)
    
    # Base confidence on count of suspicious phrases
    # More sophisticated logic could be implemented here
    if count >= 3:
        is_fake = True
        confidence = min(0.5 + (count * 0.05), 0.95)  # Cap at 0.95
        explanation = (
            "Due to API rate limits, we're using a simplified analysis method. "
            f"This content contains {count} phrases often associated with misleading content. "
            "This is not a definitive classification and you should verify with other sources."
        )
    else:
        is_fake = False
        confidence = max(0.5 - (count * 0.05), 0.05)  # Floor at 0.05
        explanation = (
            "Due to API rate limits, we're using a simplified analysis method. "
            f"This content contains {count} phrases that might indicate misleading content. "
            "The content appears relatively neutral, but this is not a definitive classification "
            "and you should verify with other sources."
        )
    
    return is_fake, confidence, explanation

async def classify_news(title, content):
    """
    Classify news as fake or real using Gemini AI
    
    Returns:
    - is_fake: boolean
    - confidence: float (0.0 to 1.0)
    - explanation: string
    """
    # If we have more than one API key, try each key before falling back
    original_key_index = CURRENT_KEY_INDEX
    retry_attempts = min(len(API_KEYS), 3)  # Try up to 3 keys
    
    for attempt in range(retry_attempts):
        # Run this in a separate thread to not block asyncio
        loop = asyncio.get_event_loop()
        try:
            if attempt > 0:
                next_key = get_next_api_key()
                genai.configure(api_key=next_key)
                print(f"Trying with alternate API key {CURRENT_KEY_INDEX + 1}/{len(API_KEYS)}")
                
            result = await loop.run_in_executor(None, _classify_news_sync, title, content)
            return result
        except Exception as e:
            # Check if it's a rate limit error
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                print(f"Rate limit exceeded on key {CURRENT_KEY_INDEX + 1}/{len(API_KEYS)}. Error: {e}")
                
                # If we've tried all keys, use fallback
                if attempt == retry_attempts - 1:
                    print("All API keys reached rate limits. Using fallback classification.")
                    # Add random delay before returning to reduce concurrent requests
                    await asyncio.sleep(random.uniform(1, 3))
                    return get_fallback_classification(title, content)
                
                # Otherwise try next key, with slight delay
                await asyncio.sleep(1)
            else:
                # Re-raise other errors
                raise
    
    # This should not be reached, but just in case
    return get_fallback_classification(title, content)

def _classify_news_sync(title, content):
    # Construct prompt for Gemini
    prompt = f"""Analyze the following news article for factual accuracy and determine if it's fake news.
    
Title: {title}

Content: {content}

Please provide a JSON response with the following structure:
{{
    "is_fake": true/false,
    "confidence": float (0.0 to 1.0),
    "explanation": "detailed explanation of why this is considered fake or real news"
}}

For the confidence score:
- 0.0-0.2: Highly confident it's real news
- 0.2-0.4: Somewhat confident it's real news
- 0.4-0.6: Uncertain
- 0.6-0.8: Somewhat confident it's fake news
- 0.8-1.0: Highly confident it's fake news

Focus on analyzing language patterns, source credibility, consistency with known facts, logical coherence, and emotional manipulation tactics.
"""
    
    try:
        # Get response from Gemini
        model = get_model()
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Extract JSON from response
        try:
            # Check if response is wrapped in code blocks
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].strip()
            else:
                json_str = response_text.strip()
                
            result = json.loads(json_str)
            return result["is_fake"], result["confidence"], result["explanation"]
        except (KeyError, json.JSONDecodeError) as e:
            # Fallback to manual parsing if JSON parsing fails
            is_fake = "true" in response_text.lower() and "is_fake" in response_text.lower()
            confidence = 0.7 if is_fake else 0.3  # Default confidence
            explanation = response_text
            return is_fake, confidence, explanation
    except Exception as e:
        # Let the calling function handle this
        raise

async def analyze_news_content(text):
    """
    Perform detailed analysis of news content
    
    Returns:
    - analysis: string with detailed analysis
    """
    # If we have more than one API key, try each key before falling back
    original_key_index = CURRENT_KEY_INDEX
    retry_attempts = min(len(API_KEYS), 3)  # Try up to 3 keys
    
    for attempt in range(retry_attempts):
        loop = asyncio.get_event_loop()
        try:
            if attempt > 0:
                next_key = get_next_api_key()
                genai.configure(api_key=next_key)
                print(f"Trying with alternate API key {CURRENT_KEY_INDEX + 1}/{len(API_KEYS)}")
                
            result = await loop.run_in_executor(None, _analyze_news_content_sync, text)
            return result
        except Exception as e:
            # Check if it's a rate limit error
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                print(f"Rate limit exceeded on key {CURRENT_KEY_INDEX + 1}/{len(API_KEYS)}. Error: {e}")
                
                # If we've tried all keys, use fallback
                if attempt == retry_attempts - 1:
                    print("All API keys reached rate limits. Using fallback analysis.")
                    # Add random delay before returning to reduce concurrent requests
                    await asyncio.sleep(random.uniform(1, 3))
                    return (
                        "Unable to perform detailed analysis due to API rate limits. "
                        "Please try again later or verify this content with other fact-checking sources. "
                        "When analyzing news, look for these indicators of potential fake news:\n\n"
                        "1. Sensationalist language and clickbait headlines\n"
                        "2. Lack of cited sources or references to anonymous sources\n"
                        "3. Emotional manipulation and fear-mongering\n"
                        "4. Missing context or incomplete information\n"
                        "5. Non-reputable or unfamiliar publication source\n"
                        "6. Poor grammar, spelling errors, or excessive use of ALL CAPS\n"
                        "7. Claims that seem too shocking or unlikely to be true\n"
                        "8. Recently created website with no history\n\n"
                        "Always cross-check information across multiple reliable sources."
                    )
                
                # Otherwise try next key, with slight delay
                await asyncio.sleep(1)
            else:
                # Re-raise other errors
                raise
    
    # This should not be reached, but just in case
    return (
        "Unable to perform detailed analysis due to API rate limits. "
        "Please try again later or verify this content with other fact-checking sources."
    )

def _analyze_news_content_sync(text):
    # Construct prompt for Gemini
    prompt = f"""Analyze the following news content in detail:

{text}

Provide a comprehensive analysis covering:
1. Factual accuracy - identify any false or misleading claims
2. Source credibility assessment
3. Language analysis - identify emotional manipulation, propaganda techniques
4. Context analysis - is important context missing?
5. Overall assessment of reliability

Please be specific and cite examples from the text.
"""
    
    # Get response from Gemini
    model = get_model()
    response = model.generate_content(prompt)
    return response.text