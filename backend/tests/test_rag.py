from app.services.rag_service import rag_service

def test_rag_indexes_documents():
    assert len(rag_service.chunks) > 0

def test_rag_semantic_retrieval():
    results = rag_service.retrieve_relevant_evidence("white coating filiform papillae", top_k=2)
    assert len(results) > 0
    assert "source" in results[0]
    assert "text" in results[0]

def test_rag_citations_formatted():
    results = rag_service.retrieve_relevant_evidence("scalloped lateral border tongue", top_k=1)
    prompt_context = rag_service.format_evidence_for_prompt(results)
    assert "SOURCE:" in prompt_context
