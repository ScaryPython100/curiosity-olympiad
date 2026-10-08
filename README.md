# Agastya Curiosity Olympiad 🚀🌿

> *“Curiosity, Creativity, and Confidence under Care”*

The **Agastya Curiosity Olympiad** is an interactive, gamified science learning platform built for students across India. Designed around the Agastya International Foundation’s core philosophy, the platform turns science education from passive memorization into active, hands-on exploration.

We built this project to make science playful, accessible, and deeply engaging on any device, from school desktops to budget smartphones in rural classrooms.

---

## 🌟 What’s Inside the Platform?

### 1. 🚌 The Agastya “Mobile Science Van” Progress Highway
* **Interactive Kuppam Campus Map:** Instead of generic progress bars, students drive an animated Agastya Yellow Mobile Science Van along a winding S-curve road across a lush evergreen forest landscape.
* **11 Campus Landmarks (0 to 10,000 XP):** As students earn XP in labs, their van travels from *Campus Entrance* -> *Art & Ecology Center* -> *Robotics Lab* -> *Discovery Center* -> *Planetarium* all the way to *VisionWorks*.
* **Interactive Honk & Trivia:** Clicking landmarks pops up real-world trivia about the Kuppam Creative Campus, and students can click “Honk Van! 🎺” for audio feedback.

### 2. 🏆 Leaderboards & Verified Merit Certificates
* **Official Daily & Weekly Leaderboards:** Competitive live standings with podium highlights and badges.
* **Rank #1 Agastya Verified Certificates:** To protect fairness, official downloadable Merit Certificates are only accessible to the undisputed #1 Rank Holder of each Daily or Weekly cycle after the cycle officially concludes at midnight.
* **Friends Leaderboard:** A relaxed, social leaderboard tab where certificates are hidden so friendly competition among peers stays casual and pressure-free.

### 3. 🧪 Practice Labs & Mock Tests
* **Interactive Science Modules:** H5P-inspired interactive assessments, hypothesis testing, and conceptual challenges that build analytical confidence.
* **XP Rewards & Badges:** Consistent experimentation awards badges (Rising Genius, Logic Master) and boosts student levels.

---

## 🛠 Tech Stack & Architecture

This project is built using modern web development tools to ensure performance, maintainability, and scalability.

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** Vanilla Tailwind CSS with custom SVG illustrations and responsive fluid layouts
* **Database & Auth:** [Supabase](https://supabase.com/) (Postgres, Row Level Security, Realtime tables)
* **Build System:** Optimized static and dynamic route generation.

---

## 🎨 Design Notes

* **Zero Corporate Fluff:** Designed with warm, vibrant colors (`#ffe16d` Agastya yellow, `#143867` deep blue, `#f37021` vibrant orange, and lush emerald greens) that feel inviting and child-friendly.
* **Mobile-First & Lightweight:** Free of heavy 3D canvas libraries so pages load instantly on standard mobile connections, ensuring accessibility in low-bandwidth areas.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v20+ recommended)
* npm (v10+ recommended)
* Supabase Account (for Database and Auth)

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/your-username/curiosity-olympiad.git
   cd curiosity-olympiad
   ```

2. **Install NPM packages**
   ```sh
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: Ensure your Supabase instance has the necessary tables and RLS policies configured as per the project requirements.*

4. **Start the development server**
   ```sh
   npm run dev
   ```

5. **Open the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
