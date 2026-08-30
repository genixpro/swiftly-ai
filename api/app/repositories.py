"""Small persistence boundary around the Mongo collections used by the demo."""
from __future__ import annotations


class MongoCollectionRepository:
    def __init__(self, collection):
        self._collection = collection

    def find(self, *args, **kwargs):
        return self._collection.find(*args, **kwargs)

    def find_one(self, *args, **kwargs):
        return self._collection.find_one(*args, **kwargs)

    def insert_one(self, *args, **kwargs):
        return self._collection.insert_one(*args, **kwargs)

    def update_one(self, *args, **kwargs):
        return self._collection.update_one(*args, **kwargs)

    def replace_one(self, *args, **kwargs):
        return self._collection.replace_one(*args, **kwargs)

    def find_one_and_update(self, *args, **kwargs):
        return self._collection.find_one_and_update(*args, **kwargs)

    def find_one_and_delete(self, *args, **kwargs):
        return self._collection.find_one_and_delete(*args, **kwargs)

    def delete_one(self, *args, **kwargs):
        return self._collection.delete_one(*args, **kwargs)

    def delete_many(self, *args, **kwargs):
        return self._collection.delete_many(*args, **kwargs)

    def distinct(self, *args, **kwargs):
        return self._collection.distinct(*args, **kwargs)


class Repositories:
    """Lazily exposes named repositories without leaking Mongo from route code."""

    def __init__(self, database):
        self._database = database
        self._repositories = {}

    def __getitem__(self, name: str) -> MongoCollectionRepository:
        if name not in self._repositories:
            self._repositories[name] = MongoCollectionRepository(self._database[name])
        return self._repositories[name]

    def __getattr__(self, name: str) -> MongoCollectionRepository:
        if name.startswith("_"):
            raise AttributeError(name)
        return self[name]
