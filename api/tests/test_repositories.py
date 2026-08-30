import mongomock

from app.repositories import Repositories


def test_collection_repositories_preserve_crud_and_query_behavior():
    repositories = Repositories(mongomock.MongoClient().swiftly)
    repositories.appraisals.insert_one({"_id": "a", "name": "Original"})

    assert repositories.appraisals.find_one({"_id": "a"})["name"] == "Original"
    repositories.appraisals.update_one({"_id": "a"}, {"$set": {"name": "Changed"}})
    assert [item["name"] for item in repositories["appraisals"].find({})] == ["Changed"]
    assert repositories.appraisals.distinct("name") == ["Changed"]
    assert repositories.appraisals.delete_one({"_id": "a"}).deleted_count == 1
