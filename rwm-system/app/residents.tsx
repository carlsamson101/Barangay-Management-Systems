// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";
import CertificatePreview from "../components/CertificatePreview";
import { certificateTemplate } from "../lib/certificateTemplate";
import { summonTemplate } from "../lib/summonTemplate";
import ProfileModal from "../components/ProfileModal";

/* ============================================================================
   CONSTANTS & HELPERS
   ========================================================================== */

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"];
const BENEFICIARY_STATUS_OPTIONS = ["None", "4Ps", "Senior Citizen", "PWD", "Solo Parent"];
const SEARCH_TYPES = ["name", "purok", "age", "street", "gender"];

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthDate: "",
  gender: "Male",
  street: "",
  purok: "",
  barangay: "",
  civilStatus: "Single",
  contactNumber: "",
  occupation: "",
  monthlyIncome: "",
  beneficiaryStatus: "None",
  purpose: "",
};

const formatDatePH = (dateLike?: string | Date) => {
  try {
    const d = dateLike ? new Date(dateLike) : new Date();
    return d.toLocaleDateString("en-PH", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  } catch {
    return "";
  }
};

const fullName = (r) =>
  [r?.firstName, r?.middleName, r?.lastName].filter(Boolean).join(" ");

const classifyIncome = (monthlyIncome: number | string) => {
  const income = typeof monthlyIncome === 'string' ? Number(monthlyIncome) : monthlyIncome;
  
  if (!income || income <= 0) return 'Not Specified';
  if (income <= 5000) return 'Indigent';
  if (income <= 12000) return 'Poor';
  if (income <= 20000) return 'Low Income';
  if (income <= 40000) return 'Lower Middle Income';
  if (income <= 60000) return 'Middle Income';
  if (income <= 100000) return 'Upper Middle Income';
  return 'High Income';
};

/* ============================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function ResidentsScreen() {
  // State - Data
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
    const [barangayLogoUrl, setBarangayLogoUrl] = useState<string | null>(null);
const [barangayCaptain, setBarangayCaptain] = useState<string>(""); // ✅ ADD THIS
  // State - Search
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // State - Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // State - Form & Preview
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [purposeText, setPurposeText] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");
  const [previewResident, setPreviewResident] = useState<any | null>(null);
  const [previewType, setPreviewType] = useState<"indigency" | "summon" | null>(null);

  /* ==========================================================================
     API CALLS
     ======================================================================== */

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch (err: any) {
      console.error("❌ /residents error:", err?.response?.data || err?.message);
      Alert.alert("Error", "Failed to load residents.");
    } finally {
      setLoading(false);
    }
  };

  // Updated constants - Add gender to search types
const SEARCH_TYPES = ["name", "purok", "age", "street", "gender"];

