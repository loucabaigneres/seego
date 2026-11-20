import { importErrorState } from './import-errors';

describe('importErrorState', () => {
  it('asks for the caption when the post could not be read', () => {
    expect(importErrorState('CAPTION_UNAVAILABLE')).toEqual({
      message: expect.stringMatching(/Colle la description/),
      needsCaption: true,
    });
  });

  it('explains when the analysis is unavailable', () => {
    expect(importErrorState('AI_UNAVAILABLE')).toEqual({
      message: 'L’analyse n’est pas disponible pour le moment.',
      needsCaption: false,
    });
  });

  it('shows the server message as is, with a fallback', () => {
    expect(importErrorState('Cette publication a été refusée.').message).toBe(
      'Cette publication a été refusée.',
    );
    expect(importErrorState(undefined).message).toBe('L’analyse a échoué, réessaie.');
    expect(importErrorState(' ').message).toBe('L’analyse a échoué, réessaie.');
  });
});
