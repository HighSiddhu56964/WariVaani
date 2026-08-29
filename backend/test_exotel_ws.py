import asyncio
import websockets

async def test():
    uri = "wss://flavorful-refract-chatter.ngrok-free.dev/telephony/exotel?ngrok-skip-browser-warning=true"
    print(f"Connecting to {uri}...")
    headers = {"User-Agent": "ExotelVoicebot/1.0", "ngrok-skip-browser-warning": "1"}
    async with websockets.connect(uri, additional_headers=headers) as ws:
        print("Connected to Exotel WebSocket!")
        await ws.send('{"event": "connected"}')
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(test())
