import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import BackHeader from "../../components/BackHeader";
import { fetchSearchFoods, type SearchFoodItem } from "../../services/searchFoodService";
import {
  formatFoodBaseQuantity,
  mealTypeLabels,
  saveMealRecord,
  type MealFoodEntry,
  type MealType,
} from "../../services/mealLogService";
import { styles } from "../../styles/MealRegisterScreenStyles";

const mealTypeOptions: MealType[] = ["CAFE_DA_MANHA", "ALMOCO", "JANTAR", "LANCHE"];
const portionOptions = [0.5, 1, 2] as const;
const popupStyles = styles as typeof styles & Record<string, any>;

type SelectedFood = MealFoodEntry;

function toImageUri(imagem64: string) {
  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

function readFoodQuantity(item: SearchFoodItem) {
  const qty = item.qtdParaUmCoracao;
  return typeof qty === "number" && Number.isFinite(qty) ? qty : 1;
}

function readFoodUnit(item: SearchFoodItem) {
  return item.unidade?.trim() || "unidade";
}


function SearchIcon() {
  return <Ionicons name="search" size={18} color="#145FA0" />;
}

function CameraButton() {
  return <Ionicons name="camera-outline" size={20} color="#FFFFFF" />;
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
    if (isSelected) {
      onPortionChange(portion);
    }
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

function SelectedFoodRow({
  item,
  onRemove,
}: {
  item: SelectedFood;
  onRemove: () => void;
}) {
  const [checked, setChecked] = React.useState(false);

  return (
    <View style={styles.selectedFoodRow}>
      <Pressable
        style={styles.selectedFoodCheckbox}
        onPress={() => setChecked((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      />
      <View style={styles.selectedFoodInfo}>
        <Text style={styles.selectedFoodName} numberOfLines={1}>
          {item.title}
        </Text>
        <HeartAmount value={item.heartQuantity} size={14} color={item.heartColor ?? "#01AB51"} />
        <Text style={styles.selectedFoodQuantityText}>
          {formatPortionLabel(
            item.quantity * item.heartQuantity,
            item.unit,
            item.qtdMedidaCaseira != null ? item.qtdMedidaCaseira * item.heartQuantity : undefined,
            item.medidaCaseira,
          )}
        </Text>
      </View>
      <Pressable style={styles.selectedFoodRemoveBtn} onPress={onRemove} accessibilityRole="button">
        <Text style={styles.selectedFoodRemoveText}>{"−"}</Text>
      </Pressable>
    </View>
  );
}

function formatPortionLabel(
  qty: number,
  unit: string,
  measureQty: number | undefined,
  measureUnit: string | undefined,
): string {
  const mainPart = formatFoodBaseQuantity(qty, unit);
  if (measureQty != null && Number.isFinite(measureQty) && measureUnit?.trim()) {
    return `${mainPart} (${formatFoodBaseQuantity(measureQty, measureUnit.trim())})`;
  }
  return mainPart;
}

function formatPopupPortionLabel(item: SearchFoodItem, portion: number): string {
  const qty = readFoodQuantity(item) * portion;
  const unit = readFoodUnit(item);
  const measureQty = item.qtdMedidaCaseira != null ? item.qtdMedidaCaseira * portion : undefined;
  const measureUnit = item.unidadeMedidaCaseira?.trim();
  return formatPortionLabel(qty, unit, measureQty, measureUnit);
}

function HeartAmount({
  value,
  size = 16,
  color = "#D92D20",
}: {
  value: number;
  size?: number;
  color?: string;
}) {
  const normalizedValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const fullHearts = Math.floor(normalizedValue);
  const hasHalfHeart = normalizedValue - fullHearts >= 0.5;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {Array.from({ length: fullHearts }).map((_, index) => (
        <Ionicons key={`full-${index}`} name="heart" size={size} color={color} />
      ))}

      {hasHalfHeart ? <Ionicons name="heart-half" size={size} color={color} /> : null}
    </View>
  );
}

export default function MealRegisterScreen() {
  const router = useRouter();
  const [mealType, setMealType] = React.useState<MealType | null>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchFoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = React.useState<SelectedFood[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mealDropdownOpen, setMealDropdownOpen] = React.useState(false);
  const [foodPickerVisible, setFoodPickerVisible] = React.useState(false);
  const [selectedPopupFoods, setSelectedPopupFoods] = React.useState<Array<{ id: string; item: SearchFoodItem; portion: number }>>([]);

  const todayLabel = React.useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [],
  );

  const runSearch = React.useCallback(async (searchValue: string) => {
    const normalizedSearch = searchValue.trim();

    if (!normalizedSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const foods = await fetchSearchFoods(normalizedSearch, { excludeRedGroup: true });
      setResults(foods);
      setError(null);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : "Não foi possível buscar alimentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      void runSearch(normalizedQuery);
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, runSearch]);

  const addFood = React.useCallback((item: SearchFoodItem, heartQuantity: number) => {
    const id = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}|${Date.now()}`;
    const quantity = readFoodQuantity(item);
    const unit = readFoodUnit(item);
    const medidaCaseira = item.unidadeMedidaCaseira?.trim() ?? undefined;
    const qtdMedidaCaseira = item.qtdMedidaCaseira ?? undefined;

    setSelectedFoods((currentFoods) => [
      ...currentFoods,
      {
        id,
        title: item.nomePrincipal,
        group: item.grupoAlimentar,
        imageUri: toImageUri(item.imagem64),
        heartColor: item.heartColor,
        quantity,
        unit,
        medidaCaseira,
        qtdMedidaCaseira,
        heartQuantity,
      },
    ]);
  }, []);

  const openFoodPicker = React.useCallback(() => {
    setFoodPickerVisible(true);
    setSelectedPopupFoods([]);
  }, []);

  const isPopupFoodSelected = React.useCallback(
    (item: SearchFoodItem) => {
      const key = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;
      return selectedPopupFoods.some((food) => food.id === key);
    },
    [selectedPopupFoods],
  );

  const togglePopupFood = React.useCallback((item: SearchFoodItem, portion: number) => {
    const id = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;

    setSelectedPopupFoods((currentFoods) => {
      const alreadySelected = currentFoods.some((food) => food.id === id);

      if (alreadySelected) {
        return currentFoods.filter((food) => food.id !== id);
      }

      return [...currentFoods, { id, item, portion }];
    });
  }, []);

  const updatePopupFoodPortion = React.useCallback((item: SearchFoodItem, portion: number) => {
    const id = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;

    setSelectedPopupFoods((currentFoods) =>
      currentFoods.map((food) => (food.id === id ? { ...food, portion } : food)),
    );
  }, []);

  const closeFoodPicker = React.useCallback(() => {
    setFoodPickerVisible(false);
    setSelectedPopupFoods([]);
  }, []);

  const handleAddSelectedFoods = React.useCallback(() => {
    if (selectedPopupFoods.length === 0) {
      return;
    }

    selectedPopupFoods.forEach(({ item, portion }) => {
      addFood(item, portion);
    });

    closeFoodPicker();
  }, [addFood, closeFoodPicker, selectedPopupFoods]);

  const removeFood = React.useCallback((foodId: string) => {
    setSelectedFoods((currentFoods) => currentFoods.filter((food) => food.id !== foodId));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!mealType) {
      setError("Selecione a refeição antes de finalizar o registro.");
      return;
    }

    if (selectedFoods.length === 0) {
      setError("Selecione pelo menos um alimento para registrar a refeição.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await saveMealRecord({
        mealType,
        foods: selectedFoods,
      });
      setMessage("Refeição salva com sucesso.");
      router.replace("/meal-history");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a refeição.");
    } finally {
      setSaving(false);
    }
  }, [mealType, router, selectedFoods]);

  const selectedCount = selectedFoods.length;
  const totalHearts = selectedFoods.reduce((sum, food) => sum + food.heartQuantity, 0);
  const canFinalize = Boolean(mealType) && selectedFoods.length > 0 && !saving;

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <BackHeader title="Registro alimentar" onBackPress={() => router.back()} />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainContent}>
            <Text style={styles.pageTitle}>{todayLabel}</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Refeição</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setMealDropdownOpen((currentValue) => !currentValue)}
                accessibilityRole="button"
              >
                <Text style={[styles.dropdownText, !mealType ? styles.dropdownPlaceholder : null]} numberOfLines={1}>
                  {mealType ? mealTypeLabels[mealType] : "selecione"}
                </Text>
                <Ionicons name={mealDropdownOpen ? "chevron-up" : "chevron-down"} size={22} color="#01AB51" />
              </Pressable>

              {mealDropdownOpen ? (
                <View style={styles.dropdownMenu}>
                  {mealTypeOptions.map((option) => {
                    const isActive = mealType === option;

                    return (
                      <Pressable
                        key={option}
                        style={[styles.dropdownOption, isActive ? styles.dropdownOptionActive : null]}
                        onPress={() => {
                          setMealType(option);
                          setMealDropdownOpen(false);
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.dropdownOptionText, isActive ? styles.dropdownOptionTextActive : null]}>
                          {mealTypeLabels[option]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Adicionar alimento</Text>
              <Pressable style={styles.addFoodButton} onPress={openFoodPicker} accessibilityRole="button">
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addFoodButtonText}>Adicionar Alimento</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Alimentos Adicionados</Text>

            <View style={styles.addedFoodsSection}>
              {selectedFoods.length === 0 ? null : selectedFoods.map((item) => (
                <SelectedFoodRow
                  key={item.id}
                  item={item}
                  onRemove={() => removeFood(item.id)}
                />
              ))}
            </View>

            <View style={styles.spacer} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {message ? <Text style={styles.statusText}>{message}</Text> : null}

            <Pressable
              style={[styles.saveButton, !canFinalize ? styles.saveButtonDisabled : null]}
              onPress={() => void handleSave()}
              accessibilityRole="button"
              disabled={!canFinalize}
            >
              <Text style={styles.saveButtonText}>{saving ? "Salvando..." : "Finalizar Registro"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {foodPickerVisible ? (
        <View style={popupStyles.foodPickerLayer}>
          <View style={popupStyles.foodPickerHeaderSpacer} />

          <BlurView style={popupStyles.foodPickerScreen} intensity={80} tint="light">
            <View style={popupStyles.foodPickerContent}>
              <View style={popupStyles.searchBarRow}>
                <View style={popupStyles.searchInputWrap}>
                  <View style={popupStyles.searchInputIconWrap}>
                    <SearchIcon />
                  </View>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Procurar alimento"
                    placeholderTextColor="#145FA0"
                    style={styles.searchInput}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={popupStyles.cameraButton}
                  onPress={() => router.push("/camera-capture")}
                >
                  <CameraButton />
                </Pressable>
              </View>

              <View style={popupStyles.popupResultsCard}>
                <Text style={popupStyles.popupResultsTitle}>Resultado</Text>

                {loading ? <Text style={popupStyles.popupResultsStatus}>Buscando alimentos...</Text> : null}
                {error ? <Text style={[popupStyles.popupResultsStatus, popupStyles.popupResultsError]}>{error}</Text> : null}

                {!loading && !error && results.length === 0 ? (
                  <View style={popupStyles.popupEmptyState}>
                    <Text style={popupStyles.popupEmptyStateText}>Nenhum Item encontrado</Text>
                  </View>
                ) : null}

                <ScrollView style={popupStyles.popupResultsList} showsVerticalScrollIndicator={false}>
                  {results.map((item) => {
                    const id = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;
                    const isActive = isPopupFoodSelected(item);
                    const selectedFood = selectedPopupFoods.find((food) => food.id === id);

                    return (
                      <PopupResultRow
                        key={id}
                        item={item}
                        isSelected={isActive}
                        currentPortion={selectedFood?.portion ?? 1}
                        onToggle={(portion) => {
                          togglePopupFood(item, portion);
                          setError(null);
                        }}
                        onPortionChange={(value) => updatePopupFoodPortion(item, value)}
                      />
                    );
                  })}
                </ScrollView>
              </View>

              <Pressable
                  style={[popupStyles.popupAddButton, selectedPopupFoods.length === 0 ? popupStyles.popupAddButtonDisabled : null]}
                  onPress={handleAddSelectedFoods}
                accessibilityRole="button"
                  disabled={selectedPopupFoods.length === 0}
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
