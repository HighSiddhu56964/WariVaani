class MockTTS:
    """Mock TTS Provider for headless offline testing."""

    def synthesize(self, text: str, language: str = "mr") -> bytes:
        return b""
