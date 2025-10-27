# VIBE CODER - CONTEXT BRAIN (v2.0)
*Last Updated: 2025-10-27T23:43:00Z*

---
## THE BRIDGE (SUMMARY)

**CURRENT MISSION:** "Establish ADK Bedrock"
**STATUS:** BLOCKED. We are in a "deployment hell loop" where the backend service fails to start.
**ROOT CAUSE:** A definitive diagnosis from the `Handover Document` confirms the blocker is a logical contradiction in the `cloud-run.yaml` deployment file.
**NEXT ACTION:** Apply the surgically precise fix to `cloud-run.yaml` and execute the final deployment commands.

---
## 1. CURRENT GROUND TRUTH (THE NOW)

This section contains only the active, non-negotiable truths required for immediate action.

### Mission Status
- **Objective:** Deploy the unmodified `vibe-agent-adk-engine` sample to the `vibe-agent-final` GCP project.
- **Status:** **BLOCKED**
- **Blocker:** The Cloud Run `startupProbe` is misconfigured. `timeoutSeconds` (10) is greater than `periodSeconds` (5), causing the Cloud Run control plane to reject the deployment.
- **Next Action:**
    1. Replace the contents of `cloud-run.yaml` with the corrected configuration.
    2. Run `gcloud run services replace cloud-run.yaml ...` to apply the fix.

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
| **ADK Implementation** | `adk-samples` GitHub Repo | https://github.com/google/adk-samples |
| **Project Cloud Env** | Google Cloud Project ID | `vibe-agent-final` |

---
## 2. HISTORICAL LEDGER (THE PAST)

This is a log of significant events, decisions, and "scar tissue."

- **Entry 001: Strategic Pivot to ADK**
    - **Event:** A multi-week implementation failure on `genkit@1.20.0` led to a strategic pivot.
    - **Finding:** Genkit was identified as unstable for multi-agent use cases. The Google Agent Development Kit (ADK) `v1.2.0+` was mandated as the new bedrock.
    - **Outcome:** The `hello-genkit-functions` repo was archived. The `vibe-agent-adk-engine` repo was created.

- **Entry 002: Bedrock Source Code**
    - **Event:** The new ADK repository was initialized.
    - **Source:** The code was cloned from the official `gemini-fullstack` sample within the `google/adk-samples` repository.

- **Entry 003: Codification of Scar Tissue**
    - **Event:** Following the Genkit failure, the core Vibe Coder Foundation documents were updated.
    - **Outcome:** New unbreakable laws were added: "Principle of API Ground Truth" (The Way), an edict deprecating Genkit (Architecture), and "Law of Environmental Pinning" (Environment Bible).

- **Entry 004: Environmental Credential Refresh**
    - **Event:** A GitHub Personal Access Token was preemptively regenerated to avoid expiration.
    - **Outcome:** Averted a future `git` authentication failure.

- **Entry 005: Stale State Identification**
    - **Event:** A stale `CONTEXT_BRAIN.md` was presented, which incorrectly reported the deployment loop as resolved.
    - **Finding:** The `Handover Document` was confirmed as the most current source of truth.
    - **Outcome:** This event reinforced the critical importance of maintaining a single, consistently updated source of truth to prevent flawed diagnostic paths.