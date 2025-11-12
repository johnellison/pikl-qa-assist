# Claude API Integration for QA Analysis

## Overview

The Pikl QA Assistant uses **Claude Sonnet 4.5** (`claude-sonnet-4.5-20250929`) for analyzing customer service call transcripts. This model provides the best balance of accuracy, speed, and cost for production QA analysis.

## Features

- **8 QA Dimensions**: Comprehensive scoring across rapport, needs discovery, product knowledge, objection handling, closing, compliance, professionalism, and follow-up
- **Key Moments Detection**: Identifies positive, negative, and neutral moments with exact quotes and timestamps
- **Coaching Recommendations**: AI-generated actionable coaching points for agents
- **Compliance Monitoring**: Flags potential compliance issues
- **Cost Tracking**: Estimates and tracks API usage costs

## API Endpoints

### POST /api/analyze

Analyzes a transcript and returns comprehensive QA evaluation.

**Request:**
```json
{
  "transcript": {
    "callId": "call-123",
    "turns": [
      {
        "speaker": "agent",
        "text": "Hello, how can I help you today?",
        "timestamp": 0,
        "confidence": 0.95
      },
      {
        "speaker": "customer",
        "text": "I'm interested in your premium package",
        "timestamp": 5,
        "confidence": 0.92
      }
    ],
    "durationSeconds": 120,
    "language": "en"
  }
}
```

**Response:**
```json
{
  "analysis": {
    "callId": "call-123",
    "overallScore": 7.5,
    "scores": {
      "rapport": 8,
      "needsDiscovery": 7,
      "productKnowledge": 9,
      "objectionHandling": 6,
      "closing": 7,
      "compliance": 9,
      "professionalism": 8,
      "followUp": 7
    },
    "keyMoments": [
      {
        "timestamp": 45,
        "type": "positive",
        "category": "rapport",
        "description": "Agent showed empathy for customer's situation",
        "quote": "I completely understand how frustrating that must be"
      }
    ],
    "coachingRecommendations": [
      "Practice more probing questions during needs discovery",
      "Work on confidence when handling price objections"
    ],
    "summary": "Agent successfully closed the sale with strong product knowledge. Could improve objection handling and needs discovery.",
    "callOutcome": "Sale closed - customer purchased premium package",
    "complianceIssues": [],
    "processingTime": 2500
  },
  "estimatedCost": 0.027
}
```

**Error Responses:**
- `400`: Invalid transcript format or empty transcript
- `500`: API key not configured or Claude API error

### GET /api/analyze

Check API status and configuration.

**Response:**
```json
{
  "status": "ok",
  "service": "Claude QA Analysis API",
  "model": "claude-sonnet-4.5-20250929",
  "configured": true
}
```

## Usage Examples

### Basic Analysis

```typescript
import { analyzeTranscript } from '@/lib/claude-service';

const transcript = {
  callId: 'call-123',
  turns: [/* transcript turns */],
  durationSeconds: 180,
  language: 'en'
};

const analysis = await analyzeTranscript(transcript);
console.log(`Overall Score: ${analysis.overallScore}/10`);
console.log(`Coaching Points: ${analysis.coachingRecommendations.length}`);
```

### Cost Estimation

```typescript
import { estimateAnalysisCost } from '@/lib/claude-service';

const estimatedCost = estimateAnalysisCost(transcript);
console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

// Typical costs:
// - 2-minute call: ~$0.015 - $0.025
// - 5-minute call: ~$0.025 - $0.040
// - 10-minute call: ~$0.045 - $0.070
```

### Full Pipeline (Transcribe + Analyze)

```typescript
import { transcribeAudio } from '@/lib/whisper-service';
import { analyzeTranscript } from '@/lib/claude-service';

// Step 1: Transcribe audio
const transcript = await transcribeAudio(audioFilePath, callId);

// Step 2: Analyze transcript
const analysis = await analyzeTranscript(transcript);

// Step 3: Store results (implement your storage logic)
await storeAnalysis(analysis);
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.anthropic.com/

### Model Configuration

The service uses Claude Sonnet 4.5 by default. To change models, edit `src/lib/claude-service.ts`:

```typescript
// Change this line to use a different model
const MODEL = 'claude-sonnet-4.5-20250929';

