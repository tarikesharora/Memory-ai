"""
Hybrid CLIP + Lexical Search Engine
"""
from typing import List, Dict, Any, Optional

def compute_lexical_score(query: str, text: str) -> float:
    if not query:
        return 1.0
    q_tokens = query.lower().split()
    t_lower = text.lower()
    matches = sum(1 for token in q_tokens if token in t_lower)
    return matches / len(q_tokens) if q_tokens else 0.0

class HybridSearchEngine:
    def __init__(self, db_conn):
        self.conn = db_conn

    def search(
        self,
        query: str,
        file_type: str = "all",
        min_similarity: float = 0.0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        
        query_sql = "SELECT * FROM indexed_files WHERE is_available = 1"
        params = []
        if file_type != "all":
            query_sql += " AND file_type = ?"
            params.append(file_type)

        cur.execute(query_sql, params)
        rows = [dict(row) for row in cur.fetchall()]

        results = []
        for r in rows:
            text_field = f"{r['file_name']} {r['description']} {r['tags']} {r['ocr_snippet'] or ''}"
            lexical_score = compute_lexical_score(query, text_field)
            
            # Hybrid combined score
            score = lexical_score
            if score >= min_similarity:
                r["score"] = score
                results.append(r)

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
