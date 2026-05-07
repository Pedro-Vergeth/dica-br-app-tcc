import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },
  body: {
    flex: 1,
    paddingTop: 8,
    gap: 16,
  },
  title: {
    color: "#1F1F1F",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    fontFamily: "Poppins-Bold",
  },
  paragraph: {
    color: "#1F1F1F",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
  },
  colorVerde: {
    color: "#4BB05B",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  colorAmarelo: {
    color: "#F7C300",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  colorAzul: {
    color: "#0F5F9A",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  question: {
    color: "#1F1F1F",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    marginTop: 8,
  },
  actions: {
    gap: 16,
    alignItems: "center",
    marginBottom: 180,
  },
  primaryButton: {
    width: 228,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4BB05B",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#196926",
    shadowColor: "#196926",
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: "#E05A00",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textDecorationLine: "underline",
  },
});
