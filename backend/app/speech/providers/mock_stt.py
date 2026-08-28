class MockSTT:
    """Mock STT Provider for headless offline testing."""

    def __init__(self, default_response: str = "पालखी कुठे आहे?"):
        self.default_response = default_response

    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        return self.default_response
