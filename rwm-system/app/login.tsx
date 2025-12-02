// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Animated } from "react-native";
import api from "../lib/api";
import { saveToken } from "../lib/auth";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Shooting money animations
  const money1 = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const money2 = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const money3 = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const moneyOpacity1 = useRef(new Animated.Value(0)).current;
  const moneyOpacity2 = useRef(new Animated.Value(0)).current;
  const moneyOpacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Mouse move handler for eye tracking
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      const centerX = window.innerWidth - 200;
      const centerY = window.innerHeight - 250;
      
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 50, 8);
      
      const eyeX = Math.cos(angle) * distance;
      const eyeY = Math.sin(angle) * distance;
      
      setEyePosition({ x: eyeX, y: eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Shooting money animation function
    const shootMoney = (moneyAnim, opacityAnim, delay) => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const startX = Math.random() * screenWidth;
      const startY = -50;
      const endX = startX + (Math.random() - 0.5) * 400;
      const endY = screenHeight + 50;
      
      setTimeout(() => {
        moneyAnim.setValue({ x: startX, y: startY });
        opacityAnim.setValue(0);
        
        Animated.parallel([
          Animated.timing(moneyAnim, {
            toValue: { x: endX, y: endY },
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(1500),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Loop the animation
          shootMoney(moneyAnim, opacityAnim, Math.random() * 3000);
        });
      }, delay);
    };

    // Start shooting money animations with random delays
    shootMoney(money1, moneyOpacity1, 3500);
    shootMoney(money2, moneyOpacity2, 4000);
    shootMoney(money3, moneyOpacity3, 3000);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { username, password });
      const { token, barangayName } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("barangayName", barangayName);

      router.replace("/dashboard");
    } catch (err) {
      Alert.alert("Login Failed", "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effects */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
      
      {/* Shooting Money Icons */}
      <Animated.View
        style={[
          styles.shootingMoney,
          {
            transform: [
              { translateX: money1.x },
              { translateY: money1.y },
              { rotate: '45deg' }
            ],
            opacity: moneyOpacity1,
          },
        ]}
      >
        <Text style={styles.moneyIcon}>🏡</Text>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.shootingMoney,
          {
            transform: [
              { translateX: money2.x },
              { translateY: money2.y },
              { rotate: '30deg' }
            ],
            opacity: moneyOpacity2,
          },
        ]}
      >
        <Text style={styles.moneyIcon}>👤</Text>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.shootingMoney,
          {
            transform: [
              { translateX: money3.x },
              { translateY: money3.y },
              { rotate: '60deg' }
            ],
            opacity: moneyOpacity3,
          },
        ]}
      >
        <Text style={styles.moneyIcon}>👥</Text>
      </Animated.View>
      
      {/* Centered Login Form */}
      <View style={styles.mainContent}>
        <Animated.View
          style={[
            styles.loginFormWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.loginCard}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>🏛️</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your Barangay Account</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Right - Barangay Hall (Fixed Position) */}
      <Animated.View
        style={[
          styles.barangayHallContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.giantHall}>
          {/* Building Body */}
          <View style={styles.buildingBody}>
            {/* Roof/Triangle */}
            <View style={styles.roof} />
            
            {/* Upper decoration line */}
            <View style={styles.roofLine} />
            
            {/* Columns */}
            <View style={styles.columnsContainer}>
              <View style={styles.column} />
              <View style={styles.column} />
              <View style={styles.column} />
              <View style={styles.column} />
            </View>
            
            {/* Eyes - Minion Style */}
            <View style={styles.eyesContainer}>
              {/* Left Eye - Bigger */}
              <View style={styles.goggleLeft}>
                <View style={styles.eyeBig}>
                  <View 
                    style={[
                      styles.pupilBig,
                      {
                        transform: [
                          { translateX: eyePosition.x * 1.2 },
                          { translateY: eyePosition.y * 1.2 }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.pupilInner} />
                  </View>
                </View>
              </View>
              
              {/* Right Eye - Smaller */}
              <View style={styles.goggleLeft}>
                <View style={styles.eyeBig}>
                  <View 
                    style={[
                      styles.pupilBig,
                      {
                        transform: [
                          { translateX: eyePosition.x },
                          { translateY: eyePosition.y }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.pupilInner} />
                  </View>
                </View>
              </View>
            </View>

            {/* Goggle Strap */}
            <View style={styles.goggleStrap} />
            
            {/* Base/Steps */}
            <View style={styles.steps}>
              <View style={styles.step} />
              <View style={styles.step} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    position: "relative",
    overflow: "hidden",
  },
  gradientTop: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#3b82f6",
    opacity: 0.1,
  },
  gradientBottom: {
    position: "absolute",
    bottom: -150,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "#10b981",
    opacity: 0.08,
  },
  
  // Shooting Money Styles
  shootingMoney: {
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none",
  },
  moneyIcon: {
    fontSize: 48,
    textShadow: "0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4)",
  },
  
  // Main Content Container - Centered
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Login Form Wrapper
  loginFormWrapper: {
    width: 440,
    zIndex: 2,
  },
  loginCard: {
    width: "100%",
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  logoText: {
    fontSize: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#475569",
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  registerLink: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Barangay Hall - Fixed to Bottom Right
  barangayHallContainer: {
    position: "absolute",
    bottom: 20,
    right: 30,
    zIndex: 0,
  },
  giantHall: {
    alignItems: "center",
    transform: [{ scale: 0.8 }],
    transformOrigin: "bottom right",
  },
  buildingBody: {
    position: "relative",
    alignItems: "center",
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 180,
    borderRightWidth: 180,
    borderBottomWidth: 90,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(59, 130, 246, 0.4)",
    marginBottom: 5,
  },
  roofLine: {
    width: 340,
    height: 12,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 8,
    borderRadius: 3,
  },
  columnsContainer: {
    flexDirection: "row",
    gap: 35,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  column: {
    width: 45,
    height: 240,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
    borderWidth: 3,
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderRadius: 5,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  eyesContainer: {
    position: "absolute",
    top: 140,
    flexDirection: "row",
    gap: 80,
    zIndex: 10,
    alignItems: "center",
  },
  goggleLeft: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(100, 116, 139, 0.3)",
    borderWidth: 4,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  eyeBig: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  pupilBig: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8b4513",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  pupilInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000000",
  },
  goggleStrap: {
    position: "absolute",
    top: 175,
    width: 340,
    height: 8,
    backgroundColor: "#65790aff",
    borderRadius: 4,
    zIndex: 5,
  },
  steps: {
    alignItems: "center",
    gap: 4,
  },
  step: {
    width: 360,
    height: 15,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
});