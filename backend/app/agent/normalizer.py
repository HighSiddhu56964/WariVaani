"""
WariVaani - Marathi STT Normalizer (normalizer.py)

Cleans and normalizes imperfect Marathi STT output before intent detection.
Handles: Unicode normalization, punctuation cleanup, common phonetic
substitutions, and fuzzy keyword normalization for Wari-domain vocabulary.
"""

import re
import unicodedata
from typing import Optional

try:
    from rapidfuzz import fuzz
    _HAS_RAPIDFUZZ = True
except ImportError:
    _HAS_RAPIDFUZZ = False


# ---------------------------------------------------------------------------
# Known phonetic / regional substitutions for Wari vocabulary
# Format: (regex_pattern, replacement)
# ---------------------------------------------------------------------------
PHONETIC_SUBSTITUTIONS = [
    # Palkhi variants
    (r"पलखी",           "पालखी"),
    (r"पालकी",          "पालखी"),
    (r"पलकी",           "पालखी"),
    (r"पाल्खी",         "पालखी"),

    # Mauli variants
    (r"माउली",          "माऊली"),
    (r"माउलि",          "माऊली"),
    (r"माूली",          "माऊली"),
    (r"मौली",           "माऊली"),

    # Dnyanoba variants
    (r"ज्ञानोबा",       "ज्ञानोबा"),  # canonical
    (r"दनोबा",          "ज्ञानोबा"),
    (r"ज्ञानदेव",       "ज्ञानोबा"),

    # Tukaram variants
    (r"तुकोबा",         "तुकाराम"),
    (r"तुकाराम",        "तुकाराम"),  # canonical

    # Medical/hospital variants
    (r"दवाखान[ाे]?",   "दवाखाना"),
    (r"अस्पताल",       "इस्पितळ"),
    (r"हाॅस्पिटल",     "इस्पितळ"),
    (r"हॉस्पिटल",      "इस्पितळ"),
    (r"हॉस्पिटेल",     "इस्पितळ"),
    (r"हॉस्पीटल",      "इस्पितळ"),

    # Missing-person variants
    (r"हरवला",         "हरवला"),
    (r"हरवली",         "हरवली"),
    (r"बेपत्त[ाी]",    "बेपत्ता"),
    (r"सापडत नाही",    "सापडत नाही"),  # canonical

    # Verb "kuthe" variants
    (r"कुटे",               "कुठे"),
    (r"\bकुठवर\b",          "कुठे"),
    (r"\bकुठपर्यंत\b",     "कुठे"),
    (r"\bकुठवरी\b",        "कुठे"),

    # "ahe" variants (is / has / are) — order matters: हाय before है
    (r"\bहाय\b",            "आहे"),
    (r"\bहै\b",             "आहे"),

    # Common abbreviations / English intrusions
    (r"\blocat[io]+n\b", "कुठे"),
    (r"\bpalkhi\b",      "पालखी"),
    (r"\bmauli\b",       "माऊली"),
    (r"\bmedical\b",     "मेडिकल"),
    (r"\bdoctor\b",      "डॉक्टर"),
    (r"\bhospital\b",    "इस्पितळ"),
    (r"\bmissing\b",     "हरवला"),
    (r"\blost\b",        "हरवला"),
]

# Domain keywords for Wari voice pipeline
DOMAIN_KEYWORDS = [
    "पालखी", "माऊली", "ज्ञानोबा", "तुकाराम", "मेडिकल", "दवाखाना",
    "रुग्णालय", "इस्पितळ", "डॉक्टर", "हरवला", "हरवली", "बेपत्ता",
    "सापडत नाही", "मुलगा", "मुलगी", "व्यक्ती", "वडील", "आई",
    "सासवड", "जेजुरी", "पंढरपूर",
]


def _unicode_normalize(text: str) -> str:
    """Apply Unicode NFC normalization."""
    return unicodedata.normalize("NFC", text)


def _strip_punctuation(text: str) -> str:
    """Replace punctuation anywhere in the utterance while preserving words."""
    return re.sub(r"[।॥\.\!\?\,\;:\"'\-]+", " ", text).strip()


