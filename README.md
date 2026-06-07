# HabitQuest

App de rastreamento de hábitos com gamificação — 100% offline, sem backend, sem login.

<p align="center">
  <img src="assets/icon.png" width="120" alt="HabitQuest icon" />
</p>

---

## Funcionalidades

- Criar, editar e excluir hábitos (diários ou semanais)
- Marcar hábito como concluído (toggle)
- Sistema de XP: +10 XP por hábito concluído
- Sistema de níveis: a cada 100 XP sobe um nível
- Streak: dias consecutivos com pelo menos 1 hábito feito
- Dashboard semanal com grid de conclusões e taxa de aproveitamento
- Notificações locais com horário configurável por hábito
- Backup e restauração via JSON (exporta/importa pelo celular)
- Tema claro, escuro ou automático (segue o sistema)
- Banco de dados local SQLite — dados ficam no celular do usuário

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | [Expo SDK 56](https://docs.expo.dev) + [Expo Router v4](https://expo.github.io/router) |
| Banco de dados | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| Estado global | [Zustand](https://zustand-demo.pmnd.rs) |
| Estilização | [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS p/ React Native) |
| Notificações | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| Backup | [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) + [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) |

---

## Estrutura do projeto

```
HabitQuest/
├── src/
│   ├── app/                    # Telas (Expo Router)
│   │   ├── _layout.tsx         # Layout raiz + inicialização
│   │   ├── index.tsx           # Home — lista de hábitos do dia
│   │   ├── dashboard.tsx       # Dashboard semanal
│   │   ├── settings.tsx        # Configurações
│   │   └── habits/
│   │       ├── create.tsx      # Criar hábito
│   │       └── [id].tsx        # Editar / excluir hábito
│   ├── database/
│   │   ├── db.ts               # Singleton SQLite
│   │   └── migrations.ts       # Criação das tabelas
│   ├── repositories/           # Acesso ao banco de dados
│   │   ├── habitRepository.ts
│   │   ├── habitLogRepository.ts
│   │   └── progressRepository.ts
│   ├── stores/                 # Estado global (Zustand)
│   │   ├── habitStore.ts
│   │   ├── progressStore.ts
│   │   └── settingsStore.ts
│   ├── components/             # Componentes reutilizáveis
│   │   ├── HabitCard.tsx
│   │   ├── XPBar.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── WeekGrid.tsx
│   │   └── Button.tsx
│   ├── hooks/
│   │   └── useNotifications.ts
│   └── utils/
│       ├── xp.ts               # Lógica de XP e níveis
│       └── backup.ts           # Export/import JSON
├── assets/                     # Ícones e splash screen
├── global.css                  # Tailwind base (NativeWind)
├── app.json                    # Configuração do Expo
├── babel.config.js
├── metro.config.js
└── tailwind.config.js
```

---

## Schema do banco de dados

```sql
habits          (id, title, description, frequency, reminder_time, notification_id, active, created_at)
habit_logs      (id, habit_id, completed_date, created_at)
user_progress   (id, xp, level, current_streak, last_completed_date)
```

---

## Rodando localmente

### Pré-requisitos

- Node.js 18+
- [Expo Go](https://expo.dev/go) instalado no celular **ou** simulador iOS/Android

### Instalação

```bash
git clone https://github.com/seu-usuario/HabitQuest.git
cd HabitQuest
npm install
```

### Iniciar

```bash
npm start          # abre o Metro bundler
npm run ios        # simulador iOS
npm run android    # emulador Android
```

Escaneie o QR code com o Expo Go para abrir no seu celular.

---

## Publicando nas lojas

### Pré-requisitos de conta

| Loja | Conta | Custo |
|---|---|---|
| App Store (iOS) | [Apple Developer Program](https://developer.apple.com/programs/) | US$ 99/ano |
| Google Play (Android) | [Google Play Console](https://play.google.com/console) | US$ 25 único |

Você também precisa de uma conta no [Expo](https://expo.dev) (gratuita) e do **EAS CLI**.

### 1. Instalar EAS CLI e fazer login

```bash
npm install -g eas-cli
eas login
```

### 2. Configurar o projeto no Expo

```bash
eas build:configure
```

Isso gera o arquivo `eas.json` com os perfis de build. Aceite os padrões quando perguntado.

### 3. Atualizar identificadores em `app.json`

Antes de buildar, certifique-se de que os campos abaixo estão preenchidos corretamente no `app.json`:

```json
{
  "expo": {
    "name": "HabitQuest",
    "slug": "HabitQuest",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.seudominio.habitquest"
    },
    "android": {
      "package": "com.seudominio.habitquest"
    }
  }
}
```

> Os identificadores devem ser únicos nas lojas. Use seu domínio invertido (ex: `com.ramonsilva.habitquest`).

---

### Publicando no Google Play (Android)

#### Build

```bash
eas build --platform android --profile production
```

O EAS gera um arquivo `.aab` (Android App Bundle). Aguarde o build terminar (5–15 min) e baixe o arquivo.

#### Configurar o Google Play Console

1. Acesse [play.google.com/console](https://play.google.com/console) e crie um novo app
2. Preencha as informações: nome, descrição, capturas de tela, ícone
3. Em **Produção → Versões → Criar nova versão**, faça upload do `.aab`
4. Preencha as notas de versão e envie para revisão

#### Enviar via EAS Submit (alternativa)

```bash
eas submit --platform android
```

O EAS faz o upload diretamente para o Play Console se você configurar as credenciais de API.

---

### Publicando na App Store (iOS)

#### Pré-requisito: criar o app no App Store Connect

1. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Vá em **Meus Apps → Novo App**
3. Preencha nome, SKU, Bundle ID (deve bater com o `bundleIdentifier` no `app.json`)

#### Build

```bash
eas build --platform ios --profile production
```

O EAS cuida automaticamente dos certificados e provisioning profiles (via Apple Developer API). Aguarde o build (10–20 min).

#### Enviar para o TestFlight / Produção

**Via EAS Submit (recomendado):**

```bash
eas submit --platform ios
```

Selecione o build gerado quando perguntado. O EAS envia o `.ipa` para o App Store Connect.

**Manualmente:**

Baixe o `.ipa` e use o [Transporter](https://apps.apple.com/app/transporter/id1450874784) (Mac) para fazer o upload.

Após o upload, o build aparece no **TestFlight** em poucos minutos. Para publicar em produção, vá em **App Store → Enviar para revisão** no App Store Connect.

---

### Builds simultâneos (iOS + Android)

```bash
eas build --platform all --profile production
```

---

### Perfil `eas.json` recomendado

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Checklist antes de publicar

- [ ] Ícone 1024×1024px em `assets/icon.png`
- [ ] Splash screen em `assets/splash-icon.png`
- [ ] `bundleIdentifier` / `package` únicos no `app.json`
- [ ] `version` e `buildNumber`/`versionCode` corretos
- [ ] Capturas de tela do app (mínimo 3 por dispositivo)
- [ ] Descrição, palavras-chave e categoria preenchidas nas lojas
- [ ] Testado em dispositivo real (especialmente notificações)
- [ ] Política de privacidade (exigida pelas duas lojas para apps com notificações)

---

## Lógica de XP e gamificação

| Ação | XP |
|---|---|
| Completar um hábito | +10 XP |
| Desmarcar um hábito | -10 XP |

```
Nível = floor(XP total / 100) + 1
XP para próximo nível = nível_atual × 100
```

**Streak:** incrementa quando o `last_completed_date` é igual a ontem. Reseta se houver um dia sem completar nenhum hábito.

---

## Roadmap v2 (com backend)

- [ ] Autenticação com Supabase (Google, Apple)
- [ ] Sincronização entre dispositivos
- [ ] Hábitos em equipe / desafios com amigos
- [ ] Estatísticas avançadas e gráficos
- [ ] Monetização: RevenueCat + plano premium
- [ ] AdMob para versão gratuita

---

## Licença

MIT © Ramon Silva
