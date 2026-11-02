from app.services.medical_safety import medical_safety

def test_medical_disclaimer_enforcement():
    raw_report = {
        "summary": "Sample observation of tongue features.",
        "visible_observations": ["Pinkish color"],
        "general_explanations": ["Normal appearance"],
        "recommended_next_steps": ["Brush teeth and tongue gently"],
        "when_to_consult_doctor": [],
        "limitations": [],
        "medical_disclaimer": ""
    }

    sanitized = medical_safety.sanitize_llm_response(raw_report, language="en")
    assert "IMPORTANT MEDICAL DISCLAIMER" in sanitized["medical_disclaimer"]
    assert len(sanitized["when_to_consult_doctor"]) >= 2
    assert len(sanitized["limitations"]) >= 1

def test_prescription_blocking():
    unsafe_report = {
        "summary": "Observation indicates potential flora imbalance.",
        "visible_observations": ["Thick white coating"],
        "general_explanations": ["May indicate thrush"],
        "recommended_next_steps": ["Take 150 mg fluconazole once daily", "Use nystatin drops"],
        "when_to_consult_doctor": ["Persistent sores"],
        "limitations": [],
        "medical_disclaimer": ""
    }

    sanitized = medical_safety.sanitize_llm_response(unsafe_report, language="en")
    for step in sanitized["recommended_next_steps"]:
        assert "fluconazole" not in step.lower()
        assert "nystatin" not in step.lower()

def test_input_query_safety_validation():
    is_safe, msg = medical_safety.validate_input_query("What medication dosage should I take?")
    assert is_safe is False
    assert "strictly prohibited from prescribing medications" in msg

    is_safe_ok, _ = medical_safety.validate_input_query("What does a white coating on the tongue typically mean?")
    assert is_safe_ok is True
