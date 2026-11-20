import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message: string;
  /** Label of the destructive button. */
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

/** Native "are you sure?" dialog before a destructive action. */
export function confirmDestructive({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  onConfirm,
}: ConfirmOptions) {
  // react-native-web's Alert is a no-op.
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
