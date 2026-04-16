import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#414141",
    overflow: "hidden",
  },
  player: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(65, 65, 65, 0.24)",
  },
  titleCard: {
    position: "absolute",
    top: 100,
    left: 0,
    width: 313,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    shadowColor: "#01AB51",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  title: {
    color: "#01AB51",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36,
  },
  skipButton: {
    position: "absolute",
    right: 16,
    bottom: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  skipArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
  },
});