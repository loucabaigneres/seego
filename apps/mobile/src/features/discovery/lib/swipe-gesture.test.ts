import { dragIntent, photoTapTarget, settlesExpanded, swipeOutcome } from './swipe-gesture';

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

describe('dragIntent', () => {
  it('opens the details when a collapsed card is dragged mostly upwards', () => {
    expect(dragIntent(3, -8, false)).toBe('expand');
  });

  it('swipes a collapsed card dragged sideways or downwards', () => {
    expect(dragIntent(8, -3, false)).toBe('swipe');
    expect(dragIntent(0, 8, false)).toBe('swipe');
  });

  it('only moves the details of an expanded card', () => {
    expect(dragIntent(8, 0, true)).toBe('expand');
  });
});

describe('settlesExpanded', () => {
  it('settles on the nearest side of a slow release', () => {
    expect(settlesExpanded(0.6, 0)).toBe(true);
    expect(settlesExpanded(0.4, 0)).toBe(false);
  });

  it('follows a flick whatever the position', () => {
    expect(settlesExpanded(0.1, -900)).toBe(true);
    expect(settlesExpanded(0.9, 900)).toBe(false);
  });
});

describe('photoTapTarget', () => {
  it('browses the photos from each half of the card', () => {
    expect(photoTapTarget(0.1, 3)).toBe('previous');
    expect(photoTapTarget(0.49, 3)).toBe('previous');
    expect(photoTapTarget(0.5, 3)).toBe('next');
    expect(photoTapTarget(0.9, 3)).toBe('next');
  });

  it('does nothing when the place has a single photo', () => {
    expect(photoTapTarget(0.9, 1)).toBeNull();
    expect(photoTapTarget(0.1, 0)).toBeNull();
  });
});
