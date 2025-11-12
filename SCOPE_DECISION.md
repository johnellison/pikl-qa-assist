# Scope Decision: 3CX Integration Deferred

**Date:** 2025-01-12
**Decision:** Defer 3CX API integration to post-approval phase
**Reason:** Business continuity risk on production phone system

---

## Background

During 3CX API setup, encountered concerning warning:
> "Applying this change will reassign the following DID(s) to this new destination: (+448002545171)
> Allows external incoming calls to be forwarded to this application."

**Risk factors:**
- +448002545171 is Pikl's main business line
- Ambiguous language about "reassigning" DID
- No test environment available
- FCA-regulated business = high compliance risk
- Configuration affects live production system

---

## Decision: Build Manual Upload First

### Prototype MVP Scope (Approved)

**✅ IN SCOPE:**
1. Manual upload interface for call recordings (MP3/WAV)
2. Automated transcription (AssemblyAI or OpenAI Whisper)
3. AI-powered QA scoring (Claude API)
4. Feedback report generation
5. Call dashboard and results display
6. Report export (PDF/Markdown)

**⏭️ DEFERRED TO POST-APPROVAL:**
1. 3CX API integration (automatic call retrieval)
2. Batch processing from 3CX
3. Real-time call monitoring
4. Automated daily fetching

---

## Benefits of This Approach

### 1. Zero Business Risk
- No changes to production phone system
- No risk of call disruption
- No customer impact
- No regulatory exposure

### 2. Faster to Demo
- **Original timeline:** 18 days
- **New timeline:** 15 days (saves 3 days)
- Removes integration complexity
- More time for AI quality tuning

### 3. Proves Core Value
- Board cares about AI accuracy, not API integration
- Manual upload still demonstrates full QA capability
- Can show real results with actual call recordings
- Integration is "just plumbing" after concept is validated

### 4. Better Risk Management
- Prototype doesn't touch production systems
- Can test AI quality thoroughly before any integration
- Gives time to get proper 3CX documentation/support
- Can request test environment for post-approval phase

---

## Updated Timeline

### Original Plan (18 days)
- Days 1-3: Foundation
- Days 4-8: Core services
- Days 9-11: **3CX Integration** ← REMOVED
- Days 12-15: UI
- Days 16-18: Polish

### New Plan (15 days)
- Days 1-5: Foundation + Core Services
- Days 6-10: User Interface (with manual upload)
- Days 11-15: Testing, Polish, Demo Prep
  - **+3 extra days for AI refinement**

---

## Manual Upload User Flow

**For Prototype:**

```
1. QA Manager exports call recording from 3CX manually
   - 3CX → Call History → Right-click call → "Download Recording"
   - Saves as MP3 to local computer
   - Takes ~10 seconds per call

2. Opens Pikl QA Assistant web interface
   - Upload MP3 file
   - Enter agent name and call date
   - Click "Analyze Call"

3. System processes call (2 minutes)
   - Transcribes audio
   - Scores against QA criteria
   - Generates feedback report

4. View results and download report
   - Overall score and breakdown
   - Coaching recommendations
   - Export to PDF for agent 1-on-1

Time per call: ~2.5 minutes (vs 30 minutes manual QA)
```

**This is totally acceptable for a prototype demo.**

---

## Post-Approval Integration Plan

**If board approves and funds production deployment:**

### Phase 2: Safe 3CX Integration (Week 1-2 post-approval)

**Step 1: Get Proper Support**
- Engage 3CX support team
- Question: "How do we access call recordings read-only without affecting call routing?"
- Request documentation on Call Control API scopes
- Clarify what DID assignment actually does

**Step 2: Set Up Test Environment**
- Request staging/test 3CX environment
- Or use non-critical test number (not main line)
- Validate API behavior doesn't affect calls
- Monitor for 48-72 hours

**Step 3: Consider Alternatives**
- **Option A:** Batch export workflow
  - 3CX exports recordings to SFTP/cloud storage daily
  - App polls that location automatically
  - Zero real-time integration with phone system
  - Very safe, widely used pattern

- **Option B:** Read-only API access
  - May need different API scope than Call Control
  - Focus on metadata + recording download only
  - No webhook/routing involvement

