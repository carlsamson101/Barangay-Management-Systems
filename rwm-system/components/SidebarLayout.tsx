// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [barangayName, setBarangayName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadBarangay = async () => {
      const name = await AsyncStorage.getItem("barangayName");
      if (name) setBarangayName(name);
    };
    loadBarangay();
  }, []);

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setShowLogoutModal(false);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

            <TouchableOpacity
              style={[styles.navButton, isActive("/certificate-logs") && styles.navButtonActive]}
              onPress={() => router.push("/certificate-logs")}
            >
              <Ionicons 
                name={isActive("/certificate-logs") ? "document-text" : "document-text-outline"} 
                size={22} 
                color={isActive("/certificate-logs") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/certificate-logs") && styles.navButtonTextActive]}>
                Certificate Logs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, isActive("/summon-logs") && styles.navButtonActive]}
              onPress={() => router.push("/summon-logs")}
            >
              <Ionicons 
                name={isActive("/summon-logs") ? "receipt" : "receipt-outline"} 
                size={22} 
                color={isActive("/summon-logs") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/summon-logs") && styles.navButtonTextActive]}>
                Summon Logs
              </Text>
            </TouchableOpacity>

            {/* Divider before Profile */}
            <View style={styles.navDivider} />

            <TouchableOpacity
              style={[styles.navButton, isActive("/profile") && styles.navButtonActive]}
              onPress={() => router.push("/profile")}
            >
              <Ionicons 
                name={isActive("/profile") ? "person" : "person-outline"} 
                size={22} 
                color={isActive("/profile") ? "#3b82f6" : "#94a3b8"} 
              />
              <Text style={[styles.navButtonText, isActive("/profile") && styles.navButtonTextActive]}>
                Manage Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom section - Logout */}
          <View style={styles.sidebarFooter}>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* --- MAIN CONTENT --- */}
        <View style={styles.contentArea}>{children}</View>

        {/* --- LOGOUT CONFIRMATION MODAL --- */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="log-out-outline" size={48} color="#ef4444" />
              </View>
              
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout from the system?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.confirmButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  layoutContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#1e293b",
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
  navDivider: {
    height: 1,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    marginVertical: 12,
    marginHorizontal: 5,
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
    backgroundColor: "transparent",
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  confirmButton: {
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});