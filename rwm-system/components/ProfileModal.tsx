// @ts-nocheck
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";

type ProfileSection = {
  heading?: string;
  fields: { label: string; value: any }[];
};

type ProfileAction = {
  text: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "secondary" | "green";
};

export default function ProfileModal({
  visible,
  title,
  sections,
  onClose,
  actions = [],
}: {
  visible: boolean;
  title: string;
  sections: ProfileSection[];
  onClose: () => void;
  actions?: ProfileAction[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getButtonColor = (variant?: string) => {
    switch (variant) {
      case "danger":
        return COLORS.danger;
      case "secondary":
        return "#6366f1";
      case "green":
        return COLORS.secondary;
      default:
        return COLORS.primary;
    }
  };

  const safeSections =
    sections && sections.length > 0
      ? sections
      : [{ heading: "Details", fields: [] }];

  const clampedIndex =
    activeIndex >= safeSections.length ? safeSections.length - 1 : activeIndex;

  const currentSection = safeSections[clampedIndex];

  // Try to infer a main name for avatar (Full Name / Name)
  const allFields = safeSections.flatMap((s) => s.fields || []);
  const nameField =
    allFields.find((f) => /full name/i.test(f.label)) ||
    allFields.find((f) => /name/i.test(f.label));

  const displayName = (nameField?.value || title || "").toString();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Gradient Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "BR"}</Text>
              </View>
              <View style={styles.avatarGlow} />
            </View>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.displayName}>{displayName || title}</Text>
              <Text style={styles.subtitle}>{title}</Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {safeSections.map((s, idx) => {
                const isActive = idx === clampedIndex;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveIndex(idx)}
                    style={[
                      styles.tab,
                      isActive && styles.tabActive
                    ]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {s.heading || `Section ${idx + 1}`}
                    </Text>
                    {isActive && <View style={styles.tabIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {(currentSection?.fields || []).map((field, idx) => (
              <View key={idx} style={styles.fieldContainer}>
                <View style={styles.fieldLabelContainer}>
                  <View style={styles.fieldDot} />
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                </View>
                <Text style={styles.fieldValue}>{field.value || "—"}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          {actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {actions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={action.onPress}
                  style={[
                    styles.actionButton,
                    { backgroundColor: getButtonColor(action.variant) }
                  ]}
                >
                  <Text style={styles.actionButtonText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 550,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  
  // Header
  header: {
    backgroundColor: "#1e293b",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    position: "relative",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 2,
  },
  avatarGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
    zIndex: 1,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerTextContainer: {
    alignItems: "center",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "300",
  },

  // Tabs
  tabsContainer: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    position: "relative",
  },
  tabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -12,
    left: "50%",
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 14,
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
};