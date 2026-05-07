import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { SearchIcon as NavbarSearchIcon } from "./NavbarIcons";
import { styles } from "../styles/HomeScreenStyles";

const TAB_ICONS = [
  require("../../assets/images/navbar/home.png"),
  require("../../assets/images/navbar/receitas.png"),
  null,
  require("../../assets/images/navbar/biblioteca.png"),
  require("../../assets/images/navbar/perfil.png"),
] as const;

const TAB_LABELS = ["Início", "Receitas", "Pesquisar", "Biblioteca", "Perfil"];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bottomNav}>
      <View style={styles.bottomNavRow}>
        {state.routes.map((route, index) => {
          const onPress = () => navigation.navigate(route.name);

          if (index === 2) {
            return (
              <Pressable key={route.key} style={styles.navCenterPressable} onPress={onPress} accessibilityRole="button">
                <View style={styles.navCenterGroup}>
                  <View style={styles.navCenterHalo} />
                  <View style={styles.navCenterButton}>
                    <NavbarSearchIcon />
                  </View>
                  <Text style={styles.navCenterLabel}>Pesquisar</Text>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} style={styles.navItem} onPress={onPress} accessibilityRole="button">
              <Image source={TAB_ICONS[index]!} resizeMode="contain" style={styles.navIconImage} />
              <Text style={styles.navLabel}>{TAB_LABELS[index]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
