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

interface CertificateLog {
  _id: string;
  residentName: string;
  certificateType: string;
  purpose: string;
  issuedDate: string;
  issuedTime: string;
  status: "Issued" | "Pending" | "Revoked";
  issuedBy: string;
}

export default function CertificateLogsScreen() {
  const [certificates, setCertificates] = useState<CertificateLog[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<CertificateLog[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useFocusEffect(
  React.useCallback(() => {
    loadCertificates();
  }, [])
);
  useEffect(() => {
    filterCertificates(searchQuery);
  }, [certificates, searchQuery]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/certificates");
      const data = res.data?.data || res.data || [];
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ Error loading certificates:", error);
      Alert.alert("Error", "Failed to load certificate logs");
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = (query: string) => {
    if (!query.trim()) {
      setFilteredCertificates(certificates);
      return;
    }

    const filtered = certificates.filter((cert) =>
      cert.residentName.toLowerCase().includes(query.toLowerCase()) ||
      cert.certificateType.toLowerCase().includes(query.toLowerCase()) ||
      cert.purpose.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCertificates(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Issued":
        return "#10b981";
      case "Pending":
        return "#f59e0b";
      case "Revoked":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Issued":
        return "checkmark-circle";
      case "Pending":
        return "time";
      case "Revoked":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderCertificateCard = ({ item }: { item: CertificateLog }) => (
    <TouchableOpacity
      style={styles.certificateCard}
      onPress={() => {
        setSelectedCertificate(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.recipientName}>{item.residentName}</Text>
          <Text style={styles.certificateType}>{item.certificateType}</Text>
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
          <Ionicons name="document-outline" size={16} color="#64748b" />
          <Text style={styles.infoText} numberOfLines={1}>{item.purpose || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>
            {item.issuedDate} • {item.issuedTime}
          </Text>
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
          <Text style={styles.loadingText}>Loading certificate logs...</Text>
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
            <Text style={styles.headerTitle}>Certificate Logs</Text>
            <Text style={styles.headerSubtitle}>
              {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"} recorded
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadCertificates}
          >
            <Ionicons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, type, or purpose..."
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

        {/* Certificates List */}
        {filteredCertificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No certificates found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search"
                : "Certificates will appear here when generated from residents page"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCertificates}
            renderItem={renderCertificateCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Certificate Details Modal (Read-Only) */}
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
              {selectedCertificate && (
                <>
                  <View style={styles.detailsHeader}>
                    <View
                      style={[
                        styles.detailsStatusIcon,
                        {
                          backgroundColor: `${getStatusColor(
                            selectedCertificate.status
                          )}20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(selectedCertificate.status)}
                        size={32}
                        color={getStatusColor(selectedCertificate.status)}
                      />
                    </View>
                    <Text style={styles.detailsTitle}>
                      {selectedCertificate.residentName}
                    </Text>
                    <Text
                      style={[
                        styles.detailsStatus,
                        { color: getStatusColor(selectedCertificate.status) },
                      ]}
                    >
                      {selectedCertificate.status}
                    </Text>
                  </View>

                  <View style={styles.detailsBody}>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Certificate Type</Text>
                      <Text style={styles.detailsValue}>
                        {selectedCertificate.certificateType}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Purpose</Text>
                      <Text style={styles.detailsValue}>
                        {selectedCertificate.purpose}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Issued Date</Text>
                      <Text style={styles.detailsValue}>
                        {selectedCertificate.issuedDate}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Issued Time</Text>
                      <Text style={styles.detailsValue}>
                        {selectedCertificate.issuedTime}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Issued By</Text>
                      <Text style={styles.detailsValue}>
                        {selectedCertificate.issuedBy}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteAction]}
                      onPress={() => setShowDeleteConfirm(true)}
                    >
                      <Ionicons name="trash" size={18} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Delete</Text>
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

       {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.smallModalContent}>
              <View style={styles.deleteIconContainer}>
                <Ionicons name="warning" size={48} color="#ef4444" />
              </View>
              <Text style={styles.deleteTitle}>Delete Certificate?</Text>
              <Text style={styles.deleteMessage}>
                Are you sure you want to delete this certificate log? This action cannot be undone.
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmDeleteButton]}
                  onPress={async () => {
                    if (!selectedCertificate) return;
                    
                    try {
                      await api.delete(`/certificates/${selectedCertificate._id}`);
                      setShowDeleteConfirm(false);
                      setShowDetailsModal(false);
                      loadCertificates();
                      
                      // Show success message
                      setTimeout(() => {
                        Alert.alert("Success", "Certificate log deleted");
                      }, 300);
                    } catch (error) {
                      setShowDeleteConfirm(false);
                      Alert.alert("Error", "Failed to delete certificate log");
                    }
                  }}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
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
  certificateCard: {
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
  certificateType: {
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
    flex: 1,
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
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  deleteAction: {
  backgroundColor: "#ef4444",
},
modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  smallModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  confirmDeleteButton: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b5563",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});