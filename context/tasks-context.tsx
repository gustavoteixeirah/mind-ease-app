import {
  PreferenceKeys,
  getPreferenceString,
  setPreferenceString,
} from "@/lib/storage";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type TaskPriority = "baixa" | "normal" | "alta";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  complexity: string;
  priority: TaskPriority;
  time: string;
  date: string;
  tags?: string[];
  focusModeEnabled?: boolean;
  description?: string;
  subtasks?: { id: string; text: string }[];
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const todayKey = formatDateKey(new Date());

const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    title: "Escrever dissertação",
    completed: false,
    complexity: "Média",
    priority: "alta",
    time: "1h30m",
    date: todayKey,
    focusModeEnabled: true,
    subtasks: [
      { id: "st1-1", text: "Definir estrutura e índice" },
      { id: "st1-2", text: "Escrever introdução" },
      { id: "st1-3", text: "Desenvolver capítulo 1" },
      { id: "st1-4", text: "Revisar referências" },
    ],
  },
  {
    id: "2",
    title: "Ler 3 capítulos",
    completed: false,
    complexity: "Baixa",
    priority: "normal",
    time: "2h",
    date: todayKey,
    focusModeEnabled: true,
    subtasks: [
      { id: "st2-1", text: "Capítulo 1 – anotações" },
      { id: "st2-2", text: "Capítulo 2 – resumo" },
      { id: "st2-3", text: "Capítulo 3 – dúvidas para tirar" },
    ],
  },
  {
    id: "3",
    title: "Escrever e-mails",
    completed: true,
    complexity: "Baixa",
    priority: "baixa",
    time: "30m",
    date: todayKey,
    focusModeEnabled: true,
  },
  {
    id: "4",
    title: "Revisar apresentação",
    completed: false,
    complexity: "Média",
    priority: "normal",
    time: "45m",
    date: todayKey,
    focusModeEnabled: false,
  },
  {
    id: "5",
    title: "Entregar relatório final",
    completed: false,
    complexity: "Alta",
    priority: "alta",
    time: "2h",
    date: todayKey,
    focusModeEnabled: true,
  },
];

function loadTasksFromStorage(): Task[] {
  try {
    const raw = getPreferenceString(PreferenceKeys.TASKS_JSON);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

function saveTasksToStorage(tasks: Task[]): void {
  try {
    setPreferenceString(PreferenceKeys.TASKS_JSON, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Failed to save tasks:", e);
  }
}

export interface TasksContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (dateKey: string) => Task[];
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    saveTasksToStorage(next);
  }, []);

  const addTask = useCallback(
    (input: Omit<Task, "id">) => {
      const id = String(Date.now());
      const task: Task = { ...input, id };
      persist([...tasks, task]);
    },
    [tasks, persist],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      persist(
        tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [tasks, persist],
  );

  const toggleCompleted = useCallback(
    (id: string) => {
      persist(
        tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t,
        ),
      );
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    (id: string) => {
      const idStr = String(id);
      setTasks((prev) => {
        const next = prev.filter((t) => String(t.id) !== idStr);
        saveTasksToStorage(next);
        return next;
      });
    },
    [],
  );

  const getTasksByDate = useCallback(
    (dateKey: string) => tasks.filter((t) => t.date === dateKey),
    [tasks],
  );

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      addTask,
      updateTask,
      toggleCompleted,
      deleteTask,
      getTasksByDate,
    }),
    [
      tasks,
      addTask,
      updateTask,
      toggleCompleted,
      deleteTask,
      getTasksByDate,
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return ctx;
}
