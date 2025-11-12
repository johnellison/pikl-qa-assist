# Pikl QA Assistant - Task Breakdown & Execution Plan
## RAG-Optimized for Multi-Agent Development

**Last Updated:** 2025-01-12
**Project Phase:** Prototype MVP
**Target Completion:** 18 days

---

## Task Execution Strategy

### Context Window Management
- **Max tokens per task:** 50K tokens
- **Task independence:** Each task can be executed without loading full codebase
- **Handoff protocol:** Each task produces clear output artifacts for next task
- **Validation:** Unit tests per component before integration

### Agent Assignment Strategy
- **Main (Claude Sonnet 4.5):** Core logic, AI integration, complex algorithms
- **Fallback (GPT-4):** UI components, simple CRUD, configuration files
- **Research (Perplexity):** API documentation review, library selection, best practices

---

## Phase 1: Foundation & Research (Days 1-3)

### TASK 1.1: Research & API Validation
**Agent:** Research (Perplexity)
**Estimated Time:** 2 hours
**Dependencies:** None

**Objectives:**
- [ ] Research 3CX Call Control API authentication flow
- [ ] Identify exact endpoints for call recording retrieval
- [ ] Research AssemblyAI transcription API capabilities
- [ ] Compare transcription providers (AssemblyAI vs OpenAI Whisper)
- [ ] Document API rate limits and costs

**Deliverables:**
- `docs/api-research.md` - Comprehensive API documentation summary
- `docs/cost-analysis.md` - Per-call cost breakdown
- `docs/3cx-integration-guide.md` - Step-by-step 3CX integration approach

**Success Criteria:**
- Clear documentation of all API endpoints needed
- Cost estimates validated
- Authentication method confirmed

---

### TASK 1.2: Project Structure Setup
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 1 hour
**Dependencies:** None

**Objectives:**
- [ ] Create Python project structure
- [ ] Set up virtual environment
- [ ] Create requirements.txt with all dependencies
- [ ] Initialize git repository (if not already done)
- [ ] Create .gitignore for Python project
- [ ] Set up environment variable management

**Deliverables:**
```
pikl-qa-assist/
├── .env.local (already exists)
├── .gitignore
├── requirements.txt
├── README.md
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   └── models.py
├── services/
│   ├── __init__.py
│   ├── transcription.py
│   ├── analysis.py
│   └── cx_integration.py
├── utils/
│   ├── __init__.py
│   └── file_handler.py
├── prompts/
│   └── qa_evaluation.txt
├── recordings/
├── results/
└── tests/
    ├── __init__.py
    └── test_transcription.py
```

**Success Criteria:**
- `pip install -r requirements.txt` runs successfully
- All directories created
- Environment variables load correctly

---

### TASK 1.3: Configuration Management
**Agent:** Fallback (GPT-4)
**Estimated Time:** 1 hour
**Dependencies:** TASK 1.2

**Objectives:**
- [ ] Create config.py for centralized settings
- [ ] Load API keys from .env.local
- [ ] Define QA scoring rubric as configuration
- [ ] Set up logging configuration
- [ ] Create constants for file paths and settings

**Deliverables:**
- `app/config.py` - Complete configuration module
- `app/constants.py` - All constants and enums

**Success Criteria:**
- Config loads without errors
- All API keys accessible via config module
- QA rubric fully defined

---

## Phase 2: Core Services (Days 4-8)

### TASK 2.1: Transcription Service (Manual Upload)
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 4 hours
**Dependencies:** TASK 1.2, TASK 1.3

**Objectives:**
- [ ] Create AssemblyAI integration module
- [ ] Implement audio file upload and validation
- [ ] Enable speaker diarization (agent vs customer)
- [ ] Add timestamp generation
- [ ] Implement error handling and retries
- [ ] Save transcripts to JSON format

**Input:**
- Audio file path (MP3/WAV)
- Agent name (metadata)
- Call date (metadata)

