import os
import re
from pathlib import Path
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import BASE_DIR, settings

class RAGService:
    """
    Retrieval-Augmented Generation (RAG) Service.
    Indexes peer-reviewed clinical knowledge base documents and provides
    semantic retrieval with strict source citations and relevance filtering.
    """

    def __init__(self):
        self.doc_dir = Path(BASE_DIR.parent / "knowledge_base" / "documents")
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer = None
        self.tfidf_matrix = None
        self.load_and_index_documents()

    def load_and_index_documents(self):
        """Load, chunk, and index all medical reference documents."""
        self.chunks = []
        if not self.doc_dir.exists():
            return

        for filepath in self.doc_dir.glob("*.md"):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Extract title and source citation
                source_match = re.search(r"\*\*Source:\*\*\s*(.+)", content)
                source_cite = source_match.group(1).strip() if source_match else filepath.name

                # Split into topical sections
                sections = re.split(r"\n##\s+", content)
                for sec in sections:
                    sec = sec.strip()
                    if not sec:
                        continue
                    lines = sec.split("\n")
                    topic = lines[0].strip().replace("#", "").strip()
                    body = "\n".join(lines[1:]).strip()

                    if len(body) > 30:
                        self.chunks.append({
                            "title": topic,
                            "source": source_cite,
                            "file": filepath.name,
                            "text": f"{topic}\n{body}"
                        })
            except Exception as e:
                print(f"Error loading document {filepath}: {e}")

        # Build TF-IDF Semantic Index
        if self.chunks:
            texts = [c["text"] for c in self.chunks]
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            self.tfidf_matrix = self.vectorizer.fit_transform(texts)

    def retrieve_relevant_evidence(self, query: str, top_k: int = 3, threshold: float = 0.08) -> List[Dict[str, Any]]:
        """
        Retrieve evidence chunks matching query terms above the relevance threshold.
        """
        if not self.chunks or self.vectorizer is None or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        ranked_indices = scores.argsort()[::-1]
        results = []

        for idx in ranked_indices[:top_k]:
            score = float(scores[idx])
            if score >= threshold:
                chunk = self.chunks[idx].copy()
                chunk["relevance_score"] = round(score, 3)
                results.append(chunk)

        return results

    def format_evidence_for_prompt(self, evidence_chunks: List[Dict[str, Any]]) -> str:
        """Format retrieved chunks into a prompt context section."""
        if not evidence_chunks:
            return "No specific literature chunks retrieved above threshold. Rely strictly on foundational oral anatomical science."

        formatted = []
        for i, chunk in enumerate(evidence_chunks, 1):
            formatted.append(f"[{i}] SOURCE: {chunk['source']} | TOPIC: {chunk['title']}\n{chunk['text']}")
        return "\n\n".join(formatted)

rag_service = RAGService()
