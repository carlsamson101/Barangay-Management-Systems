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
  onRecord,
  documentType,
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[GLOBAL_STYLES.centered, { backgroundColor: "#00000088" }]}>
        <View style={[GLOBAL_STYLES.card, { width: "90%", height: "80%" }]}>
          <Text style={GLOBAL_STYLES.subtitle}>
            {documentType === "indigency" ? "Certificate Preview" : "Summon Preview"}
          </Text>

          {/* WebView-like preview */}
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: "70%", borderWidth: 1 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 10 }}>
            {onRecord && (
              <TouchableOpacity
                style={[GLOBAL_STYLES.button, { backgroundColor: "#10b981", flex: 1 }]}
                onPress={onRecord}
              >
                <Text style={GLOBAL_STYLES.buttonText}>
                  📝 Record {documentType === "indigency" ? "Certificate" : "Summon"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.secondary, flex: 1 }]}
              onPress={onPrint}
            >
              <Text style={GLOBAL_STYLES.buttonText}>🖨️ Print</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.danger, flex: 1 }]}
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