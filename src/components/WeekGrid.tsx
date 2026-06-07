import React from 'react';
import { View, Text } from 'react-native';
import { HabitLog } from '../repositories/habitLogRepository';
import { Habit } from '../repositories/habitRepository';

interface WeekGridProps {
  habits: Habit[];
  logs: HabitLog[];
  days: string[]; // 7 dates as 'YYYY-MM-DD'
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function WeekGrid({ habits, logs, days }: WeekGridProps) {
  const logSet = new Set(logs.map((l) => `${l.habit_id}|${l.completed_date}`));

  return (
    <View>
      <View className="flex-row justify-end mb-1 gap-2 pr-1">
        {days.map((d) => {
          const date = new Date(d + 'T12:00:00');
          return (
            <View key={d} className="w-7 items-center">
              <Text className="text-xs text-gray-400">{DAY_LABELS[date.getDay()]}</Text>
            </View>
          );
        })}
      </View>

      {habits.map((h) => (
        <View key={h.id} className="flex-row items-center gap-2 mb-2">
          <Text className="flex-1 text-sm text-gray-700 dark:text-gray-200" numberOfLines={1}>
            {h.title}
          </Text>
          <View className="flex-row gap-2">
            {days.map((d) => {
              const done = logSet.has(`${h.id}|${d}`);
              return (
                <View
                  key={d}
                  className={`w-7 h-7 rounded-md ${
                    done ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                />
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