**Output:**
```json
{
  "id": "call_001",
  "audio_file": "recordings/call_001.mp3",
  "duration": 420,
  "transcript": {
    "full_text": "...",
    "segments": [
      {
        "speaker": "agent",
        "text": "Good morning...",
        "timestamp": "00:00:03",
        "confidence": 0.95
      }
    ]
  }
}
```

**Success Criteria:**
- Successfully transcribes 60-minute call
- Speaker diarization accuracy > 90%
- Handles common audio formats (MP3, WAV)
- Processing time < 90 seconds for 10-min call

**Test Cases:**
- Upload 5MB MP3 file
- Upload 60-minute WAV file
- Handle corrupted audio file (error handling)

---

### TASK 2.2: QA Evaluation Prompt Engineering
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 3 hours
**Dependencies:** TASK 1.3

**Objectives:**
- [ ] Design comprehensive QA evaluation prompt
- [ ] Define structured output format (JSON schema)
- [ ] Create scoring rubric for each of 10 categories
- [ ] Add examples for each scoring level (0-5)
- [ ] Include Pikl-specific compliance requirements
- [ ] Test prompt with sample transcripts

**Deliverables:**
- `prompts/qa_evaluation_v1.txt` - Main evaluation prompt
- `prompts/scoring_rubric.json` - Detailed scoring criteria
- `prompts/examples.md` - Example evaluations

**Prompt Structure:**
```
ROLE: Expert QA evaluator for Pikl Insurance

CONTEXT:
- FCA-regulated insurance company
- Short-term rental property insurance
- Complex products across multiple underwriters
- Strict compliance requirements

TASK:
Evaluate call transcript against 10 QA criteria.

INPUT TRANSCRIPT:
[transcript]

SCORING RUBRIC:
[detailed rubric for each category]

OUTPUT FORMAT:
{
  "overall_score": 0-100,
  "categories": [...],
  "compliance_flags": [...],
  "feedback": {...}
}
```

**Success Criteria:**
- Prompt produces consistent scores across runs
- Output format is valid JSON
- Scores align with human evaluation (±10%)

---

### TASK 2.3: Analysis Service (Claude Integration)
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 4 hours
**Dependencies:** TASK 2.1, TASK 2.2

**Objectives:**
- [ ] Create Anthropic Claude API integration
- [ ] Implement prompt template system
- [ ] Add structured output parsing
- [ ] Calculate weighted scores
- [ ] Generate coaching recommendations
- [ ] Identify compliance breaches
- [ ] Handle API errors and retries

**Input:**
- Transcript JSON (from TASK 2.1)
- Agent metadata

**Output:**
```json
{
  "call_id": "call_001",
  "analysis_timestamp": "2025-01-12T14:30:00Z",
  "overall_score": 72,
  "pass_status": "PASS",
  "categories": [
    {
      "name": "Greeting & Identification",
      "score": 4,
      "weight": 10,
      "notes": "...",
      "evidence": ["line 3-5"]
    }
  ],
  "compliance_flags": [...],
  "feedback": {
    "strengths": [...],
    "improvements": [...],
    "priority_actions": [...]
  }
}
```

**Success Criteria:**
- Analysis completes in < 30 seconds
- Valid JSON output every time
- Scores are mathematically correct
- Evidence cites actual transcript lines

**Test Cases:**
- Analyze transcript with perfect call
- Analyze call with compliance breach
- Analyze call with missing data (error handling)

---

### TASK 2.4: File Storage & Retrieval
**Agent:** Fallback (GPT-4)
**Estimated Time:** 2 hours
**Dependencies:** TASK 1.2

**Objectives:**
- [ ] Create file management utilities
- [ ] Implement JSON storage for results
- [ ] Add audio file organization
- [ ] Create retrieval functions
- [ ] Add file cleanup utilities
- [ ] Implement search/filter functions

**Deliverables:**
- `utils/file_handler.py` - Complete file management module

