import { WordActivityValidator } from './word-activity.validator';

describe('WordActivityValidator', () => {
  const validator = new WordActivityValidator();

  const valid = {
    instruction: 'Make the word "really" bold.',
    startingDocument: '<p>I really like pizza.</p>',
    goals: [{ type: 'textStyle', text: 'really', bold: true }],
    assetBaseUrl: 'https://example.com/assets/',
    theme: 'LIGHT'
  };

  it('accepts a complete activity', () => {
    expect(validator.validate(valid).valid).toBeTrue();
    expect(validator.isActivity(valid)).toBeTrue();
  });

  it('accepts an empty goals list (Done instead of Check My Work)', () => {
    expect(validator.validate({ ...valid, goals: [] }).valid).toBeTrue();
  });

  it('accepts DARK and an optional hintGif, and ignores unknown fields', () => {
    expect(
      validator.validate({ ...valid, theme: 'DARK', hintGif: 'bold.gif', extra: 1 }).valid
    ).toBeTrue();
  });

  it('does not evaluate the goals themselves', () => {
    expect(validator.validate({ ...valid, goals: [{ type: 'unknown-goal' }] }).valid).toBeTrue();
  });

  ['instruction', 'startingDocument', 'goals', 'assetBaseUrl', 'theme'].forEach(field => {
    it(`rejects a missing ${field} and names it`, () => {
      const activity: Record<string, unknown> = { ...valid };
      delete activity[field];

      const result = validator.validate(activity);

      expect(result.valid).toBeFalse();
      expect(result.reason).toContain(field);
    });
  });

  it('rejects an empty instruction', () => {
    expect(validator.validate({ ...valid, instruction: '  ' }).valid).toBeFalse();
  });

  it('rejects goals that are not an array', () => {
    expect(validator.validate({ ...valid, goals: 'bold' }).valid).toBeFalse();
  });

  it('rejects an unsupported theme', () => {
    expect(validator.validate({ ...valid, theme: 'PURPLE' }).valid).toBeFalse();
  });

  it('rejects a non-string hintGif', () => {
    expect(validator.validate({ ...valid, hintGif: 5 }).valid).toBeFalse();
  });

  [null, undefined, 'text', 7].forEach(value => {
    it(`rejects ${JSON.stringify(value)} as the whole payload`, () => {
      expect(validator.validate(value).valid).toBeFalse();
    });
  });
});
