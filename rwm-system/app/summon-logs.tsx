// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../lib/api";
import SidebarLayout from "../components/SidebarLayout";

interface Summon {
  _id: string;
  recipientName: string;
  reason: string;
  summonDate: string;
  summonTime: string;
  status: "Pending" | "Served" | "No Show" | "Resolved";
  issuedBy: string;
  notes?: string;
  createdAt: string;
}

export default function SummonLogsScreen() {
  const [summons, setSummons] = useState<Summon[]>([]);
  const [filteredSummons, setFilteredSummons] = useState<Summon[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSummon, setSelectedSummon] = useState<Summon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: "",
    reason: "",
    summonDate: "",
    summonTime: "",
    notes: "",
  });

  const statuses = ["Pending", "Served", "No Show", "Resolved"];

  useFocusEffect(
    React.useCallback(() => {
      loadSummons();
    }, [])
  );

  useEffect(() => {
    filterSummons(searchQuery);
  }, [summons, searchQuery]);

  const loadSummons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/summons");
      const data = res.data?.data || res.data || [];
      setSummons(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ Error loading summons:", error);
      Alert.alert("Error", "Failed to load summons");
    } finally {
      setLoading(false);
    }
  };

  const filterSummons = (query: string) => {
    if (!query.trim()) {
      setFilteredSummons(summons);
      return;
    }

    const filtered = summons.filter((summon) =>
      summon.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      summon.reason.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSummons(filtered);
  };

  const handleAddSummon = async () => {
    if (!formData.recipientName.trim() || !formData.reason.trim() || !formData.summonDate || !formData.summonTime) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/summons", {
        recipientName: formData.recipientName,
        reason: formData.reason,
        summonDate: formData.summonDate,
        summonTime: formData.summonTime,
        notes: formData.notes,
      });

      setSummons([res.data?.data || res.data, ...summons]);
      setFormData({
        recipientName: "",
        reason: "",
        summonDate: "",
        summonTime: "",
        notes: "",
      });
      setShowAddModal(false);
      Alert.alert("Success", "✅ Summon created successfully");
    } catch (error: any) {
      console.error("❌ Error creating summon:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to create summon");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setSaving(true);
      const res = await api.put(`/summons/${id}/status`, { status: newStatus });
      setSummons(summons.map((s) => (s._id === id ? res.data?.data || res.data : s)));
      setSelectedSummon(res.data?.data || res.data);
      Alert.alert("Success", "✅ Status updated successfully");
    } catch (error: any) {
      console.error("❌ Error updating status:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSummon = async (id: string) => {
    Alert.alert("Confirm", "Delete this summon?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/summons/${id}`);
            setSummons(summons.filter((s) => s._id !== id));
            setShowDetailsModal(false);
            setTimeout(() => {
              Alert.alert("Success", "✅ Summon deleted successfully");
            }, 300);
          } catch (error: any) {
            console.error("❌ Error deleting summon:", error);
            Alert.alert("Error", error?.response?.data?.message || "Failed to delete summon");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Served":
        return "#10b981";
      case "No Show":
        return "#ef4444";
      case "Resolved":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return "time";
      case "Served":
        return "checkmark-circle";
      case "No Show":
        return "close-circle";
      case "Resolved":
        return "checkmark-done-circle";
      default:
        return "help-circle";
    }
  };

  const renderSummonCard = ({ item }: { item: Summon }) => (
    <TouchableOpacity
      style={styles.summonCard}
      onPress={() => {
        setSelectedSummon(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.recipientName}>{item.recipientName}</Text>
          <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>
            {item.summonDate} • {item.summonTime}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>Issued by: {item.issuedBy}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SidebarLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading summons...</Text>
        </View>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Summon Logs</Text>
            <Text style={styles.headerSubtitle}>
              {summons.length} {summons.length === 1 ? "summon" : "summons"} recorded
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadSummons}
            >
              <Ionicons name="refresh" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or reason..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Summons List */}
        {filteredSummons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-unread-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No summons found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? "Try adjusting your search" 
                : "Summons will appear here when generated from residents page"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSummons}
            renderItem={renderSummonCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add Summon Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.compactModalOverlay}>
            <View style={styles.compactModalContent}>
              <View style={styles.compactModalHeader}>
                <Text style={styles.compactModalTitle}>New Summon</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>

              <View style={styles.compactModalBody}>
                <Text style={styles.inputLabel}>Recipient Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter recipient name"
                  value={formData.recipientName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, recipientName: text })
                  }
                />

                <Text style={styles.inputLabel}>Reason *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Reason for summon"
                  multiline
                  numberOfLines={3}
                  value={formData.reason}
                  onChangeText={(text) =>
                    setFormData({ ...formData, reason: text })
                  }
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>Summon Date *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={formData.summonDate}
                      onChangeText={(text) =>
                        setFormData({ ...formData, summonDate: text })
                      }
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>Summon Time *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM AM/PM"
                      value={formData.summonTime}
                      onChangeText={(text) =>
                        setFormData({ ...formData, summonTime: text })
                      }
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional notes (optional)"
                  multiline
                  numberOfLines={2}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                />

                <View style={styles.compactModalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleAddSummon}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                        <Text style={styles.submitButtonText}>Create</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Summon Details Modal */}
        <Modal
          visible={showDetailsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <TouchableOpacity 
            style={styles.detailsModalOverlay}
            activeOpacity={1}
            onPress={() => setShowDetailsModal(false)}
          >
            <TouchableOpacity 
              style={styles.detailsModalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedSummon && (
                <>
                  <View style={styles.detailsHeader}>
                    <View
                      style={[
                        styles.detailsStatusIcon,
                        {
                          backgroundColor: `${getStatusColor(
                            selectedSummon.status
                          )}20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(selectedSummon.status)}
                        size={32}
                        color={getStatusColor(selectedSummon.status)}
                      />
                    </View>
                    <Text style={styles.detailsTitle}>
                      {selectedSummon.recipientName}
                    </Text>
                    <Text
                      style={[
                        styles.detailsStatus,
                        { color: getStatusColor(selectedSummon.status) },
                      ]}
                    >
                      {selectedSummon.status}
                    </Text>
                  </View>

                  <View style={styles.detailsBody}>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Reason</Text>
                      <Text style={styles.detailsValue}>
                        {selectedSummon.reason}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Summon Date</Text>
                      <Text style={styles.detailsValue}>
                        {selectedSummon.summonDate}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Summon Time</Text>
                      <Text style={styles.detailsValue}>
                        {selectedSummon.summonTime}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Issued By</Text>
                      <Text style={styles.detailsValue}>
                        {selectedSummon.issuedBy}
                      </Text>
                    </View>

                    {selectedSummon.notes && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Notes</Text>
                        <Text style={styles.detailsValue}>
                          {selectedSummon.notes}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statusActions}>
                    <Text style={styles.statusLabel}>Update Status:</Text>
                    <View style={styles.statusButtonsRow}>
                      {statuses.map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            {
                              backgroundColor:
                                selectedSummon.status === status
                                  ? getStatusColor(status)
                                  : `${getStatusColor(status)}20`,
                            },
                          ]}
                          onPress={() => handleUpdateStatus(selectedSummon._id, status)}
                          disabled={saving}
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              {
                                color:
                                  selectedSummon.status === status
                                    ? "#ffffff"
                                    : getStatusColor(status),
                              },
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.detailsActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteAction]}
                      onPress={() => handleDeleteSummon(selectedSummon._id)}
                    >
                      <Ionicons name="trash" size={18} color="#ffffff" />
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.closeAction]}
                      onPress={() => setShowDetailsModal(false)}
                    >
                      <Ionicons name="close" size={18} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
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
    color: "#1f2937",
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1f2937",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  summonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  cardTitleSection: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  reason: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#4b5563",
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3b82f6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  textArea: {
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailsModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 420,
  },
  detailsHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailsStatusIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  detailsStatus: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  detailsBody: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailsRow: {
    marginBottom: 14,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  statusActions: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  closeAction: {
    backgroundColor: "#3b82f6",
  },
  deleteAction: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  deleteActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
   compactModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  compactModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
  },
  compactModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  compactModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  compactModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 500,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  compactModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b5563",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});