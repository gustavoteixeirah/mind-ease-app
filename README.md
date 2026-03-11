# Mind Ease App

Aplicativo de produtividade e bem-estar mental para organizar tarefas, acompanhar energia e usar modo foco (técnica Pomodoro). Desenvolvido com **Expo** e **React Native**, funciona em **web**, **Android** e **iOS**.

---

## Funcionalidades

- **Dashboard** – Tarefas do dia, seleção de energia (Calmo / Presente / Focado) e sugestão de tarefa para o momento
- **Lista de tarefas** – Visualização por data, marcar conclusão, editar e excluir
- **Criar/editar tarefa** – Título, data, esforço (Leve/Normal/Exigente), prioridade, tempo estimado, subtarefas e tags
- **Modo foco** – Sessões de foco com timer, subtarefas e pausas configuráveis (25/30/35 min foco, 2/5/10 min pausa)
- **Perfil** – Aparência (claro/escuro/sistema), tema de cor, tamanho da fonte (compacto/conforto/acessível), duração do foco e da pausa
- **Autenticação** – Login com [Stack Auth](https://stack-auth.com/) (email/senha ou provedores sociais)

---

## Tecnologias

| Área           | Stack |
|----------------|--------|
| Framework      | Expo SDK 54, React 19, React Native |
| Navegação      | Expo Router, React Navigation (tabs + stack) |
| Autenticação   | Stack Auth (@stackframe/js) |
| Armazenamento  | AsyncStorage, MMKV (preferências) |
| UI             | Lucide React Native, expo-linear-gradient, react-native-safe-area-context |

---

## Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- Para **Android**: Android Studio e emulador ou dispositivo
- Para **iOS**: Xcode (apenas macOS)
- Conta no [Stack Auth](https://stack-auth.com/) para autenticação (opcional para desenvolvimento local)

---

## Instalação

1. Clone o repositório e entre na pasta:

```bash
git clone <url-do-repositorio>
cd mind-ease-app
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente (autenticação Stack):

Crie um arquivo `.env.local` na raiz do projeto com:

```env
EXPO_PUBLIC_STACK_PROJECT_ID=seu_project_id
EXPO_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua_publishable_key
STACK_SECRET_SERVER_KEY=sua_secret_server_key
```

> Os valores são obtidos no painel do [Stack Auth](https://stack-auth.com/). Não commite o `.env.local` (já deve estar no `.gitignore`).

---

## Como rodar

| Comando            | Descrição |
|--------------------|-----------|
| `npm run start`    | Inicia o Expo (QR code para device, atalhos para web/android/ios) |
| `npm run web`      | Abre no navegador |
| `npm run android`  | Build e execução no Android (Expo dev client / `expo run:android`) |
| `npm run ios`       | Build e execução no iOS (apenas macOS) |
| `npm run lint`     | Executa o ESLint |

### Desenvolvimento

- **Web**: após `npm run start`, pressione `w` ou use `npm run web`.
- **Android**: conecte um dispositivo ou inicie um emulador e pressione `a`, ou use `npx expo run:android`.
- **iOS**: `npx expo run:ios` (macOS com Xcode instalado).

---

## Estrutura do projeto (resumo)

```
mind-ease-app/
├── app/                    # Rotas (Expo Router)
│   ├── (app)/               # Telas autenticadas
│   │   ├── _layout.tsx      # Stack (Tabs, FocusMode, Profile)
│   │   ├── dashboard.tsx    # Home
│   │   └── profile.tsx      # Perfil / preferências
│   ├── (auth)/              # Login
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Redireciona por auth
├── Navigation.tsx           # Tab navigator (Home, Tarefas, Perfil, AddTask)
├── screens/                 # Telas principais
│   ├── AddEditTaskScreen.tsx
│   ├── TaskListScreen.tsx
│   ├── EditTaskListScreen.tsx
│   └── FocusModeScreen.tsx
├── components/              # Componentes reutilizáveis
│   └── ui/
│       └── list-item.tsx
├── context/                 # Contextos React
│   ├── auth-context.tsx
│   ├── tasks-context.tsx
│   ├── font-scale-context.tsx
│   ├── theme-accent-context.tsx
│   └── appearance-context.tsx
├── hooks/                   # Hooks (tema, cores)
├── lib/                     # Utilitários (storage, stack-auth)
├── constants/               # Tema, cores
└── assets/
```

---

## Licença

Projeto privado. Uso conforme definido pelos mantenedores.
