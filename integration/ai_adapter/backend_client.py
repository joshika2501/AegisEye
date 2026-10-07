"""Small authenticated HTTP client for the Spring backend."""

from time import monotonic

import requests


class BackendClient:
    def __init__(self, base_url: str, username: str, password: str, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.username = username
        self.password = password
        self.timeout = timeout
        self.session = requests.Session()
        self._token: str | None = None
        self._token_expires_at = 0.0

    def login(self) -> None:
        response = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"username": self.username, "password": self.password},
            timeout=self.timeout,
        )
        response.raise_for_status()
        body = response.json()
        self._token = body["accessToken"]
        self._token_expires_at = monotonic() + max(1, int(body["expiresInSeconds"]) - 30)

    def post_detection(self, payload: dict) -> dict:
        if not self._token or monotonic() >= self._token_expires_at:
            self.login()

        response = self.session.post(
            f"{self.base_url}/api/detections",
            json=payload,
            headers={"Authorization": f"Bearer {self._token}"},
            timeout=self.timeout,
        )
        if response.status_code == 401:
            self.login()
            response = self.session.post(
                f"{self.base_url}/api/detections",
                json=payload,
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=self.timeout,
            )
        response.raise_for_status()
        return response.json()
