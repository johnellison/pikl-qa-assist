# Sample Recordings Analysis

**Dataset:** 30 call recordings from November 12, 2025
**Total Size:** 256 MB
**Format:** WAV (uncompressed audio)
**Location:** `assets/recordings/`

---

## Agent Distribution

| Agent Name | Calls | Agent ID | Notes |
|------------|-------|----------|-------|
| **Rebecca Stevens** | 6 | 218 | Top performer - use for benchmarking |
| **Tom Brodie** | 6 | 234 | Top performer - good comparison |
| **Keith Brandon** | 6 | 206 | Top performer - diverse call types |
| **Lauren McColm** | 4 | 236 | Mid-volume |
| **Jess Black** | 4 | 230 | Mid-volume |
| **Callum Reynolds** | 2 | 231 | Lower volume |
| **Jasmyn Earl** | 1 | 233 | Single sample |
| **William Burley** | 1 | 225 | Single sample |

**Total:** 8 agents, 30 calls

---

## Call Duration Estimates

Based on WAV file sizes (approximate):

| Duration Range | Count | Example Size | Notes |
|---------------|-------|--------------|-------|
| 1-2 minutes | 5 | 1.7-2 MB | Quick queries |
| 3-5 minutes | 8 | 3-5 MB | Standard calls |
| 6-10 minutes | 10 | 6-11 MB | Detailed consultations |
| 11-20 minutes | 5 | 13-18 MB | Complex cases |
| 20+ minutes | 2 | 28-30 MB | Extended support |

**Average:** ~8 minutes per call
**Range:** 1-20 minutes

---

## Filename Convention Analysis

**Format:**
```
[LastName, FirstName]_AgentID-PhoneNumber_YYYYMMDDHHMMSS(CallID).wav
```

**Example:**
```
[Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav
```

**Extractable metadata:**
- ✅ Agent full name
- ✅ Agent ID (3 digits)
- ✅ Customer phone number (UK mobile format)
- ✅ Call timestamp (precise to second)
- ✅ Call ID (4 digits in parentheses)

**This is excellent** - we can build a call metadata parser from filenames alone.

---

## Call Timestamps Analysis

All calls from: **November 12, 2025**

**Time distribution:**
- Morning (10:00-12:00): 18 calls
- Afternoon (12:00-14:00): 12 calls

**Peak call time:** 10:00-11:00 (9 calls)

**Implications:**
- Morning calls may have fresher agents (potentially higher quality)
- Good spread for testing time-of-day patterns
- All from same day (controls for external factors)

---

## Testing Strategy

### Phase 1: Quick Validation (5 calls)

**Selected calls for initial testing:**

1. **Short call** - Jess Black (2 min) - Test handling of brief interactions
2. **Medium call** - Tom Brodie (8 min) - Standard call duration
3. **Long call** - Keith Brandon (20 min) - Test extended conversation handling
4. **Top performer** - Rebecca Stevens (10 min) - Expect high score
5. **Different agent** - Lauren McColm (6 min) - Ensure variety

**Goals:**
- ✅ Validate transcription quality
- ✅ Test speaker diarization accuracy
- ✅ Verify AI scoring works
- ✅ Check processing times
- ✅ Identify any issues early

**Cost:** 5 calls × $0.048 = **$0.24** (covered by free credits)

---

### Phase 2: Full Dataset (30 calls)

**Once Phase 1 validates quality:**

Process all 30 calls to:
- Generate QA scores for all 8 agents
- Compare agent performance
- Identify patterns (strengths/weaknesses)
- Test consistency across different call types
- Build dataset for prompt refinement

**Cost:** 30 calls × $0.048 = **$1.44** (covered by free credits)

---

### Phase 3: Human Validation

**Select 10 calls for human QA scoring:**
- 3 from top performers (expect 80%+ scores)
- 4 from mid-tier agents (expect 65-75%)
- 3 random selection

**Goal:** Validate AI scores align with human scores (±10% variance)

**If variance >10%:**
- Refine QA evaluation prompts
- Adjust scoring rubric
- Re-process and compare

---

## Expected Outcomes

### Transcription Quality Targets

- ✅ **Word accuracy:** >95%
- ✅ **Speaker diarization:** >90% correct speaker attribution
- ✅ **UK accent handling:** Clear transcription of Norwich/UK English
- ✅ **Industry terminology:** Correctly capture insurance terms

### AI Scoring Targets

- ✅ **Overall score variance:** Within ±10% of human scores
- ✅ **Compliance detection:** 100% catch rate for critical breaches
- ✅ **Actionable feedback:** 3+ specific recommendations per call
- ✅ **Processing time:** <2 minutes per call

