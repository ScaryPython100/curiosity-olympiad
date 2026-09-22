"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SandboxEngine, { EXPERIMENT_LABELS } from "@/components/SandboxEngine";
import { addActivityXP } from "@/app/actions/profile";
import { submitMockTestAttempt, getMockTestAttempts } from "@/app/actions/exams";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export interface Question {
  id: number;
  mockTestId: number;
  experimentIndex: number;
  module: "Optics" | "Gravity" | "Chemistry" | "Grades68" | "Grades910" | "Sound" | "Electricity" | "Buoyancy";
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
  module: "Optics" | "Gravity" | "Chemistry" | "Grades68" | "Grades910" | "Sound" | "Electricity" | "Buoyancy" | "Kitchen" | "Body" | "Plants";
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
    title: "Mock Test 1: Light & Sight",
    subtitle: "Optics & Reflections",
    description: "Play with room light, prisms, and shadows to understand how light travels and bends.",
    module: "Optics",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "emoji_objects",
    badge: "Foundation & Advanced Optics",
    color: "from-[#143867] to-[#1e4a85]"
  },
  {
    id: 2,
    title: "Mock Test 2: Forces & Motion",
    subtitle: "Fans, Gravity & Airflow",
    description: "Discover how blade angles push air, how launch angles affect distance, and how objects fall in a vacuum.",
    module: "Gravity",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "air",
    badge: "Forces, Trajectory & Gravity",
    color: "from-[#ea580c] to-[#f97316]"
  },
  {
    id: 3,
    title: "Mock Test 3: Heat & Fire",
    subtitle: "Thermodynamics & Combustion",
    description: "Test metal spoons in hot soup, evaporative cooling in clay matkas, and air volume for candle flames.",
    module: "Chemistry",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "local_fire_department",
    badge: "Heat Transfer & Combustion",
    color: "from-[#059669] to-[#10b981]"
  },
  {
    id: 4,
    title: "Mock Test 4: Sensory Physics (Grades 6–8)",
    subtitle: "Cooling, Flight & Steam",
    description: "Compare wet-cloth matka cooling, test kite strings in varying winds, and discover the steam pocket inside puffing chapatis.",
    module: "Grades68",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "science",
    badge: "Concrete & Sensory Inquiry",
    color: "from-[#7c3aed] to-[#8b5cf6]"
  },
  {
    id: 5,
    title: "Mock Test 5: Hypothesis Testing (Grades 9–10)",
    subtitle: "Agronomy, Solar & Bio-Energy",
    description: "Investigate first-rain soil infiltration, test solar cooker parabolic angles, and uncover seasonal biogas output bottlenecks.",
    module: "Grades910",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "biotech",
    badge: "Systemic Hypothesis Testing",
    color: "from-[#0284c7] to-[#0ea5e9]"
  },
  {
    id: 6,
    title: "Mock Test 6: Sound & Vibration",
    subtitle: "Pitch, Resonance & Echoes",
    description: "Tap water-filled matkas to discover vibrating air columns, test string phones, and shout into deep wells to find echoes.",
    module: "Sound",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "volume_up",
    badge: "Acoustics & Vibration",
    color: "from-[#0d9488] to-[#14b8a6]"
  },
  {
    id: 7,
    title: "Mock Test 7: Electricity & Magnetism",
    subtitle: "Static Charge, Circuits & Fields",
    description: "Rub combs on hair in different humidities, inspect broken loops in torches, and test attraction on coins vs. nails.",
    module: "Electricity",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "electric_bolt",
    badge: "Circuits, Charge & Magnetism",
    color: "from-[#d97706] to-[#f59e0b]"
  },
  {
    id: 8,
    title: "Mock Test 8: Water & Buoyancy",
    subtitle: "Displacement, Density & Flotation",
    description: "Fold paper boats to test water displacement, float eggs across salinity thresholds, and observe density settling in oil and water.",
    module: "Buoyancy",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "water_drop",
    badge: "Fluid Mechanics & Buoyancy",
    color: "from-[#2563eb] to-[#3b82f6]"
  },
  {
    id: 9,
    title: "Mock Test 9: Kitchen Chemistry",
    subtitle: "Indicators, Effervescence & Saturation",
    description: "Explore natural turmeric pH color changes with lemon and soap, inflate balloons with vinegar effervescence, and dissolve sugar up to thermal saturation.",
    module: "Kitchen",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "science",
    badge: "Acids, Bases & Solutions",
    color: "from-[#c2410c] to-[#ea580c]"
  },
  {
    id: 10,
    title: "Mock Test 10: The Human Body",
    subtitle: "Heartbeat, Lungs & Eye Reflexes",
    description: "Listen to resting vs. sprint heartbeat audio, pull the rubber diaphragm sheet to inflate balloon lungs, and test pupil constriction in bright torchlight.",
    module: "Body",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "favorite",
    badge: "Physiology & Biomechanics",
    color: "from-[#be123c] to-[#e11d48]"
  },
  {
    id: 11,
    title: "Mock Test 11: Plants & Growth",
    subtitle: "Photosynthesis, Transpiration & Phototropism",
    description: "Count oxygen bubbles rising from submerged waterweed under intense light, observe leaf transpiration condensation, and bend growing stems toward light.",
    module: "Plants",
    idealTime: { level1: "5 Mins", level2: "10 Mins" },
    idealSeconds: { level1: 300, level2: 600 },
    questionCount: 9,
    icon: "psychiatry",
    badge: "Plant Biology & Phototropism",
    color: "from-[#047857] to-[#10b981]"
  }
];

