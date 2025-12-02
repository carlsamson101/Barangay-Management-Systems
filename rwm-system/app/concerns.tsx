import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SidebarLayout from "../components/SidebarLayout";
import { COLORS } from "../lib/globalStyles";
import api from "../lib/api";

export default function ConcernsScreen() {
  const [loading, setLoading] = useState(true);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "New" | "In Progress" | "Resolved" | "Closed">("All");
  const [notesDraft, setNotesDraft] = useState("");
  const [banner, setBanner] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    visible: boolean;
    id: string | null;
    subject: string;
  }>({
    visible: false,
    id: null,
    subject: "",
  });

  useEffect(() => {
    fetchConcerns();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("🔐 Auth check - Token exists:", !!token);
      if (token) {
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");
      }
    } catch (error) {
      console.error("❌ Error checking auth:", error);
    }
  };

  const fetchConcerns = async () => {
    try {
      setLoading(true);
      const res = await api.get("/concerns/my");
      setConcerns(res.data || []);
    } catch (err: any) {
      console.error("Fetch concerns error:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete.id) return;

    try {
      console.log("🗑️ Attempting to delete concern:", confirmDelete.id);
      console.log("🔗 Full URL:", `http://localhost:4000/concerns/${confirmDelete.id}`);
      
      const response = await api.delete(`/concerns/${confirmDelete.id}`);
      console.log("✅ Delete successful:", response.data);

      setConcerns((prev) => prev.filter((c) => c._id !== confirmDelete.id));
      setBanner({
        type: "success",
        message: "Concern deleted successfully.",
      });
      
      // Close the detail modal too
      setSelectedConcern(null);
    } catch (err: any) {
      console.error("❌ Delete concern error:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: err?.message,
        fullError: err
      });
      
      // Better error message
      let errorMessage = "Failed to delete concern. Please try again.";
      if (err?.response?.status === 404) {
        errorMessage = "Concern not found or already deleted.";
      } else if (err?.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setBanner({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setConfirmDelete({
        visible: false,
        id: null,
        subject: "",
      });
    }
  };

  const openConcern = (c) => {
    setSelectedConcern(c);
    setNotesDraft(c.barangayNotes || "");
  };

  const updateConcernStatus = async (newStatus) => {
    if (!selectedConcern) return;

    try {
      setStatusUpdating(true);
      const res = await api.patch(`/concerns/${selectedConcern._id}`, {
        status: newStatus,
        barangayNotes: notesDraft,
      });

      const updated = res.data?.concern;

      setConcerns((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setSelectedConcern(updated);
    } catch (err: any) {
      console.error("Update concern error:", err?.response?.data || err?.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredConcerns =
    filterStatus === "All"
      ? concerns
      : concerns.filter((c) => c.status === filterStatus);

  if (loading) {
    return (
      <SidebarLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading concerns...</Text>
        </View>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Resident Concerns</Text>
          <Text style={styles.subtitle}>
            View and manage concerns submitted by residents of your barangay.
          </Text>
        </View>

        {/* Banner */}
        {banner && (
          <View
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              backgroundColor: banner.type === "success" ? "#dcfce7" : "#fee2e2",
              borderWidth: 1,
              borderColor: banner.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            <Text
              style={{
                color: banner.type === "success" ? "#166534" : "#b91c1c",
                fontSize: 14,
              }}
            >
              {banner.message}
            </Text>
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {["All", "New", "In Progress", "Resolved", "Closed"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.filterChipTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {filteredConcerns.length === 0 ? (
          <Text style={styles.emptyText}>No concerns found for this filter.</Text>
        ) : (
          filteredConcerns.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={styles.card}
              onPress={() => openConcern(c)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardSubject}>{c.subject}</Text>
                  <StatusBadge status={c.status} />
                </View>
                <Text style={styles.cardMeta}>
                  {c.residentName || "Unknown"} •{" "}
                  {c.category || "Others"}
                </Text>
                <Text numberOfLines={2} style={styles.cardMessage}>
                  {c.message}
                </Text>
              </View>
              <View>
                <Text style={styles.cardDate}>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedConcern}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedConcern(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedConcern && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedConcern.subject}</Text>
                  <StatusBadge status={selectedConcern.status} />
                </View>

                <ScrollView style={{ maxHeight: 400 }}>
                  <Section label="Resident Name" value={selectedConcern.residentName} />
                  <Section label="Contact Number" value={selectedConcern.contactNumber} />
                  <Section label="Email" value={selectedConcern.email} />
                  <Section label="Address / Purok" value={selectedConcern.address} />
                  <Section label="Category" value={selectedConcern.category} />
                  <Section label="Message" value={selectedConcern.message} multiline />

                  <Text style={styles.sectionLabel}>Barangay Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add notes or actions taken..."
                    multiline
                    value={notesDraft}
                    onChangeText={setNotesDraft}
                  />
                </ScrollView>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.statusButtonInfo]}
                    onPress={() => updateConcernStatus("In Progress")}
                    disabled={statusUpdating}
                  >
                    <Text style={styles.modalButtonText}>
                      {statusUpdating ? "Updating..." : "Mark In Progress"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.statusButtonSuccess]}
                    onPress={() => updateConcernStatus("Resolved")}
                    disabled={statusUpdating}
                  >
                    <Text style={styles.modalButtonText}>
                      {statusUpdating ? "Updating..." : "Mark Resolved"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() =>
                      setConfirmDelete({
                        visible: true,
                        id: selectedConcern._id,
                        subject: selectedConcern.subject || "This concern",
                      })
                    }
                  >
                    <Text style={styles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.closeButton]}
                    onPress={() => setSelectedConcern(null)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={confirmDelete.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmDelete((prev) => ({ ...prev, visible: false }))
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 14,
              padding: 24,
              width: "90%",
              maxWidth: 420,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Delete this concern?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              This action cannot be undone.{"\n\n"}
              <Text style={{ fontWeight: "600", color: "#111827" }}>
                "{confirmDelete.subject}"
              </Text>
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#f9fafb",
                }}
                onPress={() =>
                  setConfirmDelete((prev) => ({ ...prev, visible: false }))
                }
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#4b5563" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 999,
                  backgroundColor: "#ef4444",
                }}
                onPress={handleDeleteConfirmed}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#ffffff" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SidebarLayout>
  );
}

function StatusBadge({ status }) {
  const map = {
    New: { bg: "#e0f2fe", text: "#0369a1" },
    "In Progress": { bg: "#fef3c7", text: "#92400e" },
    Resolved: { bg: "#dcfce7", text: "#166534" },
    Closed: { bg: "#e5e7eb", text: "#374151" },
  }[status] || { bg: "#e5e7eb", text: "#374151" };

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: map.bg,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: map.text }}>
        {status}
      </Text>
    </View>
  );
}

function Section({ label, value, multiline = false }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text
        style={[
          styles.sectionValue,
          multiline && { whiteSpace: "pre-wrap" as any },
        ]}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 13,
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  cardSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    flexShrink: 1,
  },
  cardMeta: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    color: "#4b5563",
  },
  cardDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionValue: {
    fontSize: 14,
    color: "#111827",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 120,
    alignItems: "center",
  },
  statusButtonInfo: {
    backgroundColor: "#0ea5e9",
  },
  statusButtonSuccess: {
    backgroundColor: "#22c55e",
  },
  closeButton: {
    backgroundColor: "#111827",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
};