import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const quizzes = {
  react: [
    {
      question: "What is React Native mainly used for?",
      options: ["Web apps", "Mobile apps", "AI", "Databases"],
      answer: "Mobile apps",
    },
    {
      question: "Which language is used in React Native?",
      options: ["Java", "Python", "JavaScript", "C++"],
      answer: "JavaScript",
    },
    {
      question: "What is JSX?",
      options: ["CSS", "JavaScript XML", "Database", "Library"],
      answer: "JavaScript XML",
    },
    {
      question: "React uses what to manage UI?",
      options: ["DOM", "Components", "Tables", "Files"],
      answer: "Components",
    },
    {
      question: "Which hook is used for state?",
      options: ["useEffect", "useState", "useFetch", "useData"],
      answer: "useState",
    },
  ],

  general: [
    {
      question: "Capital of Ethiopia?",
      options: ["Addis Ababa", "Nairobi", "Cairo", "Lagos"],
      answer: "Addis Ababa",
    },
    {
      question: "Largest continent?",
      options: ["Africa", "Asia", "Europe", "America"],
      answer: "Asia",
    },
    {
      question: "Which planet is closest to the sun?",
      options: ["Earth", "Mars", "Mercury", "Venus"],
      answer: "Mercury",
    },
    {
      question: "Which ocean is largest?",
      options: ["Atlantic", "Indian", "Pacific", "Arctic"],
      answer: "Pacific",
    },
    {
      question: "Which country is known as Land of the Rising Sun?",
      options: ["China", "Japan", "Korea", "India"],
      answer: "Japan",
    },
  ],

  science: [
    {
      question: "Water formula?",
      options: ["H2O", "CO2", "O2", "NaCl"],
      answer: "H2O",
    },
    {
      question: "Sun is a?",
      options: ["Planet", "Star", "Moon", "Asteroid"],
      answer: "Star",
    },
    {
      question: "Human heart has how many chambers?",
      options: ["2", "3", "4", "5"],
      answer: "4",
    },
    {
      question: "Which gas do plants absorb?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      answer: "Carbon Dioxide",
    },
    {
      question: "Gravity is a?",
      options: ["Force", "Gas", "Liquid", "Object"],
      answer: "Force",
    },
  ],
};
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [screen, setScreen] = useState("home"); // home | quiz | result
  const [category, setCategory] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  // LOGIN
  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Login</Text>

        <TextInput
          placeholder="Enter username"
          style={styles.input}
          onChangeText={setUsername}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => setLoggedIn(true)}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startQuiz = (cat) => {
    setCategory(cat);
    setScore(0);
    setCurrent(0);
    setScreen("quiz");
  };

  const currentQuiz = category ? quizzes[category] : [];

  const handleAnswer = async (option) => {
    if (option === currentQuiz[current].answer) {
      setScore(score + 1);
    }

    if (current + 1 < currentQuiz.length) {
      setCurrent(current + 1);
    } else {
      setScreen("result");

      // Save score locally
      await AsyncStorage.setItem(
        username,
        JSON.stringify(score + 1)
      );
    }
  };

  // HOME
  if (screen === "home") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🧠 Quiz Master</Text>
        <Text style={styles.subtitle}>Welcome, {username} 👋</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => startQuiz("react")}
        >
          <Text style={styles.buttonText}>⚛️ React Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => startQuiz("general")}
        >
          <Text style={styles.buttonText}>🌍 General Knowledge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => startQuiz("science")}
        >
          <Text style={styles.buttonText}>🔬 Science</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // RESULT
  if (screen === "result") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Result</Text>

        <Text style={styles.score}>
          Score: {score} / {currentQuiz.length}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setScreen("home")}
        >
          <Text style={styles.buttonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QUIZ
  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        {currentQuiz[current].question}
      </Text>

      {currentQuiz[current].options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => handleAnswer(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 32,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    color: "white",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  question: {
    fontSize: 22,
    color: "white",
    marginBottom: 25,
    textAlign: "center",
  },

  option: {
    backgroundColor: "#1e293b",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },

  optionText: {
    color: "#e2e8f0",
    fontSize: 16,
  },

  score: {
    fontSize: 26,
    textAlign: "center",
    color: "#fff",
    marginVertical: 20,
  },
});