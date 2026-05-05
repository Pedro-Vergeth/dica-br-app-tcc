import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { loadProfileSummary, parseProfileInput, saveProfileSummary } from "../../services/profileStorage";
import { styles } from "../../styles/ProfileSetupScreenStyles";

type FieldKey = "age" | "weight" | "height";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [age, setAge] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const storedProfile = await loadProfileSummary();

        if (!isMounted) {
          return;
        }

        if (storedProfile) {
          setAge(String(storedProfile.age));
          setWeight(String(storedProfile.weight));
          setHeight(String(storedProfile.height));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = React.useCallback(
    (field: FieldKey, value: string) => {
      const normalizedValue = value.replace(/[^0-9.,]/g, "");

      if (field === "age") {
        setAge(normalizedValue);
        return;
      }

      if (field === "weight") {
        setWeight(normalizedValue);
        return;
      }

      setHeight(normalizedValue);
    },
    [],
  );

  const handleSubmit = React.useCallback(async () => {
    const parsedValues = parseProfileInput({ age, height, weight });

    if (!Number.isFinite(parsedValues.age) || parsedValues.age <= 0) {
      setError("Informe uma idade válida.");
      return;
    }

    if (!Number.isFinite(parsedValues.weight) || parsedValues.weight <= 0) {
      setError("Informe um peso válido.");
      return;
    }

    if (!Number.isFinite(parsedValues.height) || parsedValues.height <= 0) {
      setError("Informe uma altura válida em metros.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveProfileSummary(parsedValues);
      router.replace("/profile-result");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }, [age, height, router, weight]);

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
      <BackHeader title="Perfil" onBackPress={() => router.back()} />
        <Text style={styles.title}>Meu perfil</Text>
        <Text style={styles.subtitle}>
          As informações que você fornece são utilizadas exclusivamente para melhorar sua experiência no app e oferecer recomendações personalizadas.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Qual sua idade:</Text>
          <TextInput
            value={age}
            onChangeText={(value) => updateField("age", value)}
            placeholder="Ex: 30"
            placeholderTextColor="#A0AEC0"
            style={styles.input}
            keyboardType="number-pad"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peso em KG:</Text>
          <TextInput
            value={weight}
            onChangeText={(value) => updateField("weight", value)}
            placeholder="Ex: 85.5"
            placeholderTextColor="#A0AEC0"
            style={styles.input}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Altura em Metros:</Text>
          <TextInput
            value={height}
            onChangeText={(value) => updateField("height", value)}
            placeholder="Ex: 1.75"
            placeholderTextColor="#A0AEC0"
            style={styles.input}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

        <Pressable
          style={styles.actionButton}
          onPress={() => void handleSubmit()}
          accessibilityRole="button"
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>{loading ? "Carregando..." : "Calcular minha Dieta"}</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}