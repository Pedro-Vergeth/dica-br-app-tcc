import React from "react";
import { StyleSheet, View } from "react-native";

type NavbarIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

export function HomeIcon({ width = 32, height = 32, color = "#085491" }: NavbarIconProps) {
  return (
    <View style={[styles.iconBox, { width, height }]}>
      <View style={[styles.houseRoofLeft, { backgroundColor: color }]} />
      <View style={[styles.houseRoofRight, { backgroundColor: color }]} />
      <View style={[styles.houseBody, { borderColor: color }]} />
      <View style={[styles.houseDoor, { backgroundColor: color }]} />
    </View>
  );
}

export function FoodIcon({ width = 32, height = 32, color = "#085491" }: NavbarIconProps) {
  return (
    <View style={[styles.iconBox, { width, height }]}>
      <View style={[styles.foodForkStem, { backgroundColor: color }]} />
      <View style={[styles.foodForkTop, { backgroundColor: color }]} />
      <View style={[styles.foodKnifeStem, { backgroundColor: color }]} />
      <View style={[styles.foodKnifeTop, { backgroundColor: color }]} />
    </View>
  );
}

export function SearchIcon({ width = 32, height = 32, color = "#FFFFFF" }: NavbarIconProps) {
  return (
    <View style={[styles.iconBox, { width, height }]}>
      <View style={[styles.searchCircle, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

export function BooksIcon({ width = 32, height = 32, color = "#085491" }: NavbarIconProps) {
  return (
    <View style={[styles.iconBox, { width, height }]}>
      <View style={[styles.bookLeft, { borderColor: color }]} />
      <View style={[styles.bookRight, { borderColor: color }]} />
      <View style={[styles.bookSpine, { backgroundColor: color }]} />
    </View>
  );
}

export function ProfileIcon({ width = 32, height = 32, color = "#085491" }: NavbarIconProps) {
  return (
    <View style={[styles.iconBox, { width, height }]}>
      <View style={[styles.profileHead, { borderColor: color }]} />
      <View style={[styles.profileShoulders, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  houseRoofLeft: {
    position: "absolute",
    width: 12,
    height: 2.5,
    borderRadius: 2,
    top: 7,
    left: 9,
    transform: [{ rotate: "-45deg" }],
  },
  houseRoofRight: {
    position: "absolute",
    width: 12,
    height: 2.5,
    borderRadius: 2,
    top: 7,
    right: 9,
    transform: [{ rotate: "45deg" }],
  },
  houseBody: {
    position: "absolute",
    width: 14,
    height: 12,
    borderWidth: 2,
    borderTopWidth: 2,
    borderRadius: 2,
    top: 13,
  },
  houseDoor: {
    position: "absolute",
    width: 4,
    height: 6,
    borderRadius: 1,
    bottom: 6,
  },
  foodForkStem: {
    position: "absolute",
    width: 2.5,
    height: 17,
    borderRadius: 2,
    left: 8,
    top: 4,
  },
  foodForkTop: {
    position: "absolute",
    width: 6,
    height: 2.5,
    borderRadius: 2,
    left: 6.5,
    top: 4,
  },
  foodKnifeStem: {
    position: "absolute",
    width: 2.5,
    height: 19,
    borderRadius: 2,
    right: 8,
    top: 2,
  },
  foodKnifeTop: {
    position: "absolute",
    width: 4,
    height: 2.5,
    borderRadius: 2,
    right: 7,
    top: 2,
  },
  searchCircle: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    left: 4,
    top: 4,
  },
  searchHandle: {
    position: "absolute",
    width: 11,
    height: 2.5,
    borderRadius: 2,
    right: 1,
    bottom: 4,
    transform: [{ rotate: "45deg" }],
  },
  bookLeft: {
    position: "absolute",
    width: 12,
    height: 18,
    borderWidth: 2,
    borderRadius: 2,
    left: 2,
    top: 4,
  },
  bookRight: {
    position: "absolute",
    width: 12,
    height: 18,
    borderWidth: 2,
    borderRadius: 2,
    right: 2,
    top: 4,
  },
  bookSpine: {
    position: "absolute",
    width: 2,
    height: 20,
    borderRadius: 1,
    top: 4,
  },
  profileHead: {
    position: "absolute",
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
    top: 3,
  },
  profileShoulders: {
    position: "absolute",
    width: 22,
    height: 10,
    borderWidth: 2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    bottom: 4,
  },
});