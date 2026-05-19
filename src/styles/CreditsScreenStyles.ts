import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#Ffffff",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  developedByLabel: {
    color: "#1C1C1C",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  mediaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  gifCell: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  gif: {
    width: "100%",
    height: "100%",
  },
  secondImageCell: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  secondImage: {
    width: "100%",
    height: "100%",
  },
  secondImagePlaceholder: {
    flex: 1,
    backgroundColor: "#E8EFF5",
  },
  sectionsWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  section: {
    paddingVertical: 14,
  },
  sectionTitle: {
    color: "#1C1C1C",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  nameItem: {
    paddingVertical: 2,
    paddingLeft: 12,
  },
  nameText: {
    color: "#1C1C1C",
    fontSize: 18,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
  },
});
