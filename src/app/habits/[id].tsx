import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { habitRepository, Frequency } from '../../repositories/habitRepository';
import { useHabitStore } from '../../stores/habitStore';
import { Button } from '../../components/Button';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  requestNotificationPermissions,
} from '../../hooks/useNotifications';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateHabit, deleteHabit } = useHabitStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const habit = habitRepository.getById(id);
    if (!habit) { router.back(); return; }
    setTitle(habit.title);
    setDescription(habit.description ?? '');
    setFrequency(habit.frequency);
    setReminderEnabled(!!habit.reminder_time);
    setReminderTime(habit.reminder_time ?? '08:00');
    setNotificationId(habit.notification_id);
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'O nome do hábito é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      let newNotifId: string | null = notificationId;

      if (notificationId) {
        await cancelHabitReminder(notificationId).catch(() => null);
        newNotifId = null;
      }

      if (reminderEnabled && reminderTime) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          newNotifId = await scheduleHabitReminder(id, title.trim(), reminderTime);
        }
      }

      updateHabit(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        reminder_time: reminderEnabled ? reminderTime : undefined,
        notification_id: newNotifId,
      });

      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Excluir hábito',
      `Tem certeza que deseja excluir "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (notificationId) {
              await cancelHabitReminder(notificationId).catch(() => null);
            }
            deleteHabit(id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Nome *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#9ca3af"
          className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
          maxLength={80}
        />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Descrição</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Opcional"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
          textAlignVertical="top"
          maxLength={200}
        />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Frequência</Text>
        <View className="flex-row gap-3">
          {(['daily', 'weekly'] as Frequency[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFrequency(f)}
              className={`flex-1 py-3 rounded-xl items-center border ${
                frequency === f
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Text className={`font-semibold ${frequency === f ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {f === 'daily' ? 'Diário' : 'Semanal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-8 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">Lembrete diário</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          />
        </View>
        {reminderEnabled && (
          <View className="mt-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horário (HH:MM)</Text>
            <TextInput
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="08:00"
              placeholderTextColor="#9ca3af"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base"
              maxLength={5}
            />
          </View>
        )}
      </View>

      <Button label="Salvar" onPress={handleSave} loading={saving} className="mb-3" />
      <Button label="Excluir Hábito" onPress={handleDelete} variant="destructive" />
    </ScrollView>
  );
}
