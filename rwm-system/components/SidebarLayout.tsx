// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [barangayName, setBarangayName] = useState("");

  useEffect(() => {
    const loadBarangay = async () => {
      const name = await AsyncStorage.getItem("barangayName");
      if (name) setBarangayName(name);
    };
    loadBarangay();
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.layoutContainer}>

        {/* --- SIDEBAR --- */}
        <View style={styles.sidebar}>
          {/* Logo & Title */}
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🏛️</Text>
            </View>
            <Text style={styles.sidebarTitle}>
              {barangayName || "Barangay Panel"}
            </Text>
            <Text style={styles.sidebarSubtitle}>Management System</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Navigation */}
          <View style={styles.navContainer}>
            <TouchableOpacity
              style={[styles.navButton, isActive("/dashboard") && styles.navButtonActive]}
              onPress={() => router.push("/dashboard")}
            >
              <Ionicons 
                name={isActive("/dashboard") ? "home" : "home-outline"} 
                size={22} 
                color={isActive("/dashboard") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/dashboard") && styles.navButtonTextActive]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, isActive("/residents") && styles.navButtonActive]}
              onPress={() => router.push("/residents")}
            >
              <Ionicons 
                name={isActive("/residents") ? "people" : "people-outline"} 
                size={22} 
                color={isActive("/residents") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/residents") && styles.navButtonTextActive]}>
                Residents
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, isActive("/workers") && styles.navButtonActive]}
              onPress={() => router.push("/workers")}
            >
              <Ionicons 
                name={isActive("/workers") ? "briefcase" : "briefcase-outline"} 
                size={22} 
                color={isActive("/workers") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/workers") && styles.navButtonTextActive]}>
                Workers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom section - Logout */}
          <View style={styles.sidebarFooter}>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await AsyncStorage.clear();
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* --- MAIN CONTENT --- (keeps original background) */}
        <View style={styles.contentArea}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Light gray for overall background
  },
  layoutContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#1e293b", // Darker sidebar
    borderRightWidth: 1,
    borderRightColor: "rgba(59, 130, 246, 0.2)",
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 15,
  },
  logoText: {
    fontSize: 30,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sidebarSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    marginVertical: 15,
    marginHorizontal: 20,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "transparent",
    gap: 12,
  },
  navButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  navButtonText: {
    fontSize: 15,
    color: "#ffffffff",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  navButtonTextActive: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  sidebarFooter: {
    paddingHorizontal: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    color: "#ef4444",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  contentArea: {
    flex: 1,
    backgroundColor: "transparent", // Let the content use its own styles
  },
});