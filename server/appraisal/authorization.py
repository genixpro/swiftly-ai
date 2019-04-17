from .models.appraisal import Appraisal


def checkUserOwnsAppraisalId(userId, principalIds, appraisalId):
    if "admin" in principalIds:
        return True

    query = {
        "_id": appraisalId,
        "owner": userId
    }

    appraisal = Appraisal.objects(query).only('owner')

    if appraisal is None:
        return False
    else:
        return True

def checkUserOwnsObject(userId, principalIds, appraisal):
    if "admin" in principalIds:
        return True

    if appraisal.owner != userId:
        return False
    else:
        return True