### Performance Benchmarks

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Transcription accuracy | >95% | 90-95% | <90% |
| Diarization accuracy | >90% | 85-90% | <85% |
| Score alignment | ±5% | ±10% | >±10% |
| Processing time | <90s | 90-120s | >120s |

---

## Data Quality Assessment

### ✅ Strengths

1. **Real production data** - not synthetic or staged
2. **Recent recordings** - Nov 12, 2025 (very current)
3. **Good distribution** - 8 agents, various call lengths
4. **Rich metadata** - filenames contain all key info
5. **Sufficient volume** - 30 calls is statistically meaningful
6. **Known performers** - can validate against expectations

### ⚠️ Limitations

1. **Single day only** - all from Nov 12 (no temporal diversity)
2. **No quality labels** - don't have existing human QA scores
3. **Unknown call types** - can't distinguish New Business vs Renewals
4. **No customer outcomes** - don't know if issues were resolved

### 🔧 Mitigations

1. **Get human scores** - Have QA manager score 10 calls for validation
2. **Request diversity** - Ask for calls from different dates/scenarios
3. **Add metadata** - Can manually tag call types after listening
4. **Iterate prompts** - Use results to refine scoring logic

---

## Recommended Test Sequence

### Week 1: Foundation

**Day 1-2:** Setup (TASK 1.2, 1.3)
**Day 3:** Test transcription with 2 calls
- Process 1 short call (2 min)
- Process 1 long call (15 min)
- Validate quality before proceeding

**Day 4:** Test AI scoring with same 2 calls
- Generate QA scores
- Manual review for sanity check
- Refine prompt if needed

**Day 5:** Process 5 calls (Phase 1)
- Full pipeline test
- Identify any issues
- Fix before scaling

### Week 2: Full Processing

**Day 6:** Process all 30 calls (Phase 2)
**Day 7:** Analysis and validation
**Day 8-10:** Prompt refinement + UI development

---

## Cost Summary

### Transcription Costs (OpenAI Whisper)

| Phase | Calls | Avg Duration | Cost |
|-------|-------|-------------|------|
| Phase 1 (Quick test) | 5 | 8 min | $0.24 |
| Phase 2 (Full dataset) | 30 | 8 min | $1.44 |
| Re-processing (if needed) | 10 | 8 min | $0.48 |
| **Total** | **45** | - | **$2.16** |

### Analysis Costs (Claude 3.5 Sonnet)

| Phase | Calls | Cost per Call | Total |
|-------|-------|--------------|-------|
| Phase 1 | 5 | $0.07 | $0.35 |
| Phase 2 | 30 | $0.07 | $2.10 |
| **Total** | **35** | - | **$2.45** |

### Grand Total

**Total API costs:** $2.16 + $2.45 = **$4.61**

**Free credits available:**
- OpenAI: $5 (covers all transcription + more)
- Anthropic: $5 (covers all analysis + more)

**Net cost: $0** ✅

---

## Data Privacy Notes

### PII in Recordings

**Phone numbers visible in filenames:**
- Customer phone numbers are part of filename
- Consider anonymizing before demo if needed
- May contain sensitive information in audio

**Recommendations:**
1. ✅ Don't share raw recordings externally
2. ✅ Redact phone numbers in demo screenshots
3. ✅ Use anonymized transcripts for board presentation
4. ✅ Ensure storage follows data protection policies

### GDPR Compliance

**For production:**
- [ ] Implement data retention policies
- [ ] Add PII redaction in transcripts
- [ ] Ensure secure storage and access controls
- [ ] Document data processing in privacy policy

**For prototype:**
- ✅ Store locally only
- ✅ No cloud backups
- ✅ Delete after demo if requested

---

## Next Steps

### Immediate Actions

1. **Validate dataset** - Listen to 2-3 calls to understand content
2. **Identify quality examples** - Pick 1 great call, 1 poor call for testing
3. **Get human scores** - Request existing QA scores if available
4. **Prepare metadata** - Document any known quality issues per agent

### After TASK 1.2 (Project Setup)

1. **Build file parser** - Extract metadata from filenames
2. **Test transcription** - Process first 2 calls
3. **Validate quality** - Check transcription accuracy
4. **Proceed to Phase 1** - Process 5 calls by end of Week 1

---

## Sample Data Status

**✅ Ready for Development**

- 30 calls available
- Good distribution
- Rich metadata
- Realistic production data
- Sufficient for validation

**Total value:** Perfect dataset for prototype validation

**Risk level:** Low - can always request more samples if needed

---

**Document Version:** 1.0
**Last Updated:** 2025-01-12
**Next Review:** After Phase 1 testing
