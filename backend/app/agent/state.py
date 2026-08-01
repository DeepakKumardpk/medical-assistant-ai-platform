from typing import Optional, TypedDict


class GraphState(TypedDict, total=False):
    user_role: str  # 'patient' | 'doctor'
    user_message: str
    document_text: Optional[str]
    document_type: Optional[str]  # respond() output, e.g. 'blood_report'
    is_clinical: bool  # respond() output: does this need doctor review before a patient sees it?
    target_language: str
    retrieved_chunks: list[str]
    final_answer: str
