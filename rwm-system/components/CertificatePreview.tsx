// @ts-nocheck
import React, { useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";

export default function CertificatePreview({
  visible,
  html,
  onClose,
  onPrint,      // kept as fallback for non-web
  onRecord,
  documentType,
}) {
  const iframeRef = useRef(null);

  const handlePrint = () => {
    // 🔹 Web: print ONLY the iframe contents (the certificate)
    if (Platform.OS === "web" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
      return;
    }

    // 🔹 Native / fallback: use whatever was passed from parent
    if (onPrint) {
      onPrint();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {documentType === "indigency" ? "Certificate Preview" : "Summon Preview"}
            </Text>
          </View>

          {/* Bond Paper Preview Container */}
          <ScrollView
            style={styles.previewScrollContainer}
            contentContainerStyle={styles.previewScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.bondPaperContainer}>
              <iframe
                ref={iframeRef}
                srcDoc={html}
                style={styles.iframe}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onRecord && (
              <TouchableOpacity
                style={[styles.actionButton, styles.recordButton]}
                onPress={onRecord}
              >
                <Text style={styles.buttonText}>
                  📝 Record {documentType === "indigency" ? "Certificate" : "Summon"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.printButton]}
              onPress={handlePrint}
            >
              <Text style={styles.buttonText}>🖨️ Print</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    width: "95%",
    maxWidth: 900,
    height: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  previewScrollContainer: {
    flex: 1,
    backgroundColor: "#e2e8f0",
  },
  previewScrollContent: {
    padding: 30,
    alignItems: "center",
  },
  bondPaperContainer: {
    width: 650,         // A4-ish width
    minHeight: 920,     // A4-ish height
    backgroundColor: "#ffffff",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  iframe: {
    width: "100%",
    height: "920px",
    border: "none",
    display: "block",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recordButton: {
    backgroundColor: "#10b981",
  },
  printButton: {
    backgroundColor: COLORS.secondary,
  },
  closeButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
};
