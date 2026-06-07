import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useHabitStore } from '../stores/habitStore';
import { useProgressStore } from '../stores/progressStore';
import { habitLogRepository } from '../repositories/habitLogRepository';
import { WeekGrid } from '../components/WeekGrid';
import { XPBar } from '../components/XPBar';
import { StreakBadge } from '../components/StreakBadge';

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function DashboardScreen() {
  const { habits } = useHabitStore();
  const { xp, level, current_streak } = useProgressStore();

  const days = useMemo(() => getLast7Days(), []);
  const logs = useMemo(
    () => habitLogRepository.getLogsForRange(days[0], days[6]),
    [days]
  );

  const totalCompleted = logs.length;
  const totalPossible = habits.length * 7;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {/* Stats row */}
      <View className="flex-row gap-3 mb-5">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
          <Text className="text-3xl font-bold text-primary-500">{completionRate}%</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Taxa essa semana</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white">{totalCompleted}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Completados</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 items-center">
          <StreakBadge streak={current_streak} />
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Streak</Text>
        </View>
      </View>

      {/* XP / Level */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5">
        <Text className="text-base font-bold text-gray-800 dark:text-white mb-3">
          Nível {level}
        </Text>
        <XPBar xp={xp} level={level} />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {xp} XP total acumulado
        </Text>
      </View>

      {/* Weekly grid */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
        <Text className="text-base font-bold text-gray-800 dark:text-white mb-4">
          Últimos 7 dias
        </Text>
        {habits.length === 0 ? (
          <Text className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
            Nenhum hábito para exibir
          </Text>
        ) : (
          <WeekGrid habits={habits} logs={logs} days={days} />
        )}
      </View>
    </ScrollView>
  );
}
