# Python vision modules

`ai.detection.VehicleDetector` loads the configured Ultralytics checkpoint and returns vehicle detections. It supports detection and ByteTrack tracking. `ai.engine.AegisSightEngine` currently detects vehicles and crops them. DINOv2, FAISS, cross-view matching, and camera-graph code are separate utilities; the full sequence is not yet orchestrated or validated end to end.

Install detector dependencies from repository root with `python -m pip install -r ai/requirements.txt`. Install `ai/requirements-crossview.txt` only when using the embedding/index modules. PyTorch builds vary by OS and CUDA version. For the AI/backend prototype, see `integration/ai_adapter/README.md`.

Set `AEGIS_YOLO_MODEL` to a local compatible checkpoint or a model name Ultralytics can download. Checkpoints are ignored by Git. Generic YOLO checkpoints are not aerial- or CCTV-domain-trained weights; the team still needs suitable data, training/evaluation, and camera-specific validation.
