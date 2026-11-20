import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { Button, cn, Notice, Text, TextField } from '@/ui';
import { ClipboardTextIcon } from '@/ui/icons';

import { useClipboardLink } from '../hooks/useClipboardLink';
import type { ImportForm } from '../hooks/useImportInspiration';
import { shortUrl } from '../lib/inspiration';

const STEPS = [
  'Colle le lien d’un TikTok ou d’un Reel',
  'On lit la vidéo et sa légende',
  'On repère les lieux pour tes voyages',
];

function ImportSteps() {
  return (
    <View role="list">
      {STEPS.map((step, index) => (
        <View
          key={step}
          role="listitem"
          className={cn(
            'flex-row items-baseline gap-3.5 py-2.5',
            index < STEPS.length - 1 && 'border-b border-line',
          )}
        >
          <Text variant="section" className="w-7 text-[22px] leading-[22px] text-cta">
            {String(index + 1).padStart(2, '0')}
          </Text>
          <Text className="flex-1 text-control">{step}</Text>
        </View>
      ))}
    </View>
  );
}

/** "Lien trouvé dans ton presse-papier": fills the field in one tap. */
function ClipboardCard({ form }: { form: ImportForm }) {
  const clipboard = useClipboardLink({ enabled: !form.url });
  if (form.url || !clipboard.suggestion) return null;
  const { suggestion } = clipboard;

  return (
    <View className="flex-row items-center gap-3 rounded-card bg-surface px-4 py-3.5">
      <ClipboardTextIcon size={24} color={colors.brand} />
      <View className="min-w-0 flex-1">
        <Text variant="label" className="text-control">
          {suggestion.kind === 'link' ? 'Lien trouvé dans ton presse-papier' : 'Lien dans ton presse-papier'}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {suggestion.kind === 'link' ? shortUrl(suggestion.url) : 'Touche « Utiliser » pour le coller.'}
        </Text>
      </View>
      <Button
        label="Utiliser"
        variant="text"
        size="sm"
        disabled={form.isAnalyzing}
        onPress={async () => {
          await form.paste();
          clipboard.dismiss();
        }}
        className="px-2"
      />
    </View>
  );
}

/** Link (pasted or shared), optional caption, then the AI analysis. */
export function ImportInspirationForm({ form }: { form: ImportForm }) {
  return (
    <View className="flex-1 gap-5">
      <ImportSteps />
      <ClipboardCard form={form} />

      <TextField
        label="Lien TikTok ou Instagram"
        placeholder="https://www.tiktok.com/@compte/video/…"
        value={form.url}
        onChangeText={form.setUrl}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!form.isAnalyzing}
        returnKeyType="go"
        onSubmitEditing={form.analyze}
      />

      {form.showCaption ? (
        <View className="gap-2">
          <TextField
            label="Colle la description du post"
            placeholder="Colle ici la légende de la publication, avec ses #hashtags…"
            value={form.caption}
            onChangeText={form.setCaption}
            multiline
            maxLength={5000}
            editable={!form.isAnalyzing}
            textAlignVertical="top"
            style={{ minHeight: 112, paddingTop: 14 }}
          />
          <Text variant="caption">
            Certaines publications (surtout sur Instagram) ne peuvent pas être lues automatiquement.
          </Text>
        </View>
      ) : (
        <Pressable
          role="button"
          onPress={form.openCaption}
          className="-mt-2 self-start active:opacity-60"
        >
          <Text variant="caption" tone="brand" className="underline">
            Un problème ? Colle la description du post
          </Text>
        </Pressable>
      )}

      {form.error && <Notice message={form.error} />}

      <View className="mt-auto items-center gap-2.5">
        <Button
          label={form.isAnalyzing ? 'Analyse en cours…' : 'Analyser l’inspiration'}
          variant="cta"
          loading={form.isAnalyzing}
          onPress={form.analyze}
          className="self-stretch"
        />
        <Text variant="caption" className="text-center">
          {form.isAnalyzing
            ? 'Ça peut prendre une trentaine de secondes.'
            : 'Astuce : partage la vidéo à Seego depuis TikTok.'}
        </Text>
      </View>
    </View>
  );
}
