import React from 'react';
import { View, Text } from 'react-native';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View className="flex-row items-center gap-1 bg-accent-500/10 rounded-full px-3 py-1">
      <Text className="text-base">🔥</Text>
      <Text className="text-sm font-bold text-accent-600 dark:text-accent-500">{streak}</Text>
    </View>
  );
}
