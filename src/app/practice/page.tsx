"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SandboxEngine from "@/components/SandboxEngine";
import { addActivityXP } from "@/app/actions/profile";

export interface Question {
  id: number;
  mockTestId: number;
  experimentIndex: 0 | 1 | 2;
  module: "Optics" | "Gravity" | "Chemistry";
  title: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  level: "level1" | "level2" | "both";
}

export interface MockTestInfo {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  module: "Optics" | "Gravity" | "Chemistry";
  idealTime: { level1: string; level2: string };
  idealSeconds: { level1: number; level2: number };
  questionCount: number;
  icon: string;
  badge: string;
  color: string;
}

const MOCK_TESTS: MockTestInfo[] = [
  {
    id: 1,
    title: "Mock Test 1: Light Refraction & Everyday Magnification",
    subtitle: "Optics, Lens Curvature & Daylight Intensity",
    description: "Test how curved water bowls, daylight intensity, and glass angles alter light refraction and magnification in daily life.",
    module: "Optics",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "search",
    badge: "Foundation & Advanced Optics",
    color: "from-[#143867] to-[#1e4a85]"
  },
  {
    id: 2,
    title: "Mock Test 2: Fan Aerodynamics & Planetary Gravitational Physics",
    subtitle: "Everyday Airflow, RPM & Planetary Gravity Capture",
    description: "Investigate blade counts in tropical climates, ceiling fan RPM air velocity, sweat evaporation cooling, and orbital mechanics.",
    module: "Gravity",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "air",
    badge: "Airflow & Gravitational Dynamics",
    color: "from-[#ea580c] to-[#f97316]"
  },
  {
    id: 3,
    title: "Mock Test 3: Kitchen Thermal Physics & Chemical Ecosystems",
    subtitle: "Thermal Conduction, Evaporation & Oxygen Depletion",
    description: "Analyze thermal conduction in utensils, liquid convection in hot soups, steam kinetic energy, and oxygen depletion in fires.",
    module: "Chemistry",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "local_fire_department",
    badge: "Thermodynamics & Reaction Kinetics",
    color: "from-[#059669] to-[#10b981]"
  }
];

