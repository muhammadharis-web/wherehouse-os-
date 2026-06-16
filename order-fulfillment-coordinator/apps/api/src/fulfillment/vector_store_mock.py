from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
import uuid


@dataclass
class MockPoint:
    id: str
    vector: list[float]
    payload: dict[str, Any]


@dataclass
class MockScoredPoint:
    id: str
    vector: list[float]
    payload: dict[str, Any]
    score: float
    version: int = 0


@dataclass
class MockCollection:
    name: str
    points: dict[str, MockPoint] = field(default_factory=dict)
    vector_size: int = 1536
    distance: str = "COSINE"


class MockQdrantClient:
    """In-memory mock Qdrant client for demo without Qdrant server."""

    def __init__(self) -> None:
        self._collections: dict[str, MockCollection] = {}

    async def get_collections(self) -> Any:
        class CollectionsResponse:
            def __init__(self, collections: list[MockCollection]):
                self.collections = collections

        return CollectionsResponse(list(self._collections.values()))

    async def create_collection(
        self,
        collection_name: str,
        vectors_config: Any,
    ) -> bool:
        self._collections[collection_name] = MockCollection(
            name=collection_name,
            vector_size=vectors_config.size,
            distance=vectors_config.distance.value
            if hasattr(vectors_config.distance, "value")
            else str(vectors_config.distance),
        )
        return True

    async def upsert(
        self,
        collection_name: str,
        points: list[Any],
        wait: bool = True,
    ) -> Any:
        if collection_name not in self._collections:
            self._collections[collection_name] = MockCollection(name=collection_name)

        collection = self._collections[collection_name]
        for point in points:
            point_id = point.id if point.id else str(uuid.uuid4())
            collection.points[point_id] = MockPoint(
                id=point_id,
                vector=point.vector,
                payload=point.payload,
            )
        return type("UpdateResult", (), {"status": "completed"})()

    async def search(
        self,
        collection_name: str,
        query_vector: list[float],
        limit: int = 10,
        query_filter: Any = None,
        with_payload: bool = True,
        with_vectors: bool = False,
    ) -> list[MockScoredPoint]:
        if collection_name not in self._collections:
            return []

        collection = self._collections[collection_name]
        results = []

        for point_id, point in collection.points.items():
            if query_filter:
                must_match = True
                if hasattr(query_filter, "must"):
                    for condition in query_filter.must:
                        if hasattr(condition, "key") and hasattr(condition, "match"):
                            key = condition.key
                            expected_value = condition.match.value
                            if point.payload.get(key) != expected_value:
                                must_match = False
                                break
                if not must_match:
                    continue

            score = self._cosine_similarity(query_vector, point.vector)
            results.append(
                MockScoredPoint(
                    id=point.id,
                    vector=point.vector if with_vectors else [],
                    payload=point.payload if with_payload else {},
                    score=score,
                )
            )

        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        if len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    async def close(self) -> None:
        pass

    async def delete_collection(self, collection_name: str) -> bool:
        if collection_name in self._collections:
            del self._collections[collection_name]
        return True