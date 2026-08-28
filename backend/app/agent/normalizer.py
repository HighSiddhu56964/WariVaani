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


def get_context_hint(normalized_text: str) -> Optional[str]:
    """
    Return a domain hint string for debugging when a keyword is fuzzy-matched
    but not exact-matched.  Returns None when nothing notable was detected.
    """
    text = normalized_text.lower()
    for kw in DOMAIN_KEYWORDS:
        if fuzzy_contains_keyword(text, kw, threshold=75) and kw.lower() not in text:
            return f"fuzzy-matched '{kw}'"
    return None
