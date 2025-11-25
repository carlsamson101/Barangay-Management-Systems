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
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";
import CertificatePreview from "../components/CertificatePreview";
import { certificateTemplate } from "../lib/certificateTemplate";
import { summonTemplate } from "../lib/summonTemplate";
import ProfileModal from "../components/ProfileModal";
/* ----------------------------- Types & Helpers ---------------------------- */

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthDate: "", // ISO string from input; backend will compute age
  gender: "Male",
  street: "",
  purok: "",
  barangay: "",
  civilStatus: "Single",
  contactNumber: "",
  occupation: "",
  monthlyIncome: "",
  beneficiaryStatus: "None",
  purpose: "", // used for certificate
};

const formatDatePH = (dateLike?: string | Date) => {
  try {
    const d = dateLike ? new Date(dateLike) : new Date();
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
};

const fullName = (r) =>
  [r?.firstName, r?.middleName, r?.lastName].filter(Boolean).join(" ");
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"];
const BENEFICIARY_STATUS_OPTIONS = ["None", "4Ps", "Senior Citizen", "PWD", "Solo Parent"];

/* ------------------------------- Main Screen ------------------------------ */

export default function ResidentsScreen() {
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
const [previewHTML, setPreviewHTML] = useState("");
const [showPreview, setShowPreview] = useState(false);
const [previewResident, setPreviewResident] = useState<any | null>(null);
const [previewType, setPreviewType] = useState<"indigency" | "summon" | null>(null);
const [searchType, setSearchType] = useState("name"); // 'name', 'purok', 'age', 'street'
const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [purposeText, setPurposeText] = useState("");

  /* ------------------------------- Data Calls ------------------------------ */

const fetchResidents = async () => {
  console.log("🔄 fetchResidents called");
  try {
    setLoading(true);
    const res = await api.get("/residents");
    console.log("✅ /residents response:", res.data);
    setResidents(res.data || []);
  } catch (err: any) {
    console.error("❌ /residents error:", err?.response?.data || err?.message);
    Alert.alert("Error", "Failed to load residents.");
  } finally {
    console.log("✅ fetchResidents finished");
    setLoading(false); // ⬅️ this should hide the spinner
  }
};

const openCertificatePreview = (item, purpose) => {
  const html = certificateTemplate(item, purpose, fullName, formatDatePH);
  setPreviewResident(item);
  setPreviewType("indigency");
  setPreviewHTML(html);
  setShowPreview(true);
};

const openSummonPreview = (item) => {
  const html = summonTemplate(item, fullName, formatDatePH);
  setPreviewResident(item);
  setPreviewType("summon");
  setPreviewHTML(html);
  setShowPreview(true);
};

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

  const searchResidents = async (text: string) => {
  setQuery(text);
  
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // If empty or too short, fetch all residents
  if (!text || text.trim().length === 0) {
    fetchResidents();
    return;
  }
  
  // Set new timeout - only search after user stops typing for 500ms
  const timeout = setTimeout(async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (searchType) {
        case 'name':
          endpoint = `/residents/search/${encodeURIComponent(text)}`;
          break;
        case 'purok':
          endpoint = `/residents/search/purok/${encodeURIComponent(text)}`;
          break;
        case 'age':
          endpoint = `/residents/search/age/${encodeURIComponent(text)}`;
          break;
        case 'street':
          endpoint = `/residents/search/street/${encodeURIComponent(text)}`;
          break;
        default:
          endpoint = `/residents/search/${encodeURIComponent(text)}`;
      }
      
      const res = await api.get(endpoint);
      setResidents(res.data || []);
    } catch (err: any) {
      console.error(err?.response?.data || err?.message);
      // If search fails, show all residents
      fetchResidents();
    } finally {
      setLoading(false);
    }
  }, 500); // Wait 500ms after user stops typing
  
  setSearchTimeout(timeout);
};

