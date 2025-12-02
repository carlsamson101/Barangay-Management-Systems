// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native";
import { COLORS } from "../lib/globalStyles";
import api from "../lib/api";

export default function BarangayHomepage() {
  const [concernModalVisible, setConcernModalVisible] = useState(false);
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        setConcernModalVisible(false);
        setFeedback(null);
      }, 2000);
    } catch (err: any) {
      console.error("Submit concern error:", err?.response?.data || err?.message);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Something went wrong while submitting your concern.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Iligan City Barangay Management System
          </Text>
          <Text style={styles.heroSubtitle}>
            Connecting communities, improving lives. Efficient governance for every barangay in Iligan City.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => setConcernModalVisible(true)}
          >
            <Text style={styles.heroButtonText}>Report a Concern</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.sectionSubtitle}>
          Comprehensive barangay management solutions for residents and officials
        </Text>

        <View style={styles.featuresGrid}>
          <FeatureCard
            icon="📋"
            title="Document Requests"
            description="Apply for barangay clearances, certificates, and permits online"
          />
          <FeatureCard
            icon="🏘️"
            title="Resident Management"
            description="Digital records of all residents for better community services"
          />
          <FeatureCard
            icon="📢"
            title="Announcements"
            description="Stay updated with the latest news and events from your barangay"
          />
          <FeatureCard
            icon="👷"
            title="Worker Directory"
            description="Find skilled workers and service providers in your community"
          />
          <FeatureCard
            icon="⚖️"
            title="Summons & Cases"
            description="Transparent case management and dispute resolution system"
          />
          <FeatureCard
            icon="💬"
            title="Report Concerns"
            description="Submit complaints, requests, or feedback directly to officials"
          />
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: "#f8fafc" }]}>
        <Text style={styles.sectionTitle}>About the System</Text>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutText}>
            The Iligan City Barangay Management System is a comprehensive digital platform designed to modernize 
            barangay operations and enhance community services. Our system streamlines administrative processes, 
            improves transparency, and strengthens the connection between residents and their local government.
          </Text>
          <View style={styles.statsRow}>
            <StatCard number="44" label="Barangays" />
            <StatCard number="24/7" label="Access" />
            <StatCard number="100%" label="Digital" />
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Need to reach your barangay?</Text>
        <Text style={styles.ctaText}>
          Submit your concerns, complaints, or requests and get a response from your barangay officials.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => setConcernModalVisible(true)}
        >
          <Text style={styles.ctaButtonText}>Submit a Concern Now</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
           Iligan City Barangay Management System
        </Text>
        <Text style={styles.footerSubtext}>
          by Tutulong Sa Hall Group
        </Text>
      </View>

      {/* Report Concern Modal */}
      <Modal
        visible={concernModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConcernModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report a Concern</Text>
                <TouchableOpacity onPress={() => setConcernModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Submit issues, complaints, or requests directly to your barangay officials.
              </Text>

              {/* Feedback */}
              {feedback && (
                <View
                  style={[
                    styles.feedback,
                    {
                      backgroundColor: feedback.type === "success" ? "#dcfce7" : "#fee2e2",
                      borderColor: feedback.type === "success" ? "#22c55e" : "#ef4444",
                    },
                  ]}
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

              <FormSection title="Barangay Details" />
              <TextInput
                style={styles.input}
                placeholder="Barangay Name (e.g., Barangay San Isidro)"
                value={form.barangayName}
                onChangeText={(t) => updateField("barangayName", t)}
              />

              <FormSection title="Your Information" />
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

              <FormSection title="Concern Details" />
              <TextInput
                style={styles.input}
                placeholder="Category (e.g., Noise Complaint, Infrastructure)"
                value={form.category}
                onChangeText={(t) => updateField("category", t)}
              />
              <TextInput
                style={styles.input}
                placeholder="Subject (e.g., Broken street light)"
                value={form.subject}
                onChangeText={(t) => updateField("subject", t)}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your concern in detail..."
                value={form.message}
                multiline
                numberOfLines={5}
                onChangeText={(t) => updateField("message", t)}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? "Submitting..." : "Submit Concern"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function StatCard({ number, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FormSection({ title }) {
  return (
    <Text style={styles.formSectionTitle}>{title}</Text>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  hero: {
    backgroundColor: "#1e40af",
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroContent: {
    maxWidth: 900,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 52,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#bfdbfe",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
    maxWidth: 700,
  },
  heroButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    color: "#1e40af",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 600,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    maxWidth: 1200,
  },
  featureCard: {
    width: 340,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
  aboutContent: {
    maxWidth: 900,
    alignItems: "center",
  },
  aboutText: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 40,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statCard: {
    alignItems: "center",
    minWidth: 120,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ctaSection: {
    backgroundColor: "#2563eb",
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 16,
    color: "#bfdbfe",
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 600,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    backgroundColor: "#0f172a",
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#64748b",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    fontSize: 28,
    color: "#64748b",
    fontWeight: "300",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    lineHeight: 20,
  },
  feedback: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
    color: "#0f172a",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
};