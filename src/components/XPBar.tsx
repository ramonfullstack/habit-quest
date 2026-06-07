import React from 'react';
import { View, Text } from 'react-native';
import { xpProgressInLevel, xpProgressPercent, xpForNextLevel } from '../utils/xp';

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  const progress = xpProgressPercent(xp);
  const inLevel = xpProgressInLevel(xp);
  const needed = xpForNextLevel(level);

  return (
    <View className="w-full">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">Nível {level}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{inLevel}/{needed} XP</Text>
      </View>
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>
    </View>
  );
}