def _apply_phonetic_substitutions(text: str) -> str:
    """Apply domain-specific phonetic substitutions."""
    for pattern, replacement in PHONETIC_SUBSTITUTIONS:
        text = re.sub(pattern, replacement, text)
    return text


def _collapse_whitespace(text: str) -> str:
    """Normalize multiple spaces to single space."""
    return re.sub(r"\s+", " ", text).strip()


def normalize(raw_text: str, is_proper_name: bool = False) -> str:
    """
    Full normalization pipeline for Marathi STT output.

    Steps:
    1. Unicode NFC normalization
    2. Punctuation cleanup
    3. Phonetic / regional substitutions (skipped if is_proper_name=True)
    4. Whitespace collapse
    """
    if not raw_text or not raw_text.strip():
        return ""

    text = _unicode_normalize(raw_text)
    text = _strip_punctuation(text)
    if not is_proper_name:
        text = _apply_phonetic_substitutions(text)
    text = _collapse_whitespace(text)
    return text


def fuzzy_contains_keyword(text: str, keyword: str, threshold: int = 80) -> bool:
    """
    Check whether `text` contains a fuzzy match for `keyword` using token
    set ratio. Falls back to simple substring check if RapidFuzz is absent.
    """
    if keyword in text:
        return True
    if _HAS_RAPIDFUZZ:
        tokens = text.split()
        keyword_words = max(1, len(keyword.split()))
        candidates = tokens + [
            " ".join(tokens[i:i + keyword_words]) for i in range(len(tokens))
        ]
        score = max((fuzz.ratio(keyword, candidate) for candidate in candidates), default=0)
        return score >= threshold
    return False


from app.agent.intents import PalkhiEntity

DNYANESHWAR_SYNONYMS = [
    "ज्ञानेश्वर", "ज्ञानेश्वर महाराज", "संत ज्ञानेश्वर", "ज्ञानोबा", "ज्ञानोबा माऊली",
    "माऊली", "माऊलींची", "माउली", "माउलींची", "द्यानेश्वर", "न्यानेश्वर", "न्यानेेश्वर",
    "ध्यानेश्वर", "जाणेश्वर", "dnyaneshwar", "nyaneshwar", "gyaneshwar", "mauli", "mauli palkhi",
    "ज्ञानोबांची", "माऊलींच्या", "ज्ञानदेव"
]

TUKARAM_SYNONYMS = [
    "तुकाराम", "तुकाराम महाराज", "संत तुकाराम", "तुकोबा", "तुकोबा महाराज",
    "तुकोबांची", "देहूची पालखी", "tukaram", "tukaram maharaj", "tukoba",
    "तुकारामांची", "तुकोबांच्या"
]


def detect_palkhi_entity(raw_text: str) -> Optional[PalkhiEntity]:
    """
    Normalizes input and classifies utterance into canonical PalkhiEntity (DNYANESHWAR or TUKARAM).
    Returns None if no specific Palkhi is identified.
    """
    if not raw_text or not raw_text.strip():
        return None

    cleaned = normalize(raw_text, is_proper_name=False).lower()
    raw_lower = raw_text.lower()

    # 1. Exact / Substring match on Tukaram terms first
    for term in TUKARAM_SYNONYMS:
        t_clean = term.lower()
        if t_clean in cleaned or t_clean in raw_lower:
            return PalkhiEntity.TUKARAM

    # 2. Exact / Substring match on Dnyaneshwar terms
    for term in DNYANESHWAR_SYNONYMS:
        t_clean = term.lower()
        if t_clean in cleaned or t_clean in raw_lower:
            return PalkhiEntity.DNYANESHWAR

    # 3. Fuzzy matching fallback
    for term in TUKARAM_SYNONYMS:
        if fuzzy_contains_keyword(cleaned, term, threshold=78):
            return PalkhiEntity.TUKARAM

    for term in DNYANESHWAR_SYNONYMS:
        if fuzzy_contains_keyword(cleaned, term, threshold=78):
            return PalkhiEntity.DNYANESHWAR

    return None

