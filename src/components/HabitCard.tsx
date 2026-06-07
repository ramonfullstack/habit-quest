import React, { useMemo, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';

interface HabitCardProps {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  completedToday: boolean;
  onToggle: () => void;
}

export function HabitCard({ id, title, description, frequency, completedToday, onToggle }: HabitCardProps) {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = 80;
        const shouldToggle = Math.abs(gesture.dx) > threshold;

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();

        if (shouldToggle) {
          onToggle();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      },
    }),
    [onToggle, translateX]
  );

  return (
    <View className="mb-3">
      <View className="absolute inset-0 rounded-2xl bg-primary-500/10 items-center justify-center">
        <Text className="text-xs font-semibold text-primary-600">
          Deslize para {completedToday ? 'desmarcar' : 'concluir'}
        </Text>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/habits/${id}`)}
          activeOpacity={0.8}
          className="flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        >
          <Pressable
            onPress={(e) => { e.stopPropagation(); onToggle(); }}
            className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
              completedToday
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {completedToday && <Text className="text-white text-xs font-bold">✓</Text>}
          </Pressable>

          <View className="flex-1">
            <Text
              className={`text-base font-semibold ${
                completedToday
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-800 dark:text-gray-100'
              }`}
            >
              {title}
            </Text>
            {description ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
                {description}
              </Text>
            ) : null}
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{frequency}</Text>
          </View>

          <Text className="text-gray-400 dark:text-gray-500 text-lg">›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
