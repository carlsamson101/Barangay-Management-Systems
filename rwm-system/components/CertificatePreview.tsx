// @ts-nocheck
import React from "react";
import { View, Modal, TouchableOpacity, Text } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function CertificatePreview({
  visible,
  html,
  onClose,
  onPrint,
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[GLOBAL_STYLES.centered, { backgroundColor: "#00000088" }]}>
        <View style={[GLOBAL_STYLES.card, { width: "90%", height: "80%" }]}>
          <Text style={GLOBAL_STYLES.subtitle}>Preview</Text>

          {/* WebView-like preview */}
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: "70%", borderWidth: 1 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <TouchableOpacity
              style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.secondary }]}
              onPress={onPrint}
            >
              <Text style={GLOBAL_STYLES.buttonText}>Print</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.danger }]}
              onPress={onClose}
            >
              <Text style={GLOBAL_STYLES.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
