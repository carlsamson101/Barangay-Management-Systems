// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", role: "" });

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/workers");
      setWorkers(res.data);
    } catch {
      Alert.alert("Error", "Failed to fetch workers");
    }
  };

  const addWorker = async () => {
    if (!form.name || !form.role) return;
    await api.post("/workers", form);
    setForm({ name: "", role: "" });
    fetchWorkers();
  };

  const deleteWorker = async (id: string) => {
    await api.delete(`/workers/${id}`);
    fetchWorkers();
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <View style={GLOBAL_STYLES.container}>
      <Text style={GLOBAL_STYLES.title}>Workers</Text>

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TextInput
          style={[GLOBAL_STYLES.input, { flex: 1 }]}
          placeholder="Name"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />
        <TextInput
          style={[GLOBAL_STYLES.input, { flex: 1, marginLeft: 10 }]}
          placeholder="Role"
          value={form.role}
          onChangeText={(v) => setForm({ ...form, role: v })}
        />
        <TouchableOpacity style={[GLOBAL_STYLES.button, { marginLeft: 10 }]} onPress={addWorker}>
          <Text style={GLOBAL_STYLES.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[GLOBAL_STYLES.card, { flexDirection: "row", justifyContent: "space-between" }]}>
            <Text style={GLOBAL_STYLES.cardText}>{item.name} ({item.role})</Text>
            <TouchableOpacity onPress={() => deleteWorker(item._id)}>
              <Text style={{ color: COLORS.danger }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