const PRACTICE_QUESTIONS: Question[] = [
  // --- MOCK TEST 1 (Optics) ---
  {
    id: 1, mockTestId: 1, experimentIndex: 0, module: "Optics",
    title: "TV Screen Glare",
    question: "Why can't you see the TV picture clearly when the Room Light is very bright?",
    options: [
      "The TV gets scared of the light.",
      "Bright room light reflects off the TV screen, washing out the picture with glare.",
      "The TV drinks the light and turns white.",
      "The sun breaks the TV colors."
    ],
    correct: 1,
    explanation: "When a room is too bright, the light bounces (reflects) off the shiny TV screen. This glare makes it hard to see the dark colors on the screen!",
    level: "both"
  },
  {
    id: 2, mockTestId: 1, experimentIndex: 0, module: "Optics",
    title: "Dark Room Eye Strain",
    question: "Why do your eyes hurt if you watch a very bright TV in a pitch-black room?",
    options: [
      "The TV shoots tiny invisible lasers into the room.",
      "The huge difference in brightness (contrast) makes your eye muscles work too hard.",
      "The TV eats all the oxygen in the dark.",
      "The dark air makes the TV heavy."
    ],
    correct: 1,
    explanation: "Your eyes have to constantly adjust between the bright TV and the dark room walls. This huge contrast tires out your eye muscles, causing eye strain!",
    level: "both"
  },
  {
    id: 3, mockTestId: 1, experimentIndex: 0, module: "Optics",
    title: "Perfect Picture",
    question: "What is the best way to watch TV without hurting your eyes?",
    options: [
      "Wear sunglasses while watching TV.",
      "Turn the TV brightness up and the room light down to zero.",
      "Match the TV brightness with a soft room light so they are balanced.",
      "Put the TV outside in the bright sun."
    ],
    correct: 2,
    explanation: "Balancing the TV brightness with a soft, cozy room light means your eyes don't have to work as hard, and you won't get any annoying screen glare!",
    level: "both"
  },
  {
    id: 4, mockTestId: 1, experimentIndex: 1, module: "Optics",
    title: "Bending Light",
    question: "When you rotate the prism angle, what happens to the path of the light ray?",
    options: [
      "The light stops completely.",
      "The light bends at a sharper angle through the glass.",
      "The light turns into water.",
      "The light bounces straight backwards."
    ],
    correct: 1,
    explanation: "As the angle of the glass surface changes relative to the incoming light ray, refraction bends the ray more sharply!",
    level: "both"
  },
  {
    id: 5, mockTestId: 1, experimentIndex: 1, module: "Optics",
    title: "Water Illusions",
    question: "Why does a coin at the bottom of a pool look closer than it really is?",
    options: [
      "The water pushes the coin up.",
      "Light bends when it leaves the water, tricking your eyes.",
      "Fish push the coin to the top.",
      "The coin gets lighter in water."
    ],
    correct: 1,
    explanation: "Light bends as it moves from water to air. Your brain thinks light travels straight, so it gets tricked into seeing the coin higher up!",
    level: "both"
  },
  {
    id: 6, mockTestId: 1, experimentIndex: 1, module: "Optics",
    title: "Rainbow Colors",
    question: "Why does Sunlight turn into a beautiful rainbow when it hits the scale?",
    options: [
      "The plastic scale is painted with rainbow colors.",
      "Sunlight has all colors mixed together, and the plastic bends each color differently.",
      "The scale gets hot and glows in colors.",
      "The light takes colors from the air."
    ],
    correct: 1,
    explanation: "White sunlight is actually made of all colors! When it goes through the plastic, each color bends a little differently and they spread out into a rainbow.",
    level: "both"
  },
  {
    id: 7, mockTestId: 1, experimentIndex: 2, module: "Optics",
    title: "Sun Height",
    question: "When the Sun Height is very low (like Morning), why is the tree's shadow so long?",
    options: [
      "The sun is tired in the morning.",
      "The sun's light hits the tree from the side, stretching the shadow across the ground.",
      "The tree grows bigger in the morning.",
      "The ground is colder in the morning."
    ],
    correct: 1,
    explanation: "When the sun is low in the sky, it shines on the side of the tree, casting a long stretched-out shadow on the ground behind it.",
    level: "both"
  },
  {
    id: 8, mockTestId: 1, experimentIndex: 2, module: "Optics",
    title: "Upside Down Shadows",
    question: "If you look through a tiny hole at a tree, why does it sometimes look upside down?",
    options: [
      "The hole has a tiny mirror.",
      "Light goes in straight lines, so light from the top of the tree hits the bottom of your eye.",
      "Your brain plays a trick on you.",
      "The air flips the light over."
    ],
    correct: 1,
    explanation: "Light travels in straight lines! So light from the top of the tree travels straight down through the hole, hitting the bottom of the wall.",
    level: "both"
  },
  {
    id: 9, mockTestId: 1, experimentIndex: 2, module: "Optics",
    title: "Fuzzy Shadows",
    question: "Why do some shadows look fuzzy and blurry on the edges?",
    options: [
      "The sun is wearing glasses.",
      "The sun is big, so light from different sides of the sun makes overlapping shadows.",
      "The wind blows the shadow around.",
      "The ground is dusty."
    ],
    correct: 1,
    explanation: "Because the sun is big, light comes from many points. This makes some parts of the shadow darker and the edges lighter and fuzzy!",
    level: "both"
  },

  // --- MOCK TEST 2 (Gravity) ---
  {
    id: 10, mockTestId: 2, experimentIndex: 0, module: "Gravity",
    title: "Fan Speed",
    question: "When you increase the Fan Speed, why do you feel more wind?",
    options: [
      "The fan makes the air colder.",
      "The blades spin faster and push more air down towards you.",
      "The fan sucks air from outside the house.",
      "The fan creates ice cubes in the air."
    ],
    correct: 1,
    explanation: "Fan blades are tilted! When they spin faster, they slap more air downwards, creating a strong breeze you can feel.",
    level: "both"
  },
  {
    id: 11, mockTestId: 2, experimentIndex: 0, module: "Gravity",
    title: "Why Fans Cool Us",
    question: "Why does the fast wind from the fan make you feel cold on a hot day?",
    options: [
      "The fan breaks the heat.",
      "The moving air dries your sweat faster, which cools down your skin.",
      "The fan pushes the heat out the window.",
      "The fan covers you in cold air."
    ],
    correct: 1,
    explanation: "Fans don't actually cool the room; they cool YOU! The breeze helps your sweat evaporate faster, which takes away your body heat.",
    level: "both"
  },
  {
    id: 12, mockTestId: 2, experimentIndex: 0, module: "Gravity",
    title: "Number of Blades",
    question: "Why do we use 3 blades on ceiling fans in hot places instead of 5?",
    options: [
      "3 blades can spin much faster and push more air than heavy 5 blades.",
      "5 blades take too much paint.",
      "3 blades look prettier.",
      "5 blades make the air too heavy."
    ],
    correct: 0,
    explanation: "In hot climates, we want fast air! 3 blades are lighter and cut through the air easier, allowing the fan to spin very fast.",
    level: "both"
  },
  {
    id: 13, mockTestId: 2, experimentIndex: 1, module: "Gravity",
    title: "Falling Ball",
    question: "When you hit the cricket ball, why doesn't it go up into space forever?",
    options: [
      "The ball gets tired.",
      "The Earth's gravity pulls it back down to the ground.",
      "The wind pushes it down.",
      "The bat is not strong enough."
    ],
    correct: 1,
    explanation: "Gravity is an invisible force from the Earth that pulls everything down. No matter how hard you hit the ball, gravity will bring it back!",
    level: "both"
  },
  {
    id: 14, mockTestId: 2, experimentIndex: 1, module: "Gravity",
    title: "Space Station",
    question: "Why doesn't the Space Station fall down to Earth?",
    options: [
      "It has giant balloons.",
      "It is moving sideways so fast that it keeps missing the Earth as it falls.",
      "There is zero gravity in space.",
      "It has wings like an airplane."
    ],
    correct: 1,
    explanation: "The Space Station is actually falling! But because it zooms sideways super fast, the round Earth curves away beneath it, so it never hits the ground.",
    level: "both"
  },
  {
    id: 15, mockTestId: 2, experimentIndex: 1, module: "Gravity",
    title: "Hit Power",
    question: "What happens when you increase the Hit Power for the cricket ball?",
    options: [
      "The ball gets heavier.",
      "The ball gets more energy and flies much further before hitting the ground.",
      "The ball turns red.",
      "The ball bounces backwards."
    ],
    correct: 1,
    explanation: "More power means more starting speed (energy!). It takes gravity longer to pull a fast-moving ball down, so it travels further.",
    level: "both"
  },
  {
    id: 16, mockTestId: 2, experimentIndex: 2, module: "Gravity",
    title: "Air Push",
    question: "In normal air, why does a heavy stone land before a light dry leaf?",
    options: [
      "Gravity likes heavy things more.",
      "The air pushes up on the wide leaf and slows it down.",
      "The leaf forgets to fall.",
      "The stone has a motor."
    ],
    correct: 1,
    explanation: "Air gets in the way! The wide, light leaf catches a lot of air as it falls, which acts like a parachute and slows it down.",
    level: "both"
  },
  {
    id: 17, mockTestId: 2, experimentIndex: 2, module: "Gravity",
    title: "Removing Air (Vacuum)",
    question: "If you remove ALL the air (a vacuum), what happens when you drop the leaf and stone?",
    options: [
      "The stone still lands first.",
      "They both hit the ground at the exact same time!",
      "They float up to the ceiling.",
      "The leaf falls faster."
    ],
    correct: 1,
    explanation: "Without air pushing back, gravity pulls EVERYTHING down at the exact same speed. A feather and a bowling ball would land together!",
    level: "both"
  },
  {
    id: 18, mockTestId: 2, experimentIndex: 2, module: "Gravity",
    title: "Stone Weight",
    question: "If you make the stone heavier, does it fall faster in a vacuum?",
    options: [
      "Yes, heavy things fall way faster.",
      "No, gravity pulls all objects at the same falling speed if there is no air.",
      "Yes, it breaks the ground.",
      "No, heavy things fall slower."
    ],
    correct: 1,
    explanation: "Weight doesn't matter in a vacuum! Gravity accelerates all objects identically, so they fall at the exact same speed.",
    level: "both"
  },

  // --- MOCK TEST 3 (Chemistry) ---
  {
    id: 19, mockTestId: 3, experimentIndex: 0, module: "Chemistry",
    title: "Hot Spoons",
    question: "Why does the Steel Spoon get too hot to touch in the hot dal, but the Wood Spoon stays cool?",
    options: [
      "Wood hates the soup.",
      "Steel is a metal that lets heat travel through it super fast.",
      "The steel spoon is shorter.",
      "Wood reflects the heat into the air."
    ],
    correct: 1,
    explanation: "Metals like steel are great at conducting (sharing) heat. The heat travels straight up the steel handle to your hand! Wood stops the heat.",
    level: "both"
  },
  {
    id: 20, mockTestId: 3, experimentIndex: 0, module: "Chemistry",
    title: "Stirring the Soup",
    question: "Why does stirring the hot soup make it cool down faster?",
    options: [
      "Stirring makes ice.",
      "Stirring brings the hot soup from the bottom to the top so the heat can escape.",
      "Stirring breaks the heat.",
      "The spoon sucks the heat out."
    ],
    correct: 1,
    explanation: "When you stir, the hot soup at the bottom comes up to the surface. The heat escapes into the air as steam, cooling the soup down!",
    level: "both"
  },
  {
    id: 21, mockTestId: 3, experimentIndex: 0, module: "Chemistry",
    title: "Steam",
    question: "Why do you see more steam when you turn up the Stove Heat?",
    options: [
      "The spoon melts into smoke.",
      "Hot water gets so much energy it flies into the air as steam.",
      "The heat burns the air.",
      "The pot catches fire."
    ],
    correct: 1,
    explanation: "Heat gives water molecules energy! When they get really hot, they wiggle so fast they pop out of the liquid and turn into steam gas.",
    level: "both"
  },
  {
    id: 22, mockTestId: 3, experimentIndex: 1, module: "Chemistry",
    title: "Clay Pot vs Metal",
    question: "Why does a clay pot (Matka) make water cold, but a metal pot keeps it warm?",
    options: [
      "Clay has magic ice rocks inside.",
      "Water leaks through tiny holes in clay and dries up, taking the heat away.",
      "Metal gets shy.",
      "Clay is always cold."
    ],
    correct: 1,
    explanation: "Clay has tiny holes! Water seeps out and evaporates into the air. Evaporation steals heat from the pot, making the water inside cold.",
    level: "both"
  },
  {
    id: 23, mockTestId: 3, experimentIndex: 1, module: "Chemistry",
    title: "Air Wetness (Humidity)",
    question: "If the air is very wet (humid) because it is raining, does the Matka still cool the water well?",
    options: [
      "Yes, rain helps it cool.",
      "No, if the air is wet, the water on the pot can't dry up (evaporate) to cool it down.",
      "Yes, it gets freezing.",
      "No, the pot melts."
    ],
    correct: 1,
    explanation: "Cooling needs evaporation! If the air is already full of water (humid), the water on the pot can't evaporate into the air easily.",
    level: "both"
  },
  {
    id: 24, mockTestId: 3, experimentIndex: 1, module: "Chemistry",
    title: "Pressure Cooker",
    question: "Why does a closed pressure cooker cook food so much faster than an open pot?",
    options: [
      "It has a motor.",
      "Trapped steam makes high pressure, so water gets much hotter than normal boiling.",
      "The food gets scared.",
      "It makes a loud whistle."
    ],
    correct: 1,
    explanation: "Because the steam can't escape, the pressure inside goes up. High pressure forces the water to get much hotter before it boils, cooking food fast!",
    level: "both"
  },
  {
    id: 25, mockTestId: 3, experimentIndex: 2, module: "Chemistry",
    title: "Candle Needs Air",
    question: "When you put a glass jar over the Diya (candle), why does the fire go out?",
    options: [
      "The glass crushes the fire.",
      "Fire needs oxygen from the air to burn, and the jar traps only a little bit.",
      "The jar makes it too cold.",
      "The fire gets scared of the dark."
    ],
    correct: 1,
    explanation: "Fire needs 3 things: Fuel, Heat, and Oxygen! The glass jar stops new air from getting in. Once the fire uses up all the trapped oxygen, it goes out.",
    level: "both"
  },
  {
    id: 26, mockTestId: 3, experimentIndex: 2, module: "Chemistry",
    title: "Big Glass vs Small Glass",
    question: "If you use a much bigger Glass Size over the candle, what happens?",
    options: [
      "The candle goes out immediately.",
      "The candle burns longer because a bigger glass holds more air.",
      "The candle turns green.",
      "The glass breaks."
    ],
    correct: 1,
    explanation: "A larger glass traps a lot more air (and oxygen) inside it. The fire has more oxygen to use, so it can burn for a longer time before going out.",
    level: "both"
  },
  {
    id: 27, mockTestId: 3, experimentIndex: 2, module: "Chemistry",
    title: "Lemon Juice & Baking Soda",
    question: "What happens when you mix sour lemon juice and baking soda in the kitchen?",
    options: [
      "It gets super hot and boils.",
      "They react and make lots of fizzy carbon dioxide gas bubbles!",
      "It turns into hard plastic.",
      "It freezes into ice."
    ],
    correct: 1,
    explanation: "When you mix an acid (lemon juice) and a base (baking soda), they have a chemical reaction and create a new gas called Carbon Dioxide, making fizzy bubbles!",
    level: "both"
  },

  // --- MOCK TEST 4 (Grades 6-8) ---
  {
    id: 28, mockTestId: 4, experimentIndex: 0, module: "Grades68",
    title: "Matka Placement",
    question: "Where did the bare Matka cool the water best?",
    options: ["In the Sun", "In the Shade", "Inside a box", "On a heater"],
    correct: 1, explanation: "Shade is naturally cooler!", level: "both"
  },
  {
    id: 29, mockTestId: 4, experimentIndex: 0, module: "Grades68",
    title: "The Wet Cloth Anomaly",
    question: "Why was the wet cloth in the sun cooler than the bare pot in the shade?",
    options: ["Sunlight makes ice", "Rapid evaporation pulled the heat away", "The cloth blocked the sun", "The water got scared"],
    correct: 1, explanation: "Evaporation removes heat. Hot sun makes it evaporate fast!", level: "both"
  },
  {
    id: 30, mockTestId: 4, experimentIndex: 0, module: "Grades68",
    title: "Plastic vs Clay",
    question: "Why doesn't the plastic bottle cool water like the Matka?",
    options: ["Plastic has no tiny holes for water to evaporate", "Plastic likes to be hot", "Plastic drinks the water", "Plastic is too smooth"],
    correct: 0, explanation: "Evaporation needs pores!", level: "both"
  },
  {
    id: 31, mockTestId: 4, experimentIndex: 1, module: "Grades68",
    title: "Kite Angle",
    question: "What happens if you pull the kite angle too tight in strong wind?",
    options: ["It flies to space", "It dives down because wind spills off the face", "It turns into a bird", "It stops moving"],
    correct: 1, explanation: "Too much angle spills the wind!", level: "both"
  },
  {
    id: 32, mockTestId: 4, experimentIndex: 1, module: "Grades68",
    title: "Low Wind",
    question: "How do you fly high when wind is low?",
    options: ["Keep angle moderate and let out string", "Pull it flat", "Drop it", "Cut the string"],
    correct: 0, explanation: "You need a good surface area to catch light breeze.", level: "both"
  },
  {
    id: 33, mockTestId: 4, experimentIndex: 1, module: "Grades68",
    title: "String Tension",
    question: "What holds the kite in the air?",
    options: ["Magic", "The balance between wind push and string pull", "Birds", "Clouds"],
    correct: 1, explanation: "Wind pushes it up, string holds it against the wind!", level: "both"
  },
  {
    id: 34, mockTestId: 4, experimentIndex: 2, module: "Grades68",
    title: "Chapati Puff",
    question: "What makes the chapati puff up?",
    options: ["Air trapped inside turning to steam", "Yeast", "Sugar", "Baking powder"],
    correct: 0, explanation: "Moisture turns to steam and expands!", level: "both"
  },
  {
    id: 35, mockTestId: 4, experimentIndex: 2, module: "Grades68",
    title: "Thin Chapati Anomaly",
    question: "Why doesn't a very thin chapati puff on low heat?",
    options: ["It burns instantly", "It dries out before steam can build up", "It melts", "It shrinks"],
    correct: 1, explanation: "It becomes a cracker!", level: "both"
  },
  {
    id: 36, mockTestId: 4, experimentIndex: 2, module: "Grades68",
    title: "High Heat",
    question: "Why is high heat better for puffing?",
    options: ["It flashes moisture to steam quickly before the dough dries out", "It makes it taste sweet", "It changes the color", "It adds air"],
    correct: 0, explanation: "Fast steam = big puff!", level: "both"
  },
  // --- MOCK TEST 5 (Grades 9-10) ---
  {
    id: 37, mockTestId: 5, experimentIndex: 0, module: "Grades910",
    title: "Soil Drainage",
    question: "Which soil flooded easiest?",
    options: ["Sandy", "Loamy", "Clay", "Rocks"],
    correct: 2, explanation: "Clay holds a lot of water!", level: "both"
  },
  {
    id: 38, mockTestId: 5, experimentIndex: 0, module: "Grades910",
    title: "First Rain",
    question: "Why is Loamy soil best for sowing?",
    options: ["It's pretty", "It balances drainage and retention", "It's cheap", "It smells good"],
    correct: 1, explanation: "Not too wet, not too dry!", level: "both"
  },
  {
    id: 39, mockTestId: 5, experimentIndex: 0, module: "Grades910",
    title: "Sandy Soil",
    question: "What is the problem with sandy soil?",
    options: ["It drains water too fast, leaving roots dry", "It floods", "It's sticky", "It's heavy"],
    correct: 0, explanation: "Water slips right through sand.", level: "both"
  },
  {
    id: 40, mockTestId: 5, experimentIndex: 1, module: "Grades910",
    title: "Solar Cooker Angle",
    question: "Why did the best angle change in the afternoon?",
    options: ["The mirror melted", "The sun moved across the sky", "The food got hot", "The wind blew"],
    correct: 1, explanation: "The sun's position changes!", level: "both"
  },
  {
    id: 41, mockTestId: 5, experimentIndex: 1, module: "Grades910",
    title: "Reflector Purpose",
    question: "What does the reflector do?",
    options: ["Blocks wind", "Bounces more sunlight onto the cooker", "Makes it look nice", "Cools it down"],
    correct: 1, explanation: "More bounced light = more heat!", level: "both"
  },
  {
    id: 42, mockTestId: 5, experimentIndex: 1, module: "Grades910",
    title: "Tracking",
    question: "How do you keep it cooking all day?",
    options: ["Add fire", "Keep adjusting the angle to track the sun", "Put a blanket on it", "Paint it black"],
    correct: 1, explanation: "You must follow the sun!", level: "both"
  },
  {
    id: 43, mockTestId: 5, experimentIndex: 2, module: "Grades910",
    title: "Biogas Temperature",
    question: "Why did gas output drop in winter?",
    options: ["The pipe froze", "Bacteria work slower in cold temperatures", "Cows eat less", "Dung gets heavy"],
    correct: 1, explanation: "Bacteria need warmth to digest dung!", level: "both"
  },
  {
    id: 44, mockTestId: 5, experimentIndex: 2, module: "Grades910",
    title: "Dung Ratio Anomaly",
    question: "Why didn't adding more dung fix the winter output?",
    options: ["It made it too thick", "The process was temperature-limited, not fuel-limited", "It leaked", "It dissolved"],
    correct: 1, explanation: "If they are too cold to eat, giving them more food doesn't help!", level: "both"
  },
  {
    id: 45, mockTestId: 5, experimentIndex: 2, module: "Grades910",
    title: "Winter Solution",
    question: "How can you improve winter biogas output?",
    options: ["Insulate or bury the tank to keep it warm", "Add ice", "Leave it open", "Add water"],
    correct: 0, explanation: "Keeping the heat in helps the bacteria!", level: "both"
  },
  // --- MOCK TEST 6 (Sound & Vibration) ---
  {
    id: 46, mockTestId: 6, experimentIndex: 0, module: "Sound",
    title: "Matka Pitch",
    question: "What happened to the sound when the matka had MORE water?",
    options: ["It got deeper/lower", "It got higher", "It stopped completely", "It sounded like a bell"],
    correct: 1, explanation: "More water means less air space, making a higher pitch!", level: "both"
  },
  {
    id: 47, mockTestId: 6, experimentIndex: 0, module: "Sound",
    title: "Vibrating Air",
    question: "What is actually vibrating to make the sound when you tap?",
    options: ["The water", "The air column inside the matka", "Your finger", "The table"],
    correct: 1, explanation: "The empty air space vibrates to make the sound.", level: "both"
  },
  {
    id: 48, mockTestId: 6, experimentIndex: 0, module: "Sound",
    title: "Empty Matka",
    question: "Why does an almost empty matka sound so deep?",
    options: ["It is heavy", "There is a very long column of air to vibrate", "It has a hole", "The water is cold"],
    correct: 1, explanation: "More air space makes a deeper, lower sound.", level: "both"
  },
  {
    id: 49, mockTestId: 6, experimentIndex: 1, module: "Sound",
    title: "String Telephone",
    question: "Why did the sound stop when the string was pinched?",
    options: ["The string broke", "The pinch stopped the string from vibrating", "The cup fell off", "The wind blew"],
    correct: 1, explanation: "Sound travels as a vibration. Pinching it kills the vibration!", level: "both"
  },
  {
    id: 50, mockTestId: 6, experimentIndex: 1, module: "Sound",
    title: "Loose String",
    question: "What happens if the string is completely loose?",
    options: ["Sound travels faster", "Sound doesn't travel at all", "It gets louder", "It changes language"],
    correct: 1, explanation: "A loose string cannot carry vibrations well.", level: "both"
  },
  {
    id: 51, mockTestId: 6, experimentIndex: 1, module: "Sound",
    title: "How Sound Travels",
    question: "How does the sound get from one cup to the other?",
    options: ["It flies through the air", "It travels as a vibration along the tight string", "It uses electricity", "It goes underground"],
    correct: 1, explanation: "The string physically shakes (vibrates) to carry the sound.", level: "both"
  },
  {
    id: 52, mockTestId: 6, experimentIndex: 2, module: "Sound",
    title: "Echo in the Field",
    question: "Why couldn't you hear an echo in the open field?",
    options: ["The field was too loud", "There were no hard surfaces for the sound to bounce off", "The grass ate the sound", "You didn't shout loud enough"],
    correct: 1, explanation: "Echoes need a wall or surface to bounce off of!", level: "both"
  },
  {
    id: 53, mockTestId: 6, experimentIndex: 2, module: "Sound",
    title: "Shallow Well",
    question: "Why was the echo bad in the shallow well?",
    options: ["It was too dark", "The sound bounced back too fast and blended with the shout", "The well was dry", "Frogs were croaking"],
    correct: 1, explanation: "Sound needs enough distance so the bounce comes back AFTER you finish shouting.", level: "both"
  },
  {
    id: 54, mockTestId: 6, experimentIndex: 2, module: "Sound",
    title: "What is an Echo?",
    question: "What exactly is an echo?",
    options: ["A ghost", "Sound waves bouncing off a surface and returning to your ears", "Wind blowing back", "A bird copying you"],
    correct: 1, explanation: "It's just reflected sound waves!", level: "both"
  },
  // --- MOCK TEST 7 (Electricity & Magnetism) ---
  {
    id: 55, mockTestId: 7, experimentIndex: 0, module: "Electricity",
    title: "Comb & Paper",
    question: "Why didn't the comb pick up paper on a humid (rainy) day?",
    options: ["The paper was heavy", "Moisture in the air let the static charge leak away", "The comb was broken", "The paper was wet"],
    correct: 1, explanation: "Water in the humid air carries the static charge away!", level: "both"
  },
  {
    id: 56, mockTestId: 7, experimentIndex: 0, module: "Electricity",
    title: "Rubbing the Comb",
    question: "What does rubbing the comb on dry hair do?",
    options: ["Makes it shiny", "Builds up static electrical charge", "Makes it hot", "Cleans it"],
    correct: 1, explanation: "Friction transfers tiny electrons, building up a charge.", level: "both"
  },
  {
    id: 57, mockTestId: 7, experimentIndex: 0, module: "Electricity",
    title: "Best Conditions",
    question: "When is the best time to do this trick?",
    options: ["During a thunderstorm", "On a very dry, sunny day", "While taking a bath", "In the rain"],
    correct: 1, explanation: "Dry air keeps the static charge trapped on the comb.", level: "both"
  },
  {
    id: 58, mockTestId: 7, experimentIndex: 1, module: "Electricity",
    title: "The Loose Wire",
    question: "Why did the torch stay dark when there was a gap in the wire?",
    options: ["The batteries were dead", "Electricity needs a complete, unbroken loop to flow", "The bulb was old", "The batteries were upside down"],
    correct: 1, explanation: "Even a tiny gap stops the flow of electricity completely.", level: "both"
  },
  {
    id: 59, mockTestId: 7, experimentIndex: 1, module: "Electricity",
    title: "More Batteries",
    question: "Did adding a second battery fix the gap?",
    options: ["Yes, it pushed the electricity across", "No, a gap stops the circuit no matter how much power there is", "It blew up", "It made it flicker"],
    correct: 1, explanation: "Power can't jump across a broken circuit.", level: "both"
  },
  {
    id: 60, mockTestId: 7, experimentIndex: 1, module: "Electricity",
    title: "Circuit Definition",
    question: "What do we call the path that electricity flows through?",
    options: ["A road", "A circuit", "A wire tube", "A power line"],
    correct: 1, explanation: "A complete circle for electricity is called a circuit.", level: "both"
  },
  {
    id: 61, mockTestId: 7, experimentIndex: 2, module: "Electricity",
    title: "Magnet and Coin",
    question: "Why didn't the magnet attract the ₹5 coin?",
    options: ["The coin was too heavy", "The coin is made of a metal that isn't magnetic", "The magnet was weak", "The coin was dirty"],
    correct: 1, explanation: "Not all metals are magnetic! Coins are usually not magnetic.", level: "both"
  },
  {
    id: 62, mockTestId: 7, experimentIndex: 2, module: "Electricity",
    title: "Magnetic Metals",
    question: "Which of these metals WILL a magnet attract?",
    options: ["Gold", "Silver", "Iron/Steel", "Aluminum"],
    correct: 2, explanation: "Iron, steel, nickel, and cobalt are magnetic.", level: "both"
  },
  {
    id: 63, mockTestId: 7, experimentIndex: 2, module: "Electricity",
    title: "Visual Test",
    question: "Can you tell if something is magnetic just by looking at it?",
    options: ["Yes, if it's shiny", "No, many metals look the same but aren't magnetic", "Yes, if it's gray", "Yes, if it's heavy"],
    correct: 1, explanation: "You have to test it! A steel nail and aluminum coin can look similar.", level: "both"
  },
  // --- MOCK TEST 8 (Water & Buoyancy) ---
  {
    id: 64, mockTestId: 8, experimentIndex: 0, module: "Buoyancy",
    title: "Boat Shape",
    question: "Why did the flat boat hold more stones than the narrow boat?",
    options: ["It was made of stronger paper", "It pushed aside (displaced) more water, giving it more lift", "It was lighter", "It had a sail"],
    correct: 1, explanation: "A wider bottom displaces more water, creating stronger buoyancy.", level: "both"
  },
  {
    id: 65, mockTestId: 8, experimentIndex: 0, module: "Buoyancy",
    title: "Sinking",
    question: "What happens when the stones get too heavy?",
    options: ["The boat pushes aside enough water", "The weight is greater than the buoyant push of the water", "The water gets scared", "The boat shrinks"],
    correct: 1, explanation: "If weight beats buoyancy, it sinks!", level: "both"
  },
  {
    id: 66, mockTestId: 8, experimentIndex: 0, module: "Buoyancy",
    title: "Ship Design",
    question: "Why are heavy cargo ships built very wide?",
    options: ["To look cool", "To displace a huge amount of water to support their massive weight", "To go faster", "To carry more passengers"],
    correct: 1, explanation: "Wide hulls displace more water, keeping heavy ships afloat.", level: "both"
  },
  {
    id: 67, mockTestId: 8, experimentIndex: 1, module: "Buoyancy",
    title: "Floating Egg",
    question: "Did adding a little bit of salt make the egg float immediately?",
    options: ["Yes", "No, the water had to reach a specific density threshold first", "It dissolved the egg", "It made it sink faster"],
    correct: 1, explanation: "It's a threshold! The water must become denser than the egg.", level: "both"
  },
  {
    id: 68, mockTestId: 8, experimentIndex: 1, module: "Buoyancy",
    title: "Salt Water Density",
    question: "What does adding salt do to the water?",
    options: ["Makes it blue", "Makes it denser (heavier for its size)", "Makes it lighter", "Makes it colder"],
    correct: 1, explanation: "Dissolved salt adds mass, making the water denser.", level: "both"
  },
  {
    id: 69, mockTestId: 8, experimentIndex: 1, module: "Buoyancy",
    title: "Swimming in the Ocean",
    question: "Why is it easier to float in the ocean than a swimming pool?",
    options: ["The ocean has waves", "Ocean water is salty and dense, pushing you up more", "The pool is too small", "The ocean is deep"],
    correct: 1, explanation: "Saltwater is denser, so it provides more buoyant force!", level: "both"
  },
  {
    id: 70, mockTestId: 8, experimentIndex: 2, module: "Buoyancy",
    title: "Oil and Water",
    question: "What happens if you pour oil into the glass FIRST, and then water?",
    options: ["The water stays on top", "The oil still rises to the top", "They mix into juice", "They explode"],
    correct: 1, explanation: "Oil is less dense, so it always floats to the top!", level: "both"
  },
  {
    id: 71, mockTestId: 8, experimentIndex: 2, module: "Buoyancy",
    title: "Stirring Oil and Water",
    question: "Can you permanently mix the oil and water by stirring vigorously?",
    options: ["Yes, forever", "No, they will eventually separate again", "Yes, if you use a spoon", "Only if the water is cold"],
    correct: 1, explanation: "They might look mixed for a minute, but density will separate them again.", level: "both"
  },
  {
    id: 72, mockTestId: 8, experimentIndex: 2, module: "Buoyancy",
    title: "Density Stacking",
    question: "If honey is denser than water, where would it go in the glass?",
    options: ["On top of the oil", "Between the oil and water", "At the very bottom", "It would disappear"],
    correct: 2, explanation: "Densest liquids sink to the bottom!", level: "both"
  },
  // --- MOCK TEST 9 (Kitchen Chemistry) ---
  {
    id: 73, mockTestId: 9, experimentIndex: 0, module: "Kitchen",
    title: "Turmeric Color Shift",
    question: "What color does turmeric turn when mixed with laundry detergent or soap?",
    options: ["Bright blue", "Deep crimson red", "Green", "Transparent"],
    correct: 1, explanation: "Turmeric contains curcumin, which turns deep red in alkaline (basic) solutions!", level: "both"
  },
  {
    id: 74, mockTestId: 9, experimentIndex: 0, module: "Kitchen",
    title: "Neutralizing Turmeric",
    question: "What happens when you add lemon juice to turmeric that has turned red from soap?",
    options: ["It turns green", "It turns back to bright yellow", "It boils violently", "It turns purple"],
    correct: 1, explanation: "Citric acid neutralizes the alkaline soap, restoring curcumin to its natural yellow state.", level: "both"
  },
  {
    id: 75, mockTestId: 9, experimentIndex: 0, module: "Kitchen",
    title: "Natural Indicator",
    question: "What scientific role does turmeric play in this test?",
    options: ["A preservative", "A natural pH indicator", "A cleaning surfactant", "A flavor enhancer"],
    correct: 1, explanation: "A pH indicator changes color depending on whether a liquid is acidic or basic.", level: "both"
  },
  {
    id: 76, mockTestId: 9, experimentIndex: 1, module: "Kitchen",
    title: "Gas in the Balloon",
    question: "What gas is produced when baking soda reacts with vinegar to inflate the balloon?",
    options: ["Oxygen", "Carbon Dioxide (CO₂)", "Hydrogen", "Helium"],
    correct: 1, explanation: "Acetic acid in vinegar reacts with sodium bicarbonate to form carbon dioxide gas!", level: "both"
  },
  {
    id: 77, mockTestId: 9, experimentIndex: 1, module: "Kitchen",
    title: "Limiting Reactant",
    question: "Why did adding extra baking soda past 18g stop inflating the balloon further?",
    options: ["The balloon popped", "All the vinegar acid had already been consumed", "Gas escaped through the rubber", "The flask got too cold"],
    correct: 1, explanation: "Vinegar was the limiting reactant — once all acid is used up, excess base cannot react.", level: "both"
  },
  {
    id: 78, mockTestId: 9, experimentIndex: 1, module: "Kitchen",
    title: "Gas Pressure",
    question: "How does the gas inside the flask physically inflate the rubber balloon?",
    options: ["By heating the rubber", "By exerting physical gas pressure against the inner walls", "By pulling air from the room", "By generating electricity"],
    correct: 1, explanation: "Gas molecules collide with the inside walls of the balloon, creating outward pressure.", level: "both"
  },
  {
    id: 79, mockTestId: 9, experimentIndex: 2, module: "Kitchen",
    title: "Solubility & Heat",
    question: "Why does hot water dissolve significantly more sugar than cold water?",
    options: ["Hot water is lighter", "Thermal energy expands spaces and movement between water molecules", "Sugar melts into water", "Cold water destroys sugar crystals"],
    correct: 1, explanation: "Thermal kinetic energy increases molecular spacing and solvent capacity.", level: "both"
  },
  {
    id: 80, mockTestId: 9, experimentIndex: 2, module: "Kitchen",
    title: "Saturation Point",
    question: "What do we call a liquid solution that cannot dissolve any more solute at its current temperature?",
    options: ["Dilute", "Saturated", "Unstable", "Distilled"],
    correct: 1, explanation: "A saturated solution holds the maximum possible dissolved solute at that temperature.", level: "both"
  },
  {
    id: 81, mockTestId: 9, experimentIndex: 2, module: "Kitchen",
    title: "Dissolving Sediment",
    question: "If you heat a saturated sugar solution that has crystals sitting on the bottom, what happens?",
    options: ["The sediment crystals dissolve into the liquid", "The crystals turn into ice", "The water evaporates instantly", "More crystals appear"],
    correct: 0, explanation: "Higher temperatures increase the saturation limit, dissolving the settled sediment.", level: "both"
  },
  // --- MOCK TEST 10 (The Human Body) ---
  {
    id: 82, mockTestId: 10, experimentIndex: 0, module: "Body",
    title: "Sprint Pulse Rate",
    question: "Why does your pulse rate jump when you sprint compared to when sitting at rest?",
    options: ["To keep your body cool", "Working muscles require much more oxygen and energy transported by blood", "Your lungs shrink during sprinting", "Running slows down digestion"],
    correct: 1, explanation: "Sprint muscles burn energy rapidly, demanding faster blood flow to supply oxygen.", level: "both"
  },
  {
    id: 83, mockTestId: 10, experimentIndex: 0, module: "Body",
    title: "Heartbeat Acoustics",
    question: "What creates the classic 'lub-dub' acoustic sound heard through a stethoscope?",
    options: ["Air flowing through the trachea", "Heart valves snapping shut during contraction and relaxation", "Blood splashing against ribs", "Lungs expanding"],
    correct: 1, explanation: "Heart valves closing (AV valves first, then semilunar valves) create the two audible sounds.", level: "both"
  },
  {
    id: 84, mockTestId: 10, experimentIndex: 0, module: "Body",
    title: "Feeling the Pulse",
    question: "Where on your body can you easily feel an arterial pulse with your fingertips?",
    options: ["On your fingernail", "On the inside of your wrist (radial artery) or side of neck (carotid)", "On your kneecap", "On your earlobe"],
    correct: 1, explanation: "The radial artery at your wrist and carotid in your neck run close to the skin surface.", level: "both"
  },
  {
    id: 85, mockTestId: 10, experimentIndex: 1, module: "Body",
    title: "Diaphragm Mechanics",
    question: "What happens inside the chest cavity when the diaphragm muscle pulls downward?",
    options: ["Chest cavity volume shrinks", "Cavity volume expands and pressure drops, sucking air inside", "Air is squeezed out", "Lungs stop breathing"],
    correct: 1, explanation: "Lower internal pressure creates a vacuum that atmospheric air rushes in to fill.", level: "both"
  },
  {
    id: 86, mockTestId: 10, experimentIndex: 1, module: "Body",
    title: "Passive Lungs",
    question: "Do human lungs have their own muscles to pump air in and out?",
    options: ["Yes, strong internal lung muscles", "No, they expand passively due to surrounding pressure changes", "Only the left lung has muscles", "Only during exercise"],
    correct: 1, explanation: "Lungs are passive elastic tissue moved by the diaphragm and rib intercostal muscles.", level: "both"
  },
  {
    id: 87, mockTestId: 10, experimentIndex: 1, module: "Body",
    title: "Exhalation Driver",
    question: "What primarily causes exhalation during quiet resting breathing?",
    options: ["Diaphragm relaxing upward and elastic recoil of the lungs", "Deep coughing", "Swallowing air", "Heart beating against the chest"],
    correct: 0, explanation: "When the diaphragm relaxes into its dome shape, internal pressure rises and air flows out.", level: "both"
  },
  {
    id: 88, mockTestId: 10, experimentIndex: 2, module: "Body",
    title: "Pupil Constriction",
    question: "Why does your pupil shrink when a bright flashlight shines into your eye?",
    options: ["To focus on far away objects", "To protect the sensitive retina from excessive light and glare", "To turn the light off", "Because the eye is sleeping"],
    correct: 1, explanation: "The pupillary light reflex constricts the pupil to protect retinal photoreceptors from light damage.", level: "both"
  },
  {
    id: 89, mockTestId: 10, experimentIndex: 2, module: "Body",
    title: "Eye Iris Muscle",
    question: "Which anatomical part of the eye contains the colored muscle that adjusts pupil aperture?",
    options: ["Cornea", "Iris", "Lens", "Retina"],
    correct: 1, explanation: "The iris contains circular sphincter and radial dilator muscles that regulate pupil aperture.", level: "both"
  },
  {
    id: 90, mockTestId: 10, experimentIndex: 2, module: "Body",
    title: "Pupil Dilation in Darkness",
    question: "What happens to your pupils when you step into a dimly lit room?",
    options: ["They constrict to tiny specks", "They dilate (widen) to capture as much ambient light as possible", "They turn green", "They close completely"],
    correct: 1, explanation: "In dim light, the pupil widens (dilates) up to 8mm to improve vision.", level: "both"
  },
  // --- MOCK TEST 11 (Plants & Growth) ---
  {
    id: 91, mockTestId: 11, experimentIndex: 0, module: "Plants",
    title: "Photosynthesis Bubbles",
    question: "What gas is inside the tiny bubbles rising from submerged waterweed in bright light?",
    options: ["Carbon Dioxide", "Oxygen (O₂)", "Nitrogen", "Methane"],
    correct: 1, explanation: "Photosynthesis splits water molecules ($H_2O$), releasing oxygen gas as a byproduct.", level: "both"
  },
  {
    id: 92, mockTestId: 11, experimentIndex: 0, module: "Plants",
    title: "Light and Bubbling Rate",
    question: "What happens to the bubble release rate when you pull the lamp further away from the plant?",
    options: ["It increases", "It decreases because lower light intensity slows photosynthesis", "It stays exactly the same", "Bubbles turn blue"],
    correct: 1, explanation: "Light intensity decreases with distance, reducing the rate of photochemical photosynthesis.", level: "both"
  },
  {
    id: 93, mockTestId: 11, experimentIndex: 0, module: "Plants",
    title: "Green Pigment",
    question: "What green pigment inside plant cells absorbs sunlight to power photosynthesis?",
    options: ["Hemoglobin", "Chlorophyll", "Melanin", "Keratin"],
    correct: 1, explanation: "Chlorophyll absorbs red and blue light wavelengths while reflecting green light.", level: "both"
  },
  {
    id: 94, mockTestId: 11, experimentIndex: 1, module: "Plants",
    title: "Transpiration Moisture",
    question: "Where did the water droplets inside the clear plastic bag tied around the branch originate?",
    options: ["Rain leaked through the bag", "Water vapor evaporated from leaf stomata pores and condensed on the cool bag", "The plastic generated water", "The branch melted"],
    correct: 1, explanation: "Plants transpire water vapor through stomata, which condenses as liquid droplets on the plastic.", level: "both"
  },
  {
    id: 95, mockTestId: 11, experimentIndex: 1, module: "Plants",
    title: "Transpiration Suction",
    question: "Why do plants evaporate so much water through their leaves every day?",
    options: ["To cool leaf tissues and pull minerals upward from soil via xylem suction", "To cause rainclouds", "Because roots cannot hold water", "To attract birds"],
    correct: 0, explanation: "Transpiration acts like a suction straw, pulling water and soil nutrients upward through the xylem.", level: "both"
  },
  {
    id: 96, mockTestId: 11, experimentIndex: 1, module: "Plants",
    title: "Shade Transpiration",
    question: "Why was there minimal condensation when the plant was kept in deep shade?",
    options: ["The plant dried out", "Cooler temperatures and dim light cause guard cells to close stomata pores", "Shade removes water from leaves", "Plastic cannot hold fog in shade"],
    correct: 1, explanation: "Guard cells close stomatal openings in lower light and cooler temperatures to conserve moisture.", level: "both"
  },
  {
    id: 97, mockTestId: 11, experimentIndex: 2, module: "Plants",
    title: "Auxin Phototropism",
    question: "Why did the growing seedling stem bend toward the light source placed on the side?",
    options: ["Light pulled the stem magnetically", "Plant hormone (auxin) accumulated on the shaded side, causing shaded cells to grow longer", "Sunny side cells expanded faster", "Wind pushed the tip"],
    correct: 1, explanation: "Auxin concentrates on the shaded side, accelerating cell elongation and bending the tip toward light!", level: "both"
  },
  {
    id: 98, mockTestId: 11, experimentIndex: 2, module: "Plants",
    title: "Growth Response Name",
    question: "What is this directional growth of a plant stem in response to light called?",
    options: ["Geotropism", "Phototropism", "Hydrotropism", "Chemotropism"],
    correct: 1, explanation: "Phototropism describes growth orientation toward (positive) or away from (negative) light.", level: "both"
  },
  {
    id: 99, mockTestId: 11, experimentIndex: 2, module: "Plants",
    title: "Gravitropism in Roots",
    question: "Why do plant roots grow downward into dark soil rather than toward the light?",
    options: ["Roots fear the sun", "Positive gravitropism (sensing Earth's gravity downward)", "Roots follow cold air currents", "Roots have no cells"],
    correct: 1, explanation: "Roots exhibit positive gravitropism, sensing gravity to anchor and find water underground.", level: "both"
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
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] text-[#143867] font-bold">Loading...</div>}>
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  
  const initialTestId = (() => {
    const p = searchParams?.get("mockTestId") || searchParams?.get("testId") || searchParams?.get("id");
    const val = parseInt(p || "1", 10);
    return !isNaN(val) && val >= 1 && val <= 11 ? val : 1;
  })();
  const initialActive = (() => {
    const s = searchParams?.get("start") || searchParams?.get("auto");
    return s === "true";
  })();
  const initialExp = (() => {
    const e = searchParams?.get("exp") || searchParams?.get("expIndex");
    const val = parseInt(e || "0", 10);
    return !isNaN(val) && val >= 0 && val <= 2 ? val : 0;
  })();

  const [selectedMockTestId, setSelectedMockTestId] = useState<number>(initialTestId);
  const [difficulty, setDifficulty] = useState<"level1" | "level2">("level1");
  const [activeTest, setActiveTest] = useState(initialActive);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentExpIndex, setCurrentExpIndex] = useState(initialExp);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  
  // Telemetry metric tracking
  const [reversalsCount, setReversalsCount] = useState<number>(2);
  const [sliderAdjustments, setSliderAdjustments] = useState<number>(4);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState<any>({
    distinctStatesReached: 3,
    triggerActivated: false,
    voluntaryExplorationTrials: 2,
    sliderAdjustments: 4,
    reversals: 2,
    totalDwellTime: 45000,
    optionalActions: 1
  });

  const [hoveredExperiment, setHoveredExperiment] = useState<number | null>(null);

  // Sound Engine initial load
  useEffect(() => {
    import('@/utils/webAudio').then(module => {
      module.soundEngine.init();
    }).catch(err => console.log('Audio Engine fallback:', err));
  }, []);

  const handleTelemetryUpdate = useCallback((data: any) => {
    if (!data) return;
    setActiveTelemetry(data);
    if (typeof data.reversals === "number" && data.reversals > 0) {
      setReversalsCount(data.reversals);
    }
    const totalEdits = (data.clickCount || 0) + (data.dragCount || 0);
    if (totalEdits > 0) {
      setSliderAdjustments(totalEdits);
    }
  }, []);

  // Persistence for completed mock tests
  const [completedMockTests, setCompletedMockTests] = useState<Record<number, MockTestResult>>({});
  const [unlockedLevelIndices, setUnlockedLevelIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  useEffect(() => {
    // Fetch unlocked levels from backend
    import('@/app/actions/scoring').then(module => {
      module.getUnlockedLevels().then(res => {
        if (res.success && res.unlockedLevels) {
          setUnlockedLevelIndices(res.unlockedLevels);
        }
      });
    });

    try {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const levelParam = searchParams?.get("level") || urlParams?.get("level");
      const testIdParam = searchParams?.get("mockTestId") || searchParams?.get("testId") || searchParams?.get("id") || urlParams?.get("mockTestId") || urlParams?.get("testId") || urlParams?.get("id");
      const startParam = searchParams?.get("start") || searchParams?.get("auto") || urlParams?.get("start") || urlParams?.get("auto");

      if (levelParam === "level1" || levelParam === "level2") {
        setDifficulty(levelParam);
      }
      if (testIdParam) {
        const parsed = parseInt(testIdParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 11) {
          setSelectedMockTestId(parsed);
          const expParam = searchParams?.get("exp") || searchParams?.get("expIndex") || urlParams?.get("exp") || urlParams?.get("expIndex");
          if (expParam) {
            const expParsed = parseInt(expParam, 10);
            if (!isNaN(expParsed) && expParsed >= 0 && expParsed <= 2) {
              setCurrentExpIndex(expParsed);
            } else {
              setCurrentExpIndex(0);
            }
          } else {
            setCurrentExpIndex(0);
          }
          if (startParam === "true") {
            setActiveTest(true);
          }
        }
      } else {
        setActiveTest(true);
      }

      // Hydrate completed mock tests: Supabase is source of truth, localStorage is fallback/cache
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("curiosity_mock_tests_results");
        if (stored) {
          try {
            setCompletedMockTests(JSON.parse(stored));
          } catch (e) {}
        }
      }

      getMockTestAttempts().then((res) => {
        if (res.success && res.data && Object.keys(res.data).length > 0) {
          setCompletedMockTests((prev) => {
            const merged = { ...prev, ...res.data };
            if (typeof window !== "undefined") {
              localStorage.setItem("curiosity_mock_tests_results", JSON.stringify(merged));
            }
            return merged;
          });
        }
      }).catch((err) => {
        console.warn("Could not sync mock test attempts from Supabase:", err);
      });
    } catch (err) {
      console.error("Error parsing practice URL params:", err);
    }
  }, [searchParams]);

  const activeMockTest = MOCK_TESTS.find((m) => m.id === selectedMockTestId) || MOCK_TESTS[0];

  // Sync reflections from localStorage scoped to test and experiment: reflection_${mockTestId}_${experimentId}
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = `reflection_${selectedMockTestId}_${currentExpIndex}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setReflections((prev) => ({ ...prev, [key]: saved }));
      } else {
        setReflections((prev) => {
          if (prev[key] === undefined) {
            return { ...prev, [key]: "" };
          }
          return prev;
        });
      }
    }
  }, [selectedMockTestId, currentExpIndex]);

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
    // Prepare comprehensive telemetry & attempt payload
    const testTelemetry = {
      mockTestId: selectedMockTestId,
      title: activeMockTest.title,
      score,
      total,
      percentage,
      level: difficulty,
      timeSecs: elapsedSeconds,
      accuracyXP,
      telemetryBonusXP,
      totalXP,
      reversals: reversalsCount,
      sliderAdjustments: sliderAdjustments,
      distinctStatesReached: activeTelemetry.distinctStatesReached || 3,
      triggerActivated: activeTelemetry.triggerActivated || false,
      voluntaryExplorationTrials: activeTelemetry.voluntaryExplorationTrials || 0,
      totalDwellTime: elapsedSeconds * 1000,
      optionalActions: activeTelemetry.optionalActions || 0,
      timestamp: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("curiosity_mock_tests_results", JSON.stringify(updated));

      // Persist rich behavioral telemetry record for CQ profile calculations
      try {
        const historyRaw = localStorage.getItem("curiosity_telemetry_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const filtered = history.filter((h: any) => h.mockTestId !== selectedMockTestId);
        filtered.push(testTelemetry);
        localStorage.setItem("curiosity_telemetry_history", JSON.stringify(filtered));
      } catch (e) {
        console.warn("Failed to persist telemetry history to localStorage:", e);
      }
    }

    setIsSubmitted(true);
    setShowTelemetryModal(true);

    // Persist to Supabase: Exam Submission & Telemetry (Source of Truth)
    try {
      const subRes = await submitMockTestAttempt(
        selectedMockTestId,
        score,
        total,
        testTelemetry
      );
      if (!subRes?.success) {
        console.warn("Supabase test submission note:", subRes?.error);
      }
    } catch (err) {
      console.error("Failed to persist test attempt to Supabase:", err);
    }

    // Award XP to profile backend & local state
    try {
      await addActivityXP(totalXP, `Completed ${activeMockTest.title}`);
    } catch (err) {
      console.error("Failed to persist XP:", err);
    }
  };

  const idealTimeMins = activeMockTest.idealTime[difficulty];

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col font-['Montserrat'] antialiased relative">
      {/* TopAppBar: Impeccable Responsive Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs w-full">
        {/* Tier 1: Primary Navigation Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 py-2 min-h-14 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <Link
              href="/dashboard"
              className="text-[#143867] hover:bg-gray-100 transition-colors p-1.5 sm:p-2 rounded-full active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Go back to dashboard"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[26px]">arrow_back</span>
            </Link>
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#143867] tracking-tight truncate">
              {t.app.practice_lab}
            </h1>
          </div>

          {/* Desktop/Tablet Test Controls (Joined horizontally on md+) */}
          {activeTest && (
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              {/* Ideal Completion Time Badge */}
              <div className="flex items-center gap-1.5 bg-[#eef2f7] border border-[#d1dbe5] px-3 py-1.5 rounded-full text-xs font-bold text-[#143867]">
                <span className="material-symbols-outlined text-sm text-[#ea580c]">timer</span>
                <span>Ideal Time: {idealTimeMins}</span>
              </div>

              {/* Elapsed Timer */}
              <div className="flex items-center gap-1.5 bg-[#fff7ed] border border-[#ffedd5] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-[#ea580c]">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              {/* Pause / Resume Button */}
              {!isSubmitted && (
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-transform duration-100 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isPaused
                      ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                      : "bg-[#143867] hover:bg-[#1e4a85] text-white"
                  }`}
                  aria-label={isPaused ? "Resume Mock Test" : "Pause Mock Test"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isPaused ? "play_arrow" : "pause"}
                  </span>
                  <span>{isPaused ? "Resume" : "Pause Test"}</span>
                </button>
              )}
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {/* Tier 2: Dedicated Mobile Assessment Status Strip (< md) */}
        {activeTest && (
          <div className="md:hidden border-t border-gray-100 bg-slate-50/95 px-3 py-1.5 flex items-center justify-between gap-2 w-full">
            {/* Left: Timing Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 bg-white border border-gray-200/90 px-2 py-1 rounded-full text-[11px] font-bold text-[#143867] shadow-2xs">
                <span className="material-symbols-outlined text-xs text-[#ea580c]">timer</span>
                <span>{idealTimeMins}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#fff7ed] border border-[#fed7aa] px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-[#ea580c] shadow-2xs">
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Right: Pause / Resume Button - Always 100% visible with ample margin */}
            {!isSubmitted && (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-transform duration-100 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 ${
                  isPaused
                    ? "bg-green-600 text-white hover:bg-green-700 animate-pulse"
                    : "bg-[#143867] text-white hover:bg-[#1e4a85]"
                }`}
                aria-label={isPaused ? "Resume Mock Test" : "Pause Mock Test"}
              >
                <span className="material-symbols-outlined text-xs">
                  {isPaused ? "play_arrow" : "pause"}
                </span>
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-32 space-y-6 sm:space-y-8 overflow-x-hidden">
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
                  Agastya Science Experiments
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Interactive Science Mock Tests
                </h2>
                <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                  Play official science experiments for Optics, Gravity, and Chemistry. Exploring and trying new things will earn you extra curiosity points!
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
                    2. Select Science Experiment ({MOCK_TESTS.length} Available)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Play experiments and earn Curiosity Points every time!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {MOCK_TESTS.map((test, index) => {
                  const result = completedMockTests[test.id];
                  const isCompleted = Boolean(result?.completed);
                  const isSelected = selectedMockTestId === test.id;
                  const isLocked = false; // All experiments unlocked for practice

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
                            setCurrentExpIndex(0);
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
                          <span>{isCompleted ? `Play Experiment ${test.id} Again` : `Start Experiment ${test.id}`}</span>
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
                data-testid="launch-mock-test-btn"
                onClick={() => {
                  setActiveTest(true);
                  setCurrentExpIndex(0);
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

            {/* Assessment Header Info: Clean Impeccable Design */}
            <div className="flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#143867] text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeMockTest.title.split(":")[0]}
                </span>
                <span className="text-xs text-gray-600 font-bold hidden xs:inline">
                  {difficulty === "level1" ? "Level 1: Foundation" : "Level 2: Advanced"}
                </span>
              </div>

              {/* Active Module Indicator */}
              <div className="flex items-center gap-1.5 bg-[#fff7ed] border border-[#ffedd5] px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                <span className="text-[11px] sm:text-xs font-bold text-[#ea580c]">
                  {activeMockTest.module} ({mockTestQuestions.length} Qs)
                </span>
              </div>
            </div>

            {/* LIVE EXPERIENTIAL SANDBOX ENGINE */}
            <div className="bg-white p-3.5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ea580c] text-xl">
                    science
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#143867]">
                    Live Interactive Simulation Workspace
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-500">
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
                  onTelemetryUpdate={handleTelemetryUpdate}
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
                    <div className="bg-white border-l-4 border-[#ea580c] p-4 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white tracking-wide">
                            Experiment {currentExpIndex + 1} of 3 • Real-Life Questions
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-[#143867] mt-1.5">
                            Questions for {EXPERIMENT_LABELS[selectedMockTestId]?.[currentExpIndex] || `Experiment ${currentExpIndex + 1}`}
                          </h3>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            Try adjusting the simulation above to see how things react, then pick your answer!
                          </p>
                        </div>
                        {isSubmitted && (
                          <span className="text-xs sm:text-sm font-bold text-[#143867] bg-[#eef2f7] px-3 py-1 rounded-full border border-[#d1dbe5]">
                            Score: {calculateScore()} / {mockTestQuestions.length} Correct
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {currentExperimentQuestions.map((q, idx) => {
                        const selectedIdx = selectedAnswers[q.id];
                        const isCorrect = selectedIdx === q.correct;

                        return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-2xl p-4 sm:p-6 border-2 transition-all shadow-2xs space-y-3.5 ${
                        isSubmitted
                          ? isCorrect
                            ? "border-green-400 bg-green-50/20"
                            : "border-red-300 bg-red-50/20"
                          : selectedIdx !== undefined
                          ? "border-[#143867] bg-indigo-50/10 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 bg-[#143867] text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            Q{idx + 1}
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                            {q.title}
                          </span>
                        </div>
                        {isSubmitted && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isCorrect
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
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

                      {/* Options with Letter Badges and Tactile Press */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((option, oIdx) => {
                          const isSelected = selectedIdx === oIdx;
                          const letter = String.fromCharCode(65 + oIdx);
                          let optionStyle =
                            "bg-gray-50/80 border-gray-200 text-gray-800 hover:bg-gray-100 hover:border-gray-300";

                          if (isSubmitted) {
                            if (oIdx === q.correct) {
                              optionStyle =
                                "bg-green-600 text-white font-bold border-green-700 shadow-sm";
                            } else if (isSelected && !isCorrect) {
                              optionStyle =
                                "bg-red-500 text-white font-bold border-red-600";
                            } else {
                              optionStyle = "bg-gray-100 text-gray-400 border-gray-200";
                            }
                          } else if (isSelected) {
                            optionStyle =
                              "bg-[#143867] text-white font-bold border-[#143867] shadow-sm";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, oIdx)}
                              disabled={isSubmitted}
                              className={`p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-transform duration-100 active:scale-[0.98] flex items-center justify-between gap-2.5 cursor-pointer min-h-[44px] ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isSelected || (isSubmitted && oIdx === q.correct)
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}>
                                  {letter}
                                </span>
                                <span className="leading-snug">{option}</span>
                              </div>
                              {isSelected && !isSubmitted && (
                                <span className="material-symbols-outlined text-sm shrink-0">
                                  check
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Post-Submit Explanation */}
                      {isSubmitted && (
                        <div className="mt-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
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

              {/* Stationary Quick Scientist's Thought Card with Scoped Storage and Sonner Toast Feedback */}
              {(() => {
                const currentReflectionKey = `reflection_${selectedMockTestId}_${currentExpIndex}`;
                const currentReflectionValue = reflections[currentReflectionKey] ?? "";

                return (
                  <div className="bg-amber-50/60 border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3 mt-6">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="text-xl shrink-0">💡</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                          Quick Scientist&apos;s Thought (Optional)
                        </h4>
                        <p className="text-[11px] sm:text-xs text-amber-900/80">
                          In one sentence, what surprised you or what else would you test?
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="scientist-thought-input"
                        type="text"
                        placeholder="e.g. In a pitch dark room, even low brightness strained my eyes..."
                        value={currentReflectionValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReflections((prev) => ({ ...prev, [currentReflectionKey]: val }));
                          if (typeof window !== "undefined") {
                            localStorage.setItem(currentReflectionKey, val);
                          }
                        }}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                      <button
                        type="button"
                        id="save-thought-btn"
                        onClick={() => {
                          const text = reflections[currentReflectionKey] || "";
                          if (text && text.trim()) {
                            if (typeof window !== "undefined") {
                              localStorage.setItem(currentReflectionKey, text.trim());
                            }
                            toast.success("Scientist's thought saved!", {
                              description: "Recorded in your science reflection log.",
                              duration: 2500,
                            });
                          } else {
                            toast.info("Feel free to jot down a one-sentence thought anytime!", {
                              duration: 2000,
                            });
                          }
                        }}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 active:scale-95 cursor-pointer"
                      >
                        Save Thought
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Ambient Experiment Stepper Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  disabled={currentExpIndex === 0}
                  onClick={() => {
                    if (currentExpIndex > 0) {
                      const nextIdx = currentExpIndex - 1;
                      setCurrentExpIndex(nextIdx);
                      toast.info(`Switched to Experiment ${nextIdx + 1}`, { duration: 1500 });
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold text-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous Experiment</span>
                </button>

                {currentExpIndex < 2 ? (
                  <button
                    type="button"
                    data-testid="next-experiment-btn"
                    onClick={() => {
                      const nextIdx = currentExpIndex + 1;
                      setCurrentExpIndex(nextIdx);
                      toast.info(`Switched to Experiment ${nextIdx + 1}`, { duration: 1500 });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#143867] hover:bg-[#1e4a85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Next: Experiment {currentExpIndex + 2}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="submit-test-btn"
                    onClick={handleSubmitTest}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Finish & Submit Test</span>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </button>
                )}
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
                  <span>Go back to Experiments</span>
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitTest}
                    className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    <span>Finish Experiment</span>
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