- **Option C:** Manual batch upload stays
  - If integration remains risky, keep manual process
  - Can still batch-upload multiple files at once
  - QA Manager spends 5 minutes/day uploading vs hours scoring

**Step 4: Controlled Rollout**
- Start with single agent's calls
- Monitor for 1 week
- Expand to 5 agents
- Full rollout after validation

---

## How to Present This Decision

### To the QA Manager:
> "For the prototype, you'll need to download call recordings from 3CX and upload them to the QA Assistant. This takes about 10 seconds per call. Once we're approved for production, we'll add automatic fetching so you don't have to do this step."

### To the Board:
> "We identified a business continuity risk with integrating the prototype into the live phone system. To protect customer calls, we built a manual upload interface that validates the AI's accuracy without touching production systems. This approach is faster, safer, and still demonstrates the full value of automated QA scoring.
>
> Once approved, we can add secure API integration with proper testing in a controlled rollout."

### To Technical Stakeholders:
> "The 3CX Call Control API configuration requires assigning a DID to the application, which appeared to involve call routing/forwarding. Given this was the main business line and we had no test environment, we deferred that integration. The prototype uses manual upload to prove the AI scoring works, and we can add API integration post-approval with proper testing."

**This shows:**
- ✅ Good judgment and risk awareness
- ✅ Focus on delivering value quickly
- ✅ Protecting business operations
- ✅ Pragmatic problem-solving

---

## Success Metrics (Unchanged)

The prototype must still demonstrate:

1. ✅ Upload and process a call recording
2. ✅ Generate accurate QA scores (±10% of human scores)
3. ✅ Produce actionable coaching recommendations
4. ✅ Flag compliance breaches automatically
5. ✅ Process 10-minute call in under 2 minutes

**3CX integration is not required to prove any of these.**

---

## Cost Impact

**Original estimate (with 3CX integration):**
- Development time: 60 hours
- API costs: ~$30 prototype, ~$300/month production

**New estimate (manual upload):**
- Development time: 47 hours (saves 13 hours)
- API costs: ~$30 prototype, ~$300/month production (unchanged)
- **Faster delivery, same cost, less risk**

---

## Risk Register Updated

| Risk | Original Probability | New Probability | Mitigation |
|------|---------------------|-----------------|------------|
| Disrupt live calls | Medium (30%) | **Zero (0%)** | Manual upload = no system changes |
| 3CX API unstable | Medium | **N/A** | Not using 3CX API in prototype |
| Integration takes longer | High | **N/A** | Removed from scope |
| Board wants automation | Low | Low | Still buildable in Phase 2 |
| Manual upload too slow | Very Low | Very Low | 10 sec/call is acceptable for prototype |

**Net result: Significantly reduced risk profile**

---

## Alternative Considered and Rejected

**"Use a test DID number for 3CX integration"**

Rejected because:
- Still requires API configuration we don't fully understand
- Would need to generate test calls to that number
- Doesn't reflect real call quality/scenarios
- Adds complexity without much demo value
- Still risks misconfiguration affecting other numbers

---

## Approval & Sign-Off

**Decision made by:** Product Manager (with AI consultant recommendation)
**Date:** 2025-01-12
**Stakeholders informed:**
- [ ] QA Manager (Pikl)
- [ ] IT/Operations team
- [ ] Technical team

**Next review:** After board presentation
**Escalation trigger:** If board requires 3CX integration for approval decision

---

## Next Actions

1. ✅ **Proceed with TASK 1.1** (Transcription API research) - no 3CX research needed
2. ✅ **Continue with updated task breakdown** (skip tasks 3.1-3.3)
3. 📋 **Build manual upload UI** (Task 4.2) as primary interface
4. 📋 **Update demo script** to explain manual upload approach
5. 📋 **Document 3CX integration plan** for Phase 2 (this document)

---

## Document Control

**Version:** 1.0
**Status:** Approved
**Next Review:** Post-board presentation
**Related Documents:**
- PRD.md
- taskmaster/TASK_BREAKDOWN.md
- taskmaster/QUICK_START.md