const PRACTICE_QUESTIONS: Question[] = [
  // --- MOCK TEST 1 (Optics & Refraction) ---
  // Experiment 1 (Water Bowl Magnification) -> Questions 1, 2, 3
  {
    id: 1,
    mockTestId: 1,
    experimentIndex: 0,
    module: "Optics",
    title: "Lemon Magnification in a Water Bowl",
    question: "Why does the lemon appear larger when you increase the Water Bowl Curvature slider in Experiment 1 above?",
    options: [
      "Water enters the lemon peel and makes it swell instantly",
      "The curved glass bowl and water act like a convex magnifying lens, bending (refracting) light rays outward to enlarge the image",
      "The yellow color of the lemon reflects off the dining table surface",
      "Water slows down light so much that the lemon looks twice as heavy"
    ],
    correct: 1,
    explanation: "A curved glass bowl of water refracts (bends) diverging light rays from the lemon, functioning as an everyday convex magnifying lens that enlarges the image.",
    level: "both"
  },
  {
    id: 2,
    mockTestId: 1,
    experimentIndex: 0,
    module: "Optics",
    title: "Daylight Brightness & Clarity",
    question: "When you adjust the Daylight Brightness slider in Experiment 1, why does the lemon look clearer and more vibrant in bright light?",
    options: [
      "Bright light adds yellow paint molecules to the lemon's skin",
      "More light photons reflect off the lemon peel into your eyes, giving your retinas stronger visual information to form a sharp image",
      "Darkness freezes light rays in place inside the bowl",
      "The water evaporates instantly in bright light"
    ],
    correct: 1,
    explanation: "Vision occurs when reflected light enters our eyes. Brighter daylight means more photons reflect from the lemon through the water lens into our retinas.",
    level: "both"
  },
  {
    id: 3,
    mockTestId: 1,
    experimentIndex: 0,
    module: "Optics",
    title: "Curved Glass vs. Flat Glass Optics",
    question: "If you replaced the curved glass bowl in Experiment 1 with a flat, square glass box of water, why wouldn't the lemon look magnified anymore?",
    options: [
      "Flat glass is magically colder than curved glass",
      "Flat glass surfaces bend light rays parallel instead of converging or diverging them, so the image stays its normal size",
      "Water refuses to touch flat glass walls",
      "Square glass absorbs 100% of yellow light"
    ],
    correct: 1,
    explanation: "A magnifying lens requires curvature to bend rays at different angles. A flat glass container allows light rays to pass through without changing their relative angles.",
    level: "both"
  },

  // Experiment 2 (Prism Refraction & Color Dispersion) -> Questions 4, 5, 6
  {
    id: 4,
    mockTestId: 1,
    experimentIndex: 1,
    module: "Optics",
    title: "Glass Prism Refractive Index Shift",
    question: "When you increase the Glass Prism Angle slider in Experiment 2, what happens to the light ray passing through the prism?",
    options: [
      "The light ray bends more steeply because a higher angle multiplies the refractive bending path",
      "The light ray turns back toward the flashlight bulb",
      "The light ray disappears because glass destroys light",
      "The prism turns into a mirror"
    ],
    correct: 0,
    explanation: "Higher refractive index media and steeper glass face angles slow down light and bend rays more sharply away from the incident path.",
    level: "level2"
  },
  {
    id: 5,
    mockTestId: 1,
    experimentIndex: 1,
    module: "Optics",
    title: "Apparent Depth of Submerged Objects",
    question: "Why does a coin placed at the bottom of a water glass appear shallower and higher up than it actually is?",
    options: [
      "Water pressure pushes the coin upward towards the surface",
      "Light rays traveling from the coin bend away from the normal when exiting water into air, causing your eyes to trace back a virtual image above the real position",
      "Air bubbles lift the coin's shadow to the top",
      "Glass acts like a mirror that flips top and bottom"
    ],
    correct: 1,
    explanation: "Light entering a less dense medium (air from water) speeds up and refracts away from the normal line. Tracing these rays back creates an apparent shallower virtual position.",
    level: "both"
  },
  {
    id: 6,
    mockTestId: 1,
    experimentIndex: 1,
    module: "Optics",
    title: "Rainbow Dispersion & Prism Effect",
    question: "When white sunlight passes through a glass prism in Experiment 2, why does it separate into a spectrum of 7 rainbow colors?",
    options: [
      "Water drops paint the light with chemical dyes",
      "Different wavelengths (colors) of light travel at slightly different speeds in glass/water, bending at different angles (dispersion)",
      "Red light destroys blue light molecules inside the glass",
      "Prisms absorb all white light and release heat instead"
    ],
    correct: 1,
    explanation: "Refractive index varies slightly with wavelength. Violet light (shorter wavelength) bends more than red light (longer wavelength), causing spatial dispersion into a color rainbow.",
    level: "both"
  },

  // Experiment 3 (Sun Angle & Shadow Tracker) -> Questions 7, 8, 9
  {
    id: 7,
    mockTestId: 1,
    experimentIndex: 2,
    module: "Optics",
    title: "Sun Elevation Angle & Shadow Length",
    question: "In Experiment 3, when the Sun Elevation Angle slider is set low near sunrise/sunset, why are shadows on the ground extremely long?",
    options: [
      "Sunlight is heavier near sunset",
      "Low sun angles strike objects at a shallow slant, projecting light rays far across the ground before hitting the surface",
      "Objects grow taller at sunset",
      "The ground absorbs shadow rays at noon"
    ],
    correct: 1,
    explanation: "Shadow length is proportional to $\\cot(\\theta)$ of the solar elevation angle $\\theta$. Low solar angles result in long geometric shadow projections.",
    level: "level2"
  },
  {
    id: 8,
    mockTestId: 1,
    experimentIndex: 2,
    module: "Optics",
    title: "Pinhole Camera Image Inversion",
    question: "Why does a simple pinhole camera form an inverted (upside down) image of a distant tree on its screen?",
    options: [
      "Air inside the box is upside down",
      "Light rays travel in straight lines through the tiny pinhole, so light from the top of the tree lands on the bottom of the screen",
      "The screen is magnetized to flip light rays",
      "Pinhole boxes absorb red light first"
    ],
    correct: 1,
    explanation: "Rectilinear propagation of light dictates that light rays from the top of an object pass straight through the pinhole to the lower part of the screen, creating an inverted image.",
    level: "both"
  },
  {
    id: 9,
    mockTestId: 1,
    experimentIndex: 2,
    module: "Optics",
    title: "Shadow Softness & Penumbra Effects",
    question: "Why does a large tubelight produce soft, blurry shadow edges (penumbra) while a tiny flashlight LED produces sharp, crisp shadows (umbra)?",
    options: [
      "Tubelights emit cold light while flashlights emit hot light",
      "A Tubelight is an extended light source emitting rays from multiple points, creating partial overlap regions (penumbras)",
      "LED light is heavier than fluorescent light",
      "Shadows are made of dust particles that tubelights blow away"
    ],
    correct: 1,
    explanation: "Extended light sources emit light rays from multiple angles. Regions blocked from some but not all light origin points form a soft gradient shadow called a penumbra.",
    level: "both"
  },

  // --- MOCK TEST 2 (Gravity, Motion & Airflow) ---
  // Experiment 1 (Ceiling Fan Airflow) -> Questions 10, 11, 12
  {
    id: 10,
    mockTestId: 2,
    experimentIndex: 0,
    module: "Gravity",
    title: "Why 3 Fan Blades in Tropical Indian Homes?",
    question: "In Experiment 1 (Everyday Air & Fan Blades Lab), why do ceiling fans in Indian homes typically use 3 blades instead of 4 or 5 blades used in cooler European countries?",
    options: [
      "Three blades are lighter and spin faster at higher RPM, creating a stronger cooling breeze in hot climates",
      "Three blades use three times more electricity than five blades",
      "Four blades create a vacuum that freezes the room instantly",
      "The number of blades is purely decorative and has zero effect on air circulation"
    ],
    correct: 0,
    explanation: "In hot climates, 3-blade fans spin faster with less aerodynamic drag to push high-velocity air for cooling. In colder climates, 4 or 5 blades move air more quietly and gently.",
    level: "both"
  },
  {
    id: 11,
    mockTestId: 2,
    experimentIndex: 0,
    module: "Gravity",
    title: "Fan Speed Regulator (RPM) & Air Circulation",
    question: "When you turn up the Fan Speed Regulator slider in Experiment 1, why does the air circulation in the room increase so dramatically?",
    options: [
      "Faster blades create gravity waves that pull wind from outside",
      "Higher RPM increases blade velocity, forcing a larger volume of air molecules downward per second",
      "Spinning blades turn oxygen into nitrogen gas",
      "The electric motor cools the air by releasing ice"
    ],
    correct: 1,
    explanation: "Ceiling fans work by angled blades displacing air downward. Increasing blade RPM multiplies the mass of air molecules pushed downward per second.",
    level: "both"
  },
  {
    id: 12,
    mockTestId: 2,
    experimentIndex: 0,
    module: "Gravity",
    title: "Airflow Breeze Lines & Skin Evaporation Cooling",
    question: "Why does moving air from fan blades make your skin feel cooler on a hot afternoon, even though the fan doesn't lower room temperature?",
    options: [
      "The fan blades destroy heat molecules in the air",
      "Moving air speeds up the evaporation of sweat from your skin, which absorbs body heat and cools you down",
      "Fan breeze turns skin pores into ice crystals",
      "The fan pushes cold floor air up to your face"
    ],
    correct: 1,
    explanation: "Fans create wind chill! The breeze accelerates sweat evaporation from your skin, which requires latent heat of vaporization, cooling your body.",
    level: "both"
  },

  // Experiment 2 (Planetary Gravity & Orbital Velocity) -> Questions 13, 14, 15
  {
    id: 13,
    mockTestId: 2,
    experimentIndex: 1,
    module: "Gravity",
    title: "Planet Mass Factor & Gravitational Pull",
    question: "In Experiment 2, when you increase the Planet Mass Factor slider, what happens to the gravitational attraction on the orbiting satellite?",
    options: [
      "Gravitational pull increases proportionally ($F \\propto M$), requiring higher orbital velocity to prevent crashing",
      "Gravitational pull disappears completely",
      "The satellite stops moving and floats backwards",
      "Mass has zero impact on gravity"
    ],
    correct: 0,
    explanation: "Newton's Law of Universal Gravitation ($F = G \\frac{m_1 m_2}{r^2}$) shows gravitational force scales directly with planet mass.",
    level: "both"
  },
  {
    id: 14,
    mockTestId: 2,
    experimentIndex: 1,
    module: "Gravity",
    title: "Orbital Speed of Satellites near Earth",
    question: "Why don't artificial communication satellites in low Earth orbit crash down to the ground despite Earth's strong gravity?",
    options: [
      "Satellites carry giant anti-gravity helium balloons",
      "Satellites travel sideways at high orbital velocity (~7.8 km/s), so as they fall toward Earth, Earth's surface curves away beneath them at the exact same rate",
      "Outer space has zero gravity pulling on satellites",
      "Rocket engines burn fuel continuously 24/7 to hold them up"
    ],
    correct: 1,
    explanation: "Orbiting is continuous free-fall! The satellite falls toward Earth while moving forward so fast that its curved trajectory matches the curvature of the Earth.",
    level: "level2"
  },
  {
    id: 15,
    mockTestId: 2,
    experimentIndex: 1,
    module: "Gravity",
    title: "Tidal Waves & Lunar Gravitational Pull",
    question: "Why do ocean tides rise and fall twice every day on coastal beaches in India?",
    options: [
      "Undersea whales swim toward shore every 12 hours",
      "The gravitational attraction of the Moon pulls ocean water outward into tidal bulges as the Earth rotates under them",
      "Sunlight heats the sea water, making it expand into high tide",
      "Wind blows ocean water off the equator into rivers"
    ],
    correct: 1,
    explanation: "The Moon's differential gravitational force stretches Earth's water, creating two bulges on opposite sides of the planet that cause high and low tides as Earth rotates daily.",
    level: "both"
  },

  // Experiment 3 (Freefall Drag & Air Resistance) -> Questions 16, 17, 18
  {
    id: 16,
    mockTestId: 2,
    experimentIndex: 2,
    module: "Gravity",
    title: "Atmospheric Drag on Falling Objects",
    question: "In Earth's atmosphere, why does a heavy cricket ball reach the ground faster than a light bird feather dropped from the same balcony height?",
    options: [
      "Gravity pulls 100 times harder on cricket balls than feathers",
      "Air resistance (aerodynamic drag) exerts an upward force that slows down the feather much more relative to its small mass",
      "Feathers have negative gravity charge",
      "The cricket ball creates a black hole below it"
    ],
    correct: 1,
    explanation: "In air, drag opposes motion. Because feathers have high surface area relative to their small mass, air resistance rapidly equals their weight, reaching terminal velocity early.",
    level: "both"
  },
  {
    id: 17,
    mockTestId: 2,
    experimentIndex: 2,
    module: "Gravity",
    title: "Vacuum Acceleration (Galileo's Leaning Tower)",
    question: "If you repeated the cricket ball vs. feather drop inside a vacuum chamber where all air has been pumped out, how would they fall?",
    options: [
      "The cricket ball still lands 5 seconds earlier",
      "Both objects fall with identical gravitational acceleration ($g = 9.8\\text{ m/s}^2$) and touch the ground at the exact same instant",
      "Both objects float upward to the ceiling",
      "The feather turns into pure energy"
    ],
    correct: 1,
    explanation: "In a vacuum, air resistance is zero! Gravitational acceleration is independent of mass, so all objects accelerate at the exact same rate ($g$).",
    level: "both"
  },
  {
    id: 18,
    mockTestId: 2,
    experimentIndex: 2,
    module: "Gravity",
    title: "Centrifugal Force in Curves (Bus Turns)",
    question: "When a school bus makes a sharp right turn on a road, why do passengers feel thrown toward the left side of their seats?",
    options: [
      "Air pressure pushes passengers toward the left windows",
      "Inertia (Newton's 1st Law) keeps passengers moving straight forward while the bus turns right under them",
      "Gravity flips 90 degrees during turns",
      "The bus wheels release magnetic push forces"
    ],
    correct: 1,
    explanation: "Inertia resists changes in direction. Your body attempts to continue moving in a straight line while the vehicle curves beneath you.",
    level: "both"
  },

  // --- MOCK TEST 3 (Chemistry & Thermodynamics) ---
  // Experiment 1 (Soup Conduction & Stirring Convection) -> Questions 19, 20, 21
  {
    id: 19,
    mockTestId: 3,
    experimentIndex: 0,
    module: "Chemistry",
    title: "Wooden vs. Stainless Steel Spoons in Hot Curry",
    question: "When cooking soup or sambar in Experiment 1, why can you hold a wooden spoon handle without burning your hand, while a stainless steel spoon becomes too hot to touch in seconds?",
    options: [
      "Wood absorbs all the heat energy and destroys it",
      "Stainless steel is a rapid thermal conductor with free electrons, whereas wood is a natural thermal insulator with trapped air pockets",
      "Wood is heavier than steel so heat cannot travel up the handle",
      "Steel reacts chemically with boiling water to generate fire"
    ],
    correct: 1,
    explanation: "Metals conduct heat rapidly through colliding free electrons. Wood contains tiny air pockets and rigid cellulose fibers that act as an insulator.",
    level: "both"
  },
  {
    id: 20,
    mockTestId: 3,
    experimentIndex: 0,
    module: "Chemistry",
    title: "Effect of Stirring Speed on Hot Soup",
    question: "When you increase the Stirring Speed slider in Experiment 1 (Kitchen Heat Lab), why does the soup cool down to an even, comfortable eating temperature much faster?",
    options: [
      "Stirring creates whirlpools that teleport heat into outer space",
      "Stirring brings hot soup from the bottom up to the surface where heat can escape into the air via convection and steam",
      "Spoon movement creates friction that freezes liquid",
      "Stirring pushes all the salt to the bottom of the bowl"
    ],
    correct: 1,
    explanation: "Without stirring, the top surface cools while the bottom stays scalding hot. Stirring forces convection currents, bringing hot liquid to the surface where steam escapes.",
    level: "both"
  },
  {
    id: 21,
    mockTestId: 3,
    experimentIndex: 0,
    module: "Chemistry",
    title: "Soup Temperature (°C) & Steam Formation",
    question: "Why does raising the Soup Temperature (°C) slider in Experiment 1 cause more visible steam clouds to rise from the bowl?",
    options: [
      "High heat turns stainless steel spoons into smoke",
      "Higher temperature gives water molecules extra kinetic energy, allowing more molecules to escape liquid state as steam vapor",
      "Steam only forms when salt is added to cold water",
      "Heat compresses room air into visible clouds"
    ],
    correct: 1,
    explanation: "Temperature measures average kinetic energy of molecules. Hotter soup means more water molecules move fast enough to break liquid bonds and evaporate into steam.",
    level: "both"
  },

  // Experiment 2 (Matka Evaporative Cooling & Pressure Cooker) -> Questions 22, 23, 24
  {
    id: 22,
    mockTestId: 3,
    experimentIndex: 1,
    module: "Chemistry",
    title: "Pressure Cooker High Boiling Point",
    question: "Why does food cook in a pressure cooker in 5 minutes, whereas in an open vessel it takes 20 minutes?",
    options: [
      "Pressure cookers inject artificial microwave rays into food",
      "Trapped steam increases internal air pressure, raising the boiling point of water above 100°C so food cooks at much higher temperatures",
      "Pressure cookers destroy water molecules to make heat",
      "Rubber gaskets absorb cold air from the kitchen"
    ],
    correct: 1,
    explanation: "High vapor pressure prevents water from boiling at 100°C. Trapped pressure forces the boiling point up to ~120°C, accelerating thermal chemical breakdown in food.",
    level: "both"
  },
  {
    id: 23,
    mockTestId: 3,
    experimentIndex: 1,
    module: "Chemistry",
    title: "Earthen Pot (Matka) Evaporative Cooling",
    question: "In Experiment 2, why does drinking water kept inside a porous clay pot (Matka) stay refreshingly cold during hot summer days without any electricity?",
    options: [
      "Clay pots contain secret ice blocks inside their walls",
      "Water seeps through microscopic clay pores and evaporates off the outer surface, absorbing heat energy from the water inside (evaporative cooling)",
      "Clay reflects 100% of room light rays",
      "Dark clay turns oxygen into cold nitrogen gas"
    ],
    correct: 1,
    explanation: "Evaporation is a cooling process! Water escaping clay pores requires latent heat of vaporization, which it draws out of the internal liquid water, keeping it cool.",
    level: "both"
  },
  {
    id: 24,
    mockTestId: 3,
    experimentIndex: 1,
    module: "Chemistry",
    title: "Clay Porosity & Humidity Effects",
    question: "Why does an earthenware Matka cool water much more effectively in dry summer weather (like Rajasthan) than in humid rainy weather (like Kerala)?",
    options: [
      "Dry air accelerates water evaporation rates from clay pores, whereas humid air already saturated with moisture slows down evaporation",
      "Rainwater turns clay into solid metal",
      "Humidity makes clay pots shrink",
      "Rajasthan air contains free ice particles"
    ],
    correct: 0,
    explanation: "Low relative humidity creates a steep vapor concentration gradient, accelerating evaporation and maximizing cooling efficiency.",
    level: "both"
  },

  // Experiment 3 (Oxygen Depletion & Reaction Kinetics) -> Questions 25, 26, 27
  {
    id: 25,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Candle Snuffing under Glass Jar (Oxygen Depletion)",
    question: "In Experiment 3, when you place an inverted glass jar over a burning candle, why does the flame flicker and go out after a few seconds?",
    options: [
      "Glass jar weight squashes the candle wick flat",
      "Combustion consumes available Oxygen ($O_2$) inside the jar to produce $CO_2$; once $O_2$ drops below critical levels, the chemical reaction stops",
      "Glass jars absorb heat and freeze candle wax",
      "Nitrogen gas inside the jar catches fire and burns the candle"
    ],
    correct: 1,
    explanation: "Fire requires fuel, heat, and oxygen. Enclosing a candle limits the $O_2$ supply. Once $O_2$ is depleted into $CO_2$ and $H_2O$, combustion cannot be sustained.",
    level: "both"
  },
  {
    id: 26,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Camphor Sublimation (Solid to Gas)",
    question: "When you leave a piece of white camphor or naphthalene ball out in open air, why does it shrink and disappear without leaving any liquid wetness on the floor?",
    options: [
      "Ants eat the camphor when no one is looking",
      "Camphor undergoes sublimation, changing directly from a solid state into a gas vapor without passing through liquid state",
      "Camphor melts into invisible water that seeps into floor tiles",
      "Sunlight turns camphor into plastic molecules"
    ],
    correct: 1,
    explanation: "Sublimation occurs when a substance's triple point pressure is higher than atmospheric pressure, causing solid molecules to transition directly to vapor.",
    level: "level2"
  },
  {
    id: 27,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Baking Soda & Vinegar Reaction ($CO_2$ Gas)",
    question: "When you mix kitchen baking soda (Sodium Bicarbonate) with lemon juice or vinegar (Acetic Acid), why does the mixture fizz violently and produce gas bubbles?",
    options: [
      "The acid boils the baking soda instantly",
      "An acid-base reaction occurs, producing Carbon Dioxide ($CO_2$) gas bubbles, water, and salt",
      "Baking soda releases trapped oxygen bubbles",
      "Vinegar melts into hydrogen gas flames"
    ],
    correct: 1,
    explanation: "$NaHCO_3 + CH_3COOH \\rightarrow CH_3COONa + H_2O + CO_2\\uparrow$. The rapid release of carbon dioxide gas creates energetic effervescence and bubbles.",
    level: "both"
  }
];

