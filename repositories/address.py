from gettext import textdomain
from typing import List

from sqlalchemy import text
from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from schemas.address import AddressSchema
from models.address import AddressCreate, AddressUpdate


class AddressRepository(BaseRepository[AddressSchema, AddressCreate, AddressUpdate]):
    def __init__(self, db: Session):
        super().__init__(db, AddressSchema)

    def search(self, search_terms: List[str]):
        """
        Search addresses with multiple terms matching any field
        Args:
            search_terms: List of lowercase search terms
        """
        # Build dynamic query with flexible matching
        conditions = []
        params = {}

        for i, term in enumerate(search_terms):
            param_name = f"term_{i}"
            params[param_name] = f"%{term}%"
            conditions.append(
                f"""
                LOWER(province) LIKE :{param_name} OR
                LOWER(district) LIKE :{param_name} OR
                LOWER(commune) LIKE :{param_name}
            """
            )

        where_clause = " AND ".join(f"({condition})" for condition in conditions)

        query = text(
            f"""
             SELECT id, province, district, commune
            FROM parcelpoint.public.address
            WHERE {where_clause}
            ORDER BY
                (
                    CASE WHEN LOWER(province) = ANY(ARRAY[:exact_terms]) THEN 3 ELSE 0 END +
                    CASE WHEN LOWER(district) = ANY(ARRAY[:exact_terms]) THEN 3 ELSE 0 END +
                    CASE WHEN LOWER(commune) = ANY(ARRAY[:exact_terms]) THEN 3 ELSE 0 END +
                    CASE WHEN LOWER(province) LIKE ANY(ARRAY[:terms]) THEN 1 ELSE 0 END +
                    CASE WHEN LOWER(district) LIKE ANY(ARRAY[:terms]) THEN 1 ELSE 0 END +
                    CASE WHEN LOWER(commune) LIKE ANY(ARRAY[:terms]) THEN 1 ELSE 0 END
                ) DESC
            """
        )

        # Add the terms arrays to params
        params.update({"terms": search_terms, "exact_terms": search_terms})

        result = self.db.execute(query, params).fetchall()
        return result
