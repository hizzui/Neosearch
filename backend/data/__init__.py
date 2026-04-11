"""
Genre data loader - uses JSON from Spotify seeding or falls back to defaults
"""
import json
import os
from pathlib import Path

# Default fallback data (used if JSON not yet seeded)
DEFAULT_GENRES_DATA = [
    {
        "id": "0",
        "name": "Synthwave",
        "popularity": 8,
        "connections": ["1", "3", "5", "7"],
        "artists": []
    },
    {
        "id": "1",
        "name": "Vaporwave",
        "popularity": 7,
        "connections": ["0", "2", "4", "6"],
        "artists": []
    },
    {
        "id": "2",
        "name": "Darkwave",
        "popularity": 6,
        "connections": ["1", "3", "5", "8"],
        "artists": []
    },
    {
        "id": "3",
        "name": "Industrial",
        "popularity": 7,
        "connections": ["0", "2", "4", "9"],
        "artists": []
    },
    {
        "id": "4",
        "name": "Glitch",
        "popularity": 6,
        "connections": ["1", "3", "5", "10"],
        "artists": []
    },
    {
        "id": "5",
        "name": "Cyberpunk",
        "popularity": 8,
        "connections": ["0", "2", "4", "6", "11"],
        "artists": []
    },
    {
        "id": "6",
        "name": "Chillwave",
        "popularity": 7,
        "connections": ["1", "5", "7", "12"],
        "artists": []
    },
    {
        "id": "7",
        "name": "Techno",
        "popularity": 8,
        "connections": ["0", "3", "6", "8", "13"],
        "artists": []
    },
    {
        "id": "8",
        "name": "Acid House",
        "popularity": 6,
        "connections": ["2", "3", "7", "9", "14"],
        "artists": []
    },
    {
        "id": "9",
        "name": "EBM",
        "popularity": 5,
        "connections": ["3", "8", "10", "15"],
        "artists": []
    },
    {
        "id": "10",
        "name": "Harsh Noise",
        "popularity": 4,
        "connections": ["4", "9", "11"],
        "artists": []
    },
    {
        "id": "11",
        "name": "Ambient",
        "popularity": 7,
        "connections": ["5", "6", "10", "12"],
        "artists": []
    },
    {
        "id": "12",
        "name": "Drone",
        "popularity": 5,
        "connections": ["6", "11", "13"],
        "artists": []
    },
    {
        "id": "13",
        "name": "Minimal",
        "popularity": 6,
        "connections": ["7", "12", "14"],
        "artists": []
    },
    {
        "id": "14",
        "name": "Post-Punk",
        "popularity": 7,
        "connections": ["8", "13", "15"],
        "artists": []
    },
    {
        "id": "15",
        "name": "Noise Rock",
        "popularity": 5,
        "connections": ["9", "14"],
        "artists": []
    }
]

def _load_genres_data():
    """Load genres from JSON file or use defaults"""
    json_path = Path(__file__).parent / "genres.json"
    
    if json_path.exists():
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"[OK] Loaded {len(data)} genres from {json_path}")
                return data
        except Exception as e:
            print(f"[WARN] Error loading JSON: {e}, using defaults")
            return DEFAULT_GENRES_DATA
    else:
        print(f"[INFO] No genres.json found, using default data")
        print(f"[INFO] Run 'python data_seed.py' to fetch real Spotify genres")
        return DEFAULT_GENRES_DATA

# Load genre data
GENRES_DATA = _load_genres_data()

# Helper functions
def get_genre(genre_id: str):
    """Get single genre by ID"""
    for genre in GENRES_DATA:
        if genre["id"] == genre_id:
            return genre
    return None

def get_all_genres():
    """Get all genres"""
    return GENRES_DATA

def find_genre_by_name(name: str):
    """Find genre by name (case-insensitive)"""
    name_lower = name.lower()
    for genre in GENRES_DATA:
        if genre["name"].lower() == name_lower:
            return genre
    return None
