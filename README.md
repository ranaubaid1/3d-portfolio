# 🌌 Ubaid Abid — Interactive 3D Developer Portfolio
 
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
 
A state-of-the-art, fully interactive 3D WebGL developer portfolio built with **Three.js**, **vanilla JavaScript**, and premium **CSS glassmorphism** layouts — combining real-time 3D rendering with a responsive, modern interface.
 
---
 
## 📑 Table of Contents
 
- [Live Demo](#-live-demo)
- [Visual Highlights](#-visual-highlights)
- [Tech Stack](#️-tech-stack)
- [Local Setup & Development](#-local-setup--development)
- [Project Structure](#-project-structure)
- [Browser Compatibility](#-browser-compatibility)
- [Roadmap](#-roadmap)
- [Connect With Me](#-connect-with-me)
- [License](#-license)
---
 
## 🔗 Live Demo
 
🌐 **[View Live Portfolio](#)** *(add your deployed URL here)*
 
---
 
## ✨ Visual Highlights
 
- **3D Robot Companion** — A floating 3D model that tracks pointer movement (mouse or touch) and reacts to clicks with gravity-based jumps and velocity-driven spins.
- **Orbiting Specular Light Spotlights** — Dual point lights (cyan & magenta) orbit the robot model, casting dynamic colored reflections across its metallic surface.
- **3D Glass Card Tilt Effect** — Glassmorphic panels containing biography details and project lists that pitch and tilt in 3D space relative to cursor position.
- **Voice-Over Text-to-Speech** — Native browser speech synthesis automatically narrates card details when navigating between sections.
- **WebGL Starfield Galaxy** — A background of 2,000 particles slowly orbiting to create an immersive galaxy effect.
- **Fully Responsive Layout** — Fluid CSS typography (`clamp()`) and flexible column layouts that scale seamlessly down to mobile and touch devices.
---
 
## 🛠️ Tech Stack
 
| Category               | Technology                          |
|--------------------------|--------------------------------------|
| Graphics & 3D Rendering  | Three.js (WebGL)                     |
| Frontend & Styling       | HTML5, CSS3, JavaScript (ES6 Modules)|
| Animations               | Custom typing-effect scripts         |
| Local Dev Server         | Node.js & Express.js                 |
 
---
 
## 💻 Local Setup & Development
 
### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (included with Node.js)
- A modern browser with WebGL support
### 1. Clone the repository
```bash
git clone https://github.com/ranaubaid1/3d-portfolio.git
cd 3d-portfolio
```
 
### 2. Install dependencies
```bash
npm install
```
 
### 3. Start the local server
```bash
node server.js
```
 
### 4. Open in browser
Navigate to [http://localhost:3000](http://localhost:3000) to view the interactive portfolio.
 
---
 
## 📂 Project Structure
 
```
├── assets/              # 3D models (robot.glb), CV, profile/project images
├── css/                 # Glassmorphism styles and responsive layouts
├── javascript/          # Three.js scene, lighting, main and cursor scripts
├── server.js            # Express local development server
├── package.json         # Project dependencies and scripts
├── package-lock.json    # Locks package versions
└── index.html           # Application entry point
```
 
---
 
## 🌐 Browser Compatibility
 
This portfolio relies on WebGL and the Web Speech API. For the best experience, use an up-to-date version of:
 
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari (partial Web Speech API support)
> ⚠️ Voice narration and 3D rendering performance may vary on lower-end mobile devices.
 
---
 
## 🗺️ Roadmap
 
- [ ] Add dark/light theme toggle
- [ ] Optimize 3D asset loading for slower connections
- [ ] Add project filtering by technology
- [ ] Deploy with a custom domain

---

## 📫 Connect With Me

- **Email**: [ranaubaid934@gmail.com](mailto:ranaubaid934@gmail.com)
- **LinkedIn**: [Rana Ubaid](https://www.linkedin.com/in/rana-ubaid-53013a294/)
- **Instagram**: [@ubaid_rana_1](https://instagram.com/ubaid_rana_1)

---

## 📄 License

This project is licensed under the MIT License.
