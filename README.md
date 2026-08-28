# WariVaani (वारीवाणी)

WariVaani is a grounded Marathi voice helper for the Pandharpur Wari. The local
pipeline uses AI4Bharat IndicConformer for speech recognition, deterministic
backend tools for facts and reporting, and Sarvam Bulbul v3 for speech output.

## Supported STT environment

The Marathi checkpoint requires AI4Bharat's `nemo-v2` fork. AI4Bharat documents
WSL as the supported route on Windows. Do not install NVIDIA NeMo 3.x for this
checkpoint and do not add compatibility monkeypatches.

The old `venv` directories in this checkout may refer to a removed Python 3.10
installation. Create a fresh environment rather than reusing them.

### Exact installation commands (Windows laptop, WSL2/Ubuntu, CPU)

Run the first command in an Administrator PowerShell window if WSL is not
already installed, then restart when Windows asks:

```powershell
wsl --install -d Ubuntu
```

Run the remaining commands inside Ubuntu/WSL from the repository directory:

```bash
sudo apt-get update
sudo apt-get install -y python3.10 python3.10-venv git ffmpeg libsndfile1 portaudio19-dev

cd /mnt/d/WariVanni/warivaani
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel

# CPU-only PyTorch for Intel Iris Xe / no CUDA
python -m pip install torch==2.2.2 torchaudio==2.2.2 \
  --index-url https://download.pytorch.org/whl/cpu

python -m pip install -r backend/requirements.txt
python -m pip uninstall -y nemo_toolkit
python -m pip install -r backend/requirements-indicconformer.txt
```

The final requirements file installs the official AI4Bharat fork from its
`nemo-v2` branch. Apex and CUDA are not needed for CPU inference.

## Hugging Face access

1. Sign in at <https://huggingface.co/>.
2. Open <https://huggingface.co/ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large>.
3. Accept the model's contact-information/access conditions.
4. Create a read token at <https://huggingface.co/settings/tokens>.
5. Copy `.env.example` to `.env` and put the token in `HF_TOKEN`. Never commit
   the token.

## Environment values

```env
STT_PROVIDER=indicconformer
STT_LANGUAGE=mr
HF_TOKEN=hf_your_read_token

TTS_PROVIDER=sarvam
TTS_LANGUAGE=mr-IN
SARVAM_API_KEY=your_sarvam_api_key
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TTS_LANGUAGE=mr-IN
SARVAM_TTS_SPEAKER=shubh
SARVAM_TTS_SAMPLE_RATE=16000
```

`STT_PROVIDER=whisper` is the only way to select the explicit Whisper fallback.
An IndicConformer load failure never switches providers silently.

## Run

Start the database from a PowerShell window:

```powershell
cd D:\WariVanni\warivaani
docker compose up -d db
```

Run the voice pipeline inside the configured environment:

```bash
cd /mnt/d/WariVanni/warivaani/backend
source ../.venv/bin/activate
python -m app.speech.voice_cli
```

On a successful model load, startup includes:

```text
STT: AI4Bharat IndicConformer Marathi
Model: ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large
Decoder: CTC
Device: CPU
```

Each turn logs grounded routing and latency separately:

```text
Raw STT: पालकी कुटे आहे
Normalized: पालखी कुठे आहे
Intent: GET_PALKHI_LOCATION
Intent confidence: 1.00
Agent response: माऊलींची पालखी सध्या सासवडजवळ आहे. पुढचा नियोजित थांबा जेजुरी आहे.

Latency:
STT: 1.42 sec
Normalization + intent: 0.01 sec
Backend: 0.02 sec
TTS first audio: 0.31 sec
Total: 1.76 sec
```

## Tests

```bash
cd /mnt/d/WariVanni/warivaani/backend
source ../.venv/bin/activate
pytest tests -q
```

Manual speech checklist:

- `पालखी कुठे आहे?` — answers from `get_palkhi_location_tool()`.
- `माऊली कुठवर आली?` — routes to the same grounded tool.
- `जवळ डॉक्टर कुठे मिळतील?` — asks for the caller's village if needed.
- `माझी मुलगी हरवली आहे.` — asks naturally for her name.
- `आकांक्षा` — asks आकांक्षा's age.
- `ती पाच वर्षांची आहे` — records age 5 and asks about clothing.
- `गुलाबी फ्रॉक घातला आहे` — asks where she was last seen.
- `सासवडला दिसली होती` — asks for a contact number.

For missing-person testing, continue with a phone number, confirm the summary,
and verify that the returned ticket exists in the database.
