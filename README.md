# Pikl Call Center QA Assistant

AI-powered quality assurance tool for automatically transcribing and scoring call center recordings against compliance checklists.

## Overview

Pikl's contact center currently faces a 50% compliance failure rate with manual QA processes covering only ~5% of calls. This prototype automates the QA process using AI to:

- Transcribe call recordings with speaker identification
- Score calls against 10 QA criteria
- Generate actionable feedback reports for agents
- Identify compliance breaches automatically

## Key Features

- **Manual Call Upload** - Web interface for uploading MP3/WAV recordings
- **Automated Transcription** - Convert audio to text with speaker labels using AssemblyAI
- **AI-Powered Scoring** - Evaluate calls against QA criteria using Claude 3.5 Sonnet
- **Agent Feedback Reports** - Generate detailed reports with:
  - Overall QA score (0-100)
  - Category-by-category breakdown
  - Specific coaching recommendations
  - Compliance flags for critical issues
- **Simple Dashboard** - View analyzed calls with scores and status

## QA Scoring Framework

Each call is evaluated across 10 categories (scored 0-5):

1. Greeting & Identification (10%)
2. Call Control & Structure (10%)
3. Active Listening & Empathy (10%)
4. Questioning & Discovery (10%)
5. Accuracy of Information (15%)
6. **Compliance & Disclosures** (15% - critical)
7. **Handling of Sensitive Data** (10% - critical)
8. Call Resolution & Next Steps (10%)
9. Professionalism & Tone (5%)
10. Documentation Quality (5%)

**Pass Requirement:** 70% weighted score AND no critical failures

## Tech Stack

- **Backend:** Python 3.11+ with Flask
- **Frontend:** Streamlit (Python-based UI)
- **Transcription:** AssemblyAI API
- **Analysis:** Anthropic Claude API (Claude 3.5 Sonnet)
- **Storage:** Local JSON files and file system

## Project Structure

```
pikl-qa-assist/
├── app.py                 # Main Streamlit application
├── transcribe.py          # AssemblyAI integration
├── analyze.py             # Claude API scoring logic
├── requirements.txt       # Python dependencies
├── config.py              # API keys and settings
├── recordings/            # Uploaded audio files
├── results/               # JSON analysis results
└── reports/               # Exported reports
```

## Installation

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up API keys in config.py or .env.local

# 4. Run the app
streamlit run app.py
```

## Prerequisites

- Python 3.11 or higher
- API keys for:
  - [AssemblyAI](https://www.assemblyai.com/) (transcription)
  - [Anthropic Claude](https://console.anthropic.com/) (analysis)

## Success Metrics

- Process and score 10+ call recordings
- QA scores align with human evaluators (±15% variance)
- Generate actionable feedback in <2 minutes per call
- Board demo-ready within 2-3 weeks

## Cost Estimate

- **Per call:** ~$0.40 (transcription + analysis)
- **Prototype phase:** ~$40-50 for 50 test calls
- **Production estimate:** ~$120/month for 300 calls
- **ROI:** 15x in labor savings

## Development Phases

### Phase 1: Core Engine (Week 1)
- Set up Python environment and API integrations
- Build transcription and scoring pipeline
- Test with 5 sample calls

### Phase 2: Simple UI (Week 2)
- Build Streamlit interface
- Add file upload and results display
- Implement report export

### Phase 3: Refinement (Week 3)
- Refine prompts based on results
- Add error handling and polish
- Prepare demo materials

## Out of Scope (v1)

- 3CX API integration
- Multi-user authentication
- Real-time call monitoring
- Cloud infrastructure
- Production deployment

## Documentation

- Full PRD available in [PRD.md](PRD.md)
- Scope decisions in [SCOPE_DECISION.md](SCOPE_DECISION.md)

## License

ISC

## Status

Prototype v1.0 - In Development
