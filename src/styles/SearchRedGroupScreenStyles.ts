import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  title: {
    color: "#E60000",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 14,
  },
  paragraph: {
    color: "#4B4B4B",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#1E1E1E",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleRed: {
    color: "#E60000",
  },
  bulletList: {
    gap: 9,
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletMark: {
    color: "#6A6A6A",
    fontSize: 18,
    lineHeight: 24,
    marginTop: -1,
  },
  bulletText: {
    flex: 1,
    color: "#6A6A6A",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
});