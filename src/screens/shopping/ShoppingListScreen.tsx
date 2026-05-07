import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import BackHeader from "../../components/BackHeader";
import { fetchFoodsByGroup, fetchSearchFoods, type SearchFoodItem } from "../../services/searchFoodService";
import { formatFoodBaseQuantity } from "../../services/mealLogService";
import { styles, popupStyles } from "../../styles/ShoppingListScreenStyles";

const portionOptions = [0.5, 1, 2] as const;

const GROUP_VERDE = "VERDE";
const GROUP_AMARELO = "AMARELO";
const GROUP_AZUL = "AZUL";
const GROUP_COLORS: Record<string, string> = {
  [GROUP_VERDE]: "#4BB05B",
  [GROUP_AMARELO]: "#D4A800",
  [GROUP_AZUL]: "#085491",
};

type ShoppingItem = {
  id: string;
  title: string;
  group: string;
  heartColor: string;
  quantity: number;
  unit: string;
  medidaCaseira?: string;
  heartQuantity: number;
};

function readFoodQuantity(item: SearchFoodItem): number {
  const candidate = item.quantidade;
  if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === "string" && candidate.trim()) {
    const v = Number(candidate.replace(",", "."));
    return Number.isFinite(v) ? v : 1;
  }
  return 1;
}

function readFoodUnit(item: SearchFoodItem): string {
  return item.unidade?.trim() || "unidade";
}

function formatPopupPortionLabel(item: SearchFoodItem, portion: number): string {
  const physicalQty = readFoodQuantity(item) * portion;
  const medidaCaseira = item.medidaCaseira?.trim() ?? item.medidacaseira?.trim() ?? null;
  return formatFoodBaseQuantity(physicalQty, medidaCaseira ?? readFoodUnit(item));
}

