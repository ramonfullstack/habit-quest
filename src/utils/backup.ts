import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { db } from '../database/db';
import { habitRepository } from '../repositories/habitRepository';
import { habitLogRepository } from '../repositories/habitLogRepository';
import { progressRepository } from '../repositories/progressRepository';

interface BackupData {
  version: number;
  exported_at: string;
  habits: ReturnType<typeof habitRepository.getAllForBackup>;
  logs: ReturnType<typeof habitLogRepository.getAllForBackup>;
  progress: ReturnType<typeof progressRepository.get>;
}

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 1,
    exported_at: new Date().toISOString(),
    habits: habitRepository.getAllForBackup(),
    logs: habitLogRepository.getAllForBackup(),
    progress: progressRepository.get(),
  };

  const json = JSON.stringify(data, null, 2);
  const file = new File(Paths.document, 'habitquest-backup.json');
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
  } else {
    Alert.alert('Backup salvo', `Arquivo em: ${file.uri}`);
  }
}

export async function importBackup(onSuccess: () => void): Promise<void> {
  let picked: File;
  try {
    const result = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain'] });
    if (result.canceled || !result.result) return;
    picked = result.result as File;
  } catch {
    return;
  }

  let data: BackupData;
  try {
    const json = await picked.text();
    data = JSON.parse(json) as BackupData;
    if (!data.habits || !data.logs || !data.progress) throw new Error('invalid');
  } catch {
    Alert.alert('Erro', 'Arquivo de backup inválido.');
    return;
  }

  Alert.alert(
    'Restaurar backup',
    'Isso vai sobrescrever todos os dados atuais. Continuar?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        style: 'destructive',
        onPress: () => {
          db.execSync('DELETE FROM habit_logs; DELETE FROM habits; DELETE FROM user_progress;');

          for (const h of data.habits) {
            db.runSync(
              `INSERT OR REPLACE INTO habits (id, title, description, frequency, reminder_time, notification_id, active, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [h.id, h.title, h.description, h.frequency, h.reminder_time, h.notification_id, h.active, h.created_at]
            );
          }

          for (const l of data.logs) {
            db.runSync(
              `INSERT OR REPLACE INTO habit_logs (id, habit_id, completed_date, created_at)
               VALUES (?, ?, ?, ?)`,
              [l.id, l.habit_id, l.completed_date, l.created_at]
            );
          }

          const p = data.progress;
          db.runSync(
            `INSERT OR REPLACE INTO user_progress (id, xp, level, current_streak, last_completed_date)
             VALUES (?, ?, ?, ?, ?)`,
            [p.id, p.xp, p.level, p.current_streak, p.last_completed_date]
          );

          Alert.alert('Sucesso', 'Backup restaurado com sucesso!');
          onSuccess();
        },
      },
    ]
  );
}
