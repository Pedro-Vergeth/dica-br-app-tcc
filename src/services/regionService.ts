export type RegionKey = "north" | "northeast" | "centerWest" | "southeast" | "south";

export type StateOption = {
  label: string;
  value: string;
  region: RegionKey;
};

export const stateOptions: StateOption[] = [
  { label: "Acre", value: "AC", region: "north" },
  { label: "Amapá", value: "AP", region: "north" },
  { label: "Amazonas", value: "AM", region: "north" },
  { label: "Pará", value: "PA", region: "north" },
  { label: "Rondônia", value: "RO", region: "north" },
  { label: "Roraima", value: "RR", region: "north" },
  { label: "Tocantins", value: "TO", region: "north" },
  { label: "Alagoas", value: "AL", region: "northeast" },
  { label: "Bahia", value: "BA", region: "northeast" },
  { label: "Ceará", value: "CE", region: "northeast" },
  { label: "Maranhão", value: "MA", region: "northeast" },
  { label: "Paraíba", value: "PB", region: "northeast" },
  { label: "Pernambuco", value: "PE", region: "northeast" },
  { label: "Piauí", value: "PI", region: "northeast" },
  { label: "Rio Grande do Norte", value: "RN", region: "northeast" },
  { label: "Sergipe", value: "SE", region: "northeast" },
  { label: "Distrito Federal", value: "DF", region: "centerWest" },
  { label: "Goiás", value: "GO", region: "centerWest" },
  { label: "Mato Grosso", value: "MT", region: "centerWest" },
  { label: "Mato Grosso do Sul", value: "MS", region: "centerWest" },
  { label: "Espírito Santo", value: "ES", region: "southeast" },
  { label: "Minas Gerais", value: "MG", region: "southeast" },
  { label: "Rio de Janeiro", value: "RJ", region: "southeast" },
  { label: "São Paulo", value: "SP", region: "southeast" },
  { label: "Paraná", value: "PR", region: "south" },
  { label: "Rio Grande do Sul", value: "RS", region: "south" },
  { label: "Santa Catarina", value: "SC", region: "south" },
];

export const regionImages: Record<RegionKey, number> = {
  north: require("../../assets/images/regionSelect/north.png"),
  northeast: require("../../assets/images/regionSelect/northeast.png"),
  centerWest: require("../../assets/images/regionSelect/centerWest.png"),
  southeast: require("../../assets/images/regionSelect/southeast.png"),
  south: require("../../assets/images/regionSelect/south.png"),
};

export const noSelectedRegionImage = require("../../assets/images/regionSelect/noSelectedRegion.png");

export function getRegionImageByState(state: StateOption | null) {
  if (!state) {
    return noSelectedRegionImage;
  }

  return regionImages[state.region];
}