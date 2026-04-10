import React from "react";
import { Image, LayoutAnimation, PanResponder, Platform, Pressable, ScrollView, Text, UIManager, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { fetchGameFoods } from "../services/gameFoodService";
import { styles } from "../styles/GameScreenStyles";
import Svg, { Path, Text as SvgText, TextPath } from "react-native-svg";

const BOARD_DESIGN_WIDTH = 346;
const BOARD_DESIGN_HEIGHT = 313.563;
const PLATE_DESIGN_SIZE = 280;
const FOOD_SIZE = 48;
const FOOD_GAP = 12;
const TRAY_ITEM_WIDTH = 74;
const TRAY_ITEM_HEIGHT = 92;
const TRAY_TILE_SIZE = 64;
const TRAY_ITEM_SPACING = 16;

type ZoneKey = "blue" | "yellow" | "green";

type TrayFoodItem = {
  id: string;
  nomePrincipal: string;
  grupoAlimentar: string;
  imagem64: string;
  imageUri: string;
  color: string;
};

const zoneColors: Record<ZoneKey, string> = {
  blue: "#0F5F9A",
  yellow: "#F7C300",
  green: "#4BB05B",
};

function toZoneKey(grupoAlimentar: string): ZoneKey | null {
  const normalized = grupoAlimentar.trim().toUpperCase();

  if (normalized === "AZUL") {
    return "blue";
  }

  if (normalized === "AMARELO") {
    return "yellow";
  }

  if (normalized === "VERDE") {
    return "green";
  }

  return null;
}

function toImageUri(imagem64: string) {
  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

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
  const arcId = React.useId().replace(/:/g, "");

  return (
    <Svg width={100} height={30} viewBox="0 0 95 8" style={styles.foodLabelArcWrap}>
      <Path id={arcId} d="M 0 46 A 46 46 0 0 1 92 46" fill="none" />
      <SvgText fill="#1F1F1F" fontSize="14" fontWeight="700" fontFamily="Poppins-Bold" textAnchor="middle">
        <TextPath href={`#${arcId}`} startOffset="50%">
          {text}
        </TextPath>
      </SvgText>
    </Svg>
  );
}

function FoodToken({
  label,
  color,
  imageUri,
  size = TRAY_TILE_SIZE,
  showLabel = true,
}: {
  label: string;
  color: string;
  imageUri?: string;
  size?: number;
  showLabel?: boolean;
}) {
  const visualSize = size * 1.12;
  const borderRadius = visualSize / 2;
  const imageSize = visualSize * 1.06;
  const imageTopOffset = -(visualSize * 0.11);
  const imageLeftOffset = -(visualSize * 0.03);

  return (
    <View style={styles.foodTokenWrap}>
      {showLabel ? (
        <ArcLabel text={label} />
      ) : null}
      <View
        style={[
          styles.foodTile,
          {
            backgroundColor: color,
            width: visualSize,
            height: visualSize,
            borderRadius,
            marginTop: 0,
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            resizeMode="cover"
            style={{
              position: "absolute",
              top: imageTopOffset,
              left: imageLeftOffset,
              width: imageSize,
              height: imageSize,
              borderRadius,
            }}
          />
        ) : null}
      </View>
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
  item: TrayFoodItem;
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
          const zoneKey = toZoneKey(item.grupoAlimentar) ?? "yellow";
          const zone = zoneLayouts[zoneKey];

          // Usamos a posição exata do dedo na tela (moveX/moveY) para a colisão
          // Isso funciona mesmo se o ScrollView tiver rolado!
          const centerX = gestureState.moveX;
          const centerY = gestureState.moveY;

          if (isInsideZone(centerX, centerY, zone)) {
            // Calcula onde ele deve ficar fixo no prato (coordenadas absolutas da tela)
            const targetX = zone.x + zone.width / 2 - FOOD_SIZE / 2;
            const targetY = zone.y + zone.height / 2 - FOOD_SIZE / 2;
            
            // Avisa a tela principal que acertou e onde deve prender
            onPlaced(item.id, targetX, targetY, zoneKey);
          }

          onDragEnd(item.id);
        },
      }),
    [item.grupoAlimentar, item.id, onDragEnd, onDragMove, onDragStart, onPlaced, originX, originY, zoneLayouts],
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
      <FoodToken label={item.nomePrincipal} color={item.color} imageUri={item.imageUri} />
    </View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scaleX = React.useCallback((value: number) => (value * width) / 402, [width]);
  const scaleY = React.useCallback((value: number) => (value * height) / 874, [height]);

  const [foodTray, setFoodTray] = React.useState<TrayFoodItem[]>([]);
  const [foodsLoaded, setFoodsLoaded] = React.useState(false);
  const [foodsError, setFoodsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFoods() {
      console.log("[GameScreen] loading foods from API");

      try {
        const payload = await fetchGameFoods();

        if (cancelled) {
          return;
        }

        console.log("[GameScreen] foods received", payload.length);

        const normalizedFoods = payload.map((item, index) => {
          const zoneKey = toZoneKey(item.grupoAlimentar);

          if (!zoneKey) {
            console.log("[GameScreen] item without valid zone", item);
            return null;
          }

          return {
            id: `${item.nomePrincipal}-${index}`,
            nomePrincipal: item.nomePrincipal,
            grupoAlimentar: item.grupoAlimentar,
            imagem64: item.imagem64,
            imageUri: toImageUri(item.imagem64),
            color: zoneColors[zoneKey],
          } satisfies TrayFoodItem;
        }).filter((item): item is TrayFoodItem => Boolean(item));

        console.log("[GameScreen] foods rendered after normalization", normalizedFoods.length);
        setFoodTray(normalizedFoods);
        setFoodsError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log("[GameScreen] failed to load foods from API", error);
        setFoodTray([]);
        setFoodsError(error instanceof Error ? error.message : "Não foi possível carregar os alimentos da API.");
      } finally {
        if (!cancelled) {
          console.log("[GameScreen] foods loading finished");
          setFoodsLoaded(true);
        }
      }
    }

    void loadFoods();

    return () => {
      cancelled = true;
    };
  }, []);

  const boardWidth = scaleX(BOARD_DESIGN_WIDTH);
  const boardHeight = scaleY(BOARD_DESIGN_HEIGHT);
  const boardLeft = scaleX(32);
  const boardTop = scaleY(339);

  const trayLeft = scaleX(32);
  const trayTop = scaleY(177);
  const trayWidth = width + scaleX(33);
  const trayHeight = scaleY(112);
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

  const visibleTrayItems = React.useMemo(() => foodTray.filter((item) => !placedItems[item.id]), [foodTray, placedItems]);

  const handlePlaced = React.useCallback((itemId: string, x: number, y: number, zone: ZoneKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlacedItems((current) => ({ ...current, [itemId]: { x, y, zone } }));
    setPlacedOrder((current) => (current.includes(itemId) ? current : [...current, itemId]));
  }, []);

  const allPlaced = foodTray.length > 0 && Object.keys(placedItems).length === foodTray.length;
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
              const originX = measuredLayout ? trayLeft + measuredLayout.x - trayScrollX : trayLeft + trayHorizontalPadding + index * (TRAY_ITEM_WIDTH + TRAY_ITEM_SPACING) - trayScrollX;
              const originY = measuredLayout ? trayTop + measuredLayout.y : trayTop + trayVerticalOffset;
              const isActive = activeDrag?.itemId === item.id;

              return (
                <View key={item.id} style={{ marginRight: TRAY_ITEM_SPACING, flexShrink: 0, width: TRAY_ITEM_WIDTH, height: TRAY_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
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
              label={foodTray.find((entry) => entry.id === activeDrag.itemId)?.nomePrincipal ?? ""}
              color={foodTray.find((entry) => entry.id === activeDrag.itemId)?.color ?? "#DADADA"}
              imageUri={foodTray.find((entry) => entry.id === activeDrag.itemId)?.imageUri}
              showLabel={true}
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
                <FoodToken label={item.nomePrincipal} color={item.color} imageUri={item.imageUri} size={FOOD_SIZE} showLabel={true} />
              </View>
            );
          }),
        )}

        {!foodsLoaded ? (
          <Text style={[styles.helperText, { top: scaleY(310), left: scaleX(32), color: "#145FA0" }]}>Carregando alimentos...</Text>
        ) : null}

        {foodsLoaded && foodTray.length === 0 && !foodsError ? (
          <Text style={[styles.helperText, { top: scaleY(330), left: scaleX(32), color: "#145FA0" }]}>Nenhum alimento retornado pela API.</Text>
        ) : null}

        {foodsError ? (
          <Text style={[styles.helperText, { top: scaleY(330), left: scaleX(32), color: "#B42318" }]}>{foodsError}</Text>
        ) : null}

        <Text style={[styles.helperText, { top: scaleY(318), left: scaleX(32) }]}>Arraste os alimentos para o prato</Text>

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