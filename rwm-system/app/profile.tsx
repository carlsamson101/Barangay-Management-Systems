// @ts-nocheck
// File: app/profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barangayData, setBarangayData] = useState({
    name: "",
    email: "",
    address: "",
    contactNumber: "",
    captain: "",
    secretary: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadBarangayData();
  }, []);

  const loadBarangayData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      setBarangayData({
        name: res.data.name || "",
        email: res.data.email || "",
        address: res.data.address || "",
        contactNumber: res.data.contactNumber || "",
        captain: res.data.captain || "",
        secretary: res.data.secretary || "",
      });
    } catch (err: any) {
      console.error("❌ Load profile error:", err?.response?.data || err?.message);
      Alert.alert("Error", "Failed to load barangay profile.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      await api.put("/auth/profile", barangayData);
      
      // Update stored barangay name
      await AsyncStorage.setItem("barangayName", barangayData.name);
      
      Alert.alert("Success", "Barangay profile updated successfully.");
    } catch (err: any) {
      console.error("❌ Update profile error:", err?.response?.data || err?.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      Alert.alert("Success", "Password changed successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("❌ Change password error:", err?.response?.data || err?.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <ScrollView style={GLOBAL_STYLES.contentArea}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Ionicons name="person-circle" size={32} color="#ffffff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.pageTitle}>Manage Profile</Text>
            <Text style={styles.pageSubtitle}>Update your barangay information</Text>
          </View>
        </View>

        {/* Barangay Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Barangay Information</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Barangay Name</Text>
            <TextInput
              style={styles.input}
              value={barangayData.name}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, name: text })
              }
              placeholder="Enter barangay name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={barangayData.email}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, email: text })
              }
              placeholder="barangay@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={barangayData.address}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, address: text })
              }
              placeholder="Complete barangay address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={barangayData.contactNumber}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, contactNumber: text })
              }
              placeholder="+63 XXX XXX XXXX"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Barangay Captain</Text>
            <TextInput
              style={styles.input}
              value={barangayData.captain}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, captain: text })
              }
              placeholder="Captain's full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Barangay Secretary</Text>
            <TextInput
              style={styles.input}
              value={barangayData.secretary}
              onChangeText={(text) =>
                setBarangayData({ ...barangayData, secretary: text })
              }
              placeholder="Secretary's full name"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={updateProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.danger} />
            <Text style={styles.cardTitle}>Change Password</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.currentPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, currentPassword: text })
              }
              placeholder="Enter current password"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.newPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, newPassword: text })
              }
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.confirmPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, confirmPassword: text })
              }
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.changePasswordButton, saving && styles.disabledButton]}
            onPress={changePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="key-outline" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SidebarLayout>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.6,
  },
  pageHeader: {
    marginBottom: 24,
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  changePasswordButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
};