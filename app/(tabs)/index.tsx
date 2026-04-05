import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const quizzes = {
  react: [
    { question: "What is React Native mainly used for?", options: ["Web apps", "Mobile apps", "AI", "Databases"], answer: "Mobile apps" },
    { question: "Which language is used in React Native?", options: ["Java", "Python", "JavaScript", "C++"], answer: "JavaScript" },
    { question: "What is JSX?", options: ["CSS", "JavaScript XML", "Database", "Library"], answer: "JavaScript XML" },
    { question: "React uses what to manage UI?", options: ["DOM", "Components", "Tables", "Files"], answer: "Components" },
    { question: "Which hook is used for state?", options: ["useEffect", "useState", "useFetch", "useData"], answer: "useState" },
  ],
  general: [
    { question: "Capital of Ethiopia?", options: ["Addis Ababa", "Nairobi", "Cairo", "Lagos"], answer: "Addis Ababa" },
    { question: "Largest continent?", options: ["Africa", "Asia", "Europe", "America"], answer: "Asia" },
    { question: "Which planet is closest to the sun?", options: ["Earth", "Mars", "Mercury", "Venus"], answer: "Mercury" },
    { question: "Which ocean is largest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: "Pacific" },
    { question: "Which country is known as Land of the Rising Sun?", options: ["China", "Japan", "Korea", "India"], answer: "Japan" },
  ],
  science: [
    { question: "Water formula?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
    { question: "Sun is a?", options: ["Planet", "Star", "Moon", "Asteroid"], answer: "Star" },
    { question: "Human heart has how many chambers?", options: ["2", "3", "4", "5"], answer: "4" },
    { question: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
    { question: "Gravity is a?", options: ["Force", "Gas", "Liquid", "Object"], answer: "Force" },
  ],
};

const formatDate = () => {
  const date = new Date("2026-03-31");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [screen, setScreen] = useState<"home" | "quiz" | "result">("home");
  const [category, setCategory] = useState<"react" | "general" | "science" | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [highScores, setHighScores] = useState<{ [key: string]: number }>({});
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const currentDate = formatDate();
  const currentQuiz = category ? quizzes[category] : [];

  // Load high scores when user logs in
  useEffect(() => {
    const loadHighScores = async () => {
      if (!username) return;
      const scores: { [key: string]: number } = {};
      const categories = ["react", "general", "science"] as const;
      for (const cat of categories) {
        const saved = await AsyncStorage.getItem(`highscore_${username}_${cat}`);
        if (saved !== null) {
          scores[cat] = parseInt(saved, 10);
        }
      }
      setHighScores(scores);
    };
    loadHighScores();
  }, [username]);

  // Reset timer on new question
  useEffect(() => {
    if (screen === "quiz") {
      setTimeLeft(30);
    }
  }, [current, screen]);

  // Timer countdown (30 seconds per question)
  useEffect(() => {
    if (screen !== "quiz" || showFeedback || currentQuiz.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, current, showFeedback]);

  const saveHighScore = async (cat: string, finalScore: number) => {
    if (!cat || !username) return;
    const key = `highscore_${username}_${cat}`;
    const currentBest = highScores[cat] || 0;

    if (finalScore > currentBest) {
      setHighScores((prev) => ({ ...prev, [cat]: finalScore }));
      setIsNewHighScore(true);
      try {
        await AsyncStorage.setItem(key, finalScore.toString());
      } catch (e) {}
    }
  };

  const handleTimeout = () => {
    setShowFeedback(true);
    setTimeout(() => {
      if (current + 1 < currentQuiz.length) {
        setCurrent((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        saveHighScore(category!, score);
        setScreen("result");
      }
    }, 1500);
  };

  const handleAnswer = (option: string) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);

    const isCorrect = option === currentQuiz[current].answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const finalScoreForThisAnswer = isCorrect ? score + 1 : score;

    setTimeout(() => {
      if (current + 1 < currentQuiz.length) {
        setCurrent((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        saveHighScore(category!, finalScoreForThisAnswer);
        setScreen("result");
      }
    }, 1200);
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loginHeader}>
          <Text style={styles.appTitle}>QuizMaster</Text>
          <Text style={styles.appSubtitle}>Test your knowledge • Pro Edition</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <TextInput
            placeholder="Enter your username"
            style={styles.input}
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (username.trim().length < 3) {
                Alert.alert("Error", "Username must be at least 3 characters");
                return;
              }
              setLoggedIn(true);
              setScreen("home");
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const startQuiz = (cat: "react" | "general" | "science") => {
    setCategory(cat);
    setScore(0);
    setCurrent(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(30);
    setQuizStartTime(Date.now());
    setIsNewHighScore(false);
    setScreen("quiz");
  };

  // HOME SCREEN
  if (screen === "home") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Text style={styles.title}> QuizMaster</Text>
        <Text style={styles.subtitle}>Welcome, {username} </Text>
        <Text style={styles.dateText}>{currentDate}</Text>

        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryButton} onPress={() => startQuiz("react")}>
            <Text style={styles.categoryText}>⚛️ React Native</Text>
            <Text style={styles.bestScoreText}>
              Best: {highScores.react !== undefined ? `${highScores.react}/5` : "—"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryButton} onPress={() => startQuiz("general")}>
            <Text style={styles.categoryText}>🌍 General Knowledge</Text>
            <Text style={styles.bestScoreText}>
              Best: {highScores.general !== undefined ? `${highScores.general}/5` : "—"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryButton} onPress={() => startQuiz("science")}>
            <Text style={styles.categoryText}>🔬 Science</Text>
            <Text style={styles.bestScoreText}>
              Best: {highScores.science !== undefined ? `${highScores.science}/5` : "—"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // RESULT SCREEN
  if (screen === "result") {
    const totalTimeSpent = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0;
    const percentage = Math.round((score / currentQuiz.length) * 100);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Quiz Complete!</Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultScore}>
            {score} / {currentQuiz.length}
          </Text>
          <Text style={styles.resultPercentage}>{percentage}%</Text>

          {isNewHighScore && <Text style={styles.newHighText}>🏆 NEW HIGH SCORE!</Text>}

          <Text style={styles.resultDetail}>
            ⏱️ Time taken: {totalTimeSpent} seconds
          </Text>
          <Text style={styles.resultDetail}>
            Best for this category: {highScores[category || ""] || 0}/5
          </Text>

          <Text style={styles.resultMessage}>
            {percentage >= 80
              ? "Outstanding performance!"
              : percentage >= 60
              ? "Solid effort!"
              : "Keep practicing!"}
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("home")}>
          <Text style={styles.buttonText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#64748b", marginTop: 12 }]}
          onPress={() => startQuiz(category!)}
        >
          <Text style={styles.buttonText}>🔄 Retry This Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QUIZ SCREEN
  const question = currentQuiz[current];
  const isCorrectAnswer = selectedAnswer === question.answer;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {current + 1} of {currentQuiz.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((current + 1) / currentQuiz.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: timeLeft > 15 ? "#22c55e" : timeLeft > 5 ? "#eab308" : "#ef4444" }]}>
           {timeLeft}s
        </Text>
        <View style={styles.timerBarBackground}>
          <View
            style={[
              styles.timerBarFill,
              {
                width: `${(timeLeft / 30) * 100}%`,
                backgroundColor: timeLeft > 15 ? "#22c55e" : timeLeft > 5 ? "#eab308" : "#ef4444",
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.question}>{question.question}</Text>

      {question.options.map((option, index) => {
        let optionStyle = styles.option;
        let textStyle = styles.optionText;

        if (showFeedback) {
          if (option === question.answer) {
            optionStyle = styles.correctOption;
          } else if (option === selectedAnswer) {
            optionStyle = styles.wrongOption;
          }
        }

        return (
          <TouchableOpacity
            key={index}
            style={optionStyle}
            onPress={() => handleAnswer(option)}
            disabled={showFeedback}
          >
            <Text style={textStyle}>{option}</Text>
          </TouchableOpacity>
        );
      })}
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
  loginHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: "#cbd5f5",
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
  },
  loginCard: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  loginTitle: {
    fontSize: 24,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#334155",
    padding: 16,
    borderRadius: 12,
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  categoryContainer: {
    marginTop: 30,
  },
  categoryButton: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  categoryText: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  bestScoreText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timerBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 999,
    overflow: "hidden",
  },
  timerBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  question: {
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 32,
  },
  option: {
    backgroundColor: "#1e293b",
    padding: 18,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  optionText: {
    color: "#e2e8f0",
    fontSize: 17,
  },
  correctOption: {
    backgroundColor: "#166534",
    borderColor: "#4ade80",
  },
  wrongOption: {
    backgroundColor: "#7f1d1d",
    borderColor: "#f87171",
  },
  resultCard: {
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 30,
  },
  resultScore: {
    fontSize: 52,
    color: "#3b82f6",
    fontWeight: "bold",
  },
  resultPercentage: {
    fontSize: 28,
    color: "#94a3b8",
    marginVertical: 8,
  },
  newHighText: {
    fontSize: 24,
    color: "#eab308",
    fontWeight: "bold",
    marginVertical: 12,
  },
  resultDetail: {
    fontSize: 18,
    color: "#cbd5f5",
    textAlign: "center",
    marginVertical: 6,
  },
  resultMessage: {
    fontSize: 20,
    color: "#e2e8f0",
    fontWeight: "500",
    marginTop: 10,
  },
}); 