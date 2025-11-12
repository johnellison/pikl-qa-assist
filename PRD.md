# Product Requirements Document (PRD)
## Pikl Call Center QA Assistant - Prototype v1.0

---

## 1. Executive Summary

### Problem
Pikl's contact center currently has a 50% compliance failure rate. QA is entirely manual: one manager reviews one call per agent per month using a detailed checklist. This approach:
- Covers only ~5% of calls
- Takes hours per agent
- Provides inconsistent, delayed feedback
- Cannot scale with team growth

### Solution
An AI-powered QA assistant that automatically transcribes and scores call recordings against Pikl's existing QA checklist, generating actionable feedback reports for agents and managers.

### Success Metrics for Prototype
- ✅ Successfully process and score 10+ call recordings
- ✅ Generate QA scores that align with human evaluator scores (±15% variance)
- ✅ Produce actionable agent feedback in <2 minutes per call
- ✅ Board demo-ready within 2-3 weeks

---

## 2. Scope Definition

### 🎯 IN SCOPE (Prototype MVP)

#### Core Features
1. **Manual Call Upload** - Simple web interface to upload MP3/WAV call recordings
2. **Automated Transcription** - Convert audio to text with speaker labels
3. **AI-Powered Scoring** - Evaluate calls against 10 QA criteria
4. **Agent Feedback Report** - Generate per-call report with:
   - Overall QA score (0-100)
   - Category-by-category breakdown
   - 2-3 specific coaching recommendations
   - Compliance flags (critical issues)
5. **Simple Dashboard** - View list of analyzed calls with scores and status

#### Technical Scope
- Process recordings up to 30 minutes
- Support 2 common audio formats (MP3, WAV)
- Store up to 100 call analyses
- Single-user access (no authentication required for prototype)
- Run locally on your machine

### ⛔ OUT OF SCOPE (Post-Prototype)

- 3CX API integration (manual upload only for v1)
- Multi-user authentication/permissions
- Real-time call monitoring
- Agent performance dashboards over time
- Database/cloud infrastructure
- Call scheduling or automated fetching
- Integration with LMS or HR systems
- Advanced analytics or sentiment analysis
- Mobile responsiveness
- Production deployment

---

## 3. User Stories

### Primary User: QA Manager

**As a QA Manager, I want to:**
1. Upload a call recording and get an automated QA score so I can review more calls in less time
2. See specific examples from the transcript where the agent succeeded or failed on criteria
3. Generate a feedback report I can share with the agent immediately after review
4. Identify compliance breaches automatically so I can prioritize critical coaching

### Secondary User: Team Leader

**As a Team Leader, I want to:**
1. Review QA results for my team members quickly
2. Understand which agents need immediate coaching vs. who is performing well
3. See clear, actionable feedback I can discuss in 1-on-1s

---

## 4. QA Scoring Framework

### 10 Evaluation Categories (Based on Existing QA Checklist)

Each category scored 0-5:
- **5** - Excellent (exceeded standards)
- **4** - Good (met all standards)
- **3** - Adequate (met most standards, minor gaps)
- **2** - Needs improvement (missed key elements)
- **1** - Poor (significant failures)
- **0** - Critical failure (compliance breach)

| # | Category | Weight | Pass Threshold |
|---|----------|--------|----------------|
| 1 | Greeting & Identification | 10% | 3+ |
| 2 | Call Control & Structure | 10% | 3+ |
| 3 | Active Listening & Empathy | 10% | 3+ |
| 4 | Questioning & Discovery | 10% | 3+ |
| 5 | Accuracy of Information | 15% | 3+ |
| 6 | **Compliance & Disclosures** | 15% | 4+ (critical) |
| 7 | Handling of Sensitive Data | 10% | 4+ (critical) |
| 8 | Call Resolution & Next Steps | 10% | 3+ |
| 9 | Professionalism & Tone | 5% | 3+ |
| 10 | Documentation Quality | 5% | 3+ |

**Overall Pass Requirement:** 70% weighted score AND no critical failures (categories 6-7 must score 4+)

---

## 5. Technical Architecture (Simplified)

### Recommended Stack for Prototype

**Why this approach:** Optimized for speed of development by a non-developer using Claude Code. Avoids unnecessary complexity while remaining functional.

#### Backend
- **Language:** Python 3.11+
- **Framework:** Flask (minimal web framework)
- **Why:** Simpler than Next.js/Express for this use case; excellent AI/ML library support

