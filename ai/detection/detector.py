"""
=========================================================
AegisSight AI
Vehicle Detection Module

Author: Joshika Parijat

Description:
    Production-ready YOLO11 Vehicle Detector
    with ByteTrack support.
=========================================================
"""

from typing import List
import os

import cv2
from ultralytics import YOLO

from ai.configs.config_loader import ConfigLoader
from ai.core.models import BoundingBox, Detection
from ai.utils.device import get_device
from ai.utils.logger import get_logger


class VehicleDetector:
    """
    Vehicle Detection + Tracking using YOLO11.
    """

    VEHICLE_CLASSES = {
        "car",
        "truck",
        "bus",
        "motorcycle",
        "bicycle",
    }

    def __init__(self):

        self.logger = get_logger("VehicleDetector")

        self.config = ConfigLoader()

        self.device = get_device()

        self.model_name = os.getenv(
            "AEGIS_YOLO_MODEL",
            self.config.get("detector", "model"),
        )

        self.confidence = self.config.get(
            "detector",
            "confidence"
        )

        self.iou = self.config.get(
            "detector",
            "iou"
        )

        self.max_det = self.config.get(
            "detector",
            "max_detections"
        )

        self.logger.info(
            f"Loading YOLO model: {self.model_name}"
        )

        self.model = YOLO(self.model_name)

        self.logger.info(
            f"Running on device: {self.device}"
        )

    def detect(
        self,
        frame,
        frame_id=None,
    ) -> List[Detection]:

        results = self.model.predict(
            source=frame,
            conf=self.confidence,
            iou=self.iou,
            max_det=self.max_det,
            device=self.device,
            verbose=False,
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(box.cls.item())

                class_name = self.model.names[class_id]

                if class_name not in self.VEHICLE_CLASSES:
                    continue

                confidence = float(box.conf.item())

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist(),
                )

                detections.append(

                    Detection(

                        bbox=BoundingBox(
                            x1=x1,
                            y1=y1,
                            x2=x2,
                            y2=y2,
                        ),

                        confidence=confidence,

                        class_id=class_id,

                        class_name=class_name,

                        frame_id=frame_id,

                    )

                )

        self.logger.info(
            f"{len(detections)} vehicle(s) detected."
        )

        return detections

    def track(
        self,
        frame,
        frame_id=None,
        persist=True,
    ) -> List[Detection]:

        """
        Detect and track vehicles using
        YOLO11 + ByteTrack.
        """

        results = self.model.track(
            source=frame,
            conf=self.confidence,
            iou=self.iou,
            max_det=self.max_det,
            device=self.device,
            persist=persist,
            tracker="bytetrack.yaml",
            verbose=False,
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(box.cls.item())

                class_name = self.model.names[class_id]

                if class_name not in self.VEHICLE_CLASSES:
                    continue

                confidence = float(box.conf.item())

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist(),
                )

                track_id = None

                if box.id is not None:

                    track_id = int(box.id.item())

                detections.append(

                    Detection(

                        bbox=BoundingBox(
                            x1=x1,
                            y1=y1,
                            x2=x2,
                            y2=y2,
                        ),

                        confidence=confidence,

                        class_id=class_id,

                        class_name=class_name,

                        frame_id=frame_id,

                        track_id=track_id,

                    )

                )

        self.logger.info(
            f"{len(detections)} tracked vehicle(s)."
        )

        return detections

    def draw_detections(
        self,
        frame,
        detections: List[Detection],
    ):

        image = frame.copy()

        for detection in detections:

            box = detection.bbox

            cv2.rectangle(
                image,
                (box.x1, box.y1),
                (box.x2, box.y2),
                (0, 255, 0),
                2,
            )

            if detection.track_id is not None:

                label = (
                    f"ID {detection.track_id} | "
                    f"{detection.class_name} "
                    f"{detection.confidence:.2f}"
                )

            else:

                label = (
                    f"{detection.class_name} "
                    f"{detection.confidence:.2f}"
                )

            cv2.putText(
                image,
                label,
                (box.x1, box.y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )

        return image
