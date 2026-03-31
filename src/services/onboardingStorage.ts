import AsyncStorage from "@react-native-async-storage/async-storage";

import { stateOptions, type StateOption } from "./regionService";

export const onboardingStorageKeys = {
  selectedState: "@dica-br:selectedState",
  firstAccessCompleted: "@dica-br:firstAccessCompleted",
  introSeen: "@dica-br:introSeen",
} as const;

export type InitialRoute = "/state" | "/video" | "/home";

export async function saveSelectedState(state: StateOption) {
  await AsyncStorage.setItem(onboardingStorageKeys.selectedState, JSON.stringify(state));
}

export async function loadSelectedState() {
  const storedValue = await AsyncStorage.getItem(onboardingStorageKeys.selectedState);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedState = JSON.parse(storedValue) as Partial<StateOption>;
    const stateSigla = parsedState.sigla ?? (parsedState as { value?: string }).value;
    const stateName = parsedState.state ?? (parsedState as { label?: string }).label;

    if (!stateSigla && !stateName) {
      return null;
    }

    return (
      stateOptions.find((state) => state.sigla === stateSigla) ??
      stateOptions.find((state) => state.state === stateName) ??
      null
    );
  } catch {
    return null;
  }
}

export async function saveFirstAccessCompleted() {
  await AsyncStorage.setItem(onboardingStorageKeys.firstAccessCompleted, "true");
}

export async function hasCompletedFirstAccess() {
  return (await AsyncStorage.getItem(onboardingStorageKeys.firstAccessCompleted)) === "true";
}

export async function saveIntroSeen() {
  await AsyncStorage.setItem(onboardingStorageKeys.introSeen, "true");
}

export async function hasSeenIntro() {
  return (await AsyncStorage.getItem(onboardingStorageKeys.introSeen)) === "true";
}

export async function getInitialRoute(): Promise<InitialRoute> {
  const firstAccessCompleted = await hasCompletedFirstAccess();

  if (!firstAccessCompleted) {
    return "/state";
  }

  const introSeen = await hasSeenIntro();

  return introSeen ? "/home" : "/video";
}
