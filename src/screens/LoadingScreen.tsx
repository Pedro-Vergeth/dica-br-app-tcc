import React from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function LoadingScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <ImageBackground
        source={require("../../assets/images/openScreen/imageScreen.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.vectorContainer}>
            <Image
              source={require("../../assets/images/openScreen/vetor.png")}
              style={styles.vetor}
              resizeMode="contain"
            />

            <Image
              source={require("../../assets/images/openScreen/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7F1",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  vectorContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  vetor: {
    width: "100%",
    height: 1000,
    maxWidth: "100%",
    margin: 0,
    padding: 0,
  },
  logo: {
    position: "absolute",
    width: "55%",
    height: 180,
  },

});