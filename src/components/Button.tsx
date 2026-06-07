import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-500 active:bg-primary-700',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-primary-100 dark:bg-primary-700 active:opacity-80',
    text: 'text-primary-600 dark:text-white font-semibold',
  },
  destructive: {
    container: 'bg-red-500 active:bg-red-700',
    text: 'text-white font-semibold',
  },
  ghost: {
    container: 'active:opacity-60',
    text: 'text-primary-600 dark:text-primary-300 font-semibold',
  },
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, className }: ButtonProps) {
  const v = variantClasses[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-xl px-5 py-3.5 ${v.container} ${disabled || loading ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className={`text-base ${v.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
