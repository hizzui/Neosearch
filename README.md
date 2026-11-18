# Neosearch

A music genre discovery tool written in **Python** that maps relationships between 16 electronic and underground genres using a spring-force graph layout and streams 30-second track previews via the public **Deezer API**.

Includes an interactive **Streamlit + Plotly** frontend (`app.py`) and a **FastAPI** REST service (`api.py`) backed by a 30-minute in-memory TTL cache.

---

## Project Structure

```text
Neosearch/
├── data/
│   └── genres.json          # 16 genre nodes, popularity ratings, and adjacency links
├── neosearch/
│   ├── __init__.py
│   ├── cache.py             # In-memory TTL cache (30m) to avoid redundant API calls
│   ├── deezer.py            # Public Deezer search client + offline fallback tracks
│   └── graph.py             # Fruchterman-Reingold spring layout solver & Plotly graph builder
├── api.py                   # FastAPI endpoints (/api/genres, /api/graph, /api/genre/{id}/tracks)
├── app.py                   # Streamlit graph explorer and built-in MP3 preview player
└── requirements.txt
```

---

## How It Works

1. **Force-Directed Layout (`neosearch/graph.py`)**: Computes 2D coordinates for the genre adjacency network using a deterministic Fruchterman-Reingold spring simulation in pure Python and renders the graph with Plotly.
2. **Audio Previews (`neosearch/deezer.py`)**: Queries `https://api.deezer.com/search` (no OAuth token required) to retrieve track metadata and 30-second MP3 preview streams, falling back to offline sample streams if the network is unavailable.
3. **TTL Caching (`neosearch/cache.py`)**: Stores fetched track lists in memory for 30 minutes per genre so switching back and forth between nodes is instantaneous.

---

## Running Locally

1. **Clone the repository and create a virtual environment:**
   ```bash
   git clone https://github.com/hizzui/Neosearch.git
   cd Neosearch
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux / macOS:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Streamlit interface:**
   ```bash
   streamlit run app.py
   ```

4. **(Optional) Run the FastAPI service:**
   ```bash
   uvicorn api:app --reload --port 8000
   ```
