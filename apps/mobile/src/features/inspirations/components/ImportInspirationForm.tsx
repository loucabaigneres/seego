import { Pressable, View } from 'react-native';

import { Button, Notice, Text, TextField } from '@/ui';

import type { ImportForm } from '../hooks/useImportInspiration';

/** Link (pasted or shared), optional caption, then the AI analysis. */
export function ImportInspirationForm({ form }: { form: ImportForm }) {
  return (
    <View className="gap-5">
      <View className="gap-2">
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
        <Button
          label="Coller le lien"
          variant="ghost"
          size="sm"
          onPress={form.paste}
          disabled={form.isAnalyzing}
          className="self-start px-0"
        />
      </View>

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
          className="self-start active:opacity-60"
        >
          <Text variant="caption" tone="brand" className="underline">
            Un problème ? Colle la description du post
          </Text>
        </Pressable>
      )}

      {form.error && <Notice message={form.error} />}

      <View className="gap-2">
        <Button
          label={form.isAnalyzing ? 'Analyse en cours…' : 'Analyser l’inspiration'}
          variant="cta"
          loading={form.isAnalyzing}
          onPress={form.analyze}
        />
        {form.isAnalyzing && (
          <Text variant="caption" className="text-center">
            Ça peut prendre une trentaine de secondes.
          </Text>
        )}
      </View>
    </View>
  );
}