**Functions:**
- `save_transcript(call_id, transcript_data)`
- `save_analysis(call_id, analysis_data)`
- `get_call_by_id(call_id)`
- `list_all_calls(filters=None)`
- `delete_call(call_id)`

**Success Criteria:**
- All CRUD operations work
- No file corruption
- Efficient retrieval (< 100ms)

---

### TASK 2.5: End-to-End Pipeline Integration
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 3 hours
**Dependencies:** TASK 2.1, TASK 2.3, TASK 2.4

**Objectives:**
- [ ] Create main pipeline orchestration
- [ ] Connect transcription → analysis → storage
- [ ] Add progress tracking
- [ ] Implement error recovery
- [ ] Add logging throughout pipeline
- [ ] Create status reporting

**Flow:**
```python
def process_call(audio_file_path, agent_name):
    # 1. Transcribe
    transcript = transcription_service.transcribe(audio_file_path)

    # 2. Analyze
    analysis = analysis_service.evaluate(transcript)

    # 3. Store
    file_handler.save_results(call_id, transcript, analysis)

    return analysis
```

**Success Criteria:**
- Process complete call end-to-end
- All intermediate artifacts saved
- Clear error messages at each stage
- Processing time logged

---

## Phase 3: 3CX Integration (Days 9-11)

### TASK 3.1: 3CX API Authentication
**Agent:** Research (Perplexity) → Main (Claude)
**Estimated Time:** 3 hours
**Dependencies:** TASK 1.1

**Objectives:**
- [ ] Research: Get latest 3CX auth documentation
- [ ] Implement API key authentication
- [ ] Test connection to 3CX system
- [ ] Handle auth errors gracefully
- [ ] Store credentials securely

**Deliverables:**
- `services/cx_integration.py` - 3CX client module
- `docs/3cx-setup.md` - Setup instructions

**Success Criteria:**
- Successfully authenticate with 3CX
- Retrieve test call metadata
- Error handling for invalid credentials

---

### TASK 3.2: Call Recording Retrieval
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 4 hours
**Dependencies:** TASK 3.1

**Objectives:**
- [ ] Query calls by agent and date range
- [ ] Download call recordings to local storage
- [ ] Handle different audio formats
- [ ] Add metadata extraction (duration, participants)
- [ ] Implement pagination for large result sets
- [ ] Add filtering options

**Functions:**
- `get_calls_for_agent(agent_name, start_date, end_date)`
- `download_recording(call_id, destination)`
- `get_call_metadata(call_id)`

**Success Criteria:**
- Retrieve and download 10 calls successfully
- Metadata correctly extracted
- Handles missing recordings gracefully

---

### TASK 3.3: Automated Batch Processing
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 3 hours
**Dependencies:** TASK 3.2, TASK 2.5

**Objectives:**
- [ ] Create batch processing script
- [ ] Schedule automated fetching (optional)
- [ ] Process multiple calls in sequence
- [ ] Generate summary reports
- [ ] Add progress indicators

**Deliverables:**
- `scripts/batch_process.py` - Batch processing script

**Usage:**
```bash
python scripts/batch_process.py --agent "Sarah Johnson" --date 2025-01-10
```

**Success Criteria:**
- Process 10 calls without manual intervention
- Generate combined report
- Robust error handling (continue on failure)

---

## Phase 4: User Interface (Days 12-15)

### TASK 4.1: Streamlit App Structure
**Agent:** Fallback (GPT-4)
**Estimated Time:** 2 hours
**Dependencies:** TASK 2.5

**Objectives:**
- [ ] Create main Streamlit application
- [ ] Design page layout and navigation
- [ ] Add sidebar for settings
- [ ] Create page structure (upload, results, dashboard)
- [ ] Style with custom CSS

**Deliverables:**
- `app/main.py` - Main Streamlit app
- `app/styles.css` - Custom styling

**Pages:**
1. Upload & Process Call
2. View Results
3. Call Dashboard
4. Settings (3CX configuration)

**Success Criteria:**
- App launches without errors
- Navigation works smoothly
- Responsive layout

