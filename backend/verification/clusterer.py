"""
Spatio-Temporal DBSCAN Clustering Engine for NirikshakAI Dedup Agent.
Clusters nearby disaster reports (default: 5km radius, 30-60min window) into parent incidents.
"""

import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from dateutil import parser as date_parser
import numpy as np


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate geodesic distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def parse_timestamp_epoch_min(ts_str: Any) -> float:
    """Parse ISO timestamp to epoch minutes."""
    if not ts_str:
        return 0.0
    try:
        dt = date_parser.parse(str(ts_str))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp() / 60.0
    except Exception:
        return 0.0


def cluster_reports(
    reports: List[Dict[str, Any]],
    eps_km: float = 5.0,
    time_window_min: int = 45,
    min_samples: int = 2
) -> Dict[str, Any]:
    """
    DBSCAN Spatio-Temporal Clustering.
    Two reports are neighbors if:
      1. Geodesic distance <= eps_km (default 5km)
      2. Temporal difference <= time_window_min (default 45 min)
      3. Same primary hazard (optional or soft penalty)
    
    Returns:
      {
        "clusters": list[list[str]], # List of report_id groups
        "outliers": list[str]        # Isolated report_ids
      }
    """
    # Filter reports that have valid coordinates
    valid_reports = []
    unlocated_report_ids = []

    for r in reports:
        report_id = r.get("report_id")
        geo = r.get("geo", {}) if isinstance(r.get("geo"), dict) else {}
        lat = geo.get("lat") or r.get("lat")
        lon = geo.get("lon") or r.get("lon")

        claim = r.get("claim", {}) if isinstance(r.get("claim"), dict) else {}
        claimed_time = claim.get("claimed_time") or r.get("claimed_time") or r.get("created_at")
        hazard = claim.get("hazard") or r.get("hazard", "unknown")

        if lat is not None and lon is not None:
            valid_reports.append({
                "id": report_id,
                "lat": float(lat),
                "lon": float(lon),
                "time_min": parse_timestamp_epoch_min(claimed_time),
                "hazard": hazard
            })
        else:
            unlocated_report_ids.append(report_id)

    n = len(valid_reports)
    if n == 0:
        return {"clusters": [], "outliers": unlocated_report_ids}

    # Build neighbor graph
    neighbors: List[List[int]] = [[] for _ in range(n)]

    for i in range(n):
        for j in range(i + 1, n):
            p1 = valid_reports[i]
            p2 = valid_reports[j]

            # Time check first (fastest)
            time_diff = abs(p1["time_min"] - p2["time_min"])
            if time_diff > time_window_min:
                continue

            # Hazard compatibility check (don't cluster flood with fire)
            if p1["hazard"] != "unknown" and p2["hazard"] != "unknown":
                if p1["hazard"] != p2["hazard"]:
                    continue

            # Spatial distance check
            dist_km = haversine_distance_km(p1["lat"], p1["lon"], p2["lat"], p2["lon"])
            if dist_km <= eps_km:
                neighbors[i].append(j)
                neighbors[j].append(i)

    # Standard DBSCAN Traversal
    visited = [False] * n
    cluster_labels = [-1] * n  # -1 = unassigned / noise
    current_cluster_id = 0

    for i in range(n):
        if visited[i]:
            continue
        visited[i] = True

        # Check core point condition (including self: len + 1 >= min_samples)
        if len(neighbors[i]) + 1 >= min_samples:
            cluster_labels[i] = current_cluster_id
            seed_queue = list(neighbors[i])

            idx = 0
            while idx < len(seed_queue):
                neighbor_idx = seed_queue[idx]
                idx += 1

                if not visited[neighbor_idx]:
                    visited[neighbor_idx] = True
                    if len(neighbors[neighbor_idx]) + 1 >= min_samples:
                        for next_neighbor in neighbors[neighbor_idx]:
                            if next_neighbor not in seed_queue:
                                seed_queue.append(next_neighbor)

                if cluster_labels[neighbor_idx] == -1:
                    cluster_labels[neighbor_idx] = current_cluster_id

            current_cluster_id += 1

    # Format result groups
    clusters: List[List[str]] = [[] for _ in range(current_cluster_id)]
    outliers: List[str] = list(unlocated_report_ids)

    for i, label in enumerate(cluster_labels):
        rep_id = valid_reports[i]["id"]
        if label >= 0:
            clusters[label].append(rep_id)
        else:
            outliers.append(rep_id)

    return {
        "clusters": clusters,
        "outliers": outliers,
        "total_clusters": len(clusters),
        "total_clustered_reports": sum(len(c) for c in clusters),
        "total_outliers": len(outliers)
    }