#### AI Services
- **Transcription:** AssemblyAI API or OpenAI Whisper API
  - Speaker diarization (identify agent vs. customer)
  - Timestamp alignment
- **Analysis:** Anthropic Claude API (Claude 3.5 Sonnet)
  - Structured output for scoring
  - Context window supports full call transcripts

#### Storage
- **File System:** Local JSON files for call data
- **Audio Storage:** Local `/recordings` folder
- **Why:** Eliminates database setup; sufficient for 100-call prototype

#### Frontend
- **Option A (Recommended):** Streamlit
  - Python-based UI framework
  - Zero JavaScript required
  - Built-in file upload, forms, charts
  - Can build entire UI in <200 lines of Python

- **Option B:** Simple HTML + Vanilla JavaScript
  - If you prefer traditional web UI
  - Flask serves static files

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (Streamlit or Flask HTML)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                Flask Backend API                         │
│  - Upload endpoint                                       │
│  - Process call endpoint                                 │
│  - Get results endpoint                                  │
└────────┬──────────────────────────────┬─────────────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐         ┌─────────────────────────┐
│  AssemblyAI API  │         │   Anthropic Claude API  │
│  (Transcription) │         │   (Analysis & Scoring)  │
└──────────────────┘         └─────────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         ▼
              ┌────────────────────┐
              │   Local Storage    │
              │  - recordings/     │
              │  - results/        │
              │  - reports/        │
              └────────────────────┘
