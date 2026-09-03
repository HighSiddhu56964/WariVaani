# WariVaani (वारीवाणी)

A grounded Marathi voice helper for the Pandharpur Wari pilgrimage, enabling natural voice-based interactions for information queries, emergency reporting, and community support.

## 🌟 Overview

WariVaani is a full-stack voice application built with
- **Backend (Python)**: AI4Bharat IndicConformer for Marathi speech recognition, deterministic tools for facts & reporting, Sarvam Bulbul v3 for speech synthesis
- **Frontend (TypeScript/React)**: Next.js-based web interface with map visualization for tracking Palkhi locations and managing pilgrim information
- **Database (PostgreSQL)**: Grounded data store for Wari routes, locations, and pilgrim records

The system provides:
- 🎤 Natural Marathi speech understanding and response
- 📍 Real-time Palkhi (palanquin) location tracking
- 🚨 Emergency missing-person reporting
- 🏥 Local service discovery (doctors, hospitals, facilities)
- 💬 Context-aware conversational routing

---

## 📋 Project Structure

```
wari/
├── backend/                    # Python Flask/FastAPI backend
│   ├── app/
│   │   ├── speech/            # Speech processing pipeline
│   │   │   ├── voice_cli.py  # Main voice interaction CLI
│   │   │   ├── stt.py        # Speech-to-text (IndicConformer)
│   │   │   └── tts.py        # Text-to-speech (Sarvam AI)
│   │   ├── tools/            # Grounded backend tools
│   │   └── models/           # Database models
│   ├── requirements.txt       # Core dependencies
│   ├── requirements-indicconformer.txt  # IndicConformer setup
│   └── tests/               # Test suite
│
├── frontend/                  # Next.js React web app
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── package.json         # Frontend dependencies
│
├── frontend-old/            # Legacy frontend version
├── data/                    # Sample data & resources
├── photos/                  # Assets and media
├── docker-compose.yml       # PostgreSQL setup
├── .env.example            # Environment template
└── README.md               # This file
```

---

## ⚙️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **STT** | AI4Bharat IndicConformer | nemo-v2 |
| **TTS** | Sarvam AI Bulbul | v3 |
| **Backend** | Python | 3.10+ |
| **Frontend** | Next.js + React | 15.1.0 / 19.2.8 |
| **Database** | PostgreSQL | Latest |
| **ML Framework** | PyTorch | 2.2.2 (CPU) |
| **Language** | TypeScript (52%), Python (28%), HTML (18%) | - |

---

## 🚀 Quick Start

### Prerequisites
- **Windows/WSL2**: Ubuntu 20.04 or later
- **Python**: 3.10+
- **Node.js**: 18+
- **Docker**: For PostgreSQL
- **Hardware**: CPU inference supported (Intel Iris Xe compatible)

### Backend Setup (Voice Pipeline)

#### 1. Install System Dependencies (Ubuntu/WSL)

```bash
sudo apt-get update
sudo apt-get install -y python3.10 python3.10-venv git ffmpeg libsndfile1 portaudio19-dev
```

#### 2. Create Python Environment

```bash
cd /path/to/wari
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
```

#### 3. Install PyTorch (CPU-only)

```bash
python -m pip install torch==2.2.2 torchaudio==2.2.2 \
  --index-url https://download.pytorch.org/whl/cpu
```

#### 4. Install Dependencies

```bash
python -m pip install -r backend/requirements.txt
python -m pip uninstall -y nemo_toolkit
python -m pip install -r backend/requirements-indicconformer.txt
```

> **Note**: The final step installs the official AI4Bharat fork from the `nemo-v2` branch. Do **not** install NVIDIA NeMo 3.x for this checkpoint.

### Frontend Setup (Web Interface)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

```powershell
# From Windows PowerShell (or WSL)
cd D:\path\to\wari
docker compose up -d db
```

This starts a PostgreSQL container configured with:
- User: `postgres`
- Password: `postgres`
- Database: `warivaani`

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env` and configure:

### Speech Services

```env
STT_PROVIDER=indicconformer        # Speech-to-text provider
STT_LANGUAGE=mr                    # Marathi language code
HF_TOKEN=hf_your_read_token        # Hugging Face access token

