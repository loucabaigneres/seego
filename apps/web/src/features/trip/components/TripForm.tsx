import { DatePicker } from '@/components/DatePicker';
import { FIELD_CLASS } from '@/components/formStyles';
import { OptionTile } from '@/components/OptionTile';
import { ProgressBar } from '@/components/ProgressBar';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { TripFormValues } from '../lib/tripForm';
import {
  addDays,
  DIETARY_OPTIONS,
  MAX_TRAVELERS,
  MAX_TRIP_DAYS,
  MEDICAL_OPTIONS,
  tripFormSchema,
} from '../lib/tripForm';

const INTENSITY_OPTIONS = [
  { id: 'chill', title: 'Relax', description: 'Prendre son temps' },
  { id: 'balanced', title: 'Équilibré', description: 'Un peu de tout' },
  { id: 'intense', title: 'Intense', description: 'Explorer un max' },
] as const;

const BUDGET_OPTIONS = [
  { id: 'budget', title: 'Petit budget', description: 'Malin et économe' },
  { id: 'mid', title: 'Moyen', description: 'Bon rapport qualité-prix' },
  { id: 'premium', title: 'Premium', description: 'Confort et belles adresses' },
] as const;

interface TripFormProps {
  /** Answers to start from (the trip's saved configuration when coming back to the form). */
  initialValues?: Partial<TripFormValues>;
  /** Step to open on, 1 to 3. */
  initialStep?: number;
  onSubmit: (data: TripFormValues) => void;
  isLoading?: boolean;
}

