"""
=========================================================
AegisSight AI

Shared Data Models

Author: Joshika Parijat
=========================================================
"""

from dataclasses import dataclass, field
from typing import List, Optional
import numpy as np


# --------------------------------------------------------
# Bounding Box
# --------------------------------------------------------

@dataclass
class BoundingBox:
    x1: int
    y1: int
    x2: int
    y2: int

    @property
    def width(self):
        return self.x2 - self.x1

    @property
    def height(self):
        return self.y2 - self.y1

    @property
    def center(self):
        return (
            int((self.x1 + self.x2) / 2),
            int((self.y1 + self.y2) / 2),
        )


# --------------------------------------------------------
# Vehicle Detection
# --------------------------------------------------------

@dataclass
class Detection:
    """
    Represents one detected vehicle.
    """

    bbox: BoundingBox

    confidence: float

    class_id: int

    class_name: str

    frame_id: int | None = None

    track_id: int | None = None


# --------------------------------------------------------
# Vehicle Crop
# --------------------------------------------------------
@dataclass
class VehicleCrop:

    image: np.ndarray

    detection: Detection


# --------------------------------------------------------
# Feature Embedding
# --------------------------------------------------------

@dataclass
class FeatureEmbedding:

    vector: np.ndarray

    detection: Detection

    model_name: str


# --------------------------------------------------------
# Cross View Match
# --------------------------------------------------------

@dataclass
class CrossViewMatch:

    cctv_track_id: int

    drone_track_id: int

    similarity: float

    matched: bool


# --------------------------------------------------------
# Tracking State
# --------------------------------------------------------

@dataclass
class TrackState:

    track_id: int

    bbox: BoundingBox

    confidence: float

    velocity: Optional[np.ndarray] = None

    age: int = 0

    lost: bool = False


# --------------------------------------------------------
# Predicted Position
# --------------------------------------------------------

@dataclass
class PredictedPosition:

    x: float

    y: float

    timestamp: float


# --------------------------------------------------------
# Navigation Waypoint
# --------------------------------------------------------

@dataclass
class Waypoint:

    latitude: float

    longitude: float

    altitude: float


# --------------------------------------------------------
# Drone Route
# --------------------------------------------------------

@dataclass
class DroneRoute:

    vehicle_id: int

    waypoints: List[Waypoint] = field(default_factory=list)


# --------------------------------------------------------
# AI Output
# --------------------------------------------------------

@dataclass
class AIResult:

    detections: List[Detection]

    matches: List[CrossViewMatch]

    routes: List[DroneRoute]
    

# ---------------------------------------------------------
# Feature index record and search result
# ---------------------------------------------------------


@dataclass
class FeatureRecord:
    """Represents one indexed vehicle feature."""

    vehicle_id: str
    camera_id: str
    timestamp: float
    embedding: np.ndarray
    confidence: float = 1.0
    frame_id: Optional[int] = None
    bbox: Optional[tuple] = None  # (x1, y1, x2, y2)


@dataclass
class MatchResult:
    """Represents one similarity search result."""

    record: FeatureRecord
    score: float