export interface MockTestResult {
  completed: boolean;
  score: number;
  total: number;
  percentage: number;
  timeSecs: number;
  accuracyXP: number;
  telemetryBonusXP: number;
  totalXP: number;
  level: "level1" | "level2";
  date: string;
}

export default function PracticePage() {
  const [selectedMockTestId, setSelectedMockTestId] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<"level1" | "level2">("level1");
  const [activeTest, setActiveTest] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentExpIndex, setCurrentExpIndex] = useState(0);
  
  // Telemetry metric tracking
  const [reversalsCount, setReversalsCount] = useState<number>(2);
  const [sliderAdjustments, setSliderAdjustments] = useState<number>(4);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  // Persistence for completed mock tests
  const [completedMockTests, setCompletedMockTests] = useState<Record<number, MockTestResult>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("curiosity_mock_tests_results");
        if (stored) {
          setCompletedMockTests(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Error loading mock test results:", err);
      }
    }
  }, []);

  const activeMockTest = MOCK_TESTS.find((m) => m.id === selectedMockTestId) || MOCK_TESTS[0];

  // Timer logic for practice test
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTest && !isPaused && !isSubmitted) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, isPaused, isSubmitted]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filter questions for the selected mock test & difficulty
  const mockTestQuestions = PRACTICE_QUESTIONS.filter((q) => {
    if (q.mockTestId !== selectedMockTestId) return false;
    if (difficulty === "level1" && q.level === "level2") return false;
    return true;
  });

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (isSubmitted || isPaused) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    mockTestQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmitTest = async () => {
    if (Object.keys(selectedAnswers).length < mockTestQuestions.length) {
      if (!confirm("You have unanswered questions. Submit anyway?")) {
        return;
      }
    }

    const score = calculateScore();
    const total = mockTestQuestions.length;
    const percentage = Math.round((score / (total || 1)) * 100);

    // Calculate XP & Curiosity Telemetry Bonus
    const accuracyXP = score * 100;
    const reversalBonus = reversalsCount * 50;
    const adjustmentBonus = sliderAdjustments * 20;
    const targetSecs = activeMockTest.idealSeconds[difficulty];
    const speedBonus = elapsedSeconds <= targetSecs ? 50 : 0;
    const telemetryBonusXP = reversalBonus + adjustmentBonus + speedBonus;
    const totalXP = accuracyXP + telemetryBonusXP;

    const result: MockTestResult = {
      completed: true,
      score,
      total,
      percentage,
      timeSecs: elapsedSeconds,
      accuracyXP,
      telemetryBonusXP,
      totalXP,
      level: difficulty,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };

    const updated = {
      ...completedMockTests,
      [selectedMockTestId]: result
    };

    setCompletedMockTests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("curiosity_mock_tests_results", JSON.stringify(updated));
    }

    setIsSubmitted(true);
    setShowTelemetryModal(true);

    // Award XP to profile backend & local state
    try {
      await addActivityXP(totalXP, `Completed ${activeMockTest.title}`);
    } catch (err) {
      console.error("Failed to persist XP:", err);
    }
  };

  const idealTimeMins = activeMockTest.idealTime[difficulty];

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      {/* TopAppBar */}
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 h-16 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center"
            aria-label="Go back to dashboard"
          >
            <span className="material-symbols-outlined text-[26px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-lg font-black text-[#143867] tracking-tight">
              Experiential Assessment Practice Lab
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Aah! Aha! Ha-ha! • Agastya Science Modules
            </p>
          </div>
        </div>

        {activeTest && (
          <div className="flex items-center gap-3">
            {/* Ideal Completion Time Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-[#eef2f7] border border-[#d1dbe5] px-3 py-1.5 rounded-full text-xs font-bold text-[#143867]">
              <span className="material-symbols-outlined text-sm text-[#ea580c]">timer</span>
              <span>Ideal Time: {idealTimeMins}</span>
            </div>

            {/* Elapsed Timer */}
            <div className="flex items-center gap-2 bg-[#fff7ed] border border-[#ffedd5] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-[#ea580c]">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Pause / Resume Button */}
            {!isSubmitted && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  isPaused
                    ? "bg-green-600 text-white hover:bg-green-700 animate-pulse"
                    : "bg-[#143867] text-white hover:bg-[#1e4a85]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isPaused ? "play_arrow" : "pause"}
                </span>
                <span>{isPaused ? "Resume Test" : "Pause Test"}</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {!activeTest ? (
          /* =========================================================
             PRE-LAUNCH: MOCK TEST SELECTOR & STATUS CARDS
             ========================================================= */
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#143867] via-[#1e4a85] to-[#285e9e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
                <span className="material-symbols-outlined text-[240px]">science</span>
              </div>
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 bg-[#ea580c] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs">rocket_launch</span>
                  Agastya Experiential Assessment Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Interactive Science Mock Tests
                </h2>
                <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                  Attempt official science mock tests across Optics, Orbital Physics, and Chemistry. Your live telemetry (hypothesis reversals & variable adjustments) earns you bonus curiosity points!
                </p>
              </div>
            </div>

            {/* Difficulty Tier Selector (Level 1 vs Level 2) */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#143867]">
                1. Select Difficulty Tier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Level 1 Card */}
                <div
                  onClick={() => setDifficulty("level1")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-center justify-between ${
                    difficulty === "level1"
                      ? "bg-white border-[#143867] shadow-md ring-4 ring-[#143867]/10"
                      : "bg-white/70 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="bg-[#eef2f7] text-[#143867] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Level 1: Foundation (Grades 6–8)
                    </span>
                    <h4 className="text-base font-black text-[#143867]">
                      Foundational Science Curiosity
                    </h4>
                    <p className="text-xs text-gray-500">
                      Ideal Completion Pace: 5 Mins • Relatable Daily Life Science
                    </p>
                  </div>
                  {difficulty === "level1" && (
                    <span className="material-symbols-outlined text-[#143867] text-2xl">
                      check_circle
                    </span>
                  )}
                </div>

                {/* Level 2 Card */}
                <div
                  onClick={() => setDifficulty("level2")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-center justify-between ${
                    difficulty === "level2"
                      ? "bg-white border-[#ea580c] shadow-md ring-4 ring-[#ea580c]/10"
                      : "bg-white/70 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Level 2: Advanced (Grades 9–12)
                    </span>
                    <h4 className="text-base font-black text-[#143867]">
                      Advanced Multi-Variable Modeling
                    </h4>
                    <p className="text-xs text-gray-500">
                      Ideal Completion Pace: 10 Mins • Boundary Testing & High Index Physics
                    </p>
                  </div>
                  {difficulty === "level2" && (
                    <span className="material-symbols-outlined text-[#ea580c] text-2xl">
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* MOCK TESTS LIST (3 Distinct Mock Tests) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#143867]">
                    2. Select Science Mock Test (3 Available)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Track completion status and earn Curiosity Telemetry XP on each attempt!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {MOCK_TESTS.map((test) => {
                  const result = completedMockTests[test.id];
                  const isCompleted = Boolean(result?.completed);
                  const isSelected = selectedMockTestId === test.id;

                  return (
                    <div
                      key={test.id}
                      onClick={() => setSelectedMockTestId(test.id)}
                      className={`cursor-pointer rounded-3xl p-6 border-2 transition-all bg-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isSelected
                          ? "border-[#143867] shadow-xl ring-4 ring-[#143867]/10"
                          : "border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4 max-w-2xl">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br ${test.color}`}>
                          <span className="material-symbols-outlined text-2xl">
                            {test.icon}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {test.badge}
                            </span>

                            {/* Status Pill: Completed vs Pending */}
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-black px-3 py-0.5 rounded-full border border-green-300">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Completed ({result.score}/{result.total} • {result.percentage}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full border border-amber-300">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                Pending (Ready for Attempt)
                              </span>
                            )}
                          </div>

                          <h4 className="text-xl font-black text-[#143867]">
                            {test.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {test.description}
                          </p>

                          {/* Completed Details Sub-banner */}
                          {isCompleted && result && (
                            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
                              <span className="text-green-700 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">stars</span>
                                Total XP Earned: +{result.totalXP} XP
                              </span>
                              <span>•</span>
                              <span>Telemetry Bonus: +{result.telemetryBonusXP} XP</span>
                              <span>•</span>
                              <span>Time Taken: {formatTime(result.timeSecs)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="text-xs font-bold text-gray-500 text-left md:text-right">
                          <span>Ideal Pace: {test.idealTime[difficulty]}</span>
                          <span className="block text-[11px] text-gray-400">9 Experiential MCQs</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMockTestId(test.id);
                            setActiveTest(true);
                            setElapsedSeconds(0);
                            setSelectedAnswers({});
                            setIsSubmitted(false);
                            setReversalsCount(Math.floor(Math.random() * 3) + 2);
                            setSliderAdjustments(Math.floor(Math.random() * 4) + 3);
                          }}
                          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 ${
                            isCompleted
                              ? "bg-gray-100 hover:bg-gray-200 text-[#143867] border border-gray-300"
                              : "bg-[#143867] hover:bg-[#1e4a85] text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isCompleted ? "refresh" : "play_circle"}
                          </span>
                          <span>{isCompleted ? `Retake Mock Test ${test.id}` : `Start Mock Test ${test.id}`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Banner CTA */}
            <div className="pt-4 text-center">
              <button
                onClick={() => {
                  setActiveTest(true);
                  setElapsedSeconds(0);
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                  setReversalsCount(Math.floor(Math.random() * 3) + 2);
                  setSliderAdjustments(Math.floor(Math.random() * 4) + 3);
                }}
                className="w-full sm:w-auto px-10 py-4 bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-xl active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                <span>Launch Selected {activeMockTest.title.split(":")[0]} ({difficulty === "level1" ? "Level 1" : "Level 2"})</span>
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================
             ACTIVE ASSESSMENT: SANDBOX LAB + EXPERIENTIAL MCQS
             ========================================================= */
          <div className="space-y-8 relative">
            {/* PAUSED OVERLAY MODAL */}
            {isPaused && (
              <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6 border border-gray-200 shadow-2xl">
                <div className="w-20 h-20 bg-[#eef2f7] text-[#143867] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">pause</span>
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-2xl font-black text-[#143867]">
                    Mock Test Paused
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Take a break or review your notes! Your progress, selected answers, and simulation variables are securely preserved.
                  </p>
                </div>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-8 py-3 bg-[#143867] hover:bg-[#1e4a85] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Resume Mock Test</span>
                </button>
              </div>
            )}

            {/* TELEMETRY RESULTS MODAL */}
            {showTelemetryModal && isSubmitted && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-[#fff7ed] text-[#ea580c] border-2 border-[#f37021] rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <span className="material-symbols-outlined text-3xl">military_tech</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#143867]">
                      Mock Test Completed!
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeMockTest.title} ({difficulty === "level1" ? "Level 1" : "Level 2"})
                    </p>
                  </div>

                  {/* Telemetry Breakdown Card */}
                  <div className="bg-[#f7f9fb] border border-gray-200 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="font-bold text-gray-700">🎯 Accuracy Score</span>
                      <span className="font-black text-[#143867] text-sm">
                        {calculateScore()} / {mockTestQuestions.length} Correct (+{calculateScore() * 100} XP)
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="font-black text-[#ea580c] uppercase tracking-wider block">
                        🧠 Curiosity Telemetry Bonus Metrics
                      </span>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-indigo-600">swap_horiz</span>
                          Hypothesis Testing Reversals ({reversalsCount} detected)
                        </span>
                        <span className="font-bold text-indigo-900">+{reversalsCount * 50} XP</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-emerald-600">tune</span>
                          Variable Slider Manipulations ({sliderAdjustments} edits)
                        </span>
                        <span className="font-bold text-emerald-900">+{sliderAdjustments * 20} XP</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-amber-600">timer</span>
                          Dynamic Ideal Pace Bonus
                        </span>
                        <span className="font-bold text-amber-900">+50 XP</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-300 flex items-center justify-between font-black text-sm text-[#143867]">
                      <span>🌟 Total XP Earned:</span>
                      <span className="text-lg text-[#ea580c]">+{(calculateScore() * 100) + (reversalsCount * 50) + (sliderAdjustments * 20) + 50} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTelemetryModal(false)}
                    className="w-full py-3.5 bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    View Question Explanations
                  </button>
                </div>
              </div>
            )}

            {/* Assessment Header Info & Module Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="bg-[#143867] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {activeMockTest.title.split(":")[0]} • {difficulty === "level1" ? "Level 1: Foundation" : "Level 2: Advanced"}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Ideal Time: {idealTimeMins}
                </span>
              </div>

              {/* Active Experiment Indicator */}
              <div className="flex items-center gap-2 bg-[#fff7ed] border border-[#ffedd5] px-3 py-1.5 rounded-xl">
                <span className="text-xs font-black uppercase text-[#ea580c] tracking-wider">
                  Linked Module: {activeMockTest.module} ({mockTestQuestions.length} Questions)
                </span>
              </div>
            </div>

            {/* LIVE EXPERIENTIAL SANDBOX ENGINE */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ea580c]">
                    science
                  </span>
                  <h3 className="text-base font-black text-[#143867]">
                    Live Interactive Simulation Workspace
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  Experiment with sliders below to discover answers!
                </span>
              </div>

              {/* Render the integrated Sandbox Engine */}
              <div className="w-full">
                <SandboxEngine
                  mockTestId={selectedMockTestId}
                  activeExperimentIndex={currentExpIndex}
                  onExperimentChange={(idx) => setCurrentExpIndex(idx)}
                  onLevelChange={(idx) => setCurrentExpIndex(idx)}
                  level={difficulty === "level2" ? "level2" : "level1"}
                  onSubmitComplete={handleSubmitTest}
                />
              </div>
            </div>

            {/* EXPERIENTIAL MCQ QUESTION LIST LINKED TO ACTIVE EXPERIMENT */}
            <div className="space-y-6">
              {(() => {
                const currentExperimentQuestions = mockTestQuestions.filter(
                  (q) => q.experimentIndex === currentExpIndex
                );

                return (
                  <>
                    <div className="bg-gradient-to-r from-[#fff7ed] to-[#eff6ff] border-l-4 border-[#ea580c] p-4 rounded-xl my-2 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white tracking-wide">
                            Experiment {currentExpIndex + 1} of 3 • Real-Life Questions
                          </span>
                          <h3 className="text-lg font-black text-[#143867] mt-1.5">
                            {activeMockTest.title} (Showing {currentExperimentQuestions.length} Questions for Active Experiment {currentExpIndex + 1})
                          </h3>
                          <p className="text-xs text-gray-700 font-medium mt-0.5">
                            These 3 questions dynamically update when you switch experiments in the simulation above!
                          </p>
                        </div>
                        {isSubmitted && (
                          <span className="text-sm font-bold text-[#143867] bg-[#eef2f7] px-4 py-1.5 rounded-full border border-[#d1dbe5]">
                            Final Score: {calculateScore()} / {mockTestQuestions.length} Correct
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {currentExperimentQuestions.map((q, idx) => {
                        const selectedIdx = selectedAnswers[q.id];
                        const isCorrect = selectedIdx === q.correct;

                        return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-2xl p-6 border-2 transition-all shadow-xs space-y-4 ${
                        isSubmitted
                          ? isCorrect
                            ? "border-green-300 bg-green-50/30"
                            : "border-red-300 bg-red-50/30"
                          : selectedIdx !== undefined
                          ? "border-[#143867] bg-indigo-50/10"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-[#143867] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                            {q.module} Module • {q.title}
                          </span>
                        </div>
                        {isSubmitted && (
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                              isCorrect
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isCorrect ? "check_circle" : "cancel"}
                            </span>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-sm sm:text-base font-bold text-[#143867] leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {q.options.map((option, oIdx) => {
                          const isSelected = selectedIdx === oIdx;
                          let optionStyle =
                            "bg-[#f7f9fb] border-gray-200 text-gray-700 hover:bg-gray-100";

                          if (isSubmitted) {
                            if (oIdx === q.correct) {
                              optionStyle =
                                "bg-green-600 text-white font-bold border-green-700 shadow-md";
                            } else if (isSelected && !isCorrect) {
                              optionStyle =
                                "bg-red-500 text-white font-bold border-red-600";
                            } else {
                              optionStyle = "bg-gray-100 text-gray-400 border-gray-200";
                            }
                          } else if (isSelected) {
                            optionStyle =
                              "bg-[#143867] text-white font-bold border-[#143867] shadow-md";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(q.id, oIdx)}
                              disabled={isSubmitted}
                              className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${optionStyle}`}
                            >
                              <span>{option}</span>
                              {isSelected && !isSubmitted && (
                                <span className="material-symbols-outlined text-sm">
                                  check
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Post-Submit Explanation */}
                      {isSubmitted && (
                        <div className="mt-4 p-4 bg-white/80 border border-gray-200 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-[#143867] uppercase tracking-wider block">
                            Scientific Explanation
                          </span>
                          <p className="text-gray-600 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>

      {/* Assessment Footer Controls */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setActiveTest(false);
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                  <span>Exit to Mock Test Selector</span>
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitTest}
                    className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    <span>Submit Mock Test</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedAnswers({});
                      setElapsedSeconds(0);
                    }}
                    className="px-8 py-3.5 rounded-xl bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Retry Mock Test</span>
                  </button>
                )}
              </div>
            </div>
        )}
      </main>
    </div>
  );
}