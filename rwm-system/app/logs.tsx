import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import api from "../lib/api";

export default function CertificateLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/certificates")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Certificate Logs
      </Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, borderBottomWidth: 1, paddingBottom: 5 }}>
            <Text>📄 {item.documentType}</Text>
            <Text>👤 {item.residentId?.firstName} {item.residentId?.lastName}</Text>
            <Text>🗓 {new Date(item.createdAt).toLocaleString()}</Text>
            <Text>🧑‍💼 {item.generatedBy}</Text>
          </View>
        )}
      />
    </View>
  );
}
