"""
WariVaani - Response Style Guide (response_style.py)

Defines constants and utility functions for human-like, short,
Marathi-first voice responses.
"""

from typing import Optional


# -----------------------------------------------------------------------
# Humanized response templates (all Marathi)
# -----------------------------------------------------------------------

# Opening greeting (voice CLI welcome)
WELCOME = "राम कृष्ण हरी! वारीवाणीमध्ये आपले स्वागत आहे. सांगा, मी कशी मदत करू?"

# Farewell
FAREWELL = "पुन्हा भेटू! जय हरी विठ्ठल!"

# Grounded data unavailable fallback
DATA_UNAVAILABLE = "सध्या याची खात्रीशीर माहिती उपलब्ध नाही."
BACKEND_UNAVAILABLE = "सध्या याची खात्रीशीर माहिती उपलब्ध नाही."

# Unclear speech / UNKNOWN intent variants (rotated to avoid repeating identical sentence)
UNKNOWN_VARIANTS = [
    "माफ करा, मला नीट समजलं नाही. पुन्हा एकदा सांगाल का?",
    "माफ करा, ते नीट ऐकू आलं नाही. पुन्हा सांगाल का?",
    "थोडं पुन्हा सांगाल का? मला नीट समजलं नाही.",
    "माफ करा, शेवटचं वाक्य पुन्हा सांगा.",
]

_unknown_counter = 0


def get_unknown_response() -> str:
    """Return rotated natural variant for unknown/unclear speech."""
    global _unknown_counter
    resp = UNKNOWN_VARIANTS[_unknown_counter % len(UNKNOWN_VARIANTS)]
    _unknown_counter += 1
    return resp


# Partial recognition confirmation
PARTIAL_RECOGNITION = "तुम्ही {topic} बद्दल विचारत आहात का?"

# General conversation & Identity replies
IDENTITY_REPLY = (
    "मी वारीवाणी आहे. वारीमध्ये पालखीची माहिती, जवळची वैद्यकीय मदत आणि "
    "हरवलेल्या व्यक्तीची नोंद करण्यात मी मदत करू शकते."
)
GREETING_REPLY = "राम कृष्ण हरी! सांगा, मी कशी मदत करू?"
GREETING_VITHAL_REPLY = "जय हरी विठ्ठल! सांगा, पालखीची काही माहिती हवी आहे का?"
THANKS_REPLY = "देव तुमचे भले करो! जय हरी विठ्ठल!"
HELP_REPLY = (
    "मी पालखीचे स्थान, पुढचा मुक्काम, जवळचे वैद्यकीय केंद्र आणि "
    "हरवलेल्या व्यक्तीची नोंद करण्यात मदत करू शकते. सांगा, काय माहिती हवी आहे?"
)

# Missing person flow replies
MISSING_START = "ठीक आहे, मी मदत करतो. {subject} पूर्ण नाव सांगा."
MISSING_ASK_AGE = "{name}चं वय किती आहे?"
MISSING_ASK_CLOTHING = "{name}नी कोणते कपडे घातले होते?"
MISSING_ASK_LOCATION = "{name} शेवटचे कुठे दिसले होते?"
MISSING_ASK_CONTACT = "ठीक आहे. तुमचा मोबाईल नंबर सांगा."
MISSING_CONFIRM = (
    "{name}, वय {age} वर्ष, {clothing} कपडे आणि शेवटचं ठिकाण {location}. "
    "ही माहिती बरोबर आहे का?"
)
MISSING_CANCELLED = "ठीक आहे, नोंदणी रद्द केली. पुन्हा सांगितलं तर मदत करेन."


def partial_recognition_reply(topic: str) -> str:
    """Return a clarification question for a partially recognized topic."""
    return PARTIAL_RECOGNITION.format(topic=topic)


def missing_start_reply(is_female: bool = False) -> str:
    """Return missing-person start message with correct gender subject."""
    subject = "तिचं" if is_female else "त्याचं"
    return f"ठीक आहे, मी मदत करतो. {subject} पूर्ण नाव सांगा."


def missing_age_reply(name: str) -> str:
    return MISSING_ASK_AGE.format(name=name)


def missing_clothing_reply(name: str) -> str:
    return MISSING_ASK_CLOTHING.format(name=name)


def missing_location_reply(name: str) -> str:
    return MISSING_ASK_LOCATION.format(name=name)


def missing_confirm_reply(name: str, age, clothing: str, location: str) -> str:
    return MISSING_CONFIRM.format(name=name, age=age, clothing=clothing, location=location)
