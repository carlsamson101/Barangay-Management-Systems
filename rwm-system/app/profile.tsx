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
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";



export const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    // Web: use browser alert
    window.alert(`${title}\n\n${message}`);
  } else {
    // Native: use React Native Alert
    Alert.alert(title, message);
  }
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [barangayData, setBarangayData] = useState({
    name: "",
    email: "",
    address: "",
    contactNumber: "",
    captain: "",
    secretary: "",
    logoUrl: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadBarangayData();
  }, []);

// In loadBarangayData function
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
      logoUrl: res.data.logoUrl || "",
    });

    await AsyncStorage.setItem("barangayName", res.data.name || "");
    await AsyncStorage.setItem("barangayCaptain", res.data.captain || ""); // ✅ MAKE SURE THIS IS HERE
    await AsyncStorage.setItem("barangayLogoUrl", res.data.logoUrl || "");
    
    // ✅ ADD THIS DEBUG LOG
    console.log("📝 Saved captain to storage:", res.data.captain);
  } catch (err) {
    console.error("❌ Load profile error:", err);
  } finally {
    setLoading(false);
  }
};

  const pickLogo = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
       showMessage("Permission needed", "Please allow access to your photos to upload a logo.");
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadLogo(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error("❌ Pick logo error:", err);
      showMessage("Error", "Failed to select image.");
    }
  };

 const uploadLogo = async (uri: string) => {
  try {
    setUploadingLogo(true);

    const formData = new FormData();
    const filename = uri.split("/").pop() || "logo.jpg";

    if (Platform.OS === "web") {
      // 🧠 Web: convert the URI to a Blob / File
      const response = await fetch(uri);
      const blob = await response.blob();

      (formData as any).append("logo", blob, filename);
    } else {
      // 📱 Native: use the RN-style file object
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("logo", {
        uri,
        name: filename,
        type,
      } as any);
    }

    // Make sure this matches your backend route & method:
    const res = await api.put("/auth/profile/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setBarangayData((prev) => ({
      ...prev,
      logoUrl: res.data.logoUrl,
    }));

    await AsyncStorage.setItem("barangayLogoUrl", res.data.logoUrl);

    showMessage("Success", "Logo uploaded successfully!");
  } catch (err: any) {
    console.error("❌ Upload logo error:", err?.response?.data || err?.message);
    showMessage("Error", err?.response?.data?.message || "Failed to upload logo.");
  } finally {
    setUploadingLogo(false);
  }
};

  const removeLogo = async () => {
   showMessage(
      "Remove Logo",
      "Are you sure you want to remove the barangay logo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setUploadingLogo(true);
             await api.delete("/auth/profile/logo");
            setBarangayData({ ...barangayData, logoUrl: "" });
            await AsyncStorage.removeItem("barangayLogoUrl");

             showMessage("Success", "Logo removed successfully.");
            } catch (err: any) {
              console.error("❌ Remove logo error:", err?.response?.data || err?.message);
             showMessage("Error", "Failed to remove logo.");
            } finally {
              setUploadingLogo(false);
            }
          },
        },
      ]
    );
  };

  // In updateProfile function
const updateProfile = async () => {
  try {
    setSaving(true);
    await api.put("/auth/profile", barangayData);
    
    // Update stored data
    await AsyncStorage.setItem("barangayName", barangayData.name);
    await AsyncStorage.setItem("barangayCaptain", barangayData.captain); // ✅ MAKE SURE THIS IS HERE
    await AsyncStorage.setItem("barangayLogoUrl", barangayData.logoUrl);
    
    // ✅ ADD THIS DEBUG LOG
    console.log("📝 Updated captain in storage:", barangayData.captain);
    
    showMessage("Success", "Barangay profile updated successfully.");
  } catch (err: any) {
    console.error("❌ Update profile error:", err?.response?.data || err?.message);
    showMessage("Error", err?.response?.data?.message || "Failed to update profile.");
  } finally {
    setSaving(false);
  }
};



  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showMessage("Error", "Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("Error", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

     showMessage("Success", "Password changed successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("❌ Change password error:", err?.response?.data || err?.message);
     showMessage("Error", err?.response?.data?.message || "Failed to change password.");
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

        {/* Logo Upload Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Barangay Logo</Text>
          </View>

          <Text style={styles.logoDescription}>
            Upload your barangay logo. This will be used in generated certificates and official documents.
          </Text>

          <View style={styles.logoContainer}>
            {barangayData.logoUrl ? (
              <View style={styles.logoPreviewContainer}>
                <Image
                  source={{ uri: barangayData.logoUrl }}
                  style={styles.logoPreview}
                  resizeMode="contain"
                />
                <View style={styles.logoActions}>
                  <TouchableOpacity
                    style={[styles.logoActionButton, styles.changeLogoButton]}
                    onPress={pickLogo}
                    disabled={uploadingLogo}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#ffffff" />
                    <Text style={styles.logoActionText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.logoActionButton, styles.removeLogoButton]}
                    onPress={removeLogo}
                    disabled={uploadingLogo}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ffffff" />
                    <Text style={styles.logoActionText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadLogoButton}
                onPress={pickLogo}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={48} color={COLORS.primary} />
                    <Text style={styles.uploadLogoText}>Tap to Upload Logo</Text>
                    <Text style={styles.uploadLogoSubtext}>
                      Recommended: Square image (1:1 ratio), PNG or JPG
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {uploadingLogo && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
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
  logoDescription: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  uploadLogoButton: {
    width: "100%",
    height: 220,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  uploadLogoText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  uploadLogoSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  logoPreviewContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoActions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  logoActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  changeLogoButton: {
    backgroundColor: COLORS.primary,
  },
  removeLogoButton: {
    backgroundColor: COLORS.danger,
  },
  logoActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadingOverlay: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadingText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
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