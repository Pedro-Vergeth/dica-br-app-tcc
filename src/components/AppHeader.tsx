import React from "react";
import { Image, Text, View, type ImageSourcePropType, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

import { styles } from "../styles/AppHeaderStyles";

type AppHeaderProps = {
  title: string;
  logoSource?: ImageSourcePropType;
  containerStyle?: StyleProp<ViewStyle>;
  titleWrapStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showShadow?: boolean;
};

const defaultLogo = require("../../assets/images/openScreen/logo.png");

export default function AppHeader({
  title,
  logoSource = defaultLogo,
  containerStyle,
  titleWrapStyle,
  titleStyle,
  showShadow = true,
}: AppHeaderProps) {
  return (
    <View style={[styles.logoHeader, containerStyle]}>
      <View style={styles.logoWrap}>
        <Image source={logoSource} resizeMode="contain" style={styles.logoImage} />
      </View>

      <View style={[styles.logoTitleWrap, titleWrapStyle]}>
        <Text style={[styles.logoTitleText, titleStyle]}>{title}</Text>
      </View>

      {showShadow ? <View pointerEvents="none" style={styles.headerShadow} /> : null}
    </View>
  );
}