// Updated searchResidents function
const searchResidents = async (text: string) => {
  setQuery(text);
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (!text || text.trim().length === 0) {
    fetchResidents();
    return;
  }
  
  const timeout = setTimeout(async () => {
    try {
      setLoading(true);
      const endpoints = {
        name: `/residents/search/${encodeURIComponent(text)}`,
        purok: `/residents/search/purok/${encodeURIComponent(text)}`,
        age: `/residents/search/age/${encodeURIComponent(text)}`,
        street: `/residents/search/street/${encodeURIComponent(text)}`,
        gender: `/residents/search/gender/${encodeURIComponent(text)}`, // ✅ NEW
      };
      
      const endpoint = endpoints[searchType] || endpoints.name;
      console.log("🔍 Searching:", endpoint);
      
      const res = await api.get(endpoint);
      console.log("✅ Search results:", res.data?.length || 0, "residents found");
      setResidents(res.data || []);
    } catch (err: any) {
      console.error("❌ Search error:", err?.response?.data || err?.message);
      if (err?.response?.status === 404) {
        setResidents([]);
      } else {
        Alert.alert("Search Error", "Failed to search residents. Please try again.");
        fetchResidents();
      }
    } finally {
      setLoading(false);
    }
  }, 500);
  
  setSearchTimeout(timeout);
};

  const [recordStatus, setRecordStatus] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
  show: false,
  message: '',
  type: 'success'
});

  const addResident = async () => {
    try {
      const barangayName = await AsyncStorage.getItem("barangayName");
      const payload = {
        ...form,
        barangay: form.barangay || barangayName || "",
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
        birthDate: form.birthDate || undefined,
      };
      await api.post("/residents", payload);
      setShowAdd(false);
      setForm({ ...emptyForm });
      await fetchResidents();
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to add resident.");
    }
  };

  const saveEdit = async () => {
    try {
      const payload = {
        ...form,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
        birthDate: form.birthDate || undefined,
      };
      await api.put(`/residents/${editId}`, payload);
      setShowEdit(false);
      setEditId(null);
      setForm({ ...emptyForm });
      await fetchResidents();
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to update resident.");
    }
  };

  const deleteResident = async (id: string) => {
    Alert.alert("Confirm", "Delete this resident?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/residents/${id}`);
            await fetchResidents();
          } catch (err: any) {
            console.error(err?.response?.data || err?.message);
            Alert.alert("Error", "Failed to delete resident.");
          }
        },
      },
    ]);
  };

  const importCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name || "residents.csv",
        type: "text/csv",
      } as any);

      await api.post("/residents/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Residents imported successfully.");
      await fetchResidents();
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      Alert.alert("Error", "Failed to import CSV.");
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
      birthDate: item.birthDate ? item.birthDate.substring(0, 10) : "",
      gender: item.gender || "Male",
      street: item.street || "",
      purok: item.purok || "",
      barangay: item.barangay || "",
      civilStatus: item.civilStatus || "Single",
      contactNumber: item.contactNumber || "",
      occupation: item.occupation || "",
      monthlyIncome: item.monthlyIncome ? String(item.monthlyIncome) : "",
      beneficiaryStatus: item.beneficiaryStatus || "None",
      purpose: "",
    });
    setShowEdit(true);
  };

  const openView = (item) => {
    setViewItem(item);
    setShowView(true);
  };

  const openPurposeThenGenerate = (item) => {
    setViewItem(item);
    setPurposeText("");
    setShowPurpose(true);
  };

const openCertificatePreview = (item, purpose) => {
  const html = certificateTemplate(
    item,
    purpose,
    fullName,
    formatDatePH,
    barangayLogoUrl || "",
    barangayCaptain || "" // ✅ PASS CAPTAIN NAME
  );
  setPreviewResident(item);
  setPreviewType("indigency");
  setPreviewHTML(html);
  setShowPreview(true);
};

