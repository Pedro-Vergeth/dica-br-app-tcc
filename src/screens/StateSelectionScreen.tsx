import React from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import {
  getRegionImageByState,
  stateOptions,
  type StateOption,
} from "../services/regionService";
import {
  loadSelectedState,
  saveFirstAccessCompleted,
  saveSelectedState,
} from "../services/onboardingStorage";
import { styles } from "../styles/StateSelectionScreenStyles";

export default function StateSelectionScreen() {
  const router = useRouter();
  const [popupVisible, setPopupVisible] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState<StateOption | null>(null);
  const mapTransition = React.useRef(new Animated.Value(1)).current;
  const hasMounted = React.useRef(false);

  const sortedStateOptions = React.useMemo(
    () => [...stateOptions].sort((left, right) => left.state.localeCompare(right.state, "pt-BR")),
    []
  );

  const selectedRegionImage = getRegionImageByState(selectedState);

  React.useEffect(() => {
    let isMounted = true;

    const hydrateSelectedState = async () => {
      const storedState = await loadSelectedState();

      if (isMounted) {
        setSelectedState(storedState);
      }
    };

    void hydrateSelectedState();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    mapTransition.setValue(0);
    Animated.timing(mapTransition, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [selectedState?.region, mapTransition]);

  const bemVindo = "Bem-Vindo(a)!";

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <ImageBackground
        source={require("../../assets/images/openScreen/imageScreen.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.whitePanel}>
            <View style={styles.header}>
              <Text style={styles.title}>{bemVindo}</Text>
              <Text style={styles.subtitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              </Text>
            </View>

            <View style={styles.dropdownAnchor}>
              <Pressable style={styles.selectBox} onPress={() => setPopupVisible(true)}>
                <Text style={selectedState ? styles.selectTextSelected : styles.selectText}>
                  {selectedState ? selectedState.state : "Selecione seu estado"}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
            </View>

            <View style={styles.mapBox}>
              <Animated.Image
                source={selectedRegionImage}
                style={[
                  styles.regionImage,
                  {
                    opacity: mapTransition,
                    transform: [
                      {
                        translateY: mapTransition.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>

            <Pressable
              style={styles.button}
              onPress={() => {
                if (!selectedState) {
                  setPopupVisible(true);
                  return;
                }

                void saveSelectedState(selectedState);
                void saveFirstAccessCompleted();
                router.replace("/video");
              }}
            >
              <Text style={styles.buttonText}>Comece Aqui</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPopupVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPopupVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Selecione seu estado</Text>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {sortedStateOptions.map((item) => (
                <Pressable
                  key={item.sigla}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedState(item);
                    setPopupVisible(false);
                    void saveSelectedState(item);
                    void saveFirstAccessCompleted();
                  }}
                >
                  <Text style={styles.modalItemText}>{item.state}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}