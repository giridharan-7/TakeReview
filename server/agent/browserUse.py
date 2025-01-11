import sys
import json
from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio

async def main(platform_name, platform_link):
    # Initialize the LLM
    llm = ChatOpenAI(model="gpt-4o")

    print(platform_name, platform_link)
    
    # Define the task dynamically
    task = f"""
    Visit the platform named '{platform_name}' at the link '{platform_link}'.
    Extract all reviews from the page. Each review should include:
    - The title of the review
    - The body content
    - The star rating (if available)
    Return the data as a JSON array.
    """
    
    # Create and run the Agent
    agent = Agent(task=task, llm=llm)
    result = await agent.run()

    # Ensure the result is JSON-serializable
    if isinstance(result, dict):
        # If it's already a dictionary, pass it directly
        serialized_result = result
    else:
        # Otherwise, extract JSON-serializable content
        serialized_result = {
            "history": [str(item) for item in result.history],  # Example of serializing custom objects
            "output": str(result.output) if hasattr(result, "output") else None
        }

    print(json.dumps(serialized_result))  # Print the result as JSON for Node.js

if __name__ == "__main__":
    # Read input from Node.js (platform_name, platform_link)
    platform_name = sys.argv[1]
    platform_link = sys.argv[2]
    asyncio.run(main(platform_name, platform_link))