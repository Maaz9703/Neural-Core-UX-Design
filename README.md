# 🧠 Neural Core: Pro-Grade Botanical Lab

A high-fidelity, gesture-controlled 3D laboratory environment built with React, Three.js, and MediaPipe.

## 🚀 Live Demo
**Production URL**: [https://neural-core-ux-design.vercel.app](https://neural-core-ux-design.vercel.app)

---

## 🎮 Spatial Command Guide
This project uses **Neural Hand Tracking** to provide 100% manual control over 3D assets.

| Action | Gesture | Visual Feedback |
| :--- | :--- | :--- |
| **Rotate** | Pinch Thumb + Index (1 Hand) | **Pink Tracking Dots** |
| **Zoom** | Pinch Thumb + Index (2 Hands) | **Pink Tracking Dots** |
| **Elevate (Up/Down)** | Pinch Thumb + Index + Middle | **Gold Tracking Dots** |
| **Command Confirmed** | Active Interaction | **Model Glows Cyan** |

---

## 🛠️ Key Technologies
- **3D Engine**: Three.js / React-Three-Fiber
- **Interaction**: MediaPipe Hand Landmarker (V2)
- **State Engine**: Neural "Nerve Link" (Zero-Latency Ref Sync)
- **Multi-File Loader**: Smart Loading Manager for complex Blender exports (GLTF + BIN + Textures).
- **Aesthetics**: Glassmorphism UI with Framer Motion.

## 📁 Multi-File Support
The lab supports uploading complex Blender projects. When using the "Upload Model" feature, select **ALL** files in your export folder (e.g., `model.gltf`, `model.bin`, and all texture images) to ensure a complete render.

## 🛠️ Installation
```bash
npm install
npm run dev
```

## 📜 License
MIT License. Created by Maaz.
