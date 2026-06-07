import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useHabitStore } from '../../stores/habitStore';
import { Frequency } from '../../repositories/habitRepository';
import { Button } from '../../components/Button';
import { scheduleHabitReminder, requestNotificationPermissions } from '../../hooks/useNotifications';
import { habitRepository } from '../../repositories/habitRepository';

function formatTime(date: Date): string {
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

function parseTime(time: string): Date {
  const [hour, minute] = time.split(':').map((v) => parseInt(v, 10));
  const date = new Date();
  date.setHours(Number.isNaN(hour) ? 8 : hour, Number.isNaN(minute) ? 0 : minute, 0, 0);
  return date;
}

export default function CreateHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  function onTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setReminderTime(formatTime(selectedDate));
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'O nome do hábito é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const habit = addHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        reminder_time: reminderEnabled ? reminderTime : undefined,
      });

      if (reminderEnabled && reminderTime) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          const notifId = await scheduleHabitReminder(habit.id, habit.title, reminderTime);
          habitRepository.update(habit.id, { notification_id: notifId });
        }
      }

      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Nome *
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Meditar 10 minutos"
          placeholderTextColor="#9ca3af"
          className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
          maxLength={80}
        />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Descrição
        </Text>
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
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Frequência
        </Text>
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
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Lembrete diário
          </Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          />
        </View>
        {reminderEnabled && (
          <View className="mt-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horário</Text>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              <Text className="text-gray-900 dark:text-white text-base">{reminderTime}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <View className="mt-2">
                <DateTimePicker
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={parseTime(reminderTime)}
                  onChange={onTimeChange}
                  is24Hour
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(false)}
                    className="self-end mt-2 px-3 py-1.5 rounded-lg bg-primary-500"
                  >
                    <Text className="text-white text-sm font-semibold">Confirmar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      <Button label="Criar Hábito" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}
