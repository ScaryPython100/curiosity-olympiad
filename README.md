# Agastya Curiosity Olympiad 🚀🌿

The **Agastya Curiosity Olympiad** is an interactive, gamified science learning platform built for students across India. Designed around Agastya International Foundation's core philosophy—**"Curiosity, Creativity, and Confidence under Care"**—the platform turns science education from passive memorization into active, hands-on exploration.

We built this project to make science playful, accessible, and deeply engaging on any device, from school desktops to budget smartphones in rural classrooms.

---

## What's Inside the Platform?

### 1. 🔬 The Curiosity Journal & DIY Home Lab
* **Daily "Why?" Notebook**: True science starts with asking questions. Students log their daily hypotheses and observations in an interactive field notebook.
* **Community Curiosity Wall**: Scholars can read and applaud fascinating questions shared by peers across schools and campuses.
* **DIY "Trash-to-Treasure" Experiments**: A zero-cost science kit where students check off items they have at home (like a plastic bottle, balloon, straw, or leaf) and get step-by-step instructions for classic Agastya hands-on experiments (e.g., *Balloon-Powered Bottle Cars*, *Cartesian Divers*, and *Leaf Chromatography*).

### 2. 🚌 The Agastya "Mobile Science Van" Progress Highway
* **Interactive Kuppam Campus Map**: Instead of generic progress bars, students drive an animated Agastya Yellow Mobile Science Van along a winding S-curve road across a lush evergreen forest landscape.
* **11 Campus Landmarks (0 to 10,000 XP)**: As students earn XP in labs, their van travels from *Campus Entrance* -> *Art & Ecology Center* -> *Robotics Lab* -> *Discovery Center* -> *Planetarium* all the way to *VisionWorks*.
* **Interactive Honk & Trivia**: Clicking landmarks pops up real-world trivia about the Kuppam Creative Campus, and students can click **"Honk Van! 🎺"** for audio feedback.

### 3. 🏆 Leaderboards & Verified Merit Certificates
* **Official Daily & Weekly Leaderboards**: Competitive live standings with podium highlights and badges.
* **Rank #1 Verified Certificates**: To protect fairness, official downloadable Merit Certificates are only accessible to the undisputed **#1 Rank Holder** of each Daily or Weekly cycle after the cycle officially concludes at midnight.
* **Friends Leaderboard**: A relaxed, social leaderboard tab where certificates are hidden so friendly competition among peers stays casual and pressure-free.

### 4. 🧪 Practice Labs & Mock Tests
* **Interactive Science Modules**: H5P-inspired interactive assessments, hypothesis testing, and conceptual challenges that build analytical confidence.
* **XP Rewards & Badges**: Consistent experimentation awards badges (*Rising Genius*, *Logic Master*) and boosts student levels.

---

## Tech Stack & Architecture

* **Framework**: Next.js 16 (App Router, Server Actions, TypeScript)
* **Styling**: Vanilla Tailwind CSS with custom SVG illustrations and responsive fluid layouts
* **Database & Auth**: Supabase (Postgres, Row Level Security, Realtime tables)
* **Build System**: Optimized static and dynamic route generation

---

## Getting Started Locally

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your environment variables**:
   Create a `.env.local` file with your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Verify production build**:
   ```bash
   npm run build
   ```

---

## Design Notes

* **Zero Corporate Fluff**: Designed with warm, vibrant colors (#ffe16d Agastya yellow, #143867 deep blue, #f37021 vibrant orange, and lush emerald greens) that feel inviting and child-friendly.
* **Mobile-First & Lightweight**: Free of heavy 3D canvas libraries so pages load instantly on standard mobile connections.