---

### TASK 4.2: Upload & Processing Page
**Agent:** Fallback (GPT-4)
**Estimated Time:** 3 hours
**Dependencies:** TASK 4.1, TASK 2.5

**Objectives:**
- [ ] Create file upload component
- [ ] Add form for agent metadata
- [ ] Implement processing trigger
- [ ] Show real-time progress
- [ ] Display results after processing
- [ ] Add error messages for failed uploads

**UI Elements:**
- File uploader (accepts MP3, WAV)
- Text input for agent name
- Date picker for call date
- "Analyze Call" button
- Progress bar with status messages
- Results summary panel

**Success Criteria:**
- Upload 50MB file successfully
- Progress updates in real-time
- Results display correctly

---

### TASK 4.3: Results Display Page
**Agent:** Fallback (GPT-4)
**Estimated Time:** 4 hours
**Dependencies:** TASK 4.1, TASK 2.4

**Objectives:**
- [ ] Display overall QA score with visual indicator
- [ ] Show category breakdown (bar chart or table)
- [ ] Display compliance flags prominently
- [ ] Show feedback sections (strengths, improvements)
- [ ] Display full transcript with highlighting
- [ ] Add export to PDF/Markdown
- [ ] Include download button for report

**Visual Components:**
- Score gauge (0-100)
- Category score table
- Compliance alert boxes
- Feedback cards
- Collapsible transcript viewer
- Export buttons

**Success Criteria:**
- All data displays correctly
- Export generates readable report
- UI is clear and professional

---

### TASK 4.4: Dashboard & Call List
**Agent:** Fallback (GPT-4)
**Estimated Time:** 3 hours
**Dependencies:** TASK 4.1, TASK 2.4

**Objectives:**
- [ ] List all analyzed calls
- [ ] Add filtering and sorting
- [ ] Show summary statistics
- [ ] Enable drill-down to individual results
- [ ] Add delete functionality
- [ ] Show processing status for pending calls

**Features:**
- Table with: Agent, Date, Score, Status, Actions
- Filter by: Agent name, date range, pass/fail status
- Sort by: Date, score, agent
- Summary cards: Total calls, average score, pass rate
- Click to view detailed results

**Success Criteria:**
- List 100+ calls without performance issues
- Filters work correctly
- Navigation to details works

---

### TASK 4.5: 3CX Integration UI
**Agent:** Fallback (GPT-4)
**Estimated Time:** 3 hours
**Dependencies:** TASK 4.1, TASK 3.3

**Objectives:**
- [ ] Create 3CX settings page
- [ ] Add API key configuration
- [ ] Build call retrieval interface
- [ ] Show available calls from 3CX
- [ ] Enable bulk selection and processing
- [ ] Display sync status

**UI Elements:**
- API key input (secure)
- Connection test button
- Date range picker
- Agent selector
- Available calls table (from 3CX)
- Bulk select checkboxes
- "Fetch & Process Selected" button

**Success Criteria:**
- Connect to 3CX successfully
- Retrieve and display available calls
- Process selected calls

---

## Phase 5: Testing & Polish (Days 16-18)

### TASK 5.1: Validation Testing
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 4 hours
**Dependencies:** ALL previous tasks

**Objectives:**
- [ ] Test with 10 diverse call recordings
- [ ] Compare AI scores vs. human scores
- [ ] Document score variance
- [ ] Identify and fix scoring inconsistencies
- [ ] Test compliance flag detection
- [ ] Validate recommendations quality

**Test Suite:**
- 5 calls with known human scores
- 2 calls with compliance breaches
- 2 perfect calls
- 1 challenging/unclear call

**Success Criteria:**
- AI scores within ±10% of human scores
- 100% compliance breach detection
- Recommendations are specific and actionable

---

### TASK 5.2: Error Handling & Edge Cases
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 3 hours
**Dependencies:** TASK 5.1

