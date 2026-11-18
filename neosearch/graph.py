"""
Genre network loading, spring-force coordinate calculation, and Plotly graph rendering.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import plotly.graph_objects as go

BASE_DIR = Path(__file__).resolve().parent.parent
GENRES_PATH = BASE_DIR / "data" / "genres.json"


def load_genres(path: Path = GENRES_PATH) -> List[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def get_genre_map(path: Path = GENRES_PATH) -> Dict[str, Dict[str, Any]]:
    return {g["id"]: g for g in load_genres(path)}


def build_edges(genres: List[Dict[str, Any]]) -> List[Tuple[str, str]]:
    seen = set()
    edges: List[Tuple[str, str]] = []
    for genre in genres:
        src = genre["id"]
        for dst in genre.get("connections", []):
            pair = tuple(sorted((src, dst)))
            if pair not in seen:
                seen.add(pair)
                edges.append((src, dst))
    return edges


def compute_force_layout(
    genres: List[Dict[str, Any]],
    iterations: int = 80,
) -> Dict[str, Tuple[float, float]]:
    """
    Compute 2D node positions using a deterministic Fruchterman-Reingold spring layout
    initialized on a unit circle.
    """
    n = len(genres)
    if n == 0:
        return {}

    ids = [g["id"] for g in genres]
    edges = build_edges(genres)

    # Start nodes evenly around a circle
    pos: Dict[str, List[float]] = {}
    for idx, gid in enumerate(ids):
        angle = (2.0 * math.pi * idx) / n
        pos[gid] = [math.cos(angle), math.sin(angle)]

    k = math.sqrt(4.0 / n)
    temp = 0.35

    for _ in range(iterations):
        disp = {gid: [0.0, 0.0] for gid in ids}

        # Repulsive forces between all node pairs
        for i in range(n):
            u = ids[i]
            for j in range(i + 1, n):
                v = ids[j]
                dx = pos[u][0] - pos[v][0]
                dy = pos[u][1] - pos[v][1]
                dist = max(0.05, math.hypot(dx, dy))
                force = (k * k) / dist
                ux, uy = (dx / dist) * force, (dy / dist) * force
                disp[u][0] += ux
                disp[u][1] += uy
                disp[v][0] -= ux
                disp[v][1] -= uy

        # Attractive forces along connected genre edges
        for u, v in edges:
            if u not in pos or v not in pos:
                continue
            dx = pos[u][0] - pos[v][0]
            dy = pos[u][1] - pos[v][1]
            dist = max(0.05, math.hypot(dx, dy))
            force = (dist * dist) / k
            ux, uy = (dx / dist) * force, (dy / dist) * force
            disp[u][0] -= ux
            disp[u][1] -= uy
            disp[v][0] += ux
            disp[v][1] += uy

        # Apply bounded displacement
        for gid in ids:
            dx, dy = disp[gid]
            dist = max(0.01, math.hypot(dx, dy))
            step = min(dist, temp)
            pos[gid][0] += (dx / dist) * step
            pos[gid][1] += (dy / dist) * step

        temp *= 0.94

    return {gid: (round(coords[0], 4), round(coords[1], 4)) for gid, coords in pos.items()}


def build_plotly_graph(
    genres: List[Dict[str, Any]],
    selected_id: Optional[str] = None,
) -> go.Figure:
    """Render an interactive dark-themed Plotly network graph of genre relationships."""
    coords = compute_force_layout(genres)
    edges = build_edges(genres)
    genre_map = {g["id"]: g for g in genres}
    selected_neighbors = set(genre_map.get(selected_id, {}).get("connections", []))

    edge_x: List[Optional[float]] = []
    edge_y: List[Optional[float]] = []
    highlight_x: List[Optional[float]] = []
    highlight_y: List[Optional[float]] = []

    for u, v in edges:
        if u not in coords or v not in coords:
            continue
        x0, y0 = coords[u]
        x1, y1 = coords[v]
        if selected_id in (u, v):
            highlight_x.extend([x0, x1, None])
            highlight_y.extend([y0, y1, None])
        else:
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])

    fig = go.Figure()

    # Background edges
    fig.add_trace(
        go.Scatter(
            x=edge_x,
            y=edge_y,
            mode="lines",
            line=dict(width=1.2, color="#334155"),
            hoverinfo="none",
            showlegend=False,
        )
    )

    # Highlighted edges connected to active genre
    if highlight_x:
        fig.add_trace(
            go.Scatter(
                x=highlight_x,
                y=highlight_y,
                mode="lines",
                line=dict(width=2.6, color="#FACC15"),
                hoverinfo="none",
                showlegend=False,
            )
        )

    node_x, node_y, node_text, node_hover, node_colors, node_sizes = [], [], [], [], [], []
    for g in genres:
        gid = g["id"]
        x, y = coords[gid]
        node_x.append(x)
        node_y.append(y)
        node_text.append(g["name"])

        degree = len(g.get("connections", []))
        node_hover.append(
            f"<b>{g['name']}</b><br>Popularity: {g['popularity']}/10<br>Connections: {degree}"
        )
        node_sizes.append(18 + g["popularity"] * 3)

        if gid == selected_id:
            node_colors.append("#FACC15")  # Active node (Yellow)
        elif gid in selected_neighbors:
            node_colors.append("#38BDF8")  # Direct neighbor (Cyan)
        else:
            node_colors.append("#A855F7")  # Standard node (Purple)

    fig.add_trace(
        go.Scatter(
            x=node_x,
            y=node_y,
            mode="markers+text",
            text=node_text,
            textposition="top center",
            textfont=dict(size=12, color="#F8FAFC"),
            hovertext=node_hover,
            hoverinfo="text",
            marker=dict(
                size=node_sizes,
                color=node_colors,
                line=dict(width=2, color="#0F172A"),
            ),
            showlegend=False,
        )
    )

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#090D16",
        plot_bgcolor="#090D16",
        height=500,
        margin=dict(l=16, r=16, t=16, b=16),
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    )
    return fig
