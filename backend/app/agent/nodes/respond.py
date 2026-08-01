from app.agent.llm import get_chat_model
from app.agent.state import GraphState

_CATEGORIES = {"blood_report", "prescription", "general_question", "other"}

_PROMPT = """You are a careful medical assistant. Read the user's message below (with any \
document text and reference excerpts) and respond with exactly three fields.

1. CATEGORY: exactly one of blood_report, prescription, general_question, other.
2. CLINICAL: default to yes unless the message is CLEARLY just a greeting, small talk, or \
app/appointment logistics with no medical content at all. Answer yes if the message names \
or asks about any symptom, medication/drug (including what it's used for, its effects, or \
dosage), diagnosis, test/report result, or treatment -- even if the question sounds like \
"just information." When genuinely unsure, answer yes.
3. ANSWER: your actual response to the user's message.
   - Use the reference excerpts where relevant, citing the bracketed source name inline \
(e.g. "[source.pdf]"). Never invent a citation. If the references don't cover the \
question, answer from general medical knowledge and say so.
   - {register_instruction}
   - {language_instruction}

Reference excerpts:
{references}

Uploaded document text (if any):
{document}

User role: {role}
User message: {message}

Respond in exactly this format, nothing before or after:
CATEGORY: <category>
CLINICAL: <yes or no>
ANSWER: <your answer, can span multiple lines>"""


def _parse(text: str) -> tuple[str, bool, str]:
    lines = text.strip().splitlines()
    category = "other"
    is_clinical = True  # fail safe: default to requiring review if parsing is ambiguous

    for i, line in enumerate(lines):
        stripped = line.strip()
        lower = stripped.lower()
        if lower.startswith("category:"):
            value = stripped.split(":", 1)[1].strip().lower()
            if value in _CATEGORIES:
                category = value
        elif lower.startswith("clinical:"):
            value = stripped.split(":", 1)[1].strip().lower()
            is_clinical = not value.startswith("no")
        elif lower.startswith("answer:"):
            first = stripped.split(":", 1)[1].strip()
            answer = "\n".join([first, *lines[i + 1 :]]).strip()
            return category, is_clinical, answer

    # Model didn't follow the format -- treat the whole reply as the answer
    # and stay conservative on the review flag.
    return category, True, text.strip()


def respond_node(state: GraphState) -> GraphState:
    is_patient = state.get("user_role") == "patient"
    target_language = state.get("target_language", "en")

    register_instruction = (
        "Write ANSWER in simple, plain language a patient with no medical background can understand."
        if is_patient
        else "Write ANSWER in clinical/professional language appropriate for a doctor."
    )
    language_instruction = (
        "Write ANSWER in English."
        if target_language == "en"
        else f"Write ANSWER in {target_language}."
    )

    prompt = _PROMPT.format(
        register_instruction=register_instruction,
        language_instruction=language_instruction,
        references="\n\n".join(state.get("retrieved_chunks") or []) or "(none)",
        document=(state.get("document_text") or "(none)")[:3000],
        role=state.get("user_role", "patient"),
        message=state["user_message"],
    )

    llm = get_chat_model()
    response = llm.invoke(prompt)
    category, is_clinical, answer = _parse(response.content)

    # A document was uploaded specifically to be interpreted -- always
    # clinical, regardless of how the model answered.
    if state.get("document_text"):
        is_clinical = True

    return {**state, "document_type": category, "is_clinical": is_clinical, "final_answer": answer}
