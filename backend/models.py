from pydantic import BaseModel
from typing import List, Optional

class GenreRelationship(BaseModel):
    source_id: str
    target_id: str
    strength: float = 1.0

class Genre(BaseModel):
    id: str
    name: str
    popularity: int
    connections: List[str]
    
class GenreResponse(Genre):
    """Genre data for API responses"""
    pass

class GraphNode(BaseModel):
    """Force-directed graph node"""
    id: str
    name: str
    popularity: int
    x: Optional[float] = None
    y: Optional[float] = None
    
class GraphLink(BaseModel):
    """Connection between genres"""
    source: str
    target: str
    strength: float = 1.0

class GraphData(BaseModel):
    """Complete graph data"""
    nodes: List[GraphNode]
    links: List[GraphLink]

class AudioMix(BaseModel):
    """Audio mix for a genre"""
    genre_id: str
    genre_name: str
    url: str
    duration: int
    tracks: List[str]
