// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import SidebarLayout from "../components/SidebarLayout";

export default function DashboardScreen() {
  const [barangay, setBarangay] = useState<string>("");

  useEffect(() => {
    const fetchBarangay = async () => {
      const name = await AsyncStorage.getItem("barangayName");
      if (name) setBarangay(name);
    };
    fetchBarangay();
  }, []);

  return (
    <SidebarLayout>
      <Text style={styles.contentTitle}>
        {barangay ? `Welcome to  ${barangay} Management System` : "Welcome to your Dashboard"}
      </Text>

      <Text style={GLOBAL_STYLES.bodyText}>
        Select an option from the sidebar to manage your barangay's residents or workers.
      </Text>

      <View style={[GLOBAL_STYLES.artCard, { marginTop: 30 }]}>
        <Text style={GLOBAL_STYLES.subtitle}>Quick Stats</Text>
        <Text style={GLOBAL_STYLES.bodyText}>Total Residents: 1,204</Text>
        <Text style={GLOBAL_STYLES.bodyText}>Total Workers: 15</Text>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  contentTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
});
