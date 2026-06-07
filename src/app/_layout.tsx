import '../../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from '../database/migrations';
import { useHabitStore } from '../stores/habitStore';
import { useProgressStore } from '../stores/progressStore';
import { useSettingsStore } from '../stores/settingsStore';
import { requestNotificationPermissions } from '../hooks/useNotifications';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { colorScheme, hydrate } = useSettingsStore();
  const loadHabits = useHabitStore((s) => s.loadHabits);
  const loadProgress = useProgressStore((s) => s.loadProgress);

  useEffect(() => {
    runMigrations();
    loadHabits();
    loadProgress();
    hydrate();
    requestNotificationPermissions().catch(() => null);
  }, []);

  const effectiveScheme = colorScheme === 'system' ? systemScheme : colorScheme;
  const isDark = effectiveScheme === 'dark';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#111827' : '#ffffff' },
          headerTintColor: isDark ? '#f9fafb' : '#111827',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: isDark ? '#111827' : '#f3f4f6' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'HabitQuest' }} />
        <Stack.Screen name="habits/create" options={{ title: 'Novo Hábito', presentation: 'modal' }} />
        <Stack.Screen name="habits/[id]" options={{ title: 'Editar Hábito', presentation: 'modal' }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      </Stack>
    </>
  );
}
