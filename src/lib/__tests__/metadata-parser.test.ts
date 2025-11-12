import { parseCallFilename, isValidCallFilename, validateBatch } from '../metadata-parser';

describe('metadata-parser', () => {
  describe('parseCallFilename', () => {
    it('should parse valid filename correctly', () => {
      const filename = '[Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav';
      const result = parseCallFilename(filename);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.agentName).toBe('Rebecca Stevens');
      expect(result.metadata!.agentId).toBe('218');
      expect(result.metadata!.phoneNumber).toBe('07786515254');
      expect(result.metadata!.callId).toBe('2367');
      expect(result.metadata!.timestamp).toBeInstanceOf(Date);
      expect(result.metadata!.timestamp.getFullYear()).toBe(2025);
      expect(result.metadata!.timestamp.getMonth()).toBe(10); // November (0-indexed)
      expect(result.metadata!.timestamp.getDate()).toBe(12);
    });

    it('should parse filename without .wav extension', () => {
      const filename = '[Brodie, Tom]_219-07123456789_20251112130000(1234)';
      const result = parseCallFilename(filename);

      expect(result.success).toBe(true);
      expect(result.metadata!.agentName).toBe('Tom Brodie');
    });

    it('should handle names with extra spaces', () => {
      const filename = '[Brandon,  Keith ]_220-07111222333_20251112140000(5678).wav';
      const result = parseCallFilename(filename);

      expect(result.success).toBe(true);
      expect(result.metadata!.agentName).toBe('Keith Brandon');
    });

    it('should reject invalid filename format', () => {
      const filename = 'invalid-filename.wav';
      const result = parseCallFilename(filename);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid filename format');
    });

    it('should reject filename with malformed timestamp', () => {
      // Timestamp has wrong length (should be 14 digits)
      const filename = '[Test, User]_123-07111222333_2025111(1234).wav';
      const result = parseCallFilename(filename);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid filename format');
    });
  });

  describe('isValidCallFilename', () => {
    it('should return true for valid filename', () => {
      const filename = '[McColm, Lauren]_221-07987654321_20251112150000(9012).wav';
      expect(isValidCallFilename(filename)).toBe(true);
    });

    it('should return false for invalid filename', () => {
      expect(isValidCallFilename('random-file.wav')).toBe(false);
    });
  });

  describe('validateBatch', () => {
    it('should correctly categorize valid and invalid filenames', () => {
      const filenames = [
        '[Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav',
        'invalid-file.wav',
        '[Brodie, Tom]_219-07123456789_20251112130000(1234).wav',
        '[Brandon, Keith]_220-07111222333_20251112140000(5678).wav',
        'another-invalid.wav',
      ];

      const result = validateBatch(filenames);

      expect(result.totalValid).toBe(3);
      expect(result.totalInvalid).toBe(2);
      expect(result.valid).toHaveLength(3);
      expect(result.invalid).toHaveLength(2);
      expect(result.invalid[0].error).toContain('Invalid filename format');
    });

    it('should handle empty array', () => {
      const result = validateBatch([]);
      expect(result.totalValid).toBe(0);
      expect(result.totalInvalid).toBe(0);
    });
  });

  describe('Sample filenames from PRD', () => {
    // Test with the actual sample filenames mentioned in the PRD
    const sampleFilenames = [
      '[Stevens, Rebecca]_218-07786515254_20251112120634(2367).wav',
      '[Brodie, Tom]_219-07123456789_20251112130000(1234).wav',
      '[Brandon, Keith]_220-07111222333_20251112140000(5678).wav',
      '[McColm, Lauren]_221-07987654321_20251112150000(9012).wav',
      '[Black, Jess]_222-07555666777_20251112160000(3456).wav',
      '[Reynolds, Callum]_223-07444555666_20251112170000(7890).wav',
    ];

    it('should parse all sample filenames successfully', () => {
      sampleFilenames.forEach((filename) => {
        const result = parseCallFilename(filename);
        expect(result.success).toBe(true);
        expect(result.metadata).toBeDefined();
        expect(result.metadata!.agentName).toBeTruthy();
        expect(result.metadata!.agentId).toBeTruthy();
        expect(result.metadata!.phoneNumber).toBeTruthy();
        expect(result.metadata!.callId).toBeTruthy();
        expect(result.metadata!.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should extract correct agent names', () => {
      const result1 = parseCallFilename(sampleFilenames[0]);
      expect(result1.metadata!.agentName).toBe('Rebecca Stevens');

      const result2 = parseCallFilename(sampleFilenames[1]);
      expect(result2.metadata!.agentName).toBe('Tom Brodie');

      const result3 = parseCallFilename(sampleFilenames[2]);
      expect(result3.metadata!.agentName).toBe('Keith Brandon');
    });
  });
});
