import React from "react";
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { styles } from "../styles/AppHeaderStyles";

type BackHeaderProps = {
  title: string;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  backButtonIconColor?: string;
  backButtonIconSize?: number;
  titleWrapStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showShadow?: boolean;
};

export default function BackHeader({
  title,
  onBackPress,
  containerStyle,
  backButtonStyle,
  backButtonIconColor = "#01AB51",
  backButtonIconSize = 33,
  titleWrapStyle,
  titleStyle,
  showShadow = true,
}: BackHeaderProps) {
  return (
    <View style={[styles.backHeader, containerStyle]}>
      <Pressable style={[styles.backButton, backButtonStyle]} onPress={onBackPress} accessibilityRole="button">
        <Ionicons name="arrow-back" size={backButtonIconSize} color={backButtonIconColor} />
      </Pressable>

      <View style={[styles.headerRightWrap, titleWrapStyle]}>
        <Text style={[styles.headerRightText, titleStyle]}>{title}</Text>
      </View>

      {showShadow ? <View pointerEvents="none" style={styles.headerShadow} /> : null}
    </View>
  );
}