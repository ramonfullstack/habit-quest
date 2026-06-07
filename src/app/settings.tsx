import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useHabitStore } from '../stores/habitStore';
import { useProgressStore } from '../stores/progressStore';
import { exportBackup, importBackup } from '../utils/backup';
import { progressRepository } from '../repositories/progressRepository';

type ColorScheme = 'light' | 'dark' | 'system';

const SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useSettingsStore();
  const { loadHabits } = useHabitStore();
  const { loadProgress } = useProgressStore();

  function reloadAll() {
    loadHabits();
    loadProgress();
  }

  function handleResetProgress() {
    Alert.alert(
      'Resetar progresso',
      'Isso vai zerar seu XP, nível e streak. Hábitos e histórico serão mantidos. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => {
            progressRepository.reset();
            loadProgress();
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {/* Theme */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5">
        <Text className="text-base font-bold text-gray-800 dark:text-white mb-3">Aparência</Text>
        <View className="flex-row gap-2">
          {SCHEMES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setColorScheme(s.value)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${
                colorScheme === s.value
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  colorScheme === s.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Backup */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5">
        <Text className="text-base font-bold text-gray-800 dark:text-white mb-3">Dados</Text>

        <TouchableOpacity
          onPress={() => exportBackup().catch((e) => Alert.alert('Erro', String(e)))}
          className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700"
        >
          <Text className="text-lg mr-3">📤</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-800 dark:text-white">Exportar backup</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Salva todos os dados como JSON</Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => importBackup(reloadAll)}
          className="flex-row items-center py-3"
        >
          <Text className="text-lg mr-3">📥</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-800 dark:text-white">Importar backup</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Restaura a partir de um arquivo JSON</Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>

      {/* Danger zone */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5">
        <Text className="text-base font-bold text-gray-800 dark:text-white mb-3">Zona de perigo</Text>
        <TouchableOpacity
          onPress={handleResetProgress}
          className="flex-row items-center py-3"
        >
          <Text className="text-lg mr-3">🔄</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-red-500">Resetar XP e streak</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Zera seu progresso, mantém os hábitos</Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View className="items-center mt-4">
        <Text className="text-xs text-gray-400 dark:text-gray-500">HabitQuest v1.0.0</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">100% offline • Seus dados ficam no seu celular</Text>
      </View>
    </ScrollView>
  );
}