// Add cleanup in useEffect
useEffect(() => {
  fetchResidents();
  
  // Cleanup timeout on unmount
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };
}, []);


  const addResident = async () => {
    try {
      // barangay auto-fill from saved login (if you saved it)
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

  /* --------------------------------- UI ----------------------------------- */
  useEffect(() => {
    fetchResidents();
  }, []);

  const openAdd = async () => {
    const barangayName = await AsyncStorage.getItem("barangayName");
    setForm({ ...emptyForm, barangay: barangayName || "" });
    setShowAdd(true);
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

const renderRow = ({ item }) => (
  <View
    style={[
      GLOBAL_STYLES.card,
      {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      },
    ]}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "600", fontSize: 16 }}>
        {fullName(item)}
      </Text>
      <Text style={{ opacity: 0.7 }}>
        {item.gender} • {item.civilStatus || "—"} • Purok {item.purok || "—"}
      </Text>
      {/* Add income classification display */}
      <Text style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
        Income: {item.monthlyIncome ? `₱${item.monthlyIncome}` : "—"} 
        {item.monthlyIncome && ` (${classifyIncome(item.monthlyIncome)})`}
      </Text>
    </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={[GLOBAL_STYLES.button, { paddingHorizontal: 10, paddingVertical: 8 }]}
          onPress={() => openView(item)}
        >
          <Text style={GLOBAL_STYLES.buttonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 8 }]}
          onPress={() => startEdit(item)}
        >
          <Text style={GLOBAL_STYLES.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.danger, paddingHorizontal: 10, paddingVertical: 8 }]}
          onPress={() => deleteResident(item._id)}
        >
          <Text style={GLOBAL_STYLES.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary row of actions */}
      <View style={{ position: "absolute", bottom: -10, right: 14, flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 6 }]}
          onPress={() => openPurposeThenGenerate(item)}
        >
          <Text style={GLOBAL_STYLES.buttonText}>Certificate</Text>
        </TouchableOpacity>
       <TouchableOpacity
  style={[GLOBAL_STYLES.button, { backgroundColor: "#8b5cf6", paddingHorizontal: 10, paddingVertical: 6 }]}
onPress={() => openSummonPreview(item)}
>
  <Text style={GLOBAL_STYLES.buttonText}>Summon</Text>
