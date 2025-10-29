# VIBE CODER - CONTEXT BRAIN (v3.0)
*Last Updated: 2025-10-28T02:05:00Z*

---
## THE BRIDGE (SUMMARY)

**PREVIOUS MISSION:** "Establish ADK Bedrock"
**STATUS:** COMPLETE. The AI Services Engine is live and the primary `/run` endpoint is healthy.
**NEXT MISSION:** "Connect the Frontend"
**OBJECTIVE:** Update the frontend application to communicate with the new, live `/run` endpoint.

---
## 1. CURRENT GROUND TRUTH (THE NOW)

This section contains only the active, non-negotiable truths required for immediate action.

### Mission Status
- **Current Mission:** "Connect the Frontend"
- **Objective:** Modify `frontend/src/App.tsx` to make `POST` requests to the live AI service endpoint.
- **Status:** **PENDING**
- **Next Action:**
    1. Replace the contents of `frontend/src/App.tsx`.
    2. Deploy the updated frontend to Firebase Hosting.

### Live Infrastructure
| Service | URL / Endpoint | Status |
|---|---|---|
| **AI Services Engine** | `https://vibe-agent-adk-engine-534939227554.australia-southeast1.run.app` | **LIVE** |
| **Primary API Endpoint** | `.../run` | **HEALTHY (Responds 405 to GET)** |
| **API Docs Endpoint** | `.../docs` | **DEGRADED (Responds 500)** |

### Authoritative Sources of Truth (Validated)
This ledger contains the definitive, validated sources for our entire technical stack.

| Layer | Source of Truth | URL / File / Command |
|-------|------------------|-----------|
| **Python Version** | `.python-version` File | `cat .python-version` |
| **Python Docs** | Official Python 3.12 Docs | https://docs.python.org/3.12/ |
| **Python Env Manager** | pyenv GitHub Repository | https://github.com/pyenv/pyenv |
| **ADK Package Name** | PyPI (Python Package Index) | https://pypi.org/project/google-adk/ |
| **ADK Version in Project**| `requirements.txt` File | `grep google-adk requirements.txt` |
| **ADK Concepts** | Official GCP ADK Docs | https://cloud.google.com/agent-development-kit/docs |
| **ADK REST API** | Official ADK REST Docs | https://cloud.google.com/agent-development-kit/docs/reference/rest |
| **ADK Implementation** | `adk-samples` GitHub Repo | https://github.com/google/adk-samples |
| **Project Cloud Env** | Google Cloud Project ID | `vibe-agent-final` |
| **Build Definition** | `Dockerfile` | `cat Dockerfile` |


### Technical Debt Ledger
- **Entry 001: ADK Docs Endpoint Failure**
    - **Symptom:** The auto-generated API documentation at the `/docs` endpoint returns a `500 Internal Server Error`.
    - **Diagnosis:** This is a known, non-critical bug in the ADK's OpenAPI generator, likely caused by complex Pydantic models in our `agent.py`.
    - **Impact:** Low. It violates "The Law of the Living Ledger" but does not block core application functionality.
    - **Action:** Acknowledge and defer. To be fixed in a future "code quality" mission.

---
## 2. HISTORICAL LEDGER (THE PAST)

This is a log of significant events, decisions, and "scar tissue."

- **Entry 006: "Deployment Hell Loop"**
    - **Event:** A multi-day effort to deploy the initial ADK bedrock was blocked by a cascading series of failures.
    - **Root Causes:** 1) Incorrect `gcloud` command usage, 2) Syntactical errors in flags, 3) Missing `Dockerfile`, 4) Critical dependency conflicts.
    - **Outcome:** The loop was broken by creating a `Dockerfile`, simplifying `requirements.txt`, and using the `gcloud builds submit` + `gcloud run services replace` workflow. This is now our battle-tested deployment standard.

- **Entry 007: Endpoint Discovery Failure**
    - **Event:** Initial tests of the deployed service failed with `404 Not Found`.
    - **Finding:** Deep research into the ADK's official REST API documentation confirmed the correct default endpoint for the `adk api_server` is `/run`.
    - **Outcome:** The live API endpoint was correctly identified and validated.