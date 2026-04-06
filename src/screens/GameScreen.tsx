import React from "react";
import { Image, PanResponder, Pressable, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { styles } from "../styles/GameScreenStyles";

const BOARD_DESIGN_WIDTH = 346;
const BOARD_DESIGN_HEIGHT = 313.563;
const PLATE_DESIGN_SIZE = 280;
const FOOD_SIZE = 48;
const FOOD_GAP = 4;
const FOOD_ROW_PAD = 12;

const foodTray = [
  {
    id: "banana",
    label: "Amarelo",
    group: "yellow" as const,
    color: "#F7C300",
  },
  {
    id: "butter",
    label: "Azul",
    group: "blue" as const,
    color: "#0F5F9A",
  },
  {
    id: "fruit",
    label: "Verde",
    group: "green" as const,
    color: "#4BB05B",
  },
] as const;

type ZoneKey = "blue" | "yellow" | "green";

type ZoneLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function isInsideZone(centerX: number, centerY: number, zone: ZoneLayout) {
  return centerX >= zone.x && centerX <= zone.x + zone.width && centerY >= zone.y && centerY <= zone.y + zone.height;
}

function DraggableFood({
  item,
  originX,
  originY,
  trayLeft,
  trayTop,
  zoneLayouts,
  onPlaced,
}: {
  item: (typeof foodTray)[number];
  originX: number;
  originY: number;
  trayLeft: number;
  trayTop: number;
  zoneLayouts: Record<ZoneKey, ZoneLayout>;
  onPlaced: (itemId: string) => void;
}) {
  const [dragPosition, setDragPosition] = React.useState({ x: 0, y: 0 });
  const [placed, setPlaced] = React.useState(false);
  const basePosition = React.useRef({ x: 0, y: 0 });

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !placed,
        onMoveShouldSetPanResponder: () => !placed,
        onPanResponderMove: (_event, gestureState) => {
          if (placed) {
            return;
          }

          setDragPosition({
            x: basePosition.current.x + gestureState.dx,
            y: basePosition.current.y + gestureState.dy,
          });
        },
        onPanResponderRelease: (_event, gestureState) => {
          const zone = zoneLayouts[item.group];
          const absoluteOriginX = trayLeft + originX;
          const absoluteOriginY = trayTop + originY;
          const currentX = basePosition.current.x + gestureState.dx;
          const currentY = basePosition.current.y + gestureState.dy;
          const centerX = absoluteOriginX + currentX + FOOD_SIZE / 2;
          const centerY = absoluteOriginY + currentY + FOOD_SIZE / 2;

          if (isInsideZone(centerX, centerY, zone)) {
            const targetX = zone.x + zone.width / 2 - FOOD_SIZE / 2 - absoluteOriginX;
            const targetY = zone.y + zone.height / 2 - FOOD_SIZE / 2 - absoluteOriginY;

            basePosition.current = { x: targetX, y: targetY };
            setDragPosition({ x: targetX, y: targetY });
            setPlaced(true);
            onPlaced(item.id);
            return;
          }

          setDragPosition(basePosition.current);
        },
      }),
    [item.group, onPlaced, originX, originY, placed, trayLeft, trayTop, zoneLayouts],
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.foodCard,
        {
          left: originX,
          top: originY,
          width: FOOD_SIZE,
          height: FOOD_SIZE,
          opacity: placed ? 0.97 : 1,
          transform: [{ translateX: dragPosition.x }, { translateY: dragPosition.y }],
        },
      ]}
    >
        <View style={[styles.foodTile, { backgroundColor: item.color }]}>
          <Text style={styles.foodLabel}>{item.label}</Text>
        </View>
    </View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scaleX = React.useCallback((value: number) => (value * width) / 402, [width]);
  const scaleY = React.useCallback((value: number) => (value * height) / 874, [height]);

  const boardWidth = scaleX(BOARD_DESIGN_WIDTH);
  const boardHeight = scaleY(BOARD_DESIGN_HEIGHT);
  const boardLeft = scaleX(32);
  const boardTop = scaleY(339);

  const trayLeft = scaleX(32);
  const trayTop = scaleY(177);
  const trayWidth = Math.max(scaleX(338), width - scaleX(64));
  const trayHeight = scaleY(85);

  const plateSize = scaleX(PLATE_DESIGN_SIZE);
  const plateLeft = boardLeft + (boardWidth - plateSize) / 2;
  const plateTop = boardTop + scaleY(8);

  const zoneLayouts = React.useMemo<Record<ZoneKey, ZoneLayout>>(
    () => ({
      green: {
        x: plateLeft,
        y: plateTop,
        width: plateSize / 2,
        height: plateSize,
      },
      yellow: {
        x: plateLeft + plateSize / 2,
        y: plateTop,
        width: plateSize / 2,
        height: plateSize / 2,
      },
      blue: {
        x: plateLeft + plateSize / 2,
        y: plateTop + plateSize / 2,
        width: plateSize / 2,
        height: plateSize / 2,
      },
    }),
    [plateLeft, plateSize, plateTop],
  );

  const [placedIds, setPlacedIds] = React.useState<string[]>([]);

  const handlePlaced = React.useCallback((itemId: string) => {
    setPlacedIds((current) => (current.includes(itemId) ? current : [...current, itemId]));
  }, []);

  const allPlaced = placedIds.length === foodTray.length;

  const foodOrigins = React.useMemo(
    () => {
      const slotWidth = trayWidth / foodTray.length;

      return foodTray.map((_, index) => ({
        left: slotWidth * index + (slotWidth - FOOD_SIZE) / 2,
        top: (trayHeight - FOOD_SIZE) / 2 - 6,
      }));
    },
    [trayHeight, trayWidth],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Text style={styles.backButtonIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Monte seu prato</Text>
      </View>

      <View style={[styles.content, { paddingTop: scaleY(122) }]}>
        <Text style={[styles.sectionTitle, { top: scaleY(156), left: scaleX(32) }]}>Alimentos</Text>

        <View style={[styles.boardWrapper, { left: boardLeft, top: boardTop, width: boardWidth, height: boardHeight }]}>
          <Image
            source={require("../../assets/images/game/backgroundPlate.png")}
            resizeMode="cover"
            style={styles.boardBackground}
          />

          <View style={[styles.plateLayer, { left: (boardWidth - plateSize) / 2, top: scaleY(8), width: plateSize, height: plateSize }]}>
            <Image source={require("../../assets/images/game/plateGame/plate.png")} resizeMode="contain" style={styles.plateImage} />
            <View style={[styles.zoneClip, { left: 0, top: 0, width: plateSize / 2, height: plateSize }]}>
              <Image source={require("../../assets/images/game/plateGame/greenZone.png")} resizeMode="contain" style={[styles.zoneImage, styles.zoneGreen]} />
            </View>
            <View style={[styles.zoneClip, { left: plateSize / 2, top: 0, width: plateSize / 2, height: plateSize / 2 }]}>
              <Image source={require("../../assets/images/game/plateGame/yellowZone.png")} resizeMode="contain" style={[styles.zoneImage, styles.zoneYellow]} />
            </View>
            <View style={[styles.zoneClip, { left: plateSize / 2, top: plateSize / 2, width: plateSize / 2, height: plateSize / 2 }]}>
              <Image source={require("../../assets/images/game/plateGame/blueZone.png")} resizeMode="contain" style={[styles.zoneImage, styles.zoneBlue]} />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.tray,
            {
              left: trayLeft,
              top: trayTop,
              width: trayWidth,
              height: trayHeight,
            },
          ]}
        >
          <View style={styles.trayList}>
            {foodTray.map((item) => (
              <View key={item.id} style={styles.traySlot} />
            ))}
          </View>
          {foodTray.map((item, index) => (
            <DraggableFood
              key={item.id}
              item={item}
              originX={foodOrigins[index].left}
              originY={foodOrigins[index].top}
              trayLeft={trayLeft}
              trayTop={trayTop}
              zoneLayouts={zoneLayouts}
              onPlaced={handlePlaced}
            />
          ))}
        </View>

        <Text style={[styles.helperText, { top: scaleY(281), left: scaleX(32) }]}>Arraste os alimentos para o prato</Text>

        <Pressable
          accessibilityRole="button"
          disabled={!allPlaced}
          style={[styles.finishButton, { top: scaleY(708), left: (width - scaleX(228)) / 2 }, !allPlaced && styles.finishButtonDisabled]}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.finishButtonText}>Finalizar</Text>
        </Pressable>
      </View>
    </View>
  );
}
