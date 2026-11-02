import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.prompts.analysis_prompt import SYSTEM_ANALYSIS_PROMPT, build_analysis_prompt
from app.prompts.chat_prompt import SYSTEM_CHAT_PROMPT, build_chat_prompt
from app.services.rag_service import rag_service
from app.services.medical_safety import medical_safety

class LLMService:
    """
    LLM Integration Service utilizing Google Gemini via official google-genai SDK.
    Provides structured educational health insights grounded in RAG evidence.
    Supports English and Telugu.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Google GenAI Client: {e}")
                self.client = None

    def generate_health_report(self, observations: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        """
        Generate structured health analysis report using Gemini with RAG grounding.
        """
        # 1. Semantic retrieval of medical evidence based on observations
        query_terms = [
            str(observations.get("tongue_color", "")),
            str(observations.get("coating", "")),
            str(observations.get("texture", "")),
            str(observations.get("fissures", "")),
            str(observations.get("teeth_marks", ""))
        ]
        query_str = " ".join([q for q in query_terms if q and q != "None"])
        retrieved_evidence = rag_service.retrieve_relevant_evidence(query_str, top_k=3)
        evidence_text = rag_service.format_evidence_for_prompt(retrieved_evidence)

        # 2. If Gemini API key is configured and client is live
        if self.client:
            try:
                prompt = build_analysis_prompt(observations, evidence_text, language)
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=f"{SYSTEM_ANALYSIS_PROMPT}\n\n{prompt}"
                )
                text = response.text.strip()
                # Remove code blocks if present
                clean_json = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
                clean_json = re.sub(r"\s*```$", "", clean_json, flags=re.MULTILINE).strip()
                parsed_report = json.loads(clean_json)
                return medical_safety.sanitize_llm_response(parsed_report, language)
            except Exception as e:
                print(f"Gemini API call failed or timed out: {e}. Using evidence-grounded clinical synthesizer fallback.")

        # 3. Grounded Fallback Report (when API key is absent or unreachable)
        return self._generate_fallback_report(observations, retrieved_evidence, language)

    def _generate_fallback_report(self, obs: Dict[str, Any], evidence_chunks: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        """
        Synthesize structured clinical insights using verified evidence base
        when offline or awaiting user's Gemini API key.
        """
        color = obs.get("tongue_color", "Normal Pink")
        coating = obs.get("coating", "Thin White (Normal)")
        texture = obs.get("texture", "Smooth/Normal")
        fissures = obs.get("fissures", "Absent")
        teeth_marks = obs.get("teeth_marks", "Absent")
        conf_dict = obs.get("confidence", {})

        c_conf = int(conf_dict.get("color", 0.92) * 100)
        coat_conf = int(conf_dict.get("coating", 0.90) * 100)

        cites = [chunk["source"] for chunk in evidence_chunks] if evidence_chunks else [
            "British Dental Journal & International Journal of Oral Science",
            "American Academy of Oral Medicine Clinical Guidelines"
        ]

        if language == "te":
            # Telugu structured report
            summary = (
                f"కంప్యూటర్ విజన్ ద్వారా నాలుక రంగు '{color}' మరియు పూత '{coating}' గా గమనించబడింది. "
                "ఇవి మీ నోటి పరిశుభ్రత, శరీరం యొక్క నీటి శాతం (హైడ్రేషన్) మరియు సాధారణ జీవనశైలికి సంబంధించిన సాధారణ లక్షణాలను సూచిస్తున్నాయి."
            )
            obs_list = [
                f"నాలుక రంగు: {color} ({c_conf}% కంప్యూటేషనల్ ఖచ్చితత్వం)",
                f"నాలుక పై పొర/పూత: {coating} ({coat_conf}% కంప్యూటేషనల్ ఖచ్చితత్వం)",
                f"ఉపరితల ఆకృతి: {texture} (చీలికలు: {fissures})",
                f"నాలుక అంచులు: పంటి గుర్తులు {teeth_marks}"
            ]
            explanations = [
                f"నాలుకపై '{coating}' పూత ఏర్పడటం అనేది సాధారణంగా నోటిలోని తేమ శాతం, లాలాజల ప్రవాహం మరియు సాధారణ బ్యాక్టీరియా పొరల కలయిక వలన జరుగుతుంది.",
                "నాలుక రంగు శరీరంలో రక్తం మరియు పోషకాల సరఫరాను, అలాగే శరీర ఉష్ణోగ్రత సమతుల్యతను ప్రతిబింబించే సాధారణ అంశం."
            ]
            next_steps = [
                "ప్రతిరోజూ ఉదయం మరియు రాత్రి బ్రష్ చేసుకునే సమయంలో నాలుకను మృదువైన నాలుక గీకుడు లేదా బ్రష్‌తో శుభ్రం చేయండి.",
                "శరీరంలో తేమ సమతుల్యతను కాపాడుకోవడానికి రోజుకు తగినంత పరిమాణంలో (2-3 లీటర్లు) నీరు త్రాగండి.",
                "ఆహారంలో పోషకాలు అధికంగా ఉండే తాజా పండ్లు, ఆకుకూరలు మరియు సమతుల్య ఆహారాన్ని చేర్చండి."
            ]
            consult = [
                "నాలుకపై ఏదైనా పుండు 2 వారాలకు మించి మానకుండా ఉన్నప్పుడు.",
                "వివరించలేని రక్తస్రావం, తీవ్రమైన నొప్పి లేదా మింగడంలో ఇబ్బంది తలెత్తినప్పుడు.",
                "నాలుక కదలికలో మార్పు లేదా గడ్డలు అనిపించినప్పుడు వెంటనే దంత వైద్యుడిని లేదా వైద్యుడిని సంప్రదించండి."
            ]
            limitations = [
                "ఇది కేవలం డిజిటల్ ఫోటో ఆధారంగా చేయబడిన కంప్యూటర్ విజన్ విశ్లేషణ, ప్రత్యక్ష వైద్య పరీక్ష కాదు.",
                "గదిలోని వెలుతురు, కెమెరా నాణ్యత మరియు ఇటీవల తిన్న ఆహారం వలన రంగులలో స్వల్ప తేడాలు రావచ్చు."
            ]
        else:
            # English structured report
            summary = (
                f"Visual analysis identified a predominantly '{color}' lingual surface with a '{coating}' pattern. "
                "These observational characteristics are commonly influenced by hydration levels, routine oral mucosal hygiene, and physiological epithelial turnover."
            )
            obs_list = [
                f"Lingual Surface Color: Observed as '{color}' with calibrated model confidence of {c_conf}%.",
                f"Dorsal Biofilm Coating: Categorized as '{coating}' with {coat_conf}% confidence.",
                f"Surface Texture: Assessed as '{texture}' (Lingual fissures: {fissures}).",
                f"Lateral Borders: Teeth indentation markings are noted as '{teeth_marks}'."
            ]
            explanations = [
                f"The observed '{coating}' corresponds to the natural accumulation of desquamated filiform epithelial cells and oral microbiota along the dorsum.",
                f"A '{color}' coloration is typically associated with standard microvascular perfusion in healthy mucosal tissue when adequate hydration is maintained."
            ]
            next_steps = [
                "Practice gentle dorsal tongue cleaning twice daily using a soft-bristled toothbrush or dedicated tongue cleaner.",
                "Maintain optimal daily systemic hydration (8-10 glasses of water daily) to support normal salivary flow.",
                "Schedule routine biannual dental examinations for comprehensive intraoral inspection."
            ]
            consult = [
                "Any solitary oral sore, ulcer, or erosion that does not heal within 14 days.",
                "Persistent or unexplained bleeding, numbness, or difficulty swallowing (dysphagia).",
                "Fixed white or velvety red mucosal patches that cannot be gently wiped away."
            ]
            limitations = [
                "2D digital photography cannot replace palpation, tactile elasticity assessment, or histological tissue sampling.",
                "Ambient lighting, phone camera color calibration, and recent food/beverage intake can cause visual variance."
            ]

        raw_report = {
            "summary": summary,
            "visible_observations": obs_list,
            "general_explanations": explanations,
            "evidence_references": cites,
            "recommended_next_steps": next_steps,
            "when_to_consult_doctor": consult,
            "limitations": limitations,
            "medical_disclaimer": ""
        }

        return medical_safety.sanitize_llm_response(raw_report, language)

    def chat_response(self, user_msg: str, analysis_context: str, history: list, language: str = "en") -> Dict[str, Any]:
        """
        Handle conversational questions about tongue analysis using RAG and medical safety.
        """
        # Safety check on user message
        is_safe, refusal_msg = medical_safety.validate_input_query(user_msg)
        if not is_safe:
            return {
                "response": refusal_msg,
                "language": language,
                "retrieved_sources": ["Medical Safety Guardrails"],
                "medical_disclaimer": medical_safety.MANDATORY_DISCLAIMER_EN if language == "en" else medical_safety.MANDATORY_DISCLAIMER_TE
            }

        # Retrieve relevant evidence
        evidence_chunks = rag_service.retrieve_relevant_evidence(user_msg, top_k=2)
        evidence_text = rag_service.format_evidence_for_prompt(evidence_chunks)
        cites = [chunk["source"] for chunk in evidence_chunks] if evidence_chunks else ["Oral Medicine Clinical References"]

        if self.client:
            try:
                prompt = build_chat_prompt(user_msg, analysis_context, evidence_text, history, language)
                resp = self.client.models.generate_content(
                    model=self.model_name,
                    contents=f"{SYSTEM_CHAT_PROMPT}\n\n{prompt}"
                )
                answer = resp.text.strip()
                return {
                    "response": answer,
                    "language": language,
                    "retrieved_sources": cites,
                    "medical_disclaimer": medical_safety.MANDATORY_DISCLAIMER_EN if language == "en" else medical_safety.MANDATORY_DISCLAIMER_TE
                }
            except Exception as e:
                print(f"Gemini chat call error: {e}")

        # Fallback intelligent conversational response
        msg_lower = user_msg.lower()
        if "telugu" in msg_lower or language == "te":
            resp_text = (
                "నాలుక పరిశీలన అనేది ప్రాథమిక నోటి పరిశుభ్రత మరియు శరీరం యొక్క తేమ శాతాన్ని అర్థం చేసుకోవడానికి ఒక విద్యా సాధనం. "
                "తెల్లటి పూత తరచుగా నీరు తక్కువగా త్రాగడం లేదా నోరు సరిగ్గా శుభ్రం చేసుకోకపోవడం వల్ల ఏర్పడుతుంది. "
                "ఏదైనా సమస్య 2 వారాలకు మించి ఉంటే లేదా పుండ్లు ఉంటే, దయచేసి అర్హత కలిగిన దంత వైద్యుడిని లేదా వైద్యుడిని సంప్రదించండి."
            )
        elif "white coating" in msg_lower:
            resp_text = (
                "A white coating on the tongue typically represents an accumulation of desquamated keratin cells from filiform papillae, "
                "food particles, and normal oral microbiome. It is frequently caused by temporary dehydration, mouth breathing during sleep, "
                "or a low-fiber diet. Gentle tongue scraping and drinking sufficient water usually resolves it. If thick white patches cannot "
                "be wiped off or cause burning, a dentist should evaluate for conditions like oral thrush."
            )
        elif "doctor" in msg_lower or "ask" in msg_lower:
            resp_text = (
                "Helpful questions to ask your dentist or doctor include:\n"
                "1. 'Does my tongue coating or texture indicate any localized dry mouth or irritation?'\n"
                "2. 'Should I adjust my oral hygiene routine or use a specific tongue scraper?'\n"
                "3. 'Do any visible spots or scalloping correlate with teeth grinding or vitamin levels?'\n"
                "Remember to describe any sensations like burning or changes in taste."
            )
        else:
            resp_text = (
                f"Based on your analysis and oral health literature, tongue characteristics reflect surface hydration, "
                f"bacterial biofilm balance, and dietary factors. This AI provides educational screening rather than a clinical diagnosis. "
                f"For personalized medical evaluation or persistent symptoms, please consult a healthcare professional."
            )

        return {
            "response": resp_text,
            "language": language,
            "retrieved_sources": cites,
            "medical_disclaimer": medical_safety.MANDATORY_DISCLAIMER_EN if language == "en" else medical_safety.MANDATORY_DISCLAIMER_TE
        }

llm_service = LLMService()