function PopupResultRow({
  item,
  isSelected,
  currentPortion,
  onToggle,
  onPortionChange,
}: {
  item: SearchFoodItem;
  isSelected: boolean;
  currentPortion: number;
  onToggle: (portion: number) => void;
  onPortionChange: (value: number) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [localPortion, setLocalPortion] = React.useState(currentPortion);

  const handleCheckbox = () => {
    onToggle(localPortion);
    setExpanded(false);
  };

  const handlePortionSelect = (portion: number) => {
    setLocalPortion(portion);
    if (isSelected) onPortionChange(portion);
  };

  return (
    <View style={popupStyles.popupResultRow}>
      <Pressable
        style={[popupStyles.popupResultCheckbox, isSelected ? popupStyles.popupResultCheckboxActive : null]}
        onPress={handleCheckbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        {isSelected ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
      </Pressable>

      <Pressable style={popupStyles.popupResultMain} onPress={() => setExpanded((v) => !v)} accessibilityRole="button">
        <Text
          style={[popupStyles.popupResultTitle, isSelected ? popupStyles.popupResultTitleActive : null]}
          numberOfLines={2}
        >
          {item.nomePrincipal}
        </Text>
      </Pressable>

      <View style={popupStyles.popupResultActionWrap}>
        <Pressable style={popupStyles.popupResultActionButton} onPress={() => setExpanded((v) => !v)} accessibilityRole="button">
          <Ionicons name={expanded ? "chevron-up" : "add"} size={20} color="#01AB51" />
        </Pressable>

        {expanded ? (
          <View style={popupStyles.popupPortionMenu}>
            {portionOptions.map((portion, index) => {
              const isPortionActive = localPortion === portion;
              return (
                <Pressable
                  key={portion}
                  style={[
                    popupStyles.popupPortionOption,
                    index === portionOptions.length - 1 ? popupStyles.popupPortionOptionLast : null,
                    isPortionActive ? popupStyles.popupPortionOptionActive : null,
                  ]}
                  onPress={() => handlePortionSelect(portion)}
                  accessibilityRole="button"
                >
                  <Text style={[popupStyles.popupPortionText, isPortionActive ? popupStyles.popupPortionTextActive : null]}>
                    {formatPopupPortionLabel(item, portion)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function GroupDropdown({
  label,
  color,
  items,
  loading,
  onSelect,
}: {
  label: string;
  color: string;
  items: SearchFoodItem[];
  loading: boolean;
  onSelect: (item: SearchFoodItem) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (item: SearchFoodItem) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <View style={styles.groupSection}>
      <Text style={styles.groupLabel}>{label}</Text>
      <Pressable
        style={[styles.groupDropdownButton, { borderColor: color }]}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
      >
        <Text style={[styles.groupDropdownText, { color }]}>selecione</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={color} />
      </Pressable>

      {open ? (
        <ScrollView
          style={[styles.groupDropdownMenu, { borderColor: color }]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.groupDropdownItem}>
              <Text style={styles.groupDropdownItemText}>Carregando...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.groupDropdownItem}>
              <Text style={styles.groupDropdownItemText}>Nenhum alimento encontrado.</Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                key={`${item.nomePrincipal}|${item.grupoAlimentar}`}
                style={styles.groupDropdownItem}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
              >
                <Text style={styles.groupDropdownItemText}>{item.nomePrincipal}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

export default function ShoppingListScreen() {
  const router = useRouter();

  const [items, setItems] = React.useState<ShoppingItem[]>([]);

  // Popup de busca
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchFoodItem[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [selectedPopupFoods, setSelectedPopupFoods] = React.useState<{ id: string; item: SearchFoodItem; portion: number }[]>([]);

  // Dropdowns de sugestão
  const [verdeItems, setVerdeItems] = React.useState<SearchFoodItem[]>([]);
  const [azulItems, setAzulItems] = React.useState<SearchFoodItem[]>([]);
  const [amareloItems, setAmareloItems] = React.useState<SearchFoodItem[]>([]);
  const [loadingGroups, setLoadingGroups] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      const [verde, azul, amarelo] = await Promise.all([
        fetchFoodsByGroup(GROUP_VERDE),
        fetchFoodsByGroup(GROUP_AZUL),
        fetchFoodsByGroup(GROUP_AMARELO),
      ]);
      setVerdeItems(verde);
      setAzulItems(azul);
      setAmareloItems(amarelo);
      setLoadingGroups(false);
    })();
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);
      fetchSearchFoods(query)
        .then((data) => {
          setResults(data);
          setSearchLoading(false);
        })
        .catch((err: unknown) => {
          setSearchError((err as { message?: string }).message ?? "Erro ao buscar alimentos.");
          setSearchLoading(false);
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  function openPicker() {
    setPickerVisible(true);
    setQuery("");
    setResults([]);
    setSelectedPopupFoods([]);
    setSearchError(null);
  }

  function closePicker() {
    setPickerVisible(false);
    setQuery("");
    setResults([]);
    setSelectedPopupFoods([]);
    setSearchError(null);
  }

  function popupFoodId(item: SearchFoodItem) {
    return `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;
  }

  function togglePopupFood(item: SearchFoodItem, portion: number) {
    const id = popupFoodId(item);
    setSelectedPopupFoods((prev) => {
      const exists = prev.find((f) => f.id === id);
      if (exists) return prev.filter((f) => f.id !== id);
      return [...prev, { id, item, portion }];
    });
  }

  function updatePopupFoodPortion(item: SearchFoodItem, portion: number) {
    const id = popupFoodId(item);
    setSelectedPopupFoods((prev) => prev.map((f) => (f.id === id ? { ...f, portion } : f)));
  }

  function handleAddSelectedFoods() {
    const timestamp = Date.now();
    const newItems: ShoppingItem[] = selectedPopupFoods.map(({ item, portion }, i) => ({
      id: `${item.nomePrincipal}|${item.grupoAlimentar}|${timestamp + i}`,
      title: item.nomePrincipal,
      group: item.grupoAlimentar,
      heartColor: item.heartColor,
      quantity: readFoodQuantity(item),
      unit: readFoodUnit(item),
      medidaCaseira: item.medidaCaseira?.trim() ?? item.medidacaseira?.trim() ?? undefined,
      heartQuantity: portion,
    }));
    setItems((prev) => [...prev, ...newItems]);
    closePicker();
  }

  function addFromGroup(item: SearchFoodItem) {
    setItems((prev) => [
      ...prev,
      {
        id: `${item.nomePrincipal}|${item.grupoAlimentar}|${Date.now()}`,
        title: item.nomePrincipal,
        group: item.grupoAlimentar,
        heartColor: item.heartColor,
        quantity: readFoodQuantity(item),
        unit: readFoodUnit(item),
        medidaCaseira: item.medidaCaseira?.trim() ?? item.medidacaseira?.trim() ?? undefined,
        heartQuantity: 1,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleExport() {
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:6px 10px">${i.title}</td><td style="padding:6px 10px">${formatFoodBaseQuantity(i.quantity * i.heartQuantity, i.unit)}</td><td style="padding:6px 10px">${i.group}</td></tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
      body { font-family: sans-serif; padding: 24px; }
      h2 { color: #085491; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #085491; color: #fff; padding: 8px 10px; text-align: left; }
      tr:nth-child(even) { background: #F3F8FF; }
    </style></head><body>
      <h2>Lista de Compras — DICA BR</h2>
      <table>
        <thead><tr><th>Alimento</th><th>Quantidade</th><th>Grupo</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Exportar Lista de Compras" });
    } catch (err) {
      console.log("[ShoppingListScreen] export error", err);
    }
  }

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
        <BackHeader title="Lista de compras" onBackPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.addButton} onPress={openPicker} accessibilityRole="button">
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar Alimento</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Sugestão de alimentos</Text>

        <GroupDropdown
          label="Grupo verde"
          color={GROUP_COLORS[GROUP_VERDE]}
          items={verdeItems}
          loading={loadingGroups}
          onSelect={addFromGroup}
        />
        <GroupDropdown
          label="Grupo amarelo"
          color={GROUP_COLORS[GROUP_AMARELO]}
          items={amareloItems}
          loading={loadingGroups}
          onSelect={addFromGroup}
        />
        <GroupDropdown
          label="Grupo azul"
          color={GROUP_COLORS[GROUP_AZUL]}
          items={azulItems}
          loading={loadingGroups}
          onSelect={addFromGroup}
        />

        {items.length > 0 ? (
          <>
            <Text style={styles.addedSectionTitle}>Alimentos Adicionados</Text>

            {items.map((item) => (
              <View key={item.id} style={styles.foodRow}>
                <View style={styles.foodRowCheckbox} />
                <Text style={[styles.foodRowName, { color: item.heartColor }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Pressable style={styles.foodRowRemoveBtn} onPress={() => removeItem(item.id)} accessibilityRole="button">
                  <Text style={styles.foodRowRemoveText}>{"−"}</Text>
                </Pressable>
              </View>
            ))}

            <View style={{ height: 80 }} />
          </>
        ) : null}
      </ScrollView>

      {items.length > 0 ? (
        <Pressable style={styles.exportFloatingButton} onPress={handleExport} accessibilityRole="button">
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Exportar como PDF</Text>
        </Pressable>
      ) : null}

      {pickerVisible ? (
        <View style={popupStyles.foodPickerLayer}>
          <View style={popupStyles.foodPickerHeaderSpacer} />
          <BlurView style={popupStyles.foodPickerScreen} intensity={80} tint="light">
            <View style={popupStyles.foodPickerContent}>
              <View style={popupStyles.searchBarRow}>
                <View style={popupStyles.searchInputWrap}>
                  <View style={popupStyles.searchInputIconWrap}>
                    <Ionicons name="search" size={18} color="#145FA0" />
                  </View>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Procurar alimento"
                    placeholderTextColor="#145FA0"
                    style={popupStyles.searchInput}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>
                <Pressable
                  style={popupStyles.cameraButton}
                  onPress={() => router.push("/camera-capture")}
                  accessibilityRole="button"
                >
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={popupStyles.popupResultsCard}>
                <Text style={popupStyles.popupResultsTitle}>Resultado</Text>

                {searchLoading ? <Text style={popupStyles.popupResultsStatus}>Buscando alimentos...</Text> : null}
                {searchError ? (
                  <Text style={[popupStyles.popupResultsStatus, popupStyles.popupResultsError]}>{searchError}</Text>
                ) : null}

                {!searchLoading && !searchError && results.length === 0 ? (
                  <View style={popupStyles.popupEmptyState}>
                    <Text style={popupStyles.popupEmptyStateText}>
                      {query.trim() ? "Nenhum item encontrado" : "Digite para buscar alimentos"}
                    </Text>
                  </View>
                ) : null}

                <ScrollView style={popupStyles.popupResultsList} showsVerticalScrollIndicator={false}>
                  {results.map((item) => {
                    const id = popupFoodId(item);
                    const sel = selectedPopupFoods.find((f) => f.id === id);
                    return (
                      <PopupResultRow
                        key={id}
                        item={item}
                        isSelected={!!sel}
                        currentPortion={sel?.portion ?? 1}
                        onToggle={(portion) => togglePopupFood(item, portion)}
                        onPortionChange={(portion) => updatePopupFoodPortion(item, portion)}
                      />
                    );
                  })}
                </ScrollView>
              </View>

              <Pressable
                style={[
                  popupStyles.popupAddButton,
                  selectedPopupFoods.length === 0 ? popupStyles.popupAddButtonDisabled : null,
                ]}
                onPress={handleAddSelectedFoods}
                disabled={selectedPopupFoods.length === 0}
                accessibilityRole="button"
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
                <Text style={popupStyles.popupAddButtonText}>Adicionar Alimento</Text>
              </Pressable>
            </View>
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}
