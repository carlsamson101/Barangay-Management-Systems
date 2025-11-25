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
        return COLORS.primaryLight;
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
      <View
        style={[
          GLOBAL_STYLES.centered,
          { backgroundColor: "#00000088", padding: 16 },
        ]}
      >
        <View
          style={[
            GLOBAL_STYLES.card,
            {
              width: "94%",
              maxHeight: "90%",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            },
          ]}
        >
          {/* Header with avatar + title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {/* Avatar / initials */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.primaryLight,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                {initials || "BR"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.text,
                }}
              >
                {displayName || title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                {title}
              </Text>
            </View>
          </View>

          {/* Tabs (Profile / Address / Contact, etc.) */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {safeSections.map((s, idx) => {
              const isActive = idx === clampedIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveIndex(idx)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: isActive ? COLORS.primary : COLORS.lightGray,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: isActive ? COLORS.white : "#4b5563",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {s.heading || `Section ${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Current section content */}
          <ScrollView
            style={{ marginTop: 4 }}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <View
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              {currentSection?.heading ? (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {currentSection.heading}
                </Text>
              ) : null}

              {(currentSection?.fields || []).map((field) => (
                <View
                  key={field.label}
                  style={{
                    paddingVertical: 6,
                    borderBottomWidth: 1,
                    borderColor: "rgba(209,213,219,0.6)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      opacity: 0.7,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {field.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: COLORS.text,
                      marginTop: 2,
                    }}
                  >
                    {field.value || "—"}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Actions row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 4,
            }}
          >
            {/* Default Close button */}
            <TouchableOpacity
              onPress={onClose}
              style={[
                GLOBAL_STYLES.button,
                {
                  backgroundColor: COLORS.gray,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                },
              ]}
            >
              <Text style={GLOBAL_STYLES.buttonText}>Close</Text>
            </TouchableOpacity>

            {actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={action.onPress}
                style={[
                  GLOBAL_STYLES.button,
                  {
                    backgroundColor: getButtonColor(action.variant),
                    paddingHorizontal: 16,
                    borderRadius: 999,
                  },
                ]}
              >
                <Text style={GLOBAL_STYLES.buttonText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
