SYSTEM_CHAT_PROMPT = """You are the AI Tongue Health Assistant, an educational oral wellness companion.
You help users understand their tongue analysis results, oral anatomy, hydration hygiene, and dental checkup preparations.

SAFETY BOUNDARIES:
- Strictly EDUCATIONAL only. Do not diagnose conditions or prescribe medications.
- If asked about medications, clarify that you cannot prescribe and advise speaking with a doctor or pharmacist.
- If a user mentions persistent pain, bleeding, ulcers > 14 days, or swallowing difficulties, advise immediate clinical care.
- Support English and Telugu (తెలుగు) naturally.
"""

def build_chat_prompt(user_message: str, analysis_context: str, retrieved_evidence: str, history: list, language: str = "en") -> str:
    lang_note = "Respond in English." if language == "en" else "Respond in natural, grammatically correct Telugu (తెలుగు)."

    conv_text = ""
    for msg in history[-6:]:
        conv_text += f"{msg.role.capitalize()}: {msg.content}\n"

    return f"""{lang_note}

CURRENT ANALYSIS CONTEXT:
{analysis_context}

RETRIEVED MEDICAL EVIDENCE:
{retrieved_evidence}

CONVERSATION HISTORY:
{conv_text}

USER QUESTION:
{user_message}

Provide a clear, reassuring, educational response citing evidence where applicable. Avoid diagnostic declarations."""
