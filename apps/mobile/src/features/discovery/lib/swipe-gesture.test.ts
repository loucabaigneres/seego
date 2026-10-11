import { photoTapTarget, swipeOutcome } from './swipe-gesture';

describe('swipeOutcome', () => {
  it('swipes once the card is dragged past the threshold', () => {
    expect(swipeOutcome(111, 0)).toBe('like');
    expect(swipeOutcome(-111, 0)).toBe('skip');
  });

  it('brings the card back when it stays within the threshold', () => {
    expect(swipeOutcome(110, 0)).toBeNull();
    expect(swipeOutcome(-110, 0)).toBeNull();
    expect(swipeOutcome(40, 300)).toBeNull();
  });

  it('swipes on a quick flick in the direction of the drag', () => {
    expect(swipeOutcome(40, 900)).toBe('like');
    expect(swipeOutcome(-40, -900)).toBe('skip');
  });

  it('ignores a flick against the direction of the drag', () => {
    expect(swipeOutcome(40, -900)).toBeNull();
    expect(swipeOutcome(-40, 900)).toBeNull();
  });
});

describe('photoTapTarget', () => {
  it('browses the photos from the edges of the card', () => {
    expect(photoTapTarget(0.1, 3)).toBe('previous');
    expect(photoTapTarget(0.9, 3)).toBe('next');
  });

  it('does nothing in the middle of the card', () => {
    expect(photoTapTarget(0.5, 3)).toBeNull();
  });

  it('does nothing when the place has a single photo', () => {
    expect(photoTapTarget(0.9, 1)).toBeNull();
  });
});
