import React from "react";
import { Image, LayoutAnimation, PanResponder, Platform, Pressable, ScrollView, Text, UIManager, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { styles } from "../styles/GameScreenStyles";

const BOARD_DESIGN_WIDTH = 346;
const BOARD_DESIGN_HEIGHT = 313.563;
const PLATE_DESIGN_SIZE = 280;
const FOOD_SIZE = 48;
const FOOD_GAP = 12;
const TRAY_ITEM_WIDTH = 54;
const TRAY_ITEM_HEIGHT = 66;
const TRAY_TILE_SIZE = 48;
const TRAY_ITEM_SPACING = 12;

const foodTray = [
  { id: "banana", label: "Banana", group: "yellow" as const, color: "#F7C300" },
  { id: "bread", label: "Pão francês", group: "yellow" as const, color: "#E0B370" },
  { id: "butter", label: "Manteiga", group: "yellow" as const, color: "#F4E091" },
  { id: "honey", label: "Mel", group: "yellow" as const, color: "#D28D38" },
  { id: "oats", label: "Aveia", group: "yellow" as const, color: "#B8865A" },
  { id: "broccoli", label: "Brócolis", group: "green" as const, color: "#4BB05B" },
  { id: "fish", label: "Peixe", group: "blue" as const, color: "#0F5F9A" },
] as const;

type ZoneKey = "blue" | "yellow" | "green";

type ZoneLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlacedItem = {
  x: number;
  y: number;
  zone: ZoneKey;
};

function ArcLabel({ text }: { text: string }) {
  return (
    <View style={styles.foodLabelArcWrap}>
      <Text style={styles.foodLabelArcFallback}>{text}</Text>
    </View>
  );
}

function FoodToken({
  label,
  color,
  size = TRAY_TILE_SIZE,
  showLabel = true,
}: {
  label: string;
  color: string;
  size?: number;
  showLabel?: boolean;
}) {
  return (
    <View style={styles.foodTokenWrap}>
      {showLabel ? <ArcLabel text={label} /> : null}
      <View style={[styles.foodTile, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
    </View>
  );
}

function isInsideZone(centerX: number, centerY: number, zone: ZoneLayout) {
  return centerX >= zone.x && centerX <= zone.x + zone.width && centerY >= zone.y && centerY <= zone.y + zone.height;
}

function DraggableFood({
  item,
  originX,
  originY,
  zoneLayouts,
  isActive,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPlaced,
}: {
  item: (typeof foodTray)[number];
  originX: number;
  originY: number;
  zoneLayouts: Record<ZoneKey, ZoneLayout>;
  isActive: boolean;
  onDragStart: (itemId: string, x: number, y: number) => void;
  onDragMove: (itemId: string, x: number, y: number) => void;
  onDragEnd: (itemId: string) => void;
  onPlaced: (itemId: string, absoluteX: number, absoluteY: number, zone: ZoneKey) => void;
}) {
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onDragStart(item.id, originX, originY);
        },
        onPanResponderMove: (_event, gestureState) => {
          onDragMove(item.id, originX + gestureState.dx, originY + gestureState.dy);
        },
        onPanResponderRelease: (_event, gestureState) => {
          const zone = zoneLayouts[item.group];

          // Usamos a posição exata do dedo na tela (moveX/moveY) para a colisão
          // Isso funciona mesmo se o ScrollView tiver rolado!
          const centerX = gestureState.moveX;
          const centerY = gestureState.moveY;

          if (isInsideZone(centerX, centerY, zone)) {
            // Calcula onde ele deve ficar fixo no prato (coordenadas absolutas da tela)
            const targetX = zone.x + zone.width / 2 - FOOD_SIZE / 2;
            const targetY = zone.y + zone.height / 2 - FOOD_SIZE / 2;
            
            // Avisa a tela principal que acertou e onde deve prender
            onPlaced(item.id, targetX, targetY, item.group);
          }

          onDragEnd(item.id);
        },
      }),
    [item.group, item.id, onDragEnd, onDragMove, onDragStart, onPlaced, originX, originY, zoneLayouts],
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.foodCardTray,
        {
          width: TRAY_ITEM_WIDTH,
          height: TRAY_ITEM_HEIGHT,
          opacity: isActive ? 0 : 1,
        },
      ]}
    >
      <FoodToken label={item.label} color={item.color} />
    </View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scaleX = React.useCallback((value: number) => (value * width) / 402, [width]);
  const scaleY = React.useCallback((value: number) => (value * height) / 874, [height]);

  React.useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const boardWidth = scaleX(BOARD_DESIGN_WIDTH);
  const boardHeight = scaleY(BOARD_DESIGN_HEIGHT);
  const boardLeft = scaleX(32);
  const boardTop = scaleY(339);

  const trayLeft = scaleX(32);
  const trayTop = scaleY(177);
  const trayWidth = width + scaleX(33);
  const trayHeight = scaleY(85);
  const trayHorizontalPadding = 18;
  const trayVerticalOffset = (trayHeight - TRAY_ITEM_HEIGHT) / 2;

  const [trayScrollX, setTrayScrollX] = React.useState(0);
  const [trayItemLayouts, setTrayItemLayouts] = React.useState<Record<string, { x: number; y: number }>>({});

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

  const [placedItems, setPlacedItems] = React.useState<Record<string, PlacedItem>>({});
  const [placedOrder, setPlacedOrder] = React.useState<string[]>([]);

  const visibleTrayItems = React.useMemo(() => foodTray.filter((item) => !placedItems[item.id]), [placedItems]);

  const handlePlaced = React.useCallback((itemId: string, x: number, y: number, zone: ZoneKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlacedItems((current) => ({ ...current, [itemId]: { x, y, zone } }));
    setPlacedOrder((current) => (current.includes(itemId) ? current : [...current, itemId]));
  }, []);

  const allPlaced = Object.keys(placedItems).length === foodTray.length;
  const [activeDrag, setActiveDrag] = React.useState<{
    itemId: string;
    x: number;
    y: number;
  } | null>(null);

  const handleDragStart = React.useCallback((itemId: string, x: number, y: number) => {
    setActiveDrag({ itemId, x, y });
  }, []);

  const handleDragMove = React.useCallback((itemId: string, x: number, y: number) => {
    setActiveDrag((current) => (current && current.itemId === itemId ? { itemId, x, y } : current));
  }, []);

  const handleDragEnd = React.useCallback((itemId: string) => {
    setActiveDrag((current) => (current && current.itemId === itemId ? null : current));
  }, []);

  const handleTrayItemLayout = React.useCallback((itemId: string, x: number, y: number) => {
    setTrayItemLayouts((current) => {
      const previous = current[itemId];
      if (previous && previous.x === x && previous.y === y) {
        return current;
      }

      return { ...current, [itemId]: { x, y } };
    });
  }, []);

  const placedByZone = React.useMemo(
    () => ({
      yellow: placedOrder.filter((itemId) => placedItems[itemId]?.zone === "yellow"),
      green: placedOrder.filter((itemId) => placedItems[itemId]?.zone === "green"),
      blue: placedOrder.filter((itemId) => placedItems[itemId]?.zone === "blue"),
    }),
    [placedItems, placedOrder],
  );

  const getStackOffset = React.useCallback((zone: ZoneKey, stackIndex: number) => {
    const offset = stackIndex * 11;

    if (zone === "yellow") {
      return { x: -offset, y: offset * 0.82 };
    }

    if (zone === "blue") {
      return { x: -offset, y: -offset * 0.82 };
    }

    return { x: offset, y: offset * 0.6 };
  }, []);

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
            resizeMode="stretch"
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
              borderRadius: trayHeight / 2,
              backgroundColor: '#E5E5E5', 
            },
          ]}
        >
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => setTrayScrollX(event.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
              contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: trayHorizontalPadding, paddingRight: 36, height: '100%' }}
              style={{ width: '100%', flex: 1, overflow: 'hidden' }}
            >
            {visibleTrayItems.map((item, index) => {
              const measuredLayout = trayItemLayouts[item.id];
              const originX = measuredLayout ? trayLeft + measuredLayout.x - trayScrollX : trayLeft + trayHorizontalPadding + index * (TRAY_ITEM_WIDTH + FOOD_GAP) - trayScrollX;
              const originY = measuredLayout ? trayTop + measuredLayout.y : trayTop + trayVerticalOffset;
              const isActive = activeDrag?.itemId === item.id;

              return (
                <View key={item.id} style={{ marginRight: FOOD_GAP, flexShrink: 0, width: TRAY_ITEM_WIDTH, height: TRAY_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
                  <View
                    onLayout={(event) => {
                      const { x, y } = event.nativeEvent.layout;
                      handleTrayItemLayout(item.id, x, y);
                    }}
                    style={{ width: TRAY_ITEM_WIDTH, height: TRAY_ITEM_HEIGHT }}
                  >
                  <DraggableFood
                    item={item}
                      originX={originX}
                      originY={originY}
                    zoneLayouts={zoneLayouts}
                    isActive={isActive}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onPlaced={handlePlaced}
                  />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {activeDrag ? (
          <View
            style={[
              styles.foodCard,
              {
                position: "absolute",
                left: activeDrag.x,
                top: activeDrag.y,
                width: TRAY_ITEM_WIDTH,
                height: TRAY_ITEM_HEIGHT,
                zIndex: 999,
                elevation: 999,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
            pointerEvents="none"
          >
            <FoodToken
              label={foodTray.find((entry) => entry.id === activeDrag.itemId)?.label ?? ""}
              color={foodTray.find((entry) => entry.id === activeDrag.itemId)?.color ?? "#DADADA"}
            />
          </View>
        ) : null}

        {(["yellow", "green", "blue"] as ZoneKey[]).flatMap((zone) =>
          placedByZone[zone].map((itemId, stackIndex) => {
            const item = foodTray.find((entry) => entry.id === itemId);
            const placed = placedItems[itemId];

            if (!item || !placed) {
              return null;
            }

            const offset = getStackOffset(zone, stackIndex);

            return (
              <View
                key={`placed-${item.id}`}
                style={[
                  styles.foodCard,
                  {
                    position: "absolute",
                    left: placed.x + offset.x,
                    top: placed.y + offset.y,
                    width: FOOD_SIZE,
                    height: FOOD_SIZE,
                    zIndex: 30 + stackIndex,
                    elevation: 30 + stackIndex,
                    transform: [{ scale: 1 - stackIndex * 0.04 }],
                  },
                ]}
              >
                <FoodToken label={item.label} color={item.color} size={FOOD_SIZE} />
              </View>
            );
          }),
        )}

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