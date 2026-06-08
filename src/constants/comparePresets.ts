export interface ComparePreset {
  id: string;
  name: string;
  description: string;
  cca3: string[];
  accent: "cyan" | "amber" | "violet" | "emerald" | "pink";
}

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    id: "g7-major",
    name: "G7 Major Economies",
    description: "USA, Japan, Germany",
    cca3: ["USA", "JPN", "DEU"],
    accent: "cyan",
  },
  {
    id: "brics-top",
    name: "BRICS Top 3",
    description: "China, India, Brazil",
    cca3: ["CHN", "IND", "BRA"],
    accent: "amber",
  },
  {
    id: "top-population",
    name: "Most Populous",
    description: "India, China, USA",
    cca3: ["IND", "CHN", "USA"],
    accent: "violet",
  },
  {
    id: "top-area",
    name: "Largest by Area",
    description: "Russia, Canada, USA",
    cca3: ["RUS", "CAN", "USA"],
    accent: "emerald",
  },
  {
    id: "nordics",
    name: "Nordics",
    description: "Sweden, Norway, Denmark",
    cca3: ["SWE", "NOR", "DNK"],
    accent: "cyan",
  },
  {
    id: "iberian",
    name: "Iberian Peninsula",
    description: "Spain, Portugal",
    cca3: ["ESP", "PRT"],
    accent: "amber",
  },
  {
    id: "uk-ireland",
    name: "British Isles",
    description: "UK, Ireland",
    cca3: ["GBR", "IRL"],
    accent: "violet",
  },
  {
    id: "abc",
    name: "South America ABC",
    description: "Argentina, Brazil, Chile",
    cca3: ["ARG", "BRA", "CHL"],
    accent: "emerald",
  },
  {
    id: "gcc-gulf",
    name: "Gulf States",
    description: "Saudi Arabia, UAE, Qatar",
    cca3: ["SAU", "ARE", "QAT"],
    accent: "amber",
  },
  {
    id: "visegrad",
    name: "Visegrád Group",
    description: "Poland, Czechia, Hungary",
    cca3: ["POL", "CZE", "HUN"],
    accent: "pink",
  },
];
