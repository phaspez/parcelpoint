from typing import Generic, TypeVar
from uuid import UUID, uuid4

from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_
from starlette.status import HTTP_404_NOT_FOUND

SchemaType = TypeVar("SchemaType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[SchemaType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, db: Session, model: SchemaType):
        self.db = db
        self.model = model

    def get_all(self) -> list[SchemaType]:
        return self.db.query(self.model).all()

    def get_by_id(self, id: UUID) -> SchemaType:
        instance = self.db.query(self.model).filter(and_(self.model.id == id)).first()
        if not instance:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail=f"ID {id} is not found",
            )
        return instance

    def create(self, schema: CreateSchemaType) -> SchemaType:
        db_object = self.model(**{**schema.model_dump(), "id": uuid4()})
        self.db.add(db_object)
        self.db.commit()
        self.db.refresh(db_object)
        return db_object

    def delete(self, id: UUID) -> SchemaType:
        ins = self.get_by_id(id)
        self.db.delete(ins)
        self.db.commit()
        return ins

    def update(self, id: UUID, schema: UpdateSchemaType) -> SchemaType | None:
        db_object = self.get_by_id(id)
        obj_data = schema.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            if value is None:
                continue
            setattr(db_object, key, value)
        self.db.commit()
        self.db.refresh(db_object)
        return db_object

    def refresh(self, instance):
        self.db.refresh(instance)
