from abc import ABC, abstractmethod
import re
from app.agent.intents import Intent
from app.agent.normalizer import normalize, fuzzy_contains_keyword


class BaseIntentRouter(ABC):
    @abstractmethod
    def classify(self, message: str) -> tuple:
        """
        Classify user text message into an Intent.
        Returns (Intent, confidence_score: float, context_hint: str).
        """
        pass


class KeywordIntentRouter(BaseIntentRouter):
    """
    Deterministic rule & keyword-based router for Marathi text queries.
    Uses normalized text + fuzzy matching for robust intent classification.
    Provides fast, reliable hackathon MVP classification.
    """

    # --- Primary keywords ---
    RINGAN_KEYWORDS = [
        "रringण", "रिंगण", "रिंगन", "रिंगण कुठे आहे", "पुढचं रिंगण", "रिंगण कधी", "ringan"
    ]

    PALKHI_ROUTE_KEYWORDS = [
        "आणखी किती मुक्काम", "किती मुक्काम आहेत", "पंढरपूरला जाण्यापूर्वी",
        "पुढचे थांबे", "किती थांबे", "मार्ग", "रस्ता"
    ]

    NEXT_HALT_KEYWORDS = [
        "पुढचा मुक्काम", "मुक्काम कुठे", "पुढे कुठे", "पुढचा थांबा",
        "पुढील मुक्काम", "पुढील थांबा", "नंतर कुठे", "पुढचा मुकाम",
        "पुढे कुठे जाणार", "मुक्काम",
    ]

    PALKHI_KEYWORDS = [
        "पालखी", "माऊली", "ज्ञानोबा", "तुकाराम", "स्थान", "कुठवर",
        "palkhi", "mauli", "location", "dnyanoba", "tukaram",
    ]

    MEDICAL_KEYWORDS = [
        "मेडिकल", "दवाखाना", "वैद्यकीय", "डॉक्टर", "इस्पितळ", "रुग्णालय",
        "ॲम्बुलन्स", "रुग्णवाहिका", "औषध", "प्रथमोपचार",
        "medical", "hospital", "doctor", "ambulance", "medicine",
    ]

    ITEM_KEYWORDS = [
        "बॅग", "पाकीट", "फोन", "मोबाईल", "पर्स", "सामान", "वस्तू", "चष्मा", "घड्याळ",
        "bag", "wallet", "phone", "mobile", "purse", "item", "watch"
    ]

    FOUND_ITEM_KEYWORDS = [
        "सापडली आहे", "सापडली", "सापडलं आहे", "सापडलं", "सापडला", "गवसली", "गवसलं", "found", "found item"
    ]

    LOST_ITEM_KEYWORDS = [
        "बॅग हरवली", "पाकीट हरवलं", "फोन हरवला", "वस्तू हरवली", "सामान हरवलं",
        "माझी बॅग", "माझं पाकीट", "माझा फोन", "माझी वस्तू", "माझं सामान",
        "हरवली", "हरवलं", "हरवला", "सापडत नाही", "lost item", "lost bag"
    ]

    MISSING_PERSON_KEYWORDS = [
        "माणूस हरवला", "मुलगा हरवला", "मुलगी हरवली", "वडील दिसत नाही", "आई दिसत नाही",
        "माणूस बेपत्ता", "बेपत्ता", "मुलगा", "मुलगी", "वडील", "आई",
        "माझा मुलगा", "माझी मुलगी", "शोधत आहे",
        "missing", "person lost",
    ]

    GENERAL_CHAT_KEYWORDS = [
        ("तुम्ही कोण", "identity"),
        ("कोण आहात", "identity"),
        ("कोण आहेस", "identity"),
        ("तुमची माहिती", "identity"),
        ("राम कृष्ण हरी", "greeting"),
        ("जय हरी विठ्ठल", "greeting_vithal"),
        ("जय हरी माऊली", "greeting_vithal"),
        ("नमस्कार", "greeting"),
        ("नमस्ते", "greeting"),
        ("हॅलो", "greeting"),
        ("hello", "greeting"),
        ("hi", "greeting"),
        ("धन्यवाद", "thanks"),
        ("थँक्स", "thanks"),
        ("बाय", "goodbye"),
        ("गुडबाय", "goodbye"),
        ("bye", "goodbye"),
        ("goodbye", "goodbye"),
        ("पुन्हा भेटू", "goodbye"),
        ("मदत करा", "help_request"),
        ("माहिती हवी", "help_request"),
        ("काय करू शकता", "help_request"),
        ("काय करता", "help_request"),
    ]

    AFFIRMATIVE = ["हो", "बरोबर", "होय", "हा", "yes", "योग्य", "correct", "ठीक"]
    NEGATIVE = ["नाही", "नको", "रद्द", "no", "cancel", "चुकीचे"]

    FUZZY_THRESHOLD = 80

    def classify(self, message: str) -> tuple:
        """
        Returns (Intent, confidence: float, debug_hint: str)
        """
        if not message or not message.strip():
            return Intent.UNKNOWN, 0.0, "empty input"

        normalized = normalize(message)
        text = normalized.lower()

        # --- 0A. Found Item Intent ---
        for kw in self.FOUND_ITEM_KEYWORDS:
            if kw in text:
                return Intent.REPORT_FOUND_ITEM, 1.0, f"exact:{kw}"

        # --- 0B. Lost Item Intent (when item or lost item keywords match) ---
        for kw in self.LOST_ITEM_KEYWORDS[:10]:
            if kw in text:
                return Intent.REPORT_LOST_ITEM, 1.0, f"exact:{kw}"
        has_item = any(ikw in text for ikw in self.ITEM_KEYWORDS)
        if has_item and any(lkw in text for lkw in ["हरवली", "हरवलं", "हरवला", "माझी", "माझं", "lost"]):
            return Intent.REPORT_LOST_ITEM, 0.95, "item+lost"

        # --- 1. Missing person (for missing people) ---
        for kw in self.MISSING_PERSON_KEYWORDS:
            if kw in text:
                return Intent.REPORT_MISSING_PERSON, 1.0, f"exact:{kw}"
        for kw in self.MISSING_PERSON_KEYWORDS[:8]:  # fuzzy only first N
            if fuzzy_contains_keyword(text, kw, self.FUZZY_THRESHOLD):
                return Intent.REPORT_MISSING_PERSON, 0.82, f"fuzzy:{kw}"

        # General fallback if someone says "हरवला" without item
        if "हरवला" in text or "हरवली" in text or "हरवले" in text:
            if has_item:
                return Intent.REPORT_LOST_ITEM, 0.90, "fallback:item_lost"
            return Intent.REPORT_MISSING_PERSON, 0.85, "fallback:missing_person"

        # --- 2. Ringan Intent ---
        for kw in self.RINGAN_KEYWORDS:
            if kw in text:
                return Intent.GET_NEXT_RINGAN, 1.0, f"exact:{kw}"

        # --- 3. Palkhi Route / Remaining Halts Intent ---
        for kw in self.PALKHI_ROUTE_KEYWORDS:
            if kw in text:
                return Intent.GET_PALKHI_ROUTE, 1.0, f"exact:{kw}"

        # --- 4. Next Halt ---
        for kw in self.NEXT_HALT_KEYWORDS:
            if kw in text:
                return Intent.GET_NEXT_HALT, 1.0, f"exact:{kw}"
        for kw in self.NEXT_HALT_KEYWORDS[:5]:
            if fuzzy_contains_keyword(text, kw, self.FUZZY_THRESHOLD):
                return Intent.GET_NEXT_HALT, 0.80, f"fuzzy:{kw}"

        # --- 5. Medical ---
        for kw in self.MEDICAL_KEYWORDS:
            if kw in text:
                return Intent.GET_NEAREST_MEDICAL, 1.0, f"exact:{kw}"
        for kw in self.MEDICAL_KEYWORDS[:6]:
            if fuzzy_contains_keyword(text, kw, self.FUZZY_THRESHOLD):
                return Intent.GET_NEAREST_MEDICAL, 0.80, f"fuzzy:{kw}"

        # --- 6. Palkhi Location ---
        for kw in self.PALKHI_KEYWORDS:
            if kw in text:
                return Intent.GET_PALKHI_LOCATION, 1.0, f"exact:{kw}"
        for kw in self.PALKHI_KEYWORDS[:8]:
            if fuzzy_contains_keyword(text, kw, self.FUZZY_THRESHOLD):
                return Intent.GET_PALKHI_LOCATION, 0.78, f"fuzzy:{kw}"

        # --- 7. General Conversation ---
        for phrase, hint in self.GENERAL_CHAT_KEYWORDS:
            if phrase in text:
                return Intent.GENERAL_CONVERSATION, 0.95, f"general:{hint}"

        # Weak matches ask for confirmation instead of calling a data tool.
        for topic, keywords in (
            ("पालखी", self.PALKHI_KEYWORDS[:4]),
            ("वैद्यकीय मदत", self.MEDICAL_KEYWORDS[:6]),
            ("हरवलेली व्यक्ती", self.MISSING_PERSON_KEYWORDS[:8]),
        ):
            if any(fuzzy_contains_keyword(text, kw, 65) for kw in keywords):
                return Intent.UNKNOWN, 0.55, f"partial:{topic}"

        return Intent.UNKNOWN, 0.0, "no-match"


# Default router instance
intent_router = KeywordIntentRouter()