**Objectives:**
- [ ] Test with corrupted audio files
- [ ] Test with very short calls (< 1 min)
- [ ] Test with very long calls (> 2 hours)
- [ ] Test with poor audio quality
- [ ] Test with non-English speakers
- [ ] Add graceful degradation

**Edge Cases to Handle:**
- No speech detected
- Single speaker (missing customer/agent)
- Background noise
- API timeouts
- Rate limit errors

**Success Criteria:**
- No crashes on edge cases
- Clear error messages
- Suggestions for resolution

---

### TASK 5.3: Documentation & Demo Prep
**Agent:** Fallback (GPT-4)
**Estimated Time:** 4 hours
**Dependencies:** ALL previous tasks

**Objectives:**
- [ ] Write comprehensive README
- [ ] Create user guide
- [ ] Document API integrations
- [ ] Create demo script for board presentation
- [ ] Generate 3 sample reports for demo
- [ ] Create demo video (optional)
- [ ] Prepare troubleshooting guide

**Deliverables:**
- `README.md` - Complete project documentation
- `docs/USER_GUIDE.md` - Step-by-step user instructions
- `docs/DEMO_SCRIPT.md` - Board presentation script
- `docs/TROUBLESHOOTING.md` - Common issues and fixes
- `demo/sample_reports/` - 3 example QA reports

**Success Criteria:**
- Non-technical person can follow README to run app
- Demo script covers all key features
- Sample reports look professional

---

### TASK 5.4: Performance Optimization
**Agent:** Main (Claude Sonnet)
**Estimated Time:** 2 hours
**Dependencies:** TASK 5.1

**Objectives:**
- [ ] Profile application performance
- [ ] Optimize slow operations
- [ ] Add caching where appropriate
- [ ] Reduce API calls where possible
- [ ] Optimize file I/O
- [ ] Add loading states in UI

**Targets:**
- Transcription: < 90 seconds for 10-min call
- Analysis: < 30 seconds
- UI responsiveness: < 500ms
- Memory usage: < 500MB

**Success Criteria:**
- All performance targets met
- No memory leaks
- Smooth UI experience

---

## Task Dependencies Visualization

```
PHASE 1 (Days 1-3)
└─ TASK 1.1 (Research) ─┐
└─ TASK 1.2 (Setup) ────┼─→ TASK 1.3 (Config)
                        │
PHASE 2 (Days 4-8)      │
└─ TASK 1.3 ────────────┼─→ TASK 2.1 (Transcription)
                        │   └─→ TASK 2.5 (Pipeline)
└─ TASK 1.3 ────────────┼─→ TASK 2.2 (Prompts)
                        │       └─→ TASK 2.3 (Analysis)
└─ TASK 1.2 ────────────┼─→ TASK 2.4 (Storage)     └─→ TASK 2.5
                        │
PHASE 3 (Days 9-11)     │
└─ TASK 1.1 ────────────┼─→ TASK 3.1 (Auth)
                        │       └─→ TASK 3.2 (Retrieval)
└─ TASK 2.5 ────────────┤            └─→ TASK 3.3 (Batch)
                        │
PHASE 4 (Days 12-15)    │
└─ TASK 2.5 ────────────┼─→ TASK 4.1 (Streamlit)
                        │       ├─→ TASK 4.2 (Upload)
                        │       ├─→ TASK 4.3 (Results)
└─ TASK 2.4 ────────────┤       ├─→ TASK 4.4 (Dashboard)
└─ TASK 3.3 ────────────┘       └─→ TASK 4.5 (3CX UI)
                                        │
PHASE 5 (Days 16-18)                    │
└─ ALL TASKS ───────────────────────────┼─→ TASK 5.1 (Testing)
                                        │       └─→ TASK 5.2 (Edge Cases)
└─ ALL TASKS ───────────────────────────┼─→ TASK 5.3 (Docs)
└─ TASK 5.1 ────────────────────────────┘─→ TASK 5.4 (Performance)
```

---

## Parallel Execution Opportunities

