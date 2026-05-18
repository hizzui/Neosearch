# Neosearch 🎵

An interactive, data-driven music discovery engine that leverages force-directed graph simulations to map organic relationships between musical genres and artists, featuring real-time audio exploration.

## 🚀 Key Features

- **Force-Directed Graph Simulation:** Real-time physics engine (drag, zoom, pan) built with D3.js to visualize complex genre connections.
- **Integrated Audio Player:** Advanced interactive player with audio controls to preview tracks on the fly.
- **Custom Cache Management:** Optimized backend data fetching layer to handle external API rate limits and reduce endpoint latency.
- **Neo-Brutalist Responsive UI:** A bold, modern interface optimized for all screen sizes.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, D3.js, Tailwind CSS
- **Backend:** Python, FastAPI, Deezer API, Memory Cache Manager
- **Deployment:** Vercel (Frontend), Railway (Backend)

---

## 📐 Architecture Overview

The system is split into a decoupled full-stack architecture:
1. **Backend (FastAPI):** Acts as a high-performance REST API. It handles incoming requests, queries the Deezer API pipeline, processes audio metadata, and aggregates relational node data through an optimized in-memory cache layer.
2. **Frontend (React 19 & TypeScript):** Manages interactive UI states and feeds structured JSON data into the D3.js simulation engine to compute particle collisions and Coulomb repulsion forces in real-time.

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/rycarvalho/neosearch.git](https://github.com/rycarvalho/neosearch.git)
   cd neosearch