const openSummonPreview = (item) => {
  const html = summonTemplate(
    item,
    fullName,
    formatDatePH,
    barangayLogoUrl || "",
    barangayCaptain || "" // ✅ ADD THIS - Pass captain name to summon
  );
  setPreviewResident(item);
  setPreviewType("summon");
  setPreviewHTML(html);
  setShowPreview(true);
};
  
  /* ==========================================================================
     LIFECYCLE
     ======================================================================== */

  useEffect(() => {
  fetchResidents();

  // 🔹 Load logo and captain name saved in Profile screen
  const loadBarangayData = async () => {
    try {
      const logo = await AsyncStorage.getItem("barangayLogoUrl");
      const captain = await AsyncStorage.getItem("barangayCaptain");
      setBarangayLogoUrl(logo);
      setBarangayCaptain(captain || ""); // ✅ LOAD CAPTAIN
    } catch (e) {
      console.warn("Failed to load barangay data from storage", e);
    }
  };

  loadBarangayData();
  
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };
}, []);

  /* ==========================================================================
     RENDER HELPERS
     ======================================================================== */

  const renderResidentCard = ({ item }) => (
    <View style={styles.residentCard}>
      <View style={styles.cardContent}>
        {/* Left: Resident Info */}
        <View style={styles.residentInfo}>
          <Text style={styles.residentName}>{fullName(item)}</Text>
          <View style={styles.residentDetails}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{item.gender}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{item.civilStatus || "—"}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>Purok {item.purok || "—"}</Text>
            </View>
            {item.age && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailText}>Age {item.age}</Text>
              </View>
            )}
          </View>
          {item.monthlyIncome && (
            <Text style={styles.incomeInfo}>
              ₱{item.monthlyIncome.toLocaleString()} • {classifyIncome(item.monthlyIncome)}
            </Text>
          )}
        </View>

        {/* Right: Action Buttons */}
        <View style={styles.cardButtons}>
          <View style={styles.buttonRow}>
            <ActionButton text="View" onPress={() => openView(item)} color="#6366f1" small />
            <ActionButton text="Edit" onPress={() => startEdit(item)} color={COLORS.secondary} small />
            <ActionButton text="Delete" onPress={() => deleteResident(item._id)} color={COLORS.danger} small />
          </View>
          <View style={styles.buttonRow}>
            <ActionButton text="Certificate" onPress={() => openPurposeThenGenerate(item)} color="#3b82f6" small />
            <ActionButton text="Summon" onPress={() => openSummonPreview(item)} color="#8b5cf6" small />
          </View>
        </View>
      </View>
    </View>
  );

  const header = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {/* Search Row - All in one line */}
        <View style={styles.searchMainRow}>
          <View style={styles.searchTypeWrapper}>
            <Text style={styles.searchLabel}>Search By:</Text>
            <View style={styles.searchTypeDropdown}>
              <Picker
                selectedValue={searchType}
                onValueChange={(value) => {
                  setSearchType(value);
                  setQuery("");
                  fetchResidents();
                }}
                style={styles.compactPicker}
              >
                <Picker.Item label="Name" value="name" style={styles.pickerItem} />
                <Picker.Item label="Purok" value="purok" style={styles.pickerItem} />
                <Picker.Item label="Age" value="age" style={styles.pickerItem} />
                <Picker.Item label="Street" value="street" style={styles.pickerItem} />
              </Picker>
            </View>
          </View>

          <TextInput
            style={[GLOBAL_STYLES.input, styles.searchInput]}
            placeholder={getSearchPlaceholder(searchType)}
            value={query}
            onChangeText={searchResidents}
            keyboardType={searchType === "age" ? "numeric" : "default"}
          />

          <TouchableOpacity
            style={[GLOBAL_STYLES.button, styles.importButton]}
            onPress={importCSV}
          >
            <Text style={GLOBAL_STYLES.buttonText}>Import CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Add Resident Button */}
        <TouchableOpacity 
          style={[GLOBAL_STYLES.button, styles.addButton]} 
          onPress={openAdd}
        >
          <Text style={GLOBAL_STYLES.buttonText}>+ Add Resident</Text>
        </TouchableOpacity>
      </View>
    ),
    [query, searchType]
  );

  /* ==========================================================================
     MAIN RENDER
     ======================================================================== */

  return (
    <SidebarLayout>
      <View style={GLOBAL_STYLES.contentArea}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Residents Management</Text>
          <Text style={styles.pageSubtitle}>
            {residents.length} {residents.length === 1 ? 'Resident' : 'Residents'} Registered
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading residents...</Text>
          </View>
        ) : (
          <FlatList
            data={residents}
            keyExtractor={(item) => item._id}
            renderItem={renderResidentCard}
            ListHeaderComponent={header}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No residents found</Text>
                <Text style={styles.emptySubtext}>Add a resident to get started</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      {/* Modals */}
      <ResidentFormModal
        visible={showAdd}
        title="Add Resident"
        form={form}
        setForm={setForm}
        onSave={addResident}
        onCancel={() => setShowAdd(false)}
      />

      <ResidentFormModal
        visible={showEdit}
        title="Edit Resident"
        form={form}
        setForm={setForm}
        onSave={saveEdit}
        onCancel={() => setShowEdit(false)}
      />

      <PurposeModal
        visible={showPurpose}
        purposeText={purposeText}
        setPurposeText={setPurposeText}
        onGenerate={() => {
          setShowPurpose(false);
          if (viewItem) openCertificatePreview(viewItem, purposeText);
        }}
        onCancel={() => setShowPurpose(false)}
      />

      <ProfileModal
        visible={showView}
        title="Resident Profile"
        onClose={() => setShowView(false)}
        sections={buildProfileSections(viewItem)}
        actions={[
          {
            text: "Summon",
            variant: "secondary",
            onPress: () => viewItem && openSummonPreview(viewItem),
          },
          {
            text: "Certificate",
            variant: "green",
            onPress: () => viewItem && openPurposeThenGenerate(viewItem),
          },
        ]}
      />

      <CertificatePreview
  visible={showPreview}
  html={previewHTML}
  onClose={() => setShowPreview(false)}
  onPrint={async () => {
    if (!previewHTML) return;

    try {
      // 🌐 Web: use browser print dialog
      await Print.printAsync({ html: previewHTML });
    } catch (e) {
      console.error("Print error:", e);
      if (typeof window !== "undefined") {
        window.alert("Failed to print document.");
      }
    } finally {
      setShowPreview(false);
    }
  }}
  onRecord={async () => {
    if (!previewResident || !previewType) {
      setRecordStatus({
        show: true,
        message: "Missing resident or document type",
        type: "error",
      });
      return;
    }

    try {
      if (previewType === "indigency") {
        const payload = {
          residentName: fullName(previewResident),
          certificateType: "Certificate of Indigency",
          purpose: purposeText || "Official request",
        };

        console.log("📤 Sending certificate:", payload);
        const response = await api.post("/certificates", payload);
        console.log("✅ Certificate response:", response.data);

        setRecordStatus({
          show: true,
          message: "Certificate recorded successfully!",
          type: "success",
        });
      } else if (previewType === "summon") {
        const now = new Date();
        const summonDate = now.toISOString().split("T")[0];
        const summonTime = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const payload = {
          recipientName: fullName(previewResident),
          reason: "Official Summon",
          summonDate,
          summonTime,
          status: "Pending",
        };

        console.log("📤 Sending summon:", payload);
        const response = await api.post("/summons", payload);
        console.log("✅ Summon response:", response.data);

        setRecordStatus({
          show: true,
          message: "Summon recorded successfully!",
          type: "success",
        });
      }
    } catch (e: any) {
      console.error("❌ Error:", e?.response?.data || e?.message);

      setRecordStatus({
        show: true,
        message:
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Failed to record document",
        type: "error",
      });
    }
  }}
  documentType={previewType}
/>

      <Modal visible={recordStatus.show} animationType="fade" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.smallModalContent}>
      <Text style={[
        GLOBAL_STYLES.subtitle, 
        { color: recordStatus.type === 'success' ? COLORS.secondary : COLORS.danger }
      ]}>
        {recordStatus.type === 'success' ? '✅ Success' : '❌ Error'}
      </Text>
      <Text style={{ marginTop: 10, marginBottom: 20, fontSize: 15 }}>
        {recordStatus.message}
      </Text>
      <TouchableOpacity 
        style={[
          styles.modalButton, 
          recordStatus.type === 'success' ? styles.saveButton : styles.cancelButton
        ]} 
        onPress={() => setRecordStatus({show: false, message: '', type: 'success'})}
      >
        <Text style={styles.modalButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SidebarLayout>
  );
}

