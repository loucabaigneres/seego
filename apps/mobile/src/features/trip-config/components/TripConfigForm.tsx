import { ScrollView, View } from 'react-native';

import { Button, Notice, Reveal, StepHeader, Text } from '@/ui';

import type { TripConfig } from '../hooks/useTripConfig';
import { STEP_COPY } from '../options';
import { StepConstraints } from './StepConstraints';
import { StepStyle } from './StepStyle';
import { StepTravelers } from './StepTravelers';

const STEPS = { travelers: StepTravelers, style: StepStyle, constraints: StepConstraints };

function submitLabel(config: TripConfig): string {
  if (config.isSubmitting) return 'Génération…';
  return config.isLastStep ? 'Générer mon voyage' : 'Continuer';
}

export function TripConfigForm({ config, destination }: { config: TripConfig; destination: string }) {
  const { step } = config;
  const Step = STEPS[step.key];
  const copy = STEP_COPY[step.key];

  return (
    <>
      <View className="px-6">
        <StepHeader
          label={`Étape ${step.current} sur ${step.total}`}
          backLabel="Revenir à l’étape précédente"
          progress={step.progress}
          segments={step.total}
          onBack={config.goBack}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* `key` restarts the entrance animation on each step. */}
        <Reveal key={step.key} className="gap-6">
          <View className="gap-2">
            <Text variant="overline" tone="brand">
              Ton voyage à {destination}
            </Text>
            <Text variant="title" role="heading">
              {copy.title}
            </Text>
            <Text tone="muted">{copy.subtitle}</Text>
          </View>
          <Step values={config.values} errors={config.errors} dispatch={config.dispatch} />
        </Reveal>
      </ScrollView>

      <View className="gap-3 px-6">
        {config.hasFailed && (
          <Notice message="Impossible de préparer ton voyage pour le moment. Vérifie ta connexion et réessaie." />
        )}
        <Button label={submitLabel(config)} loading={config.isSubmitting} onPress={config.goForward} />
      </View>
    </>
  );
}