// Available options:
// - claude-sonnet-4.5-20250929 (Recommended - best balance)
// - claude-opus-4.1-20250514 (Highest accuracy, 5x cost)
// - claude-haiku-4.5-20250514 (Fastest, lower cost)
```

## QA Scoring Rubric

### 1. Rapport Building (rapport)
- **8-10**: Excellent rapport, warm and personable, builds strong connection
- **5-7**: Adequate rapport, professional but somewhat distant
- **0-4**: Poor rapport, cold or impersonal interaction

### 2. Needs Discovery (needsDiscovery)
- **8-10**: Thorough discovery, asked probing questions, uncovered key needs
- **5-7**: Basic discovery, identified some needs but missed opportunities
- **0-4**: Poor discovery, failed to understand customer needs

### 3. Product Knowledge (productKnowledge)
- **8-10**: Expert knowledge, confident explanations, handled complex questions
- **5-7**: Adequate knowledge, answered most questions correctly
- **0-4**: Poor knowledge, gave incorrect or incomplete information

### 4. Objection Handling (objectionHandling)
- **8-10**: Excellent handling, addressed concerns thoroughly
- **5-7**: Adequate handling, addressed concerns but lacked confidence
- **0-4**: Poor handling, avoided or dismissed objections

### 5. Closing Techniques (closing)
- **8-10**: Strong close, clear next steps, gained commitment
- **5-7**: Adequate close, some next steps but lacked clarity
- **0-4**: Weak or no close, left customer uncertain

### 6. Compliance (compliance)
- **8-10**: Full compliance, all required elements covered
- **5-7**: Mostly compliant, minor omissions
- **0-4**: Non-compliant, missed critical requirements

### 7. Professionalism (professionalism)
- **8-10**: Highly professional, polished communication, appropriate tone
- **5-7**: Adequately professional, occasional lapses
- **0-4**: Unprofessional behavior or communication

### 8. Follow-Up (followUp)
- **8-10**: Clear follow-up plan, documented action items, set expectations
- **5-7**: Basic follow-up, some next steps mentioned
- **0-4**: No follow-up plan or unclear next steps

## Cost Optimization

### Batch Processing

For analyzing multiple calls, use batch processing to optimize costs:

```typescript
const analyses = await Promise.all(
  transcripts.map(transcript => analyzeTranscript(transcript))
);
```

### Caching Results

Store analysis results to avoid re-analyzing the same transcript:

```typescript
// Check cache first
const cached = await getCachedAnalysis(callId);
if (cached) return cached;

// Analyze and cache
const analysis = await analyzeTranscript(transcript);
await cacheAnalysis(callId, analysis);
```

### Cost Tracking

Track cumulative costs across your application:

```typescript
let totalCost = 0;

for (const transcript of transcripts) {
  const cost = estimateAnalysisCost(transcript);
  totalCost += cost;

  if (totalCost > DAILY_BUDGET) {
    console.warn('Daily budget exceeded');
    break;
  }

  await analyzeTranscript(transcript);
}
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run Claude service tests only
npm test src/lib/__tests__/claude-service.test.ts

# Run API endpoint tests only
npm test src/app/api/analyze/__tests__/route.test.ts
```

### Manual Testing

```bash
# Check API status
curl http://localhost:3000/api/analyze

# Analyze a transcript
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d @test-transcript.json
```

## Performance

### Response Times

- Average analysis time: 2-5 seconds
- Varies based on transcript length and model load
- Parallel processing recommended for bulk analysis

### Rate Limits

Claude API rate limits (as of 2025):
- **Requests**: 50 requests/minute
- **Tokens**: 50,000 tokens/minute

For production use, implement rate limiting and queuing.

## Error Handling

```typescript
try {
  const analysis = await analyzeTranscript(transcript);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Implement exponential backoff
    await delay(5000);
    return analyzeTranscript(transcript); // Retry
  } else if (error.message.includes('API key')) {
    // Handle authentication error
    console.error('Invalid API key');
  } else {
    // Handle other errors
    console.error('Analysis failed:', error);
  }
}
```

## Best Practices

1. **Always estimate costs** before analyzing large batches
2. **Cache results** to avoid duplicate API calls
3. **Implement rate limiting** for production use
4. **Store raw responses** for debugging and re-analysis
5. **Monitor API usage** and costs regularly
6. **Use environment-specific API keys** (dev/staging/prod)
7. **Implement retry logic** for transient failures

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"
- Ensure `.env` file contains valid API key
- Restart dev server after adding environment variables

### "Failed to parse analysis response"
- Check Claude API status: https://status.anthropic.com/
- Verify transcript format is correct
- Review API request/response logs

### High costs
- Use cost estimation before batch processing
- Implement caching for repeated analyses
- Consider using shorter transcripts for testing

## Support

- Claude API Documentation: https://docs.anthropic.com/
- API Status: https://status.anthropic.com/
- Rate Limits: https://docs.anthropic.com/en/api/rate-limits
