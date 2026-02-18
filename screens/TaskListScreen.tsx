import ListItem from "@/components/ui/list-item";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react-native";
import React from "react";
import { FlatList, StyleSheet, Switch, Text, View } from "react-native";

const TaskListScreen = () => {
  const [detailedMode, setDetailedMode] = React.useState(false);
  const tasks = [
    {
      id: "1",
      title: "Task 1",
      completed: true,
      complexity: "Média",
      time: "30m",
      category: ["Trabalho"],
      date: "2026-06-01",
    },
    {
      id: "2",
      title: "Task 2",
      completed: false,
      complexity: "Baixa",
      time: "1h30m",
      category: ["Pessoal"],
      date: "2026-06-02",
    },
    {
      id: "3",
      title: "Task 3",
      completed: false,
      complexity: "Baixa",
      time: "15m",
      category: ["Lazer"],
      date: "2026-02-17",
    },
    {
      id: "4",
      title: "Task 4",
      completed: false,
      complexity: "Alta",
      time: "45m",
      category: ["Trabalho"],
      date: "2026-06-04",
    },
  ];
  const filterByComplexity = (tasks, complexity) => {
    return tasks.filter((task) => task.complexity === complexity);
  };

  const complexitytASK = tasks.map((task) => task.complexity);
  const uniqueComplexity = [...new Set(complexitytASK)];
  return (
    <View style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 20,
        }}
      >
        <Text style={styles.title}>Suas Tarefas</Text>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Switch
            value={detailedMode}
            onValueChange={(value) => setDetailedMode(value)}
          />
          <Text style={styles.label}>Ver detalhes</Text>
        </div>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
          }}
        >
          <ArrowLeft size={26} color="black" />
          <Text style={styles.title}>Hoje</Text>
        </View>
        <View
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Calendar size={26} color="black" />
          <ArrowRight size={26} color="black" />
        </View>
      </View>

      {uniqueComplexity.map((comp, index) => (
        <>
          <View style={styles.badge} key={index}>
            <Text style={styles.badgeText}>{comp}</Text>
          </View>
          <FlatList
            data={filterByComplexity(tasks, comp)}
            renderItem={({ item }) => (
              <ListItem
                {...item}
                detailedMode={detailedMode}
                onPress={() => {
                  item.completed = !item.completed;
                }}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
  },

  title: {
    fontSize: 26,
    color: "#000",
  },
  badge: {
    backgroundColor: "#f2eff0",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    width: "fit-content",
    marginVertical: 10,
  },
  badgeText: {
    color: "#757373",
    fontSize: 14,
  },
});

export default TaskListScreen;
