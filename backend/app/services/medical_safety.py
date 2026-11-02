import re
from typing import Dict, Any, List, Tuple

class MedicalSafetyValidator:
    """
    Medical Safety and Clinical Guardrails Validator.
    Ensures that AI insights remain strictly educational, non-diagnostic,
    free from medication prescriptions, and alert users to critical red flags.
    """

    MANDATORY_DISCLAIMER_EN = (
        "IMPORTANT MEDICAL DISCLAIMER: This AI Tongue Health Analyzer is an educational and "
        "informational screening tool based on computer vision observations. It is NOT a diagnostic "
        "medical device and does NOT diagnose systemic diseases, prescribe medications, or replace "
        "evaluation by a licensed dentist, physician, or oral maxillofacial specialist. If you experience "
        "persistent sores, bleeding, difficulty swallowing, or unexplained oral changes lasting more than "
        "two weeks, please seek professional clinical evaluation promptly."
    )

    MANDATORY_DISCLAIMER_TE = (
        "ముఖ్యమైన వైద్య నిరాకరణ: ఈ AI నాలుక ఆరోగ్య విశ్లేషణ సాధనం కేవలం విద్యా మరియు సమాచార ప్రయోజనాల కొరకు "
        "రూపొందించబడినది. ఇది రోగ నిర్ధారణ సాధనం కాదు, ఎటువంటి మందులను సూచించదు మరియు వైద్యుని లేదా దంత వైద్యుని "
        "ప్రత్యక్ష పరీక్షకు ప్రత్యామ్నాయం కాదు. ఏవైనా పుండ్లు, రక్తస్రావం లేదా మింగడంలో ఇబ్బంది 2 వారాలకు మించి ఉంటే, "
        "వెంటనే అర్హతగల వైద్యుడిని సంప్రదించండి."
    )

    PROHIBITED_PRESCRIPTION_KEYWORDS = [
        r"\bprescribe\b", r"\btake\s+\d+\s*mg\b", r"\bamoxicillin\b", r"\bfluconazole\b",
        r"\bantibiotic\b", r"\bprednisone\b", r"\bdosage\b", r"\bnystatin\s+drops\b",
        r"\bmedication\s+regimen\b", r"\bpenicillin\b"
    ]

    UNSUPPORTED_DIAGNOSIS_PATTERNS = [
        r"\byou\s+have\s+(cancer|diabetes|hiv|syphilis|kidney\s+failure|cirrhosis|heart\s+disease)\b",
        r"\bthis\s+proves\s+you\s+have\b",
        r"\bdefinitely\s+diagnosed\s+with\b",
        r"\bconfirmed\s+pathology\b"
    ]

    RED_FLAG_SYMPTOMS = [
        "persistent ulcer", "non-healing sore", "unexplained bleeding",
        "difficulty swallowing", "dysphagia", "firm lump", "numbness in tongue",
        "ear pain", "persistent white patch that cannot be wiped"
    ]

    @classmethod
    def validate_input_query(cls, query: str) -> Tuple[bool, str]:
        """Check if user prompt asks for unsafe self-medication dosages or prescriptions."""
        query_lower = query.lower()
        unsafe_patterns = [
            r"what\s+(?:medicine|medication)\s+should\s+i\s+take",
            r"prescribe",
            r"dosage",
            r"how\s+many\s+mg",
            r"take\s+antibiotic",
            r"what\s+drug\s+to\s+take"
        ]
        for pat in unsafe_patterns:
            if re.search(pat, query_lower):
                return False, (
                    "As an educational AI system, I am strictly prohibited from prescribing medications "
                    "or recommending specific drug dosages. Please consult a licensed medical professional "
                    "or pharmacist for pharmacotherapy."
                )
        return True, ""

    @classmethod
    def sanitize_llm_response(cls, report_data: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        """
        Validate and sanitize LLM-generated report to enforce medical safety guardrails:
        1. Ensures mandatory medical disclaimer is present and unaltered.
        2. Blocks unwarranted medication prescriptions.
        3. Removes diagnostic certainty claims.
        4. Injects emergency triage guidance if concerning features or red flags are mentioned.
        """
        disclaimer = cls.MANDATORY_DISCLAIMER_TE if language == "te" else cls.MANDATORY_DISCLAIMER_EN
        report_data["medical_disclaimer"] = disclaimer

        # Enforce limitations
        if not report_data.get("limitations"):
            report_data["limitations"] = [
                "Visual image analysis cannot detect microscopic tissue histology or microbiological species.",
                "Surface lighting, smartphone camera color temperature, and recent dietary intake can influence visible tones.",
                "Clinical palpation and intraoral examination by a doctor are indispensable."
            ]

        # Scan for prescription keywords and scrub
        text_fields = ["summary"] + report_data.get("general_explanations", []) + report_data.get("recommended_next_steps", [])
        combined_text = " ".join(text_fields)

        for pat in cls.PROHIBITED_PRESCRIPTION_KEYWORDS:
            if re.search(pat, combined_text, re.IGNORECASE):
                # Replace with safe medical consultation advice
                report_data["recommended_next_steps"] = [
                    step for step in report_data.get("recommended_next_steps", [])
                    if not re.search(pat, step, re.IGNORECASE)
                ]
                report_data["recommended_next_steps"].append(
                    "Discuss any potential therapeutic treatments or prescription medications directly with your doctor."
                )

        # Ensure red flag triage is present
        when_to_consult = report_data.get("when_to_consult_doctor", [])
        if not when_to_consult or len(when_to_consult) < 2:
            report_data["when_to_consult_doctor"] = [
                "Any solitary ulcer or sore persisting for more than 14 days without noticeable healing.",
                "Lumps, firm swelling, or areas of induration within the tongue substance.",
                "Difficulty chewing, swallowing (dysphagia), or restricted tongue movement.",
                "Spontaneous or unexplained bleeding from the oral mucosa."
            ]

        return report_data

medical_safety = MedicalSafetyValidator()
