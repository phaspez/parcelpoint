from typing import Generic, TypeVar, List

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class Pagination(BaseModel, Generic[T]):
    current_page: int
    page_count: int
    items: int
    previous: int | None
    next: int | None
    data: List[T]
