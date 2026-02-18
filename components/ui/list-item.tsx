import { Check, Circle, Focus } from "lucide-react-native"; // Replace with the actual icon you want to use
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ListItem = ({
  title,
  onPress,
  completed,
  complexity,
  time,
  category,
  detailedMode = false,
}) => {
  const [isCompleted, setIsCompleted] = useState(completed);

  const handlePress = () => {
    setIsCompleted(!isCompleted);
    onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      {detailedMode && (
        <View style={styles.badge}>
          {category.map((cat, index) => (
            <Text key={index} style={styles.badgeText}>
              {cat}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.titleContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {!isCompleted && <Circle size={24} color="black" />}
          {isCompleted && <Check size={24} color="black" style={styles.icon} />}
          <Text style={isCompleted ? styles.titleCompleted : styles.title}>
            {title}
          </Text>
        </View>
        {!isCompleted && (
          <Focus size={24} color="#DDD9DA" style={styles.focusIcon} />
        )}
      </View>
      <View style={styles.statusContainer}>
        {detailedMode && (
          <>
            <Text style={styles.statusText}>{complexity}</Text>
            <Text style={styles.statusText}>{time}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flexDirection: "column",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    marginLeft: 10,
    fontSize: 16,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    marginLeft: 10,
    fontSize: 16,
  },
  icon: {
    backgroundColor: "#cbe4f7",
    borderRadius: 12,
  },
  badge: {
    backgroundColor: "#f2eff0",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 3,
    width: "fit-content",
  },
  badgeText: {
    color: "#757373",
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    color: "#757373",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 10,
  },
  focusIcon: {
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
};

export default ListItem;