export function TripForm({ initialValues, initialStep = 1, onSubmit, isLoading = false }: TripFormProps) {
  const totalSteps = 3;
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), totalSteps));

  const { register, handleSubmit, control, setValue, getValues, trigger, formState: { errors } } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema as never),
    defaultValues: {
      destination: 'Paris',
      startDate: '',
      numberOfPeople: 1,
      ages: [{ value: 25 }],
      endDate: '',
      averagePrice: 'mid',
      intensity: 'balanced',
      dietaryOptions: [],
      dietaryCustom: "",
      medicalOptions: [],
      medicalCustom: "",
      ...initialValues,
    },
  });

  const { fields: ageFields, append, remove } = useFieldArray({
    control,
    name: "ages",
  });

  const numberOfPeople = useWatch({ control, name: "numberOfPeople" });
  const startDate = useWatch({ control, name: "startDate" });

  useEffect(() => {
    const currentCount = ageFields.length;
    const targetCount = Math.min(numberOfPeople || 0, MAX_TRAVELERS);

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) append({ value: 25 });
    } else if (targetCount < currentCount) {
      for (let i = currentCount - 1; i >= targetCount; i--) remove(i);
    }
  }, [numberOfPeople, ageFields.length, append, remove]);

  const intensity = useWatch({ control, name: "intensity" });
  const averagePrice = useWatch({ control, name: "averagePrice" });
  const currentDietary = useWatch({ control, name: "dietaryOptions" });
  const currentMedical = useWatch({ control, name: "medicalOptions" });

  const toggleArrayItem = (fieldName: "dietaryOptions" | "medicalOptions", itemId: string, currentArray: string[]) => {
    if (currentArray.includes(itemId)) {
      setValue(fieldName, currentArray.filter(i => i !== itemId), { shouldValidate: true });
    } else {
      setValue(fieldName, [...currentArray, itemId], { shouldValidate: true });
    }
  };

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    type FieldName = keyof TripFormValues;
    let fieldsToValidate: FieldName[] = [];

    if (step === 1) {
      fieldsToValidate = ['destination', 'startDate', 'endDate', 'numberOfPeople', 'ages'];
    } else if (step === 2) {
      fieldsToValidate = ['intensity', 'averagePrice'];
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setStep((prev: number) => prev + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep((prev: number) => prev - 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 border border-brand/15 bg-surface rounded-card mt-6">

      {/* --- EN-TÊTE ET BARRE DE PROGRESSION --- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-display font-normal text-ink">
            {step === 1 && "Les bases du voyage"}
            {step === 2 && "Le rythme & budget"}
            {step === 3 && "Les derniers détails"}
          </h1>
          <span className="text-sm font-medium text-ink-muted">Étape {step} sur {totalSteps}</span>
        </div>

        {/* Fills up to 100 % once the form is submitted, like the onboarding quiz. */}
        <ProgressBar value={isLoading ? 1 : (step - 1) / totalSteps} />
      </div>

      <form
        onSubmit={handleSubmit(
          onSubmit,
          (errs) => console.warn('Erreurs de validation :', errs),
        )}
        className="space-y-8"
      >
        
        {/* ================= ÉTAPE 1 : LES BASES ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input {...register("destination")} readOnly className="w-full border border-line-strong p-3 rounded-xl bg-background text-ink-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de départ</label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ?? ''}
                      invalid={!!errors.startDate}
                      onChange={(iso) => {
                        field.onChange(iso);
                        // The return date must stay within the allowed window after the new departure.
                        const end = getValues('endDate');
                        if (end && (end < iso || end > addDays(iso, MAX_TRIP_DAYS - 1))) setValue('endDate', '');
                      }}
                    />
                  )}
                />
                {errors.startDate && <span className="text-brand text-xs">{errors.startDate.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de retour</label>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker
                      key={startDate || 'no-start'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      min={startDate || undefined}
                      max={startDate ? addDays(startDate, MAX_TRIP_DAYS - 1) : undefined}
                      placeholder={startDate ? 'Choisis une date' : "Choisis d'abord le départ"}
                      invalid={!!errors.endDate}
                    />
                  )}
                />
                {errors.endDate && <span className="text-brand text-xs">{errors.endDate.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" id="travelers-label">Nombre de voyageurs</label>
                <Controller
                  control={control}
                  name="numberOfPeople"
                  render={({ field }) => (
                    <div
                      role="group"
                      aria-labelledby="travelers-label"
                      className="flex items-center justify-between rounded-xl border border-line-strong bg-background p-1.5"
                    >
                      <button
                        type="button"
                        aria-label="Retirer un voyageur"
                        disabled={field.value <= 1}
                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-brand transition hover:bg-accent disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        −
                      </button>
                      <span className="text-base font-semibold text-ink" aria-live="polite">
                        {field.value}
                      </span>
                      <button
                        type="button"
                        aria-label="Ajouter un voyageur"
                        disabled={field.value >= MAX_TRAVELERS}
                        onClick={() => field.onChange(Math.min(MAX_TRAVELERS, field.value + 1))}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-brand transition hover:bg-accent disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        +
                      </button>
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Âge des voyageurs</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {ageFields.map((field, index) => (
                  <div key={field.id}>
                    <label htmlFor={`age-${field.id}`} className="mb-1 block text-xs text-ink-muted">
                      Voyageur {index + 1}
                    </label>
                    <input
                      id={`age-${field.id}`}
                      type="number"
                      {...register(`ages.${index}.value`, { valueAsNumber: true })}
                      className={FIELD_CLASS}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 2 : RYTHME & BUDGET ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <fieldset>
              <legend className="block text-sm font-medium mb-2">Rythme souhaité</legend>
              <div role="radiogroup" aria-label="Rythme souhaité" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {INTENSITY_OPTIONS.map((option) => (
                  <OptionTile
                    key={option.id}
                    role="radio"
                    title={option.title}
                    description={option.description}
                    selected={intensity === option.id}
                    onToggle={() => setValue('intensity', option.id, { shouldValidate: true })}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="block text-sm font-medium mb-2">Budget moyen / personne</legend>
              <div role="radiogroup" aria-label="Budget moyen par personne" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {BUDGET_OPTIONS.map((option) => (
                  <OptionTile
                    key={option.id}
                    role="radio"
                    title={option.title}
                    description={option.description}
                    selected={averagePrice === option.id}
                    onToggle={() => setValue('averagePrice', option.id, { shouldValidate: true })}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* ================= ÉTAPE 3 : SANTÉ & PRÉCISIONS ================= */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <label className="block text-sm font-medium">Restrictions alimentaires</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DIETARY_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleArrayItem("dietaryOptions", option.id, currentDietary)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all cursor-pointer ${
                      currentDietary.includes(option.id) ? 'bg-brand text-accent border-brand' : 'bg-background text-ink-secondary border-line-strong hover:bg-background'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                {...register("dietaryCustom")} 
                placeholder="Autre chose à préciser ? (Ex: Allergie aux arachides)" 
                className={FIELD_CLASS}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <label className="block text-sm font-medium">Conditions médicales</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {MEDICAL_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleArrayItem("medicalOptions", option.id, currentMedical)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all cursor-pointer ${
                      currentMedical.includes(option.id) ? 'bg-brand text-accent border-brand' : 'bg-background text-ink-secondary border-line-strong hover:bg-background'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                {...register("medicalCustom")} 
                placeholder="Un besoin spécifique ? (Ex: Problèmes de dos)" 
                className={FIELD_CLASS}
              />
            </div>
          </div>
        )}

        {/* --- BOUTONS DE NAVIGATION --- */}
        <div className="pt-8 mt-8 border-t flex justify-between items-center">
          <button 
            type="button" 
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-6 py-3 font-medium rounded-lg transition-colors cursor-pointer ${step === 1 ? 'invisible' : 'text-ink-muted hover:bg-background'}`}
          >
            Retour
          </button>

          {step < totalSteps ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="px-8 py-3 bg-brand text-accent font-semibold rounded-xl shadow-lg shadow-brand/25 hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              Suivant
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 bg-cta text-ink font-semibold rounded-xl shadow-lg shadow-cta/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? "Génération..." : "Terminer ✨"}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
