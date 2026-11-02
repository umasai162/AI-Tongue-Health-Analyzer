SYSTEM_ANALYSIS_PROMPT = """You are a senior oral medicine and lingual health education AI specialist.
Your role is strictly EDUCATIONAL and INFORMATIONAL.
You are analyzing structured computer vision and clinical observations of a user's tongue image.

CRITICAL MEDICAL SAFETY RULES:
1. NEVER diagnose systemic or oral diseases (e.g., do NOT claim 'you have oral thrush', 'you have cancer', 'you have anemia').
2. Instead, use non-diagnostic observational language: 'features commonly associated with...', 'typical of hydration levels...', 'consistent with normal filiform papillae variations'.
3. NEVER prescribe medications, treatments, or specific drug dosages.
4. Distinguish image recognition confidence from clinical certainty.
5. Emphasize that visual imaging cannot replace clinical palpation, intraoral microscopy, or doctor evaluation.
6. Ground your scientific explanations strictly in the provided medical literature evidence.
7. Output valid JSON ONLY matching the requested schema. No surrounding markdown backticks.
"""

def build_analysis_prompt(observations: dict, retrieved_evidence: str, language: str = "en") -> str:
    lang_instruction = (
        "Respond in fluent professional English."
        if language == "en"
        else "Respond in fluent, respectful, natural Telugu (తెలుగు). Translate medical concepts into clear, easily understandable Telugu while maintaining professional medical accuracy."
    )

    return f"""
{lang_instruction}

INPUT COMPUTER VISION & FEATURE OBSERVATIONS:
{observations}

RETRIEVED PEER-REVIEWED MEDICAL EVIDENCE:
{retrieved_evidence}

Generate a comprehensive educational health explanation in strict JSON format with the following keys:
{{
  "summary": "Short 2-3 sentence educational synthesis of the primary visual findings.",
  "visible_observations": [
    "Bullet point describing observed tongue color with its calibrated confidence",
    "Bullet point describing tongue coating thickness and coverage",
    "Bullet point describing surface texture and any fissures",
    "Bullet point describing lingual body shape and lateral borders"
  ],
  "general_explanations": [
    "Educational explanation of what the observed coating pattern typically indicates in anatomical terms",
    "Explanation of physiological or lifestyle factors (hydration, oral hygiene, diet) related to these characteristics"
  ],
  "evidence_references": [
    "Citation from the retrieved medical literature supporting the above points"
  ],
  "recommended_next_steps": [
    "Practical daily oral hygiene recommendation (e.g. gentle dorsum brushing)",
    "Hydration and lifestyle maintenance advice"
  ],
  "when_to_consult_doctor": [
    "Specific warning symptoms that require clinical examination"
  ],
  "limitations": [
    "Explicit technical and clinical limitations of single 2D image analysis"
  ],
  "medical_disclaimer": "Mandatory disclaimer stating this is educational and non-diagnostic."
}}
"""
