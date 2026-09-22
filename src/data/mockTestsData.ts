export interface MockTestItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  module: "Optics" | "Gravity" | "Chemistry" | "Grades68" | "Grades910" | "Sound" | "Electricity" | "Buoyancy" | "Kitchen" | "Body" | "Plants";
  category: "Physics & Optics" | "Mechanics & Sound" | "Chemistry & Thermal" | "Electricity & Fluids" | "Hypothesis Testing" | "Sensory & Bio-Physics" | "Botany & Systems";
  idealTime: { level1: string; level2: string };
  idealSeconds: { level1: number; level2: number };
  questionCount: number;
  experimentCount: number;
  icon: string;
  badge: string;
  gradeBand: string;
}

export const OFFICIAL_MOCK_TESTS: MockTestItem[] = [
  {
    id: 1,
    title: "Mock Test 1: Light & Sight",
    subtitle: "Optics, Prisms & Shadows",
    description: "Manipulate ambient room light, rotate glass prisms, and shift shadow distances to discover how light bends and reflects.",
    module: "Optics",
    category: "Physics & Optics",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "emoji_objects",
    badge: "Optics & Ray Bending",
    gradeBand: "Grades 6–10"
  },
  {
    id: 2,
    title: "Mock Test 2: Forces & Motion",
    subtitle: "Fans, Gravity & Vacuum Drops",
    description: "Adjust fan blade pitches, test projectile launch angles, and observe feathers vs. stones dropping inside a vacuum chamber.",
    module: "Gravity",
    category: "Mechanics & Sound",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "air",
    badge: "Mechanics & Gravity",
    gradeBand: "Grades 6–10"
  },
  {
    id: 3,
    title: "Mock Test 3: Heat & Fire",
    subtitle: "Thermodynamics & Combustion",
    description: "Compare heat conduction along steel spoons, measure clay matka evaporative cooling, and test candle flame oxygen limits.",
    module: "Chemistry",
    category: "Chemistry & Thermal",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "local_fire_department",
    badge: "Heat & Thermal Inquiry",
    gradeBand: "Grades 6–10"
  },
  {
    id: 4,
    title: "Mock Test 4: Sensory Physics",
    subtitle: "Cooling, Kites & Steam Dynamics",
    description: "Examine evaporative cooling with wet cloths, test kite string tension in crosswinds, and explore steam pockets in puffed rotis.",
    module: "Grades68",
    category: "Physics & Optics",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "science",
    badge: "Sensory & Everyday Physics",
    gradeBand: "Grades 6–8"
  },
  {
    id: 5,
    title: "Mock Test 5: Hypothesis Testing",
    subtitle: "Agronomy, Solar & Bio-Energy",
    description: "Investigate first-rain soil water infiltration, optimize parabolic solar cooker mirrors, and model seasonal biogas generation.",
    module: "Grades910",
    category: "Hypothesis Testing",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "biotech",
    badge: "Systemic Hypothesis Testing",
    gradeBand: "Grades 9–10"
  },
  {
    id: 6,
    title: "Mock Test 6: Sound & Vibration",
    subtitle: "Pitch, Resonance & Well Echoes",
    description: "Tap water-filled clay matkas to hear vibrating air column pitches, build string telephones, and measure echo reflections.",
    module: "Sound",
    category: "Mechanics & Sound",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "volume_up",
    badge: "Acoustics & Waves",
    gradeBand: "Grades 6–10"
  },
  {
    id: 7,
    title: "Mock Test 7: Electricity & Magnetism",
    subtitle: "Static Charge, Circuits & Compass Fields",
    description: "Rub plastic combs to deflect light paper ribbons, troubleshoot disconnected torch circuits, and test magnetic attraction on coins.",
    module: "Electricity",
    category: "Electricity & Fluids",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "electric_bolt",
    badge: "Charge & Electromagnetic Fields",
    gradeBand: "Grades 6–10"
  },
  {
    id: 8,
    title: "Mock Test 8: Water & Buoyancy",
    subtitle: "Displacement, Brine Density & Flotation",
    description: "Fold paper boats to measure load displacement, dissolve salt to float fresh eggs, and layer mustard oil on water columns.",
    module: "Buoyancy",
    category: "Electricity & Fluids",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "water_drop",
    badge: "Density & Fluid Buoyancy",
    gradeBand: "Grades 6–10"
  },
  {
    id: 9,
    title: "Mock Test 9: Kitchen Chemistry",
    subtitle: "Indicators, Effervescence & Saturation",
    description: "Explore natural turmeric pH color changes with lemon and soap, inflate balloons with vinegar effervescence, and dissolve sugar up to thermal saturation.",
    module: "Kitchen",
    category: "Chemistry & Thermal",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "science",
    badge: "Acids, Bases & Solutions",
    gradeBand: "Grades 6–10"
  },
  {
    id: 10,
    title: "Mock Test 10: The Human Body",
    subtitle: "Heartbeat, Lungs & Eye Reflexes",
    description: "Listen to resting vs. sprint heartbeat audio, pull the rubber diaphragm sheet to inflate balloon lungs, and test pupil constriction in bright torchlight.",
    module: "Body",
    category: "Sensory & Bio-Physics",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "favorite",
    badge: "Physiology & Biomechanics",
    gradeBand: "Grades 6–10"
  },
  {
    id: 11,
    title: "Mock Test 11: Plants & Growth",
    subtitle: "Photosynthesis, Transpiration & Phototropism",
    description: "Count oxygen bubbles rising from submerged waterweed under intense light, observe leaf transpiration condensation, and bend growing stems toward light.",
    module: "Plants",
    category: "Botany & Systems",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    experimentCount: 3,
    icon: "psychiatry",
    badge: "Plant Biology & Phototropism",
    gradeBand: "Grades 6–10"
  }
];
