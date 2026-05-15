export type RegionKey = "north" | "northeast" | "centerWest" | "southeast" | "south";

export type StateOption = {
  id: number;
  state: string;
  sigla: string;
  region: RegionKey;
};

export const stateOptions: StateOption[] = [
  { id: 1, state: "Acre", sigla: "AC", region: "north" },
  { id: 2, state: "Alagoas", sigla: "AL", region: "northeast" },
  { id: 3, state: "Amapá", sigla: "AP", region: "north" },
  { id: 4, state: "Amazonas", sigla: "AM", region: "north" },
  { id: 5, state: "Bahia", sigla: "BA", region: "northeast" },
  { id: 6, state: "Ceará", sigla: "CE", region: "northeast" },
  { id: 7, state: "Distrito Federal", sigla: "DF", region: "centerWest" },
  { id: 8, state: "Espírito Santo", sigla: "ES", region: "southeast" },
  { id: 9, state: "Goiás", sigla: "GO", region: "centerWest" },
  { id: 10, state: "Maranhão", sigla: "MA", region: "northeast" },
  { id: 11, state: "Mato Grosso", sigla: "MT", region: "centerWest" },
  { id: 12, state: "Mato Grosso do Sul", sigla: "MS", region: "centerWest" },
  { id: 13, state: "Minas Gerais", sigla: "MG", region: "southeast" },
  { id: 14, state: "Pará", sigla: "PA", region: "north" },
  { id: 15, state: "Paraíba", sigla: "PB", region: "northeast" },
  { id: 16, state: "Paraná", sigla: "PR", region: "south" },
  { id: 17, state: "Pernambuco", sigla: "PE", region: "northeast" },
  { id: 18, state: "Piauí", sigla: "PI", region: "northeast" },
  { id: 19, state: "Rio de Janeiro", sigla: "RJ", region: "southeast" },
  { id: 20, state: "Rio Grande do Norte", sigla: "RN", region: "northeast" },
  { id: 21, state: "Rio Grande do Sul", sigla: "RS", region: "south" },
  { id: 22, state: "Rondônia", sigla: "RO", region: "north" },
  { id: 23, state: "Roraima", sigla: "RR", region: "north" },
  { id: 24, state: "Santa Catarina", sigla: "SC", region: "south" },
  { id: 25, state: "São Paulo", sigla: "SP", region: "southeast" },
  { id: 26, state: "Sergipe", sigla: "SE", region: "northeast" },
  { id: 27, state: "Tocantins", sigla: "TO", region: "north" },
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
