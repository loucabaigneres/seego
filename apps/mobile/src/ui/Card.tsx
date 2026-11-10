import { View, type ViewProps } from 'react-native';

import { cn } from './cn';

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return <View className={cn('rounded-card border border-brand/15 bg-surface p-5', className)} {...props} />;
}
