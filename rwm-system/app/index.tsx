import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../lib/globalStyles";

export default function IndexScreen() {
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      // Scale up logo
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      // Slide up text
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Rotate emblem
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
      
      {/* Main content centered */}
      <View style={styles.mainContent}>
        {/* Animated emblem/logo */}
        <Animated.View
          style={[
            styles.emblemContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <View style={styles.emblem}>
            <View style={styles.emblemInner}>
              <Text style={styles.emblemText}>🏛️</Text>
            </View>
          </View>
        </Animated.View>

        {/* Animated title */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Barangay</Text>
          <Text style={styles.titleBold}>Management System</Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>Building Better Communities</Text>
        </Animated.View>
      </View>

      {/* Loading indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>LOADING...</Text>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.decorativeLeft} />
      <View style={styles.decorativeRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  gradientBottom: {
    position: "absolute",
    bottom: -150,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: COLORS.secondary,
    opacity: 0.08,
  },
  mainContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -60, // Move everything up
  },
  emblemContainer: {
    marginBottom: 30, // Reduced from 40
  },
  emblem: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(59, 130, 246, 0.3)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  emblemInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  emblemText: {
    fontSize: 90,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "300",
    color: "#f8fafc",
    letterSpacing: 2,
    textAlign: "center",
  },
  titleBold: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 5,
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.primary,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    letterSpacing: 1.5,
    textAlign: "center",
    fontWeight: "300",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
    width: "80%",
  },
  loadingBar: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 15,
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  decorativeLeft: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  decorativeRight: {
    position: "absolute",
    bottom: 200,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
});