/* ============================================================================
   REUSABLE COMPONENTS
   ========================================================================== */

function ResidentFormModal({ visible, title, form, setForm, onSave, onCancel }) {
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
              
              <DateInput
                label="Birth Date"
                value={form.birthDate}
                onChange={(value) => setForm({ ...form, birthDate: value })}
              />

              <DropdownInput
                label="Gender"
                value={form.gender}
                options={GENDER_OPTIONS}
                onValueChange={(value) => setForm({ ...form, gender: value })}
              />

              <DropdownInput
                label="Civil Status"
                value={form.civilStatus}
                options={CIVIL_STATUS_OPTIONS}
                onValueChange={(value) => setForm({ ...form, civilStatus: value })}
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
              <FormInput
                label="Monthly Income"
                value={form.monthlyIncome}
                onChangeText={(t) => setForm({ ...form, monthlyIncome: t })}
                keyboardType="numeric"
              />

              <DropdownInput
                label="Beneficiary Status"
                value={form.beneficiaryStatus}
                options={BENEFICIARY_STATUS_OPTIONS}
                onValueChange={(value) => setForm({ ...form, beneficiaryStatus: value })}
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

function PurposeModal({ visible, purposeText, setPurposeText, onGenerate, onCancel }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.smallModalContent}>
          <Text style={GLOBAL_STYLES.subtitle}>Certificate Purpose</Text>
          <TextInput
            style={[GLOBAL_STYLES.input, { marginTop: 10, marginBottom: 20 }]}
            placeholder="e.g. Scholarship Application"
            value={purposeText}
            onChangeText={setPurposeText}
          />
          <View style={styles.formModalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={onGenerate}
            >
              <Text style={styles.modalButtonText}>Generate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          minWidth: small ? 85 : 100,
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

function DateInput({ label, value, onChange }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={GLOBAL_STYLES.label}>{label}</Text>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.dateInput}
      />
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

function Button({ text, onPress, variant = "primary" }) {
  const colors = {
    primary: COLORS.primary,
    danger: COLORS.danger,
    green: COLORS.secondary,
  };

  return (
    <TouchableOpacity
      style={[GLOBAL_STYLES.button, { backgroundColor: colors[variant], paddingHorizontal: 14 }]}
      onPress={onPress}
    >
      <Text style={GLOBAL_STYLES.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

/* ============================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function getSearchPlaceholder(searchType: string) {
  const placeholders = {
    name: "Search by name...",
    purok: "Search by purok...",
    age: "Search by age...",
    street: "Search by street...",
  };
  return placeholders[searchType] || "Search...";
}

function buildProfileSections(viewItem) {
  if (!viewItem) return [];

  return [
    {
      heading: "Personal Information",
      fields: [
        { label: "Full Name", value: fullName(viewItem) },
        { label: "Gender", value: viewItem.gender },
        { label: "Age", value: viewItem.age ?? "—" },
        {
          label: "Birth Date",
          value: viewItem.birthDate ? formatDatePH(viewItem.birthDate) : "—",
        },
        { label: "Civil Status", value: viewItem.civilStatus || "—" },
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
      heading: "Contact & Socio-Economic",
      fields: [
        { label: "Contact Number", value: viewItem.contactNumber || "—" },
        { label: "Occupation", value: viewItem.occupation || "—" },
        {
          label: "Monthly Income",
          value: viewItem.monthlyIncome
            ? `₱${viewItem.monthlyIncome} (${classifyIncome(viewItem.monthlyIncome)})`
            : "—",
        },
        {
          label: "Beneficiary Status",
          value: viewItem.beneficiaryStatus || "None",
        },
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

  // Search
  searchMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchTypeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    whiteSpace: "nowrap",
  },
  searchTypeDropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 120,
  },
  compactPicker: {
    height: 44,
    color: COLORS.text,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    height: 44,
  },
  importButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 44,
    marginTop: 0,
    minWidth: 120,
  },
  addButton: {
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // Dropdown Styling
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
  pickerWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // Resident Card
  residentCard: {
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
  residentInfo: {
    flex: 1,
    minWidth: 0,
  },
  residentName: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 8,
    color: COLORS.text,
  },
  residentDetails: {
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
  incomeInfo: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 4,
  },
  cardButtons: {
    gap: 8,
    alignItems: "flex-end",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
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
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
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
  pickerWrapper: {
    ...GLOBAL_STYLES.input,
    padding: 0,
    justifyContent: "center",
  },
  dateInput: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16,
    border: "1px solid #d1d5db",
  },
};