import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 18,
    paddingTop: 34,
  },
  scrollContent: {
    paddingBottom: 26,
  },
  heroBlock: {
    marginBottom: 18,
  },
  title: {
    color: "#1D1D1D",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
    marginBottom: 20,
  },
  subTitle: {
    color: "#145FA0",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  videoFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EAF2F8",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: "#1D1D1D",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionBody: {
    color: "#6C6C6C",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "500",
  },
  durationText: {
    color: "#6C6C6C",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 8,
  },
  emptyState: {
    marginTop: 32,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "#1C1C1C",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyStateText: {
    color: "#4A5568",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
