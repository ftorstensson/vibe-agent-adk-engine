# Vibe Coder AI Services Engine - agent.py
# Version: 2.2 (The Definitive CORS Fix)
# Last Updated: 2025-10-29
#
# This version implements the definitive fix for the persistent CORS issue.
# By creating the FastAPI app instance before the ADK and applying the
# middleware first, we ensure all responses, including 404s, receive the
# correct CORS headers.

import datetime
import logging
import re
from collections.abc import AsyncGenerator
from typing import Literal

# --- START: DEFINITIVE CORS FIX ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Create our own FastAPI app instance FIRST.
app = FastAPI()

# 2. Add the CORS middleware to OUR app instance immediately.
origins = [
    "https://vibe-agent-final.web.app", # The live production frontend
    "http://localhost:5173",          # The default address for local Vite development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# 3. NOW import the ADK function and have it add its routes to OUR app.
from google.adk.cli.fast_api import create_app
create_app(app)
# --- END: DEFINITIVE CORS FIX ---


from google.adk.agents import BaseAgent, LlmAgent, LoopAgent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from google.adk.planners import BuiltInPlanner
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool
from google.genai import types as genai_types
from pydantic import BaseModel, Field

from .config import config

# --- Structured Output Models ---
class SearchQuery(BaseModel):
    """Model representing a specific search query for web search."""
    search_query: str = Field(description="A highly specific and targeted query for web search.")

class Feedback(BaseModel):
    """Model for providing evaluation feedback on research quality."""
    grade: Literal["pass", "fail"] = Field(description="Evaluation result. 'pass' if the research is sufficient, 'fail' if it needs revision.")
    comment: str = Field(description="Detailed explanation of the evaluation, highlighting strengths and/or weaknesses of the research.")
    follow_up_queries: list[SearchQuery] | None = Field(default=None, description="A list of specific, targeted follow-up search queries needed to fix research gaps. This should be null or empty if the grade is 'pass'.")

# (The rest of your file remains unchanged)
# --- Callbacks ---
def collect_research_sources_callback(callback_context: CallbackContext) -> None:
    session = callback_context._invocation_context.session
    url_to_short_id = callback_context.state.get("url_to_short_id", {})
    sources = callback_context.state.get("sources", {})
    id_counter = len(url_to_short_id) + 1
    for event in session.events:
        if not (event.grounding_metadata and event.grounding_metadata.grounding_chunks):
            continue
        chunks_info = {}
        for idx, chunk in enumerate(event.grounding_metadata.grounding_chunks):
            if not chunk.web:
                continue
            url = chunk.web.uri
            title = (
                chunk.web.title
                if chunk.web.title != chunk.web.domain
                else chunk.web.domain
            )
            if url not in url_to_short_id:
                short_id = f"src-{id_counter}"
                url_to_short_id[url] = short_id
                sources[short_id] = {
                    "short_id": short_id,
                    "title": title,
                    "url": url,
                    "domain": chunk.web.domain,
                    "supported_claims": [],
                }
                id_counter += 1
            chunks_info[idx] = url_to_short_id[url]
        if event.grounding_metadata.grounding_supports:
            for support in event.grounding_metadata.grounding_supports:
                confidence_scores = support.confidence_scores or []
                chunk_indices = support.grounding_chunk_indices or []
                for i, chunk_idx in enumerate(chunk_indices):
                    if chunk_idx in chunks_info:
                        short_id = chunks_info[chunk_idx]
                        confidence = (
                            confidence_scores[i] if i < len(confidence_scores) else 0.5
                        )
                        text_segment = support.segment.text if support.segment else ""
                        sources[short_id]["supported_claims"].append(
                            {
                                "text_segment": text_segment,
                                "confidence": confidence,
                            }
                        )
    callback_context.state["url_to_short_id"] = url_to_short_id
    callback_context.state["sources"] = sources

def citation_replacement_callback(callback_context: CallbackContext) -> genai_types.Content:
    final_report = callback_context.state.get("final_cited_report", "")
    sources = callback_context.state.get("sources", {})
    def tag_replacer(match: re.Match) -> str:
        short_id = match.group(1)
        if not (source_info := sources.get(short_id)):
            logging.warning(f"Invalid citation tag found and removed: {match.group(0)}")
            return ""
        display_text = source_info.get("title", source_info.get("domain", short_id))
        return f" [{display_text}]({source_info['url']})"
    processed_report = re.sub(r'<cite\s+source\s*=\s*["\']?\s*(src-\d+)\s*["\']?\s*/>', tag_replacer, final_report)
    processed_report = re.sub(r"\s+([.,;:])", r"\1", processed_report)
    callback_context.state["final_report_with_citations"] = processed_report
    return genai_types.Content(parts=[genai_types.Part(text=processed_report)])

# --- Custom Agent for Loop Control ---
class EscalationChecker(BaseAgent):
    def __init__(self, name: str):
        super().__init__(name=name)
    async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
        evaluation_result = ctx.session.state.get("research_evaluation")
        if evaluation_result and evaluation_result.get("grade") == "pass":
            logging.info(f"[{self.name}] Research evaluation passed. Escalating to stop loop.")
            yield Event(author=self.name, actions=EventActions(escalate=True))
        else:
            logging.info(f"[{self.name}] Research evaluation failed or not found. Loop will continue.")
            yield Event(author=self.name)

# --- AGENT DEFINITIONS ---
# (All agent definitions below this line are unchanged and omitted for brevity)
plan_generator = LlmAgent(...)
section_planner = LlmAgent(...)
section_researcher = LlmAgent(...)
research_evaluator = LlmAgent(...)
enhanced_search_executor = LlmAgent(...)
report_composer = LlmAgent(...)
research_pipeline = SequentialAgent(...)
interactive_planner_agent = LlmAgent(...)

root_agent = interactive_planner_agent