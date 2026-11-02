import {
  initialTripConfigState,
  toSubmitInput,
  tripConfigReducer,
  type TripConfigAction,
  type TripConfigState,
} from './trip-config';

const reduce = (state: TripConfigState, ...actions: TripConfigAction[]) =>
  actions.reduce(tripConfigReducer, state);

const withDate = reduce(initialTripConfigState, {
  type: 'set',
  field: 'startDate',
  value: '2026-11-03',
});

describe('tripConfigReducer', () => {
  it('resizes the ages with the number of travellers, keeping those already typed', () => {
    const three = reduce(
      initialTripConfigState,
      { type: 'setAge', index: 0, value: '41' },
      { type: 'setTravelers', count: 3 },
    );
    expect(three.values.ages).toEqual(['41', '25', '25']);

    const backToOne = reduce(three, { type: 'setTravelers', count: 1 });
    expect(backToOne.values).toMatchObject({ numberOfPeople: 1, ages: ['41'] });
  });

  it('toggles a constraint on and off', () => {
    const on = reduce(initialTripConfigState, { type: 'toggle', list: 'dietary', id: 'vegan' });
    expect(on.values.dietary).toEqual(['vegan']);
    expect(reduce(on, { type: 'toggle', list: 'dietary', id: 'vegan' }).values.dietary).toEqual([]);
  });

  it('stays on the first step and shows the errors while it is incomplete', () => {
    const blocked = reduce(
      initialTripConfigState,
      { type: 'setAge', index: 0, value: '' },
      { type: 'next' },
    );
    expect(blocked.stepIndex).toBe(0);
    expect(blocked.errors.startDate).toBe('Choisis ta date de départ.');
    expect(blocked.errors.ages).toBe('Indique l’âge de chaque voyageur.');
  });

  it('clears a field error once the field changes', () => {
    const blocked = reduce(initialTripConfigState, { type: 'next' });
    const fixed = reduce(blocked, { type: 'set', field: 'startDate', value: '2026-11-03' });
    expect(fixed.errors.startDate).toBeUndefined();
  });

  it('rejects ages above 120', () => {
    const blocked = reduce(withDate, { type: 'setAge', index: 0, value: '130' }, { type: 'next' });
    expect(blocked.stepIndex).toBe(0);
    expect(blocked.errors.ages).toBeDefined();
  });

  it('walks forward and back between the bounds', () => {
    expect(reduce(initialTripConfigState, { type: 'back' }).stepIndex).toBe(0);
    const last = reduce(withDate, { type: 'next' }, { type: 'next' }, { type: 'next' });
    expect(last.stepIndex).toBe(2);
    expect(reduce(last, { type: 'back' }).stepIndex).toBe(1);
  });
});

describe('toSubmitInput', () => {
  const trip = { tripId: 'trip-1', destination: 'Lisbonne' };

  it('returns null while the form is incomplete', () => {
    expect(toSubmitInput(initialTripConfigState.values, trip)).toBeNull();
  });

  it('builds the API input: numeric ages and comma-separated constraints', () => {
    const state = reduce(
      withDate,
      { type: 'setTravelers', count: 2 },
      { type: 'setAge', index: 1, value: ' 8 ' },
      { type: 'toggle', list: 'dietary', id: 'vegetarian' },
      { type: 'toggle', list: 'dietary', id: 'halal' },
      { type: 'set', field: 'dietaryCustom', value: ' Allergie aux arachides ' },
      { type: 'set', field: 'medicalCustom', value: '   ' },
    );

    expect(toSubmitInput(state.values, trip)).toEqual({
      tripId: 'trip-1',
      destination: 'Lisbonne',
      startDate: '2026-11-03',
      durationDays: 7,
      numberOfPeople: 2,
      ages: [25, 8],
      intensity: 'balanced',
      averagePrice: 'mid',
      dietaryRestrictions: 'vegetarian, halal, Allergie aux arachides',
      medicalConditions: '',
    });
  });
});
