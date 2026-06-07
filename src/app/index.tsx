import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitStore } from '../stores/habitStore';
import { useProgressStore } from '../stores/progressStore';
import { HabitCard } from '../components/HabitCard';
import { XPBar } from '../components/XPBar';
import { StreakBadge } from '../components/StreakBadge';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, loading, loadHabits, toggleComplete } = useHabitStore();
  const { xp, level, current_streak, loadProgress } = useProgressStore();

  function refresh() {
    loadHabits();
    loadProgress();
  }

  const completedCount = habits.filter((h) => h.completedToday).length;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header card */}
      <View className="bg-white dark:bg-gray-800 px-5 pt-5 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Hoje
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount}/{habits.length} hábitos
            </Text>
          </View>
          <StreakBadge streak={current_streak} />
        </View>
        <XPBar xp={xp} level={level} />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {habits.length === 0 ? (
          <View className="items-center mt-16">
            <Text className="text-5xl mb-4">🌱</Text>
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Nenhum hábito ainda
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              Crie seu primeiro hábito e comece sua jornada!
            </Text>
          </View>
        ) : (
          habits.map((h) => (
            <HabitCard
              key={h.id}
              id={h.id}
              title={h.title}
              description={h.description}
              frequency={h.frequency}
              completedToday={h.completedToday}
              onToggle={() => { toggleComplete(h.id); loadProgress(); }}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-row px-6 py-3 pb-8">
        <TouchableOpacity
          className="flex-1 items-center"
          onPress={() => router.push('/dashboard')}
        >
          <Text className="text-2xl">📊</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-14 h-14 bg-primary-500 rounded-full items-center justify-center -mt-7 shadow-lg"
          onPress={() => router.push('/habits/create')}
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center"
          onPress={() => router.push('/settings')}
        >
          <Text className="text-2xl">⚙️</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Config</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