</TouchableOpacity>
      </View>
    </View>
  );

  const header = useMemo(
  () => (
    <View style={{ marginBottom: 10 }}>
      {/* Search Type Selector */}
      <View style={{ marginBottom: 10 }}>
        <Text style={GLOBAL_STYLES.label}>Search By:</Text>
        <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
          <Picker
            selectedValue={searchType}
            onValueChange={(value) => {
              setSearchType(value);
              setQuery(""); // Clear search when changing type
              fetchResidents(); // Reset to all residents
            }}
          >
            <Picker.Item label="Name" value="name" />
            <Picker.Item label="Purok" value="purok" />
            <Picker.Item label="Age" value="age" />
            <Picker.Item label="Street" value="street" />
          </Picker>
        </View>
      </View>

      {/* Search + Import */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <TextInput
          style={[GLOBAL_STYLES.input, { flex: 1 }]}
          placeholder={
            searchType === "name" ? "Search by name..." :
            searchType === "purok" ? "Search by purok..." :
            searchType === "age" ? "Search by age..." :
            "Search by street..."
          }
          value={query}
          onChangeText={searchResidents}
          keyboardType={searchType === "age" ? "numeric" : "default"}
        />
        <TouchableOpacity
          style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.secondary }]}
          onPress={importCSV}
        >
          <Text style={GLOBAL_STYLES.buttonText}>Import CSV</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={GLOBAL_STYLES.button} onPress={openAdd}>
        <Text style={GLOBAL_STYLES.buttonText}>Add Resident</Text>
      </TouchableOpacity>
    </View>
  ),
  [query, searchType]
);

  return (
    <SidebarLayout>
      <View style={GLOBAL_STYLES.contentArea}>
        <Text style={GLOBAL_STYLES.title}>Residents</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={residents}
            keyExtractor={(item) => item._id}
            renderItem={renderRow}
            ListHeaderComponent={header}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      {/* ------------------------------- ADD MODAL ------------------------------- */}
      <Modal visible={showAdd} animationType="fade" transparent onRequestClose={() => setShowAdd(false)}>
        <ScrollView contentContainerStyle={[GLOBAL_STYLES.centered, { backgroundColor: "#00000088", padding: 16 }]}>
          <View style={[GLOBAL_STYLES.card, { width: "96%" }]}>
            <Text style={GLOBAL_STYLES.subtitle}>Add Resident</Text>

            <TwoCol>
              <Input label="First Name" value={form.firstName} onChangeText={(t) => setForm({ ...form, firstName: t })} />
              <Input label="Middle Name" value={form.middleName} onChangeText={(t) => setForm({ ...form, middleName: t })} />
              <Input label="Last Name" value={form.lastName} onChangeText={(t) => setForm({ ...form, lastName: t })} />
             {/* Birth Date with calendar */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Birth Date</Text>
  <input
    type="date"
    value={form.birthDate}
    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
    style={{
  width: "100%",
  padding: 8,
  borderRadius: 8,
  backgroundColor: "white",
  fontSize: 16,
  border: "1px solid #d1d5db",
}}

  />
</View>

{/* Gender dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Gender</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.gender}
      onValueChange={(value) => setForm({ ...form, gender: value })}
    >
      {GENDER_OPTIONS.map((g) => (
        <Picker.Item key={g} label={g} value={g} />
      ))}
    </Picker>
  </View>
</View>

{/* Civil Status dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Civil Status</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.civilStatus}
      onValueChange={(value) => setForm({ ...form, civilStatus: value })}
    >
      {CIVIL_STATUS_OPTIONS.map((cs) => (
        <Picker.Item key={cs} label={cs} value={cs} />
      ))}
    </Picker>
  </View>
</View>
              <Input label="Street" value={form.street} onChangeText={(t) => setForm({ ...form, street: t })} />
              <Input label="Purok" value={form.purok} onChangeText={(t) => setForm({ ...form, purok: t })} />
              <Input label="Barangay" value={form.barangay} onChangeText={(t) => setForm({ ...form, barangay: t })} />
              <Input label="Contact Number" value={form.contactNumber} onChangeText={(t) => setForm({ ...form, contactNumber: t })} keyboardType="phone-pad" />
              <Input label="Occupation" value={form.occupation} onChangeText={(t) => setForm({ ...form, occupation: t })} />
              <Input label="Monthly Income" value={form.monthlyIncome} onChangeText={(t) => setForm({ ...form, monthlyIncome: t })} keyboardType="numeric" />
              {/* Beneficiary Status dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Beneficiary Status</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.beneficiaryStatus}
      onValueChange={(value) => setForm({ ...form, beneficiaryStatus: value })}
    >
      {BENEFICIARY_STATUS_OPTIONS.map((opt) => (
        <Picker.Item key={opt} label={opt} value={opt} />
      ))}
    </Picker>
  </View>
</View>
            </TwoCol>

            <Row gap={10} style={{ marginTop: 10 }}>
              <Button text="Save" onPress={addResident} />
              <Button text="Cancel" onPress={() => setShowAdd(false)} variant="danger" />
            </Row>
          </View>
        </ScrollView>
      </Modal>

      {/* ------------------------------- EDIT MODAL ------------------------------ */}
      <Modal visible={showEdit} animationType="fade" transparent onRequestClose={() => setShowEdit(false)}>
        <ScrollView contentContainerStyle={[GLOBAL_STYLES.centered, { backgroundColor: "#00000088", padding: 16 }]}>
          <View style={[GLOBAL_STYLES.card, { width: "96%" }]}>
            <Text style={GLOBAL_STYLES.subtitle}>Edit Resident</Text>

            <TwoCol>
              <Input label="First Name" value={form.firstName} onChangeText={(t) => setForm({ ...form, firstName: t })} />
              <Input label="Middle Name" value={form.middleName} onChangeText={(t) => setForm({ ...form, middleName: t })} />
              <Input label="Last Name" value={form.lastName} onChangeText={(t) => setForm({ ...form, lastName: t })} />
          <View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Birth Date</Text>
  <input
    type="date"
    value={form.birthDate}
    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
   style={{
  width: "100%",
  padding: 8,
  borderRadius: 8,
  backgroundColor: "white",
  fontSize: 16,
  border: "1px solid #d1d5db",
}}

  />
</View>

{/* Gender dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Gender</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.gender}
      onValueChange={(value) => setForm({ ...form, gender: value })}
    >
      {GENDER_OPTIONS.map((g) => (
        <Picker.Item key={g} label={g} value={g} />
      ))}
    </Picker>
  </View>
</View>

{/* Civil Status dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Civil Status</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.civilStatus}
      onValueChange={(value) => setForm({ ...form, civilStatus: value })}
    >
      {CIVIL_STATUS_OPTIONS.map((cs) => (
        <Picker.Item key={cs} label={cs} value={cs} />
      ))}
    </Picker>
  </View>
</View>

              <Input label="Street" value={form.street} onChangeText={(t) => setForm({ ...form, street: t })} />
              <Input label="Purok" value={form.purok} onChangeText={(t) => setForm({ ...form, purok: t })} />
              <Input label="Barangay" value={form.barangay} onChangeText={(t) => setForm({ ...form, barangay: t })} />
              <Input label="Contact Number" value={form.contactNumber} onChangeText={(t) => setForm({ ...form, contactNumber: t })} keyboardType="phone-pad" />
              <Input label="Occupation" value={form.occupation} onChangeText={(t) => setForm({ ...form, occupation: t })} />
              <Input label="Monthly Income" value={form.monthlyIncome} onChangeText={(t) => setForm({ ...form, monthlyIncome: t })} keyboardType="numeric" />
{/* Beneficiary Status dropdown */}
<View style={{ marginBottom: 10 }}>
  <Text style={GLOBAL_STYLES.label}>Beneficiary Status</Text>
  <View style={[GLOBAL_STYLES.input, { padding: 0, justifyContent: "center" }]}>
    <Picker
      selectedValue={form.beneficiaryStatus}
      onValueChange={(value) => setForm({ ...form, beneficiaryStatus: value })}
    >
      {BENEFICIARY_STATUS_OPTIONS.map((opt) => (
        <Picker.Item key={opt} label={opt} value={opt} />
      ))}
    </Picker>
  </View>
</View>            </TwoCol>

            <Row gap={10} style={{ marginTop: 10 }}>
              <Button text="Save Changes" onPress={saveEdit} />
              <Button text="Cancel" onPress={() => setShowEdit(false)} variant="danger" />
            </Row>
          </View>
        </ScrollView>
      </Modal>

      

      {/* ----------------------------- PURPOSE MODAL --------------------------- */}
      <Modal visible={showPurpose} animationType="fade" transparent onRequestClose={() => setShowPurpose(false)}>
        <View style={[GLOBAL_STYLES.centered, { backgroundColor: "#00000088", padding: 16 }]}>
          <View style={[GLOBAL_STYLES.card, { width: "92%" }]}>
            <Text style={GLOBAL_STYLES.subtitle}>Certificate Purpose</Text>
            <TextInput
              style={GLOBAL_STYLES.input}
              placeholder="e.g. Scholarship Application"
              value={purposeText}
              onChangeText={setPurposeText}
            />
            <Row gap={10}>
              <Button
  text="Generate"
  onPress={() => {
    const item = viewItem;
    setShowPurpose(false);
    if (item) openCertificatePreview(item, purposeText);
  }}
/>

              <Button text="Cancel" onPress={() => setShowPurpose(false)} variant="danger" />
            </Row>
          </View>
        </View>
      </Modal>
            <ProfileModal
        visible={showView}
        title="Resident Profile"
        onClose={() => setShowView(false)}
        sections={
          !viewItem
            ? []
            : [
                {
                  heading: "Personal Information",
                  fields: [
                    { label: "Full Name", value: fullName(viewItem) },
                    { label: "Gender", value: viewItem.gender },
                    { label: "Age", value: viewItem.age ?? "—" },
                    {
                      label: "Birth Date",
                      value: viewItem.birthDate
                        ? formatDatePH(viewItem.birthDate)
                        : "—",
                    },
                    { label: "Civil Status", value: viewItem.civilStatus || "—" },
                  ],
                },
                {
                  heading: "Address",
                  fields: [
                    {
                      label: "Street",
                      value: viewItem.street || "—",
                    },
                    {
                      label: "Purok",
                      value: viewItem.purok || "—",
                    },
                    {
                      label: "Barangay",
                      value: viewItem.barangay || "—",
                    },
                  ],
                },
                {
                  heading: "Contact & Socio-Economic",
                  fields: [
                    {
                      label: "Contact Number",
                      value: viewItem.contactNumber || "—",
                    },
                    {
                      label: "Occupation",
                      value: viewItem.occupation || "—",
                    },
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
              ]
        }
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
    if (!previewHTML || !previewResident || !previewType) return;

    // 1) Generate PDF
    const { uri } = await Print.printToFileAsync({ html: previewHTML });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    // 2) Log to backend
    try {
      await api.post("/certificates", {
        residentId: previewResident._id,
        documentType:
          previewType === "indigency"
            ? "Certificate of Indigency"
            : "Letter of Summon",
        purpose: previewType === "indigency" ? purposeText || "Official request" : "",
      });
    } catch (e: any) {
      console.warn(
        "Failed to log certificate:",
        e?.response?.data || e?.message
      );
    }

    setShowPreview(false);
  }}
/>


    </SidebarLayout>
  );
}

/* ------------------------------ Small UI Bits ----------------------------- */

function Row({ children, style, gap = 8 }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap }, style]}>{children}</View>;
}

function TwoCol({ children }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {React.Children.map(children, (child) => (
        <View style={{ flexBasis: "48%", flexGrow: 1, minWidth: "48%" }}>{child}</View>
      ))}
    </View>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={GLOBAL_STYLES.label}>{label}</Text>
      <TextInput style={GLOBAL_STYLES.input} {...props} />
    </View>
  );
}

function Button({ text, onPress, variant }: { text: string; onPress: () => void; variant?: "danger" | "green" }) {
  const bg =
    variant === "danger" ? COLORS.danger : variant === "green" ? COLORS.secondary : COLORS.primary;
  return (
    <TouchableOpacity style={[GLOBAL_STYLES.button, { backgroundColor: bg, paddingHorizontal: 14 }]} onPress={onPress}>
      <Text style={GLOBAL_STYLES.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function ProfileRow({ label, value }) {
  return (
    <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.lightGray }}>
      <Text style={{ fontSize: 12, opacity: 0.6 }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}
