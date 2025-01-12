import sys
import json
import asyncio
from langchain_google_vertexai import ChatVertexAI
from browser_use import Agent
from dotenv import load_dotenv
import os

load_dotenv()

async def main(platform_name, platform_link):

    print("Control comes to 1")
    llm = ChatVertexAI(model="gemini-1.5-flash")
    
    task = """
    Visit the page 'https://www.timeanddate.com/date/duration.html' and return the page title as text.
    """
    
    agent = Agent(task=task, llm=llm)
    result = await agent.run()

    if isinstance(result, dict):
        serialized_result = result
    else:
        serialized_result = {
            "history": [str(item) for item in result.history],
            "output": str(result.output) if hasattr(result, "output") else None
        }

    print(json.dumps(serialized_result))

if __name__ == "__main__":
    platform_name = sys.argv[1]
    platform_link = sys.argv[2]
    asyncio.run(main(platform_name, platform_link))
