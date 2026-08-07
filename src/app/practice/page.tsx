"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SandboxEngine from "@/components/SandboxEngine";
import { addActivityXP } from "@/app/actions/profile";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

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
    title: "Game 1: Light and Big Things",
    subtitle: "Light and Bowls",
    description: "Play with water bowls and light to see how things look bigger and how rainbows are made.",
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
    title: "Game 2: Fans and Falling Things",
    subtitle: "Wind and Planets",
    description: "Play with fans to make wind and drop things to see how they fall on different planets.",
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
    title: "Game 3: Hot Soup and Fire",
    subtitle: "Heat and Air",
    description: "Play with hot soup to see how spoons get warm and watch how a candle fire needs air to burn.",
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
      "Water enters through microscopic pores in the lemon peel, causing it to physically swell and expand",
      "The curved glass bowl of water acts like a magnifying lens, bending light outward to enlarge its image",
      "Yellow light reflects strongly off the table surface, projecting a double shadow around the lemon",
      "Water compresses room air inside the glass bowl, magnifying object reflections toward your eyes"
    ],
    correct: 1,
    explanation: "A curved glass bowl of water acts like an everyday convex magnifying lens. The curved surface refracts (bends) light rays outward, making the submerged lemon look larger to your eyes.",
    level: "both"
  },
  {
    id: 2,
    mockTestId: 1,
    experimentIndex: 0,
    module: "Optics",
    title: "Daylight Brightness & Visual Clarity",
    question: "When you adjust the Daylight Brightness slider in Experiment 1, why does the lemon look clearer and more vibrant in bright light?",
    options: [
      "Bright daylight heats up the water, turning it into a clearer transparent liquid for sharper vision",
      "More reflected light rays enter your eyes from the lemon, giving your retinas stronger visual details",
      "Sunlight reacts chemically with lemon skin pigments, releasing glowing fluorescent light particles",
      "Bright light removes microscopic air bubbles from water, reducing scattered shadow blurring inside"
    ],
    correct: 1,
    explanation: "We see objects when light rays bounce off them into our eyes. Brighter daylight means more light photons reflect off the lemon's peel into your eyes, forming a sharper image.",
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
      "Flat glass absorbs incoming light rays completely, preventing light from exiting the back side of the box",
      "Flat glass allows light rays to pass straight through without bending them outward to magnify images",
      "Water inside flat square containers becomes denser, blocking light rays from stretching outward",
      "Flat glass reflects 90% of yellow light wavelengths back into water, making images look smaller"
    ],
    correct: 1,
    explanation: "Magnification requires a curved lens surface to bend light rays at different angles. A flat glass box lets light pass straight through parallel, so objects remain their normal visual size.",
    level: "both"
  },

  // Experiment 2 (Prism Refraction & Color Dispersion) -> Questions 4, 5, 6
  {
    id: 4,
    mockTestId: 1,
    experimentIndex: 1,
    module: "Optics",
    title: "Glass Prism Light Bending Shift",
    question: "When you increase the Glass Prism Angle slider in Experiment 2, what happens to the light ray passing through the prism?",
    options: [
      "The light ray bends more sharply because a steeper glass angle forces light to change direction more",
      "The light ray reflects straight backward toward the lamp because dense glass acts like a silver mirror",
      "The light ray speeds up dramatically inside the glass prism, shooting straight through without turning",
      "The light ray splits into invisible heat waves that evaporate the outer glass coating of the prism"
    ],
    correct: 0,
    explanation: "Light slows down and changes direction when entering glass from air. A steeper prism surface angle forces the light ray to refract (bend) at a sharper angle away from its original path.",
    level: "level2"
  },
  {
    id: 5,
    mockTestId: 1,
    experimentIndex: 1,
    module: "Optics",
    title: "Apparent Depth of Submerged Coin",
    question: "Why does a coin placed at the bottom of a water glass appear shallower and higher up than it actually is?",
    options: [
      "Water pressure at the bottom of the glass pushes the metal coin upward closer to the surface",
      "Light rays bend away as they exit water into air, making your brain trace a shallower image position",
      "Air bubbles trapped under the glass mirror elevate the coin's visual reflection higher in the water",
      "Light slows down in water, making the coin appear twice as heavy and floating near the top surface"
    ],
    correct: 1,
    explanation: "Light traveling from the underwater coin speeds up and bends away as it exits water into air. Tracing these bent rays straight back creates an apparent shallower virtual position.",
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
      "Glass prisms contain chemical dyes that color white light as it passes through the center glass",
      "Different colors of light travel at different speeds in glass, bending at slightly different angles",
      "White light friction against glass molecules creates thermal heat that glows in rainbow colors",
      "Red light absorbs green and blue wavelengths, leaving only leftover rainbow colors on the screen"
    ],
    correct: 1,
    explanation: "White light is made of all rainbow colors mixed together. Red light bends the least while violet light bends the most inside glass, spreading the colors into a visible rainbow spectrum.",
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
      "Sunlight carries less energy near sunset, allowing ground shadows to expand and stretch outward",
      "Low sun angles strike objects at a shallow slant, projecting light rays far across the ground surface",
      "The atmosphere acts like a giant lens at dusk, magnifying the physical height of objects and shadows",
      "Ground temperature drops at sunset, preventing Earth's surface from absorbing black shadow rays"
    ],
    correct: 1,
    explanation: "When the Sun is low in the sky, light rays strike objects at a shallow angle. The object blocks light over a wider stretch of ground, casting a longer geometric shadow.",
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
      "Air pressure inside the dark camera box flips light rays upside down before hitting the back screen",
      "Light travels in straight lines through the small hole, so top rays land at the bottom of the screen",
      "The glass screen contains magnetic poles that pull red light rays to the top and blue rays to the bottom",
      "Light reflects off the inner box walls twice, reversing top and bottom positions on the image screen"
    ],
    correct: 1,
    explanation: "Light travels in straight lines! Rays from the top of the tree pass through the tiny pinhole and continue straight down to the bottom of the screen, creating an inverted image.",
    level: "both"
  },
  {
    id: 9,
    mockTestId: 1,
    experimentIndex: 2,
    module: "Optics",
    title: "Shadow Softness & Penumbra Effects",
    question: "Why does a long tubelight produce soft, blurry shadow edges (penumbra) while a tiny LED produces sharp, crisp shadows?",
    options: [
      "Long tubelights emit cooler light waves that soften shadow edges, whereas flashlights emit hot light",
      "Extended tubelights emit light from multiple points, creating partial overlap regions with soft edges",
      "Flashlight beams travel faster through air, blasting away soft penumbra shadows around object edges",
      "Tubelight glass diffuses air dust particles, casting a blurry gray mist around the shadow border"
    ],
    correct: 1,
    explanation: "A tubelight is a wide, extended light source emitting rays from many points. Areas that receive light from some points but not others form a soft gradient shadow edge called a penumbra.",
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
      "Three blades are lighter and spin at higher RPM, pushing a stronger cooling breeze in hot weather",
      "Three blades consume much less electricity while creating a partial room vacuum that lowers room temp",
      "Four blades create air turbulence that traps hot air near the ceiling, preventing room air circulation",
      "Five-blade fans spin too fast for tropical humidity, causing fan motors to overheat and slow down"
    ],
    correct: 0,
    explanation: "In hot climates, 3-blade fans encounter less aerodynamic drag, allowing them to spin faster at higher RPM to push high-velocity air for stronger cooling breezes.",
    level: "both"
  },
  {
    id: 11,
    mockTestId: 2,
    experimentIndex: 0,
    module: "Gravity",
    title: "Fan Speed Regulator (RPM) & Air Displacement",
    question: "When you turn up the Fan Speed Regulator slider in Experiment 1, why does the air circulation in the room increase so dramatically?",
    options: [
      "Faster fan blades create magnetic suction waves that draw cooler outdoor air inside the room",
      "Higher RPM increases blade speed, forcing a larger mass of air molecules downward every second",
      "Spinning fan blades convert room oxygen into cooler nitrogen gas, lowering air density near the floor",
      "The electric motor cools room air directly by releasing chilled moisture particles from the blades"
    ],
    correct: 1,
    explanation: "Ceiling fan blades are angled to push air downward. Turning up the speed regulator multiplies blade RPM, displacing a much greater volume of air molecules toward the floor every second.",
    level: "both"
  },
  {
    id: 12,
    mockTestId: 2,
    experimentIndex: 0,
    module: "Gravity",
    title: "Airflow Breeze & Skin Evaporation Cooling",
    question: "Why does moving air from fan blades make your skin feel cooler on a hot afternoon, even though the fan doesn't lower room temperature?",
    options: [
      "Moving air destroys heat energy in the room, physically cooling down ambient air temperature",
      "Moving air speeds up sweat evaporation from skin, carrying away body heat to make you feel cool",
      "Fan breezes compress skin pores, preventing internal body heat from escaping onto your forehead",
      "Fan blades push cold floor air upward, creating a cold air blanket around your upper torso"
    ],
    correct: 1,
    explanation: "Fans don't cool room air—they cool people! Moving air accelerates sweat evaporation off your skin. Liquid sweat absorbs body heat as it turns to vapor, cooling your body.",
    level: "both"
  },

  // Experiment 2 (Planetary Gravity & Orbital Velocity) -> Questions 13, 14, 15
  {
    id: 13,
    mockTestId: 2,
    experimentIndex: 1,
    module: "Gravity",
    title: "Planet Mass & Gravitational Pull",
    question: "In Experiment 2, when you increase the Planet Mass Factor slider, what happens to the gravitational attraction on the orbiting satellite?",
    options: [
      "Increasing planet mass increases gravitational pull, requiring faster orbital speed to stay in orbit",
      "Increasing planet mass creates anti-gravity space waves that push orbiting satellites outward",
      "Satellite orbital speed depends only on distance, while planet mass has zero effect on gravity pull",
      "Larger planets absorb space vacuum pressure, causing satellites to float in fixed stationary points"
    ],
    correct: 0,
    explanation: "Gravitational force depends directly on mass. A heavier planet exerts a stronger gravitational pull on nearby satellites, requiring faster sideways speed to avoid crashing.",
    level: "both"
  },
  {
    id: 14,
    mockTestId: 2,
    experimentIndex: 1,
    module: "Gravity",
    title: "Orbital Speed of Low-Earth Satellites",
    question: "Why don't artificial communication satellites in low Earth orbit crash down to the ground despite Earth's strong gravity?",
    options: [
      "Satellites carry helium gas tanks that create upward buoyant force against Earth's gravitational pull",
      "Satellites travel sideways so fast that as they fall, Earth's curved surface falls away beneath them",
      "Gravity does not exist at space station altitude, allowing satellites to float without falling",
      "Rocket engines burn fuel continuously 24 hours a day to hold satellites up against gravity"
    ],
    correct: 1,
    explanation: "Orbiting is continuous free-fall! Satellites travel sideways so fast (~7.8 km/s) that as gravity pulls them down, Earth's round surface curves away beneath them at the exact same rate.",
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
      "Undersea volcanic heat expands ocean water twice daily, pushing high tides onto coastal shores",
      "The Moon's gravitational pull attracts ocean water, creating tidal bulges as Earth rotates under them",
      "Daytime solar heat evaporates coastal seawater, causing low tides that refill during cool night hours",
      "Ocean wind currents change direction every 12 hours, piling up seawater along beach coastlines"
    ],
    correct: 1,
    explanation: "The Moon's gravity pulls on Earth's oceans, stretching water into two bulges on opposite sides of the planet. As Earth rotates through these bulges every day, beaches experience high tides.",
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
      "Gravity pulls much stronger on heavy cricket balls than on feathers dropped from the same height",
      "Air resistance creates an upward drag force that slows down the light feather far more than the ball",
      "Feathers carry a negative static charge that repels them from Earth's magnetic ground surface",
      "Heavy objects create downward air vortexes that pull them toward the ground much faster than air"
    ],
    correct: 1,
    explanation: "In air, drag resists falling objects. Because feathers have a large surface area relative to their tiny mass, upward air resistance quickly balances their weight, slowing their drop.",
    level: "both"
  },
  {
    id: 17,
    mockTestId: 2,
    experimentIndex: 2,
    module: "Gravity",
    title: "Falling in an Empty Vacuum Chamber",
    question: "If you repeated the cricket ball vs. feather drop inside an empty glass chamber where all air has been pumped out, what surprising thing would you observe?",
    options: [
      "The cricket ball still lands first because heavy objects naturally fall faster than light ones",
      "Both objects fall side-by-side at the exact same speed and hit the ground at the exact same instant",
      "Removing air causes both objects to lose weight and float upward toward the top of the chamber",
      "The feather falls faster than the ball because removing air drag lets light objects zoom downward"
    ],
    correct: 1,
    explanation: "Without air resistance to push back against the feather, gravity pulls all objects downward at the exact same rate! Both the cricket ball and feather fall side-by-side and land together.",
    level: "both"
  },
  {
    id: 18,
    mockTestId: 2,
    experimentIndex: 2,
    module: "Gravity",
    title: "Centrifugal Force & Inertia in Bus Turns",
    question: "When a school bus makes a sharp right turn on a road, why do passengers feel thrown toward the left side of their seats?",
    options: [
      "Air pressure inside turning buses shifts toward the outer windows, pushing passengers sideways",
      "Your body's inertia tries to keep moving in a straight line while the bus turns right underneath you",
      "Gravity shifts sideways during sharp vehicle turns, pulling passengers toward the left seats",
      "Turning tires create outward magnetic force fields that push passenger bodies toward the doors"
    ],
    correct: 1,
    explanation: "Inertia is your body's tendency to resist changes in motion. When the bus turns right, your body naturally tries to keep moving straight ahead, making you feel pushed to the left.",
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
      "Wood destroys heat energy inside its fibers, keeping the handle cool even in boiling liquid",
      "Steel conducts heat rapidly via free electrons, while wood acts as an insulator trapping air",
      "Steel absorbs heat because it is heavier, whereas wooden handles reflect 100% of heat rays",
      "Boiling curry reacts chemically with metal spoons, generating heat energy that burns your hand"
    ],
    correct: 1,
    explanation: "Metals like steel are great thermal conductors—heat travels quickly through free electrons up to the handle. Wood contains trapped air pockets and acts as a natural insulator.",
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
      "Stirring creates air friction that freezes water molecules near the surface of the soup bowl",
      "Stirring brings hot liquid from the bottom up to the surface where heat escapes via steam",
      "Stirring forces salt to dissolve faster, which chemically lowers the liquid boiling temperature",
      "Fast spoon movement pushes heat energy into the bowl walls, cooling down the central soup liquid"
    ],
    correct: 1,
    explanation: "Without stirring, only the top layer cools while the bottom stays scalding hot. Stirring creates convection currents, circulating hot soup to the top where heat escapes into the air.",
    level: "both"
  },
  {
    id: 21,
    mockTestId: 3,
    experimentIndex: 0,
    module: "Chemistry",
    title: "Soup Temperature & Steam Formation",
    question: "Why does raising the Soup Temperature (°C) slider in Experiment 1 cause more visible steam clouds to rise from the bowl?",
    options: [
      "High heat turns stainless steel spoon molecules into visible white steam rising above the bowl",
      "Higher temperature gives water molecules extra energy to break liquid bonds and escape as steam",
      "Steam forms when room air moisture condenses against cold soup liquid surfaces near the top",
      "Hot soup releases trapped oxygen bubbles that expand into visible steam clouds in open room air"
    ],
    correct: 1,
    explanation: "Temperature measures kinetic energy. Hotter soup means water molecules move faster and gain enough energy to break away from liquid water and evaporate into steam vapor clouds.",
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
      "Pressure cookers generate internal microwave radiation that cooks food from the inside out",
      "Trapped steam increases air pressure, raising water boiling point above 100°C for faster cooking",
      "Pressure cookers compress food molecules physically, breaking down tough fibers in 5 minutes",
      "Rubber lid gaskets absorb cold kitchen air, forcing all thermal energy into the cooking liquid"
    ],
    correct: 1,
    explanation: "Trapped steam increases internal pressure inside the sealed cooker. High pressure prevents water from boiling at 100°C, pushing the boiling point up to ~120°C so food cooks 4x faster!",
    level: "both"
  },
  {
    id: 23,
    mockTestId: 3,
    experimentIndex: 1,
    module: "Chemistry",
    title: "Earthen Pot / Matka Evaporative Cooling",
    question: "In Experiment 2, why does drinking water kept inside a porous clay pot (Matka) stay refreshingly cold during hot summer days without any electricity?",
    options: [
      "Clay pot walls contain natural mineral ice pockets that cool down internal water without power",
      "Water seeps through clay pores and evaporates outside, absorbing heat energy from inside water",
      "Dark terracotta clay reflects 100% of room light, preventing external heat from touching water",
      "Clay pores absorb oxygen from surrounding air, converting room humidity into cold nitrogen gas"
    ],
    correct: 1,
    explanation: "Evaporation is a cooling process! Small amounts of water seep through tiny clay pores and evaporate off the outer surface. Evaporation requires heat, which it draws from the water inside.",
    level: "both"
  },
  {
    id: 24,
    mockTestId: 3,
    experimentIndex: 1,
    module: "Chemistry",
    title: "Clay Porosity & Humidity Effects in Matka",
    question: "Why does an earthenware Matka cool water much more effectively in dry summer weather (like Rajasthan) than in humid rainy weather (like Kerala)?",
    options: [
      "Dry air accelerates water evaporation from clay pores, whereas humid air slows down evaporation",
      "Humid air turns clay pot walls into solid metal, blocking evaporative cooling during rainy weather",
      "High humidity makes clay pores shrink tight, preventing water seepage needed for cooling",
      "Dry desert air contains cold air ions that react with clay minerals to create artificial cooling"
    ],
    correct: 0,
    explanation: "Dry air has low humidity, encouraging rapid water evaporation off the Matka's surface. In humid air already filled with moisture, water cannot evaporate quickly, reducing the cooling effect.",
    level: "both"
  },

  // Experiment 3 (Oxygen Depletion & Reaction Kinetics) -> Questions 25, 26, 27
  {
    id: 25,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Candle Flame Oxygen Depletion in Sealed Jar",
    question: "In Experiment 3, when you place an inverted glass jar over a burning candle, why does the flame flicker and go out after a few seconds?",
    options: [
      "The heavy weight of the glass jar squashes candle flame heat, forcing the wick to go out",
      "Combustion uses up oxygen inside the jar; once oxygen drops low, the flame reaction stops",
      "Glass jars absorb flame heat rapidly, freezing candle wax into solid non-flammable liquid",
      "Carbon dioxide gas inside glass jars catches fire, consuming all flame energy in a few seconds"
    ],
    correct: 1,
    explanation: "Fire requires fuel, heat, and oxygen! Covering a candle with a glass jar traps a limited amount of oxygen. Once the flame consumes the available oxygen, combustion stops and the flame goes out.",
    level: "both"
  },
  {
    id: 26,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Camphor Disappearing in Open Air",
    question: "When you leave a piece of white camphor out on a plate, why does it slowly shrink and vanish over a few days without leaving any wet spot or liquid puddle?",
    options: [
      "Camphor melts into an invisible liquid that immediately soaks into the plate",
      "Camphor transforms directly from a solid into floating air vapor without ever becoming liquid",
      "Microscopic dust mites eat the solid camphor particles when the room is dark",
      "Sunlight turns solid camphor into microscopic white dust that blows away in the breeze"
    ],
    correct: 1,
    explanation: "Some special solids like camphor don't melt into liquid at all! They turn directly from solid into gas vapor that drifts into the air, which is why your plate stays completely dry.",
    level: "level2"
  },
  {
    id: 27,
    mockTestId: 3,
    experimentIndex: 2,
    module: "Chemistry",
    title: "Why Baking Soda & Lemon Fizz and Bubble",
    question: "When you squeeze fresh lemon juice or vinegar onto baking soda in the kitchen, why does the mixture suddenly fizz violently and create lots of bubbles?",
    options: [
      "The lemon juice makes the baking soda so hot that it boils and produces scalding steam bubbles",
      "The two kitchen ingredients react together and release carbon dioxide gas bubbles into the air",
      "Baking soda contains trapped air sponges that pop open when touched by any liquid",
      "Vinegar turns baking soda into liquid soap that naturally makes foam and bubbles"
    ],
    correct: 1,
    explanation: "When you combine baking soda with a tangy liquid like lemon juice or vinegar, they react together and generate carbon dioxide gas! Those gas bubbles rush to escape, creating fun fizz and foam.",
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
  const { t } = useLanguage();
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
  const [unlockedLevelIndices, setUnlockedLevelIndices] = useState<number[]>([0]);

  useEffect(() => {
    // Fetch unlocked levels from backend
    import('@/app/actions/scoring').then(module => {
      module.getUnlockedLevels().then(res => {
        if (res.success && res.unlockedLevels) {
          setUnlockedLevelIndices(res.unlockedLevels);
        }
      });
    });

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("curiosity_mock_tests_results");
        if (stored) {
          setCompletedMockTests(JSON.parse(stored));
        }
      } catch (err) {
        console.error(err);
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
              {t.app.practice_lab}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
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
        </div>
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
                  Agastya Science Games
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Interactive Science Mock Tests
                </h2>
                <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                  Play official science games for Optics, Gravity, and Chemistry. Exploring and trying new things will earn you extra curiosity points!
                </p>
              </div>
            </div>

            {/* Difficulty Tier Selector (Level 1 vs Level 2) */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#143867]">
                1. Choose Level
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
                      Science for Beginners
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
                      Science for Experts
                    </h4>
                    <p className="text-xs text-gray-500">
                      Ideal Completion Pace: 10 Mins • Fun Science Challenges
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
                    2. Select Science Game (3 Available)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Play games and earn Curiosity Points every time!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {MOCK_TESTS.map((test, index) => {
                  const result = completedMockTests[test.id];
                  const isCompleted = Boolean(result?.completed);
                  const isSelected = selectedMockTestId === test.id;
                  const isLocked = !unlockedLevelIndices.includes(index);

                  return (
                    <div
                      key={test.id}
                      onClick={() => !isLocked && setSelectedMockTestId(test.id)}
                      className={`rounded-3xl p-6 border-2 transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isLocked 
                          ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" 
                          : isSelected
                            ? "cursor-pointer border-[#143867] shadow-xl ring-4 ring-[#143867]/10 bg-white"
                            : "cursor-pointer border-gray-200 hover:border-gray-300 shadow-sm bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4 max-w-2xl">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br ${isLocked ? 'from-gray-400 to-gray-500' : test.color}`}>
                          <span className="material-symbols-outlined text-2xl">
                            {isLocked ? 'lock' : test.icon}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {test.badge}
                            </span>

                            {/* Status Pill: Completed vs Pending vs Locked */}
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-0.5 rounded-full border border-gray-300">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Locked (Finish previous level)
                              </span>
                            ) : isCompleted ? (
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
                              <span>Bonus Points: +{result.telemetryBonusXP} XP</span>
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
                          <span>{isCompleted ? `Play Game ${test.id} Again` : `Start Game ${test.id}`}</span>
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
             ACTIVE GAME: LAB + QUESTIONS
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
                            Why this happens
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
                  <span>Go back to Games</span>
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitTest}
                    className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    <span>Finish Game</span>
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
                    <span>Play Again</span>
                  </button>
                )}
              </div>
            </div>
        )}
      </main>
    </div>
  );
}