These tasks can run in parallel to speed up development:

**Week 1:**
- TASK 1.1 (Research) || TASK 1.2 (Setup)
- TASK 2.2 (Prompts) || TASK 2.4 (Storage)

**Week 2:**
- TASK 3.1 (3CX Auth) || TASK 4.1 (Streamlit Setup)

**Week 3:**
- TASK 4.2, 4.3, 4.4, 4.5 can all be developed in parallel (different UI pages)

---

## Context Management Per Task

Each task is designed to fit within 50K token context:

| Task | Approx Context | Dependencies Needed |
|------|---------------|---------------------|
| 2.1 Transcription | 20K | config.py, requirements.txt |
| 2.2 Prompts | 15K | scoring rubric, examples |
| 2.3 Analysis | 25K | transcription output, prompts |
| 2.4 Storage | 10K | data models |
| 2.5 Pipeline | 30K | all service modules |
| 3.2 3CX Retrieval | 20K | auth module, API docs |
| 4.2 Upload UI | 15K | pipeline module |
| 4.3 Results UI | 20K | analysis output format |

**Strategy:** Load only required dependencies per task, not full codebase.

---

## Success Metrics per Phase

### Phase 1 (Foundation)
- ✅ All APIs researched and documented
- ✅ Project structure created and runnable
- ✅ Configuration system working

### Phase 2 (Core Services)
- ✅ Successfully transcribe test call
- ✅ AI generates valid QA score
- ✅ End-to-end pipeline processes call
- ✅ Results stored and retrievable

### Phase 3 (3CX Integration)
- ✅ Connect to 3CX successfully
- ✅ Download 10 call recordings
- ✅ Batch process multiple calls

### Phase 4 (UI)
- ✅ Web app launches and runs
- ✅ Upload and process call via UI
- ✅ View results in clean interface
- ✅ Dashboard shows all analyzed calls

### Phase 5 (Polish)
- ✅ 10 test calls processed successfully
- ✅ AI scores within ±10% of human scores
- ✅ All edge cases handled gracefully
- ✅ Documentation complete
- ✅ Demo-ready

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Assigned Task |
|------|------------|--------|------------|---------------|
| 3CX API access delayed | Medium | High | Build manual upload first | TASK 2.1 |
| Transcription accuracy low | Low | Medium | Use AssemblyAI (proven quality) | TASK 2.1 |
| AI scores don't match humans | Medium | High | Extensive prompt engineering | TASK 2.2, 5.1 |
| API costs exceed budget | Low | Low | Set rate limits, monitor usage | TASK 1.1 |
| Performance too slow | Low | Medium | Optimize early, profile often | TASK 5.4 |
| Scope creep | High | Medium | Stick to task breakdown strictly | ALL |

---

## Quick Start Guide

### To begin development:

1. **Start with Phase 1 (Days 1-3)**
   ```bash
   # Run research task
   python -m taskmaster run --task 1.1

   # Set up project structure
   python -m taskmaster run --task 1.2

   # Configure application
   python -m taskmaster run --task 1.3
   ```

2. **Each task produces artifacts for next task**
   - Check `taskmaster/output/` for task results
   - Review generated code before proceeding
   - Run tests after each task

3. **Use agent assignments**
   - Research tasks → Perplexity
   - Core logic → Claude Sonnet
   - UI & simple tasks → GPT-4

4. **Validate frequently**
   - Test after each task completion
   - Don't proceed if tests fail
   - Document any deviations

---

## Daily Stand-up Questions

At end of each day, answer:
1. Which tasks completed today?
2. Any blockers encountered?
3. Deviation from plan? Why?
4. Tomorrow's priority tasks?
5. Are we on track for board demo date?

---

## Approval & Sign-off

- [ ] Task breakdown reviewed
- [ ] Dependencies validated
- [ ] Resource allocation confirmed
- [ ] Timeline approved
- [ ] Ready to begin execution

**Next Step:** Execute TASK 1.1 (Research & API Validation)
