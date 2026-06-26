"""rect64 helpers.

Flickr face-tag rectangles are encoded as 16 hex chars = four 16-bit values
(x1, y1, x2, y2), each ``value / 65535`` giving a fraction of the image's
width/height. Example: ``4c3f2bc070306b9f`` -> (0.298, 0.171, 0.438, 0.420).
"""
from __future__ import annotations

_MAX = 65535


def decode(hex_str: str) -> tuple[float, float, float, float]:
    """Decode a 16-char rect64 hex string into fractional (x1, y1, x2, y2)."""
    h = hex_str.strip().lower()
    if len(h) != 16 or any(c not in "0123456789abcdef" for c in h):
        raise ValueError(f"not a 16-char hex rect64: {hex_str!r}")
    x1, y1, x2, y2 = (int(h[i : i + 4], 16) / _MAX for i in range(0, 16, 4))
    return x1, y1, x2, y2


def encode(x1: float, y1: float, x2: float, y2: float) -> str:
    """Encode fractional (x1, y1, x2, y2) back into a 16-char rect64 hex string."""
    def clamp(v: float) -> int:
        return max(0, min(_MAX, round(v * _MAX)))

    return "".join(f"{clamp(v):04x}" for v in (x1, y1, x2, y2))


def is_valid(hex_str: str) -> bool:
    try:
        decode(hex_str)
        return True
    except ValueError:
        return False
