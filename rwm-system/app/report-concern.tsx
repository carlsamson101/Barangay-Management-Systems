// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { COLORS, GLOBAL_STYLES } from "../lib/globalStyles";
import api from "../lib/api";

export default function ReportConcernScreen() {
  const [form, setForm] = useState({
    barangayName: "",
    residentName: "",
    contactNumber: "",
    email: "",
    address: "",
    category: "Others",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

 
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setFeedback(null);

    if (!form.barangayName || !form.residentName || !form.subject || !form.message) {
      setFeedback({
        type: "error",
        message: "Please fill in Barangay, your name, subject, and message.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/concerns", form);
      setFeedback({
        type: "success",
        message: "Your concern has been submitted to the barangay.",
      });
      setForm({
        barangayName: "",
        residentName: "",
        contactNumber: "",
        email: "",
        address: "",
        category: "Others",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      console.error("Submit concern error:", err?.response?.data || err?.message);
      setFeedback({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Something went wrong while submitting your concern.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f1f5f9" }}
      contentContainerStyle={{ padding: 24, alignItems: "center" }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 720,
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 4, color: "#0f172a" }}>
          Report a Concern
        </Text>
        <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          Submit issues, complaints, or requests directly to your barangay.
        </Text>

        {/* Feedback */}
        {feedback && (
          <View
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              backgroundColor:
                feedback.type === "success" ? "#dcfce7" : "#fee2e2",
              borderWidth: 1,
              borderColor:
                feedback.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            <Text
              style={{
                color: feedback.type === "success" ? "#166534" : "#b91c1c",
                fontSize: 14,
              }}
            >
              {feedback.message}
            </Text>
          </View>
        )}

        {/* Barangay + Resident Info */}
        <SectionTitle title="Barangay Details" />
        <TextInput
          style={styles.input}
          placeholder="Barangay Name (e.g., Barangay San Isidro)"
          value={form.barangayName}
          onChangeText={(t) => updateField("barangayName", t)}
        />

        <SectionTitle title="Your Information" />
        <TextInput
          style={styles.input}
          placeholder="Your Full Name"
          value={form.residentName}
          onChangeText={(t) => updateField("residentName", t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number (optional)"
          value={form.contactNumber}
          onChangeText={(t) => updateField("contactNumber", t)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          value={form.email}
          onChangeText={(t) => updateField("email", t)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Address / Purok (optional)"
          value={form.address}
          onChangeText={(t) => updateField("address", t)}
        />

        {/* Concern Details */}
        <SectionTitle title="Concern Details" />
        <TextInput
          style={styles.input}
          placeholder="Category (e.g., Noise Complaint, Garbage, etc.)"
          value={form.category}
          onChangeText={(t) => updateField("category", t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Short Subject (e.g., Loud music at night)"
          value={form.subject}
          onChangeText={(t) => updateField("subject", t)}
        />
        <TextInput
          style={[styles.input, { height: 140, textAlignVertical: "top" }]}
          placeholder="Describe your concern in detail..."
          value={form.message}
          multiline
          onChangeText={(t) => updateField("message", t)}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={[
            styles.submitButton,
            submitting && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit Concern"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ title }) {
  return (
    <Text
      style={{
        fontSize: 15,
        fontWeight: "700",
        marginTop: 18,
        marginBottom: 6,
        color: "#0f172a",
      }}
    >
      {title}
    </Text>
  );
}

const styles = {
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cbd5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
};
