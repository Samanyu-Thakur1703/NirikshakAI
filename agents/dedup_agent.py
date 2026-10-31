"""
Dedup Agent (Agent 2 of 7) for NirikshakAI.
Implements GroundTruth Architecture: 3-tier duplicate detection + DBSCAN spatio-temporal clustering.
"""

from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict

from backend.models import DisasterReport, Incident, DedupStats, DedupResponse
from backend.verification.duplicate_detector import get_duplicate_detector
from backend.verification.clusterer import cluster_reports
from backend.verification.incident_merger import build_incident_from_cluster

DEDUP_AGENT_PROMPT = """You are the Dedup Agent for NirikshakAI.

## YOUR ROLE
You merge duplicate and syndicated reports and cluster nearby ones into incidents.

## YOUR TOOLS
- `exact_match(report)`: MD5 hash exact match against archive
- `perceptual_match(report)`: pHash with Hamming distance <= 8
- `semantic_match(report)`: CLIP / cosine similarity >= 0.92
- `cluster_reports(reports)`: DBSCAN clustering on lat/lon + timestamp
- `merge_reports(primary_id, duplicate_ids)`: Merge into single incident
- `emit_incident(incident)`: Pass clustered incident downstream

## DUPLICATE DETECTION RULES
1. TIER 1: Exact Match (MD5 of image or text)
2. TIER 2: Perceptual Hash (Hamming distance <= 8)
3. TIER 3: Semantic Similarity (Cosine similarity >= 0.92)
4. DBSCAN CLUSTERING: 5km radius, 30-45min window, min_samples=2
5. CONFIDENCE BOOST: +15% boost for clustered incidents
"""


class DedupAgent:
    """
    Dedup Agent implementation coordinating 3-tier dedup, DBSCAN clustering, and incident merging.
    """

    def __init__(self):
        self.detector = get_duplicate_detector()

    def run(
        self,
        reports: List[DisasterReport],
        eps_km: float = 5.0,
        time_window_min: int = 45
    ) -> DedupResponse:
        """
        Process a list of DisasterReport objects through 3-tier dedup and clustering.
        """
        total_processed = len(reports)
        exact_dups = 0
        perceptual_dups = 0
        semantic_dups = 0

        unique_reports: List[DisasterReport] = []
        duplicates: List[Tuple[DisasterReport, Dict[str, Any]]] = []
        reports_by_id: Dict[str, DisasterReport] = {r.report_id: r for r in reports}

        # -------------------------------------------------------------------
        # Step 1: 3-Tier Duplicate Detection
        # -------------------------------------------------------------------
        for r in reports:
            rep_dict = r.model_dump()
            check_res = self.detector.process_report(rep_dict)

            if check_res.get("is_duplicate"):
                match_type = check_res.get("match_type")
                if match_type == "exact":
                    exact_dups += 1
                elif match_type == "perceptual":
                    perceptual_dups += 1
                elif match_type == "semantic":
                    semantic_dups += 1

                duplicates.append((r, check_res))
            else:
                unique_reports.append(r)

        # -------------------------------------------------------------------
        # Step 2: DBSCAN Clustering on Unique Reports
        # -------------------------------------------------------------------
        unique_dicts = [r.model_dump() for r in unique_reports]
        clustering_result = cluster_reports(
            unique_dicts,
            eps_km=eps_km,
            time_window_min=time_window_min,
            min_samples=2
        )

        clusters = clustering_result.get("clusters", [])
        outliers = clustering_result.get("outliers", [])

        # -------------------------------------------------------------------
        # Step 3: Incident Merging
        # -------------------------------------------------------------------
        incidents: List[Incident] = []
        incident_idx = 1

        # A. Build incidents for clusters (>= 2 reports)
        for cluster_group in clusters:
            if not cluster_group:
                continue
            inc = build_incident_from_cluster(
                cluster_report_ids=cluster_group,
                reports_by_id=reports_by_id,
                incident_index=incident_idx
            )
            incidents.append(inc)
            incident_idx += 1

        # B. Build individual incidents for outliers (single reports)
        for outlier_id in outliers:
            if outlier_id not in reports_by_id:
                continue
            inc = build_incident_from_cluster(
                cluster_report_ids=[outlier_id],
                reports_by_id=reports_by_id,
                incident_index=incident_idx
            )
            incidents.append(inc)
            incident_idx += 1

        # Sort incidents by priority & confidence
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        incidents.sort(key=lambda x: (priority_order.get(x.priority, 2), -x.confidence_score))

        total_dups = exact_dups + perceptual_dups + semantic_dups
        stats = DedupStats(
            total_processed=total_processed,
            exact_duplicates=exact_dups,
            perceptual_duplicates=perceptual_dups,
            semantic_duplicates=semantic_dups,
            total_duplicates=total_dups,
            unique_incidents=len(incidents),
            clustered_incidents=len(clusters),
            single_report_incidents=len(outliers)
        )

        return DedupResponse(
            status="success",
            processed_count=total_processed,
            unique_count=len(unique_reports),
            duplicate_count=total_dups,
            incident_count=len(incidents),
            stats=stats,
            incidents=incidents
        )


_agent_instance: Optional[DedupAgent] = None

def get_dedup_agent() -> DedupAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = DedupAgent()
    return _agent_instance
