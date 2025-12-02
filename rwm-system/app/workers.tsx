// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";
import ProfileModal from "../components/ProfileModal";

/* ============================================================================
   CONSTANTS & HELPERS
   ========================================================================== */

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const ROLE_OPTIONS = [
  "Barangay Captain",
  "Kagawad",
  "Secretary",
  "Treasurer",
  "Tanod",
  "Health Worker",
  "Volunteer",
  "Other"
];

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "Male",
  street: "",
  purok: "",
  barangay: "",
  contactNumber: "",
  occupation: "",
  role: "Kagawad",
};

const fullName = (w) =>
  [w?.firstName, w?.middleName, w?.lastName].filter(Boolean).join(" ");

/* ============================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function WorkersPage() {
  // State - Data
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State - Search
  const [query, setQuery] = useState("");
  
  // State - Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // State - Form & View
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ==========================================================================
     API CALLS
     ======================================================================== */

  const fetchWorkers = async () => {
  try {
    setLoading(true);
    console.log("🔄 Fetching workers...");
    
    const res = await api.get("/workers");
    console.log("✅ Workers fetched:", res.data);
    
    // Ensure we always set an array
    setWorkers(Array.isArray(res.data) ? res.data : []);
  } catch (err: any) {
    console.error("❌ /workers error:", err?.response?.data || err?.message);
    
    // Set empty array on error so UI isn't stuck
    setWorkers([]);
    
    // Optional: Show alert to user
    if (err?.response?.status === 401) {
      alert("Session expired. Please log in again.");
    } else if (err?.response?.status === 500) {
      alert("Server error. Please try again later.");
    } else {
      alert("Failed to load workers. Please check your connection.");
    }
  } finally {
    // CRITICAL: Always set loading to false
    setLoading(false);
    console.log("✅ Loading complete");
  }
};

  const addWorker = async () => {
    try {
      const barangayName = await AsyncStorage.getItem("barangayName");
      const payload = {
        ...form,
        barangay: form.barangay || barangayName || "",
      };
      await api.post("/workers", payload);
      setShowAdd(false);
      setForm({ ...emptyForm });
      await fetchWorkers();
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      alert(err?.response?.data?.message || "Failed to add worker.");
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/workers/${editId}`, form);
      setShowEdit(false);
      setEditId(null);
      setForm({ ...emptyForm });
      await fetchWorkers();
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      alert(err?.response?.data?.message || "Failed to update worker.");
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      await api.delete(`/workers/${id}`);
      await fetchWorkers();
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      alert("Failed to delete worker.");
    }
  };

  /* ==========================================================================
     MODAL HANDLERS
     ======================================================================== */

  const openAdd = async () => {
    const barangayName = await AsyncStorage.getItem("barangayName");
    setForm({ ...emptyForm, barangay: barangayName || "" });
    setShowAdd(true);
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setForm({
      firstName: item.firstName || "",
      middleName: item.middleName || "",
      lastName: item.lastName || "",
      gender: item.gender || "Male",
      street: item.street || "",
      purok: item.purok || "",
      barangay: item.barangay || "",
      contactNumber: item.contactNumber || "",
      occupation: item.occupation || "",
      role: item.role || "Kagawad",
    });
    setShowEdit(true);
  };

  const openView = (item) => {
    setViewItem(item);
    setShowView(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  /* ==========================================================================
     LIFECYCLE
     ======================================================================== */

  useEffect(() => {
    fetchWorkers();
  }, []);

  /* ==========================================================================
     FILTERED DATA
     ======================================================================== */

  const filteredWorkers = useMemo(() => {
    if (!query.trim()) return workers;
    
    const lowerQuery = query.toLowerCase();
    return workers.filter((w) =>
      fullName(w).toLowerCase().includes(lowerQuery) ||
      w.role?.toLowerCase().includes(lowerQuery) ||
      w.purok?.toLowerCase().includes(lowerQuery)
    );
  }, [workers, query]);

  /* ==========================================================================
     RENDER HELPERS
     ======================================================================== */

  const renderWorkerCard = ({ item }) => (
    <View style={styles.workerCard}>
      <View style={styles.cardContent}>
        {/* Left: Worker Info */}
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{fullName(item)}</Text>
          <View style={styles.workerDetails}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{item.gender}</Text>
            </View>
            <View style={[styles.detailBadge, { backgroundColor: COLORS.secondary + "20" }]}>
              <Text style={[styles.detailText, { color: COLORS.secondary }]}>{item.role}</Text>
            </View>
            {item.purok && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailText}>Purok {item.purok}</Text>
              </View>
            )}
          </View>
          {item.contactNumber && (
            <Text style={styles.contactInfo}>📞 {item.contactNumber}</Text>
          )}
        </View>

        {/* Right: Action Buttons */}
        <View style={styles.cardButtons}>
          <ActionButton text="View" onPress={() => openView(item)} color="#6366f1" small />
          <ActionButton text="Edit" onPress={() => startEdit(item)} color={COLORS.secondary} small />
          <ActionButton text="Delete" onPress={() => confirmDelete(item._id)} color={COLORS.danger} small />
        </View>
      </View>
    </View>
  );

  const header = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {/* Search & Add Row */}
        <View style={styles.searchRow}>
          <TextInput
            style={[GLOBAL_STYLES.input, styles.searchInput]}
            placeholder="Search by name, role, or purok..."
            value={query}
            onChangeText={setQuery}
          />

          <TouchableOpacity 
            style={[GLOBAL_STYLES.button, styles.addButton]} 
            onPress={openAdd}
          >
            <Text style={GLOBAL_STYLES.buttonText}>+ Add Worker</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [query]
  );

  /* ==========================================================================
     MAIN RENDER
     ======================================================================== */

  return (
    <SidebarLayout>
      <View style={GLOBAL_STYLES.contentArea}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Workers Management</Text>
          <Text style={styles.pageSubtitle}>
            {workers.length} {workers.length === 1 ? 'Worker' : 'Workers'} Registered
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading workers...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredWorkers}
            keyExtractor={(item) => item._id}
            renderItem={renderWorkerCard}
            ListHeaderComponent={header}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No workers found</Text>
                <Text style={styles.emptySubtext}>Add a worker to get started</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      {/* Modals */}
      <WorkerFormModal
        visible={showAdd}
        title="Add Worker"
        form={form}
        setForm={setForm}
        onSave={addWorker}
        onCancel={() => setShowAdd(false)}
      />

      <WorkerFormModal
        visible={showEdit}
        title="Edit Worker"
        form={form}
        setForm={setForm}
        onSave={saveEdit}
        onCancel={() => setShowEdit(false)}
      />

      <ProfileModal
        visible={showView}
        title="Worker Profile"
        onClose={() => setShowView(false)}
        sections={buildProfileSections(viewItem)}
      />

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
              <Text style={styles.deleteIcon}>⚠️</Text>
            </View>
            <Text style={styles.deleteTitle}>Delete Worker?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this worker? This action cannot be undone.
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
                onPress={() => deleteId && deleteWorker(deleteId)}
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

/* ============================================================================
   REUSABLE COMPONENTS
   ========================================================================== */

function WorkerFormModal({ visible, title, form, setForm, onSave, onCancel }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.formModalContent}>
            <Text style={GLOBAL_STYLES.subtitle}>{title}</Text>

            <TwoColumnGrid>
              <FormInput
                label="First Name"
                value={form.firstName}
                onChangeText={(t) => setForm({ ...form, firstName: t })}
              />
              <FormInput
                label="Middle Name"
                value={form.middleName}
                onChangeText={(t) => setForm({ ...form, middleName: t })}
              />
              <FormInput
                label="Last Name"
                value={form.lastName}
                onChangeText={(t) => setForm({ ...form, lastName: t })}
              />

              <DropdownInput
                label="Gender"
                value={form.gender}
                options={GENDER_OPTIONS}
                onValueChange={(value) => setForm({ ...form, gender: value })}
              />

              <DropdownInput
                label="Role"
                value={form.role}
                options={ROLE_OPTIONS}
                onValueChange={(value) => setForm({ ...form, role: value })}
              />

              <FormInput
                label="Street"
                value={form.street}
                onChangeText={(t) => setForm({ ...form, street: t })}
              />
              <FormInput
                label="Purok"
                value={form.purok}
                onChangeText={(t) => setForm({ ...form, purok: t })}
              />
              <FormInput
                label="Barangay"
                value={form.barangay}
                onChangeText={(t) => setForm({ ...form, barangay: t })}
              />
              <FormInput
                label="Contact Number"
                value={form.contactNumber}
                onChangeText={(t) => setForm({ ...form, contactNumber: t })}
                keyboardType="phone-pad"
              />
              <FormInput
                label="Occupation"
                value={form.occupation}
                onChangeText={(t) => setForm({ ...form, occupation: t })}
              />
            </TwoColumnGrid>

            <View style={styles.formModalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={onSave}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={onCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ActionButton({ text, onPress, color = COLORS.primary, small = false }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: color,
          paddingHorizontal: small ? 14 : 16,
          paddingVertical: small ? 7 : 10,
          minWidth: small ? 70 : 100,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function TwoColumnGrid({ children }) {
  return (
    <View style={styles.twoColumnGrid}>
      {React.Children.map(children, (child) => (
        <View style={styles.gridItem}>{child}</View>
      ))}
    </View>
  );
}

function FormInput({ label, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={GLOBAL_STYLES.label}>{label}</Text>
      <TextInput style={[GLOBAL_STYLES.input, styles.formInput]} {...props} />
    </View>
  );
}

function DropdownInput({ label, value, options, onValueChange }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={GLOBAL_STYLES.label}>{label}</Text>
      <View style={styles.dropdownContainer}>
        <Picker 
          selectedValue={value} 
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {options.map((opt) => (
            <Picker.Item 
              key={opt} 
              label={opt} 
              value={opt}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

/* ============================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function buildProfileSections(viewItem) {
  if (!viewItem) return [];

  return [
    {
      heading: "Personal Information",
      fields: [
        { label: "Full Name", value: fullName(viewItem) },
        { label: "Gender", value: viewItem.gender },
        { label: "Role", value: viewItem.role },
      ],
    },
    {
      heading: "Address",
      fields: [
        { label: "Street", value: viewItem.street || "—" },
        { label: "Purok", value: viewItem.purok || "—" },
        { label: "Barangay", value: viewItem.barangay || "—" },
      ],
    },
    {
      heading: "Contact & Work",
      fields: [
        { label: "Contact Number", value: viewItem.contactNumber || "—" },
        { label: "Occupation", value: viewItem.occupation || "—" },
      ],
    },
  ];
}

/* ============================================================================
   STYLES
   ========================================================================== */

const styles = {
  // Page Header
  pageHeader: {
    marginBottom: 20,
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "500",
  },
  
  // Layout
  headerContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    height: 44,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 44,
    marginTop: 0,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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
    color: COLORS.text,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    opacity: 0.5,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.4,
  },

  // Worker Card
  workerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  workerInfo: {
    flex: 1,
    minWidth: 0,
  },
  workerName: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 8,
    color: COLORS.text,
  },
  workerDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  detailBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  contactInfo: {
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 4,
  },
  cardButtons: {
    gap: 8,
    alignItems: "flex-end",
  },
  actionButton: {
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalScrollView: {
    maxHeight: "85%",
    width: "90%",
    maxWidth: 700,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  formModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  formModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.danger,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
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

  // Delete Modal
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteIcon: {
    fontSize: 48,
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

  // Form
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  gridItem: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 280,
  },
  inputContainer: {
    marginBottom: 4,
  },
  formInput: {
    marginBottom: 0,
  },
  dropdownContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 48,
    width: '100%',
    color: COLORS.text,
    fontSize: 16,
  },
  pickerItem: {
    fontSize: 16,
    color: COLORS.text,
    padding: 12,
  },
};