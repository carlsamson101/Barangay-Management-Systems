// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../lib/api";

export default function RegisterBarangayScreen() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  const handleRegister = async () => {
    // 1. Validation: Check required fields
    if (!name || !city || !province || !username || !password) {
      Alert.alert("Missing Information", "Please fill in all required fields: Name, City, Province, Username, and Password.");
      return;
    }

    setLoading(true);

    try {
      // 2. Create payload matching the API
      const payload = {
        name,
        city,
        province,
        username,
        password,
        email,
        contactNumber,
      };

      // 3. Make API call
      const response = await api.post("/auth/register", payload);
      Alert.alert(
        "Success",
        "Barangay registered successfully! You can now login."
      );
      
      // 4. Navigate to login
      router.replace("/login");

    } catch (error: any) {
      console.error("Registration Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effects */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
      
      {/* Decorative circles */}
      <View style={styles.decorativeLeft} />
      <View style={styles.decorativeRight} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.registerCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🏛️</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register your Barangay</Text>

          {/* Barangay Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Barangay Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Barangay Dalipuga"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* City */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Iligan City"
              placeholderTextColor="#64748b"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Province */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Province *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lanao del Norte"
              placeholderTextColor="#64748b"
              value={province}
              onChangeText={setProvince}
            />
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="Account username"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. barangay@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 09123456789"
              placeholderTextColor="#64748b"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  decorativeLeft: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  decorativeRight: {
    position: "absolute",
    top: 200,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
  },
  registerCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 20,
    padding: 30,
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
    top:-4,
    fontSize: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 15,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  loginLink: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});