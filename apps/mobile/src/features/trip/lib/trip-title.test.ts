import { titleChange } from './trip-title';

describe('titleChange', () => {
  it('is ready with the trimmed title when it differs', () => {
    expect(titleChange('  Week-end à Lisbonne ', 'Lisbonne')).toEqual({
      status: 'ready',
      title: 'Week-end à Lisbonne',
    });
  });

  it('does nothing when only whitespace changed', () => {
    expect(titleChange('Lisbonne  ', 'Lisbonne')).toEqual({ status: 'unchanged' });
  });

  it('accepts a first title on a trip that had none', () => {
    expect(titleChange('Rome', null)).toEqual({ status: 'ready', title: 'Rome' });
  });

  it('rejects an empty or too long title', () => {
    expect(titleChange('   ', 'Rome').status).toBe('invalid');
    expect(titleChange('a'.repeat(81), 'Rome').status).toBe('invalid');
    expect(titleChange('a'.repeat(80), 'Rome').status).toBe('ready');
  });
});
