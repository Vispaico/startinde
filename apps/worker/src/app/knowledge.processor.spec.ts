import { describe, expect, it } from 'vitest';
import { analyzePageChange } from '../app/knowledge.processor';

describe('analyzePageChange', () => {
  it('returns no change for identical content', () => {
    const result = analyzePageChange('same', 'same');
    expect(result.changed).toBe(false);
    expect(result.classification).toBe('cosmetic');
    expect(result.significance).toBe('low');
  });

  it('classifies legal changes', () => {
    const oldContent = 'Students may work 120 full days per year.';
    const newContent =
      'Students may work 140 full days per year per Section 16b Residence Act.';
    const result = analyzePageChange(oldContent, newContent);
    expect(result.changed).toBe(true);
    expect(result.classification).toBe('legal');
  });

  it('classifies financial changes', () => {
    const oldContent = 'Salary threshold: 45,300 EUR.';
    const newContent = 'Salary threshold: 48,300 EUR per year.';
    const result = analyzePageChange(oldContent, newContent);
    expect(result.changed).toBe(true);
    expect(result.classification).toBe('financial');
  });

  it('classifies procedural changes', () => {
    const oldContent = 'Submit the application form.';
    const newContent = 'Submit the application form within the deadline process.';
    const result = analyzePageChange(oldContent, newContent);
    expect(result.changed).toBe(true);
    expect(result.classification).toBe('procedural');
  });

  it('marks large changes as critical significance', () => {
    const oldLines = Array.from({ length: 60 }, (_, i) => `old line ${i}`);
    const newLines = Array.from({ length: 60 }, (_, i) => `new line ${i}`);
    const result = analyzePageChange(oldLines.join('\n'), newLines.join('\n'));
    expect(result.significance).toBe('critical');
  });
});