```

---

## 6. Core User Flow

### Happy Path: Analyzing a Call

```
1. User opens web interface (http://localhost:8080)

2. User clicks "Upload New Call Recording"
   - Selects MP3/WAV file from computer
   - Enters agent name
   - (Optional) Enters call date/ID
   - Clicks "Analyze Call"

3. System processes call:
   ⏳ "Transcribing audio..." (30-90 seconds)
   ⏳ "Analyzing against QA criteria..." (15-30 seconds)
   ⏳ "Generating report..." (10 seconds)

4. User sees results page:
   - Overall score (72/100)
   - Category breakdown with scores
   - Key strengths (2-3 bullet points)
   - Areas for improvement (2-3 specific examples)
   - Compliance flags (if any)
   - Full transcript with timestamps

5. User clicks "Download Report" (PDF or Markdown)

6. User returns to dashboard to review other calls
```

---

## 7. Data Model

### Call Analysis Record (JSON)

```json
{
  "id": "call_20250112_0001",
  "agent_name": "Sarah Johnson",
  "upload_date": "2025-01-12T14:30:00Z",
  "audio_file": "recordings/call_20250112_0001.mp3",
  "duration_seconds": 420,
  "status": "completed",

  "transcript": {
    "full_text": "...",
    "segments": [
      {
        "speaker": "agent",
        "text": "Good morning, Pikl Insurance, Sarah speaking...",
        "timestamp": "00:00:03"
      }
    ]
  },

  "qa_scores": {
    "overall_score": 72,
    "overall_percentage": 72,
    "pass_status": "PASS",

    "categories": [
      {
        "name": "Greeting & Identification",
        "score": 4,
        "max_score": 5,
        "percentage": 80,
        "weight": 10,
        "notes": "Agent greeted professionally and identified company. Did not explicitly verify customer identity before proceeding.",
        "evidence": ["Transcript line 1-3"]
      }
    ],

    "compliance_flags": [
      {
        "severity": "medium",
        "category": "Compliance & Disclosures",
        "issue": "Did not mention call recording disclosure",
        "timestamp": "00:00:05"
      }
    ]
  },

  "feedback": {
    "strengths": [
      "Excellent empathetic tone throughout the call",
      "Clear explanation of policy coverage and next steps"
    ],
    "improvements": [
      "Always state 'this call is being recorded' in your greeting",
      "Ask for name and date of birth before accessing policy details"
    ],
    "priority_actions": [
      "Review data protection compliance script before next shift"
    ]
  }
}
```

---

## 8. AI Prompting Strategy

### Transcription (AssemblyAI)
- Enable speaker diarization: 2 speakers (agent, customer)
- Enable punctuation and formatting
- Return timestamped segments

### Analysis (Claude 3.5 Sonnet)

**Prompt Structure:**
```
You are an expert call center QA evaluator for Pikl Insurance.

CONTEXT:
- Pikl provides specialist insurance for short-term rental properties
- Agents must follow strict compliance rules (FCA regulated)
- Calls involve complex products, multiple insurers, and legacy systems

YOUR TASK:
Evaluate this call transcript against the 10 QA criteria below.
For each criterion, assign a score (0-5) and provide specific evidence.

QA CRITERIA:
[Include detailed rubric for each of the 10 categories]

TRANSCRIPT:
[Insert transcript with speaker labels]

OUTPUT FORMAT:
Return a structured JSON object with:
- scores for each category
- specific transcript quotes as evidence
- 2-3 coaching recommendations
- any compliance flags
```

**Why Claude over GPT-4:**
- Longer context window (200K tokens)
- Better at following complex rubrics
- More nuanced understanding of compliance language
- Structured output capability

---

## 9. MVP Features Breakdown

### Phase 1: Core Engine (Week 1)
**Goal:** Get transcription + scoring working end-to-end

- [ ] Set up Python environment and API keys
- [ ] Build audio transcription pipeline (AssemblyAI integration)
- [ ] Create QA evaluation prompt for Claude API
- [ ] Test with 5 sample calls and validate scores manually
- [ ] Store results as JSON files

**Deliverable:** Command-line tool that processes a call and outputs JSON

---

### Phase 2: Simple UI (Week 2)
**Goal:** Make it demo-able with a web interface

- [ ] Build Streamlit interface with:
  - File upload component
  - Processing status indicator
  - Results display page
  - Simple list of analyzed calls
- [ ] Add report export (Markdown format)
- [ ] Polish UI for board presentation

**Deliverable:** Web app that can be run locally and demoed live

---

### Phase 3: Refinement (Week 3)
**Goal:** Improve accuracy and add polish for demo

- [ ] Refine prompts based on initial results
- [ ] Add better error handling
- [ ] Create 2-3 sample reports to show in deck
- [ ] Add basic CSS styling
- [ ] Prepare demo script

**Deliverable:** Polished prototype ready for board demo

---

## 10. Success Criteria

### Minimum Viable Demo

The prototype must demonstrate:

1. ✅ **Upload & Process:** Successfully transcribe and analyze a call recording
2. ✅ **Accurate Scoring:** QA scores align with human evaluation (tested on 5 calls)
3. ✅ **Actionable Feedback:** Generate specific, useful coaching recommendations
4. ✅ **Compliance Detection:** Flag critical compliance failures automatically
5. ✅ **Speed:** Process a 10-minute call in under 2 minutes

### Board Demo Talking Points

- "This call would have taken a QA manager 30 minutes to review manually"
- "The AI identified a compliance breach that was missed in the original review"
- "We can now scale from 1 call per agent per month to 10+ calls"
- "Agents can receive feedback within hours instead of weeks"

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI scoring doesn't match human judgment | High | Start with 10 test calls with known scores; refine prompts iteratively |
| Transcription accuracy poor on noisy calls | Medium | Use AssemblyAI's noise reduction; set quality threshold |
| API costs exceed budget for demo | Low | Use tier limits; ~$5 per call (acceptable for 20-call demo) |
| Technical complexity too high | Medium | Use Streamlit instead of React; avoid database setup |
| Board wants production-ready system | Medium | Set expectations: this is a proof-of-concept, not production code |

---

## 12. Open Questions for Stakeholders

Before starting development, clarify:

1. **Sample Calls:** Can you provide 10-15 representative call recordings (mix of good/bad/average)?
2. **Existing Scores:** Do you have human QA scores for any recent calls we can use as ground truth?
3. **Critical Criteria:** Are there any categories that are absolute pass/fail (auto-fail the call)?
4. **Compliance Scripts:** Do you have the exact wording agents must use for disclosures?
5. **Board Demo Date:** What's the target date for the demo?
6. **Budget:** What's the budget for API costs during prototype phase? (~$100-200 for 20-30 calls)

---

## 13. Next Steps

### Immediate Actions (This Week)

1. **Get approval on this PRD** - Review with key stakeholders
2. **Gather sample calls** - Collect 10-15 recordings with diverse scenarios
3. **Set up API accounts:**
   - AssemblyAI (transcription) - [https://www.assemblyai.com/](https://www.assemblyai.com/)
   - Anthropic Claude - [https://console.anthropic.com/](https://console.anthropic.com/)
4. **Create project repository** - Initialize Git repo and basic folder structure

### Week 1: Build Core Engine
- Set up Python environment
- Integrate transcription API
- Build scoring engine
- Test with 5 calls

### Week 2: Build Interface
- Create Streamlit UI
- Add file upload and results display
- Generate exportable reports

### Week 3: Polish & Demo Prep
- Refine based on test results
- Create demo materials
- Practice demo flow
- Prepare board presentation

---

## 14. Technical Setup Guide (Quick Start)

### Prerequisites
- Python 3.11+ installed
- Text editor (VS Code recommended)
- Terminal/command line access
- API keys (AssemblyAI, Anthropic)

### Project Structure
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

### Installation Steps
```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up API keys in config.py

# 4. Run the app
streamlit run app.py
```

---

## 15. Cost Estimate (Prototype Phase)

### Per-Call Costs
- AssemblyAI transcription: ~$0.25 per 10-min call
- Claude API analysis: ~$0.15 per call (with caching)
- **Total per call: ~$0.40**

### Prototype Budget
- 50 test calls for development: ~$20
- 20 calls for demo preparation: ~$8
- Buffer for re-processing: ~$12
- **Total prototype cost: ~$40-50**

### Post-Prototype (Monthly Estimate)
- 30 agents × 10 calls/month = 300 calls
- 300 × $0.40 = **$120/month**
- vs. QA Manager time savings: ~60 hours/month @ £30/hr = **£1,800 saved**

**ROI: 15x in labor savings alone**

---

## 16. Appendix: Example Report Output

```markdown
# Call QA Report

**Agent:** Sarah Johnson
**Date:** 12 January 2025
**Call Duration:** 7:23
**Overall Score:** 72/100 (PASS)

---

## Summary

Sarah handled this call professionally and resolved the customer's query about top-up insurance eligibility. However, there were compliance gaps in the opening (data protection verification) that must be addressed before the next shift.

---

## Category Scores

| Category | Score | Status | Notes |
|----------|-------|--------|-------|
| Greeting & Identification | 4/5 | ✅ Pass | Professional greeting; missed DPA check |
| Call Control & Structure | 5/5 | ✅ Pass | Excellent flow and hold management |
| Active Listening & Empathy | 5/5 | ✅ Pass | Customer felt heard and supported |
| Questioning & Discovery | 4/5 | ✅ Pass | Good probing on property type |
| Accuracy of Information | 4/5 | ✅ Pass | Correct advice on top-up eligibility |
| Compliance & Disclosures | 2/5 | ⚠️ FLAG | Missing call recording disclosure |
| Handling of Sensitive Data | 4/5 | ✅ Pass | Handled payment info appropriately |
| Call Resolution & Next Steps | 4/5 | ✅ Pass | Clear summary of next steps |
| Professionalism & Tone | 5/5 | ✅ Pass | Friendly and patient throughout |
| Documentation Quality | 3/5 | ✅ Pass | Notes recorded but lacked detail |

---

## 🌟 Key Strengths

1. **Excellent empathy and tone** - Customer mentioned feeling "reassured" after speaking with you
2. **Strong product knowledge** - Accurately explained top-up vs. all-in-one policy differences
3. **Good call structure** - Efficiently moved from problem to solution without rushing

---

## 🎯 Areas for Improvement

1. **Compliance - PRIORITY**
   ⚠️ You did not state "this call is being recorded" in your opening greeting.
   📍 This happened at 00:00:05 in the transcript.
   ✅ **Action:** Review the opening script before your next shift. This is a regulatory requirement.

2. **Data Protection Verification**
   You accessed policy details before confirming the customer's name and date of birth.
   ✅ **Action:** Always verify identity using the DPA script before discussing any policy info.

3. **Documentation Detail**
   System notes were brief and didn't capture all the property details discussed (e.g., number of letting days, platform used).
   ✅ **Action:** Use the structured notes template in OpenGI to ensure completeness.

---

## 📋 Compliance Flags

| Severity | Issue | Timestamp | Required Action |
|----------|-------|-----------|----------------|
| 🔴 HIGH | Call recording disclosure not stated | 00:00:05 | Mandatory training required |
| 🟡 MEDIUM | DPA verification skipped | 00:00:45 | Review DPA script |

---

## 📈 Next Steps

1. Meet with Team Leader to review compliance gaps
2. Complete refresher training on opening scripts
3. Target score of 85+ on next call review

---

**Reviewed by:** AI QA Assistant
**Generated:** 12 January 2025 14:35
```

---

## Document Control

**Version:** 1.0
**Date:** 12 January 2025
**Author:** Product Strategy (with AI assistance)
**Status:** Draft for Review
**Next Review:** Post-stakeholder feedback

---

**Approval Sign-off:**

- [ ] Product Manager
- [ ] QA Manager (Pikl)
- [ ] Technical Lead
- [ ] Board Representative (if required)