TTS_PROVIDER=sarvam                # Text-to-speech provider
TTS_LANGUAGE=mr-IN                 # Marathi locale
SARVAM_API_KEY=your_api_key        # Sarvam AI API key
SARVAM_TTS_MODEL=bulbul:v3        # Model version
SARVAM_TTS_SPEAKER=shubh          # Voice speaker
SARVAM_TTS_SAMPLE_RATE=16000      # Audio sample rate (Hz)
```

### Database

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=warivaani
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Hugging Face Access

1. Sign in at [huggingface.co](https://huggingface.co/)
2. Accept access to [ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large](https://huggingface.co/ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large)
3. Generate a **read token** at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
4. Add to `.env`:
   ```env
   HF_TOKEN=hf_your_read_token
   ```

**⚠️ Never commit `.env` to version control.**

---

## 🎤 Running the Voice Pipeline

### Start the Backend

```bash
cd backend
source ../.venv/bin/activate
python -m app.speech.voice_cli
```

#### Expected Output on Successful Model Load

```text
STT: AI4Bharat IndicConformer Marathi
Model: ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large
Decoder: CTC
Device: CPU
```

#### Sample Interaction

```text
Raw STT: पालकी कुटे आहे
Normalized: पालखी कुठे आहे
Intent: GET_PALKHI_LOCATION
Intent confidence: 1.00
Agent response: माऊलींची पालखी सध्या सासवडजवळ आहे. पुढचा नियोजित थांबा जेजुरी आहे।

Latency:
  STT: 1.42 sec
  Normalization + intent: 0.01 sec
  Backend: 0.02 sec
  TTS first audio: 0.31 sec
  Total: 1.76 sec
```

---

## 🧪 Testing

### Run Test Suite

```bash
cd backend
source ../.venv/bin/activate
pytest tests -q
```

### Manual Speech Testing

Test these Marathi utterances in the CLI:

| Utterance | Expected Behavior |
|-----------|-------------------|
| `पालखी कुठे आहे?` | Returns Palkhi location from database |
| `माऊली कुठवर आली?` | Routes to same location tool |
| `जवळ डॉक्टर कुठे मिळतील?` | Asks for caller's village for local search |
| `माझी मुलगी हरवली आहे।` | Initiates missing-person report flow |
| `आकांक्षा` | Missing person's name |
| `ती पाच वर्षांची आहे` | Records age and asks about clothing |
| `गुलाबी फ्रॉक घातला आहे` | Records clothing and asks last-seen location |
| `सासवडला दिसली होती` | Records location and requests contact number |
| *(phone number)* | Completes missing-person ticket creation |

Verify:
- ✅ System logs grounded routing and latencies
- ✅ Missing-person tickets appear in database
- ✅ Voice responses are natural and contextual

---

## 🏗️ Architecture

### Speech Pipeline

```
User Voice Input
    ↓
[STT: IndicConformer] → Marathi text
    ↓
[Normalization] → Standardized Marathi
    ↓
[Intent Router] → Command routing
    ↓
[Grounded Tools]
  ├─ get_palkhi_location_tool()
  ├─ get_nearby_doctors_tool()
  ├─ report_missing_person_tool()
  └─ ...
    ↓
[TTS: Sarvam Bulbul v3] → Marathi audio
    ↓
User Audio Output
```

### Frontend Components

- **Map View**: Real-time Palkhi tracking with Leaflet
- **Form Components**: Missing-person reporting, doctor search
- **Status Dashboard**: Pilgrimage progress, announcements
- **Mobile PWA**: Offline-capable progressive web app

---

## 📦 Dependencies

### Backend
- `torch==2.2.2` — Deep learning inference
- `torchaudio==2.2.2` — Audio processing
- `nemo-toolkit` (nemo-v2 fork) — IndicConformer wrapper
- `requests` — HTTP client for Sarvam AI API
- `sqlalchemy` — Database ORM
- `python-dotenv` — Environment configuration

### Frontend
- `next@15.1.0` — React framework
- `react@19.2.8` — UI library
- `leaflet` — Map visualization
- `lucide-react` — Icon library
- `tailwindcss@4` — Styling
- `typescript@5` — Type safety

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages
4. Push and open a pull request

---

## 📝 License

This project is part of the Pandharpur Wari initiative. See LICENSE for details.

---

## 🙋 Support

For issues, questions, or contributions:
- Open a GitHub issue
- Contact: HighSiddhu56964

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time crowd density mapping
- [ ] Integration with official Wari authorities
- [ ] Multi-language support (Hindi, English)
- [ ] Advanced missing-person AI features
- [ ] Community moderation dashboard

---

**Built with ❤️ for the Pandharpur Wari community** 🙏
