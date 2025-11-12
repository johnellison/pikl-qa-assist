import type { CallMetadata } from '@/types';

/**
 * Filename pattern: [LastName, FirstName]_AgentID-Phone_Timestamp(CallID).wav
 * Example: [Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav
 */

export interface ParseResult {
  success: boolean;
  metadata?: CallMetadata;
  error?: string;
}

/**
 * Parse call metadata from standardized filename
 * @param filename - The full filename including .wav extension
 * @returns ParseResult with metadata or error
 */
export function parseCallFilename(filename: string): ParseResult {
  // Remove .wav extension if present
  const nameWithoutExt = filename.replace(/\.wav$/i, '');

  // Regex pattern to extract metadata
  // Pattern: [LastName, FirstName]_AgentID-Phone_Timestamp(CallID)
  const pattern = /^\[([^,]+),\s*([^\]]+)\]_(\d+)-(\d+)_(\d{14})\((\d+)\)$/;

  const match = nameWithoutExt.match(pattern);

  if (!match) {
    return {
      success: false,
      error: `Invalid filename format. Expected: [LastName, FirstName]_AgentID-Phone_Timestamp(CallID).wav`,
    };
  }

  const [, lastName, firstName, agentId, phoneNumber, timestamp, callId] = match;

  // Parse timestamp (format: YYYYMMDDHHmmss)
  const year = parseInt(timestamp.substring(0, 4));
  const month = parseInt(timestamp.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(timestamp.substring(6, 8));
  const hour = parseInt(timestamp.substring(8, 10));
  const minute = parseInt(timestamp.substring(10, 12));
  const second = parseInt(timestamp.substring(12, 14));

  const parsedDate = new Date(year, month, day, hour, minute, second);

  // Validate date
  if (isNaN(parsedDate.getTime())) {
    return {
      success: false,
      error: `Invalid timestamp in filename: ${timestamp}`,
    };
  }

  // Construct full agent name
  const agentName = `${firstName.trim()} ${lastName.trim()}`;

  const metadata: CallMetadata = {
    agentName,
    agentId: agentId.trim(),
    phoneNumber: phoneNumber.trim(),
    callId: callId.trim(),
    timestamp: parsedDate,
  };

  return {
    success: true,
    metadata,
  };
}

/**
 * Validate if filename matches expected pattern
 * @param filename - The filename to validate
 * @returns boolean indicating if filename is valid
 */
export function isValidCallFilename(filename: string): boolean {
  const result = parseCallFilename(filename);
  return result.success;
}

/**
 * Extract just the agent name from filename
 * @param filename - The filename
 * @returns Agent name or null if invalid
 */
export function extractAgentName(filename: string): string | null {
  const result = parseCallFilename(filename);
  return result.success ? result.metadata!.agentName : null;
}

/**
 * Format timestamp for display
 * @param date - Date object
 * @returns Formatted string
 */
export function formatCallTimestamp(date: Date): string {
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Batch parse multiple filenames
 * @param filenames - Array of filenames
 * @returns Array of parse results
 */
export function parseCallFilenames(filenames: string[]): ParseResult[] {
  return filenames.map(parseCallFilename);
}

/**
 * Get validation summary for multiple files
 * @param filenames - Array of filenames
 * @returns Summary of valid/invalid files
 */
export function validateBatch(filenames: string[]): {
  valid: string[];
  invalid: Array<{ filename: string; error: string }>;
  totalValid: number;
  totalInvalid: number;
} {
  const valid: string[] = [];
  const invalid: Array<{ filename: string; error: string }> = [];

  filenames.forEach((filename) => {
    const result = parseCallFilename(filename);
    if (result.success) {
      valid.push(filename);
    } else {
      invalid.push({ filename, error: result.error! });
    }
  });

  return {
    valid,
    invalid,
    totalValid: valid.length,
    totalInvalid: invalid.length,
  };
}
