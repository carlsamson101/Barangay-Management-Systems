import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#2563eb",
  secondary: "#16a34a",
  danger: "#ef4444",
  background: "#f8fafc",
  text: "#1f2937",
  white: "#ffffff",
  border: "#d1d5db",
  gray: "#A9A9A9",
  primaryLight: "#60a5fa",
  lightGray: "#e5e7eb",
};

export const GLOBAL_STYLES = StyleSheet.create({
  // --- Core Layouts ---
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },

  // --- Typography ---
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 18,
    color: COLORS.text,
    opacity: 0.7, // Softer text color
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 16,
  },

  // --- Buttons ---
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  greenButton: {
    backgroundColor: COLORS.secondary,
  },
  redButton: {
    backgroundColor: COLORS.danger,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  gradientButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  gradientButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // --- Inputs & Cards ---
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardText: {
    color: COLORS.text,
    fontSize: 16,
  },
  artCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16, // More rounded
    padding: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Softer, longer shadow
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  // --- Utilities ---
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },

  // --- Sidebar Layout Styles ---
  safeAreaSidebar: {
    flex: 1,
    backgroundColor: COLORS.primary, // For the top notch
  },
  sidebarLayoutContainer: {
    flex: 1,
    flexDirection: 'row', // This creates the sidebar/content split
  },
  sidebar: {
  flex: 0.8, // smaller sidebar
  backgroundColor: COLORS.primary,
  padding: 20,
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
},
contentArea: {
  flex: 4.2, // more width for main content
  backgroundColor: COLORS.background,
  padding: 30,
},

  sidebarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 40,
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  navButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15, // Space from icon
  },
  logoutButton: {
    position: 'absolute', // Pins to the bottom of the sidebar
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.danger, // Use danger color for logout
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  
});