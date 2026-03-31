export type RegionKey = "north" | "northeast" | "centerWest" | "southeast" | "south";

export type StateOption = {
  state: string;
  sigla: string;
  region: RegionKey;
};

export const stateOptions: StateOption[] = [
  { state: "Acre", sigla: "AC", region: "north" },
  { state: "Amapá", sigla: "AP", region: "north" },
  { state: "Amazonas", sigla: "AM", region: "north" },
  { state: "Pará", sigla: "PA", region: "north" },
  { state: "Rondônia", sigla: "RO", region: "north" },
  { state: "Roraima", sigla: "RR", region: "north" },
  { state: "Tocantins", sigla: "TO", region: "north" },
  { state: "Alagoas", sigla: "AL", region: "northeast" },
  { state: "Bahia", sigla: "BA", region: "northeast" },
  { state: "Ceará", sigla: "CE", region: "northeast" },
  { state: "Maranhão", sigla: "MA", region: "northeast" },
  { state: "Paraíba", sigla: "PB", region: "northeast" },
  { state: "Pernambuco", sigla: "PE", region: "northeast" },
  { state: "Piauí", sigla: "PI", region: "northeast" },
  { state: "Rio Grande do Norte", sigla: "RN", region: "northeast" },
  { state: "Sergipe", sigla: "SE", region: "northeast" },
  { state: "Distrito Federal", sigla: "DF", region: "centerWest" },
  { state: "Goiás", sigla: "GO", region: "centerWest" },
  { state: "Mato Grosso", sigla: "MT", region: "centerWest" },
  { state: "Mato Grosso do Sul", sigla: "MS", region: "centerWest" },
  { state: "Espírito Santo", sigla: "ES", region: "southeast" },
  { state: "Minas Gerais", sigla: "MG", region: "southeast" },
  { state: "Rio de Janeiro", sigla: "RJ", region: "southeast" },
  { state: "São Paulo", sigla: "SP", region: "southeast" },
  { state: "Paraná", sigla: "PR", region: "south" },
  { state: "Rio Grande do Sul", sigla: "RS", region: "south" },
  { state: "Santa Catarina", sigla: "SC", region: "south" },
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
