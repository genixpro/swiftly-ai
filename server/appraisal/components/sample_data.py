# File contains various routines related to manipulating sample data


from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.models.appraisal import Appraisal
from appraisal.models.file import File
from appraisal.models.comparable_lease import ComparableLease
from appraisal.models.comparable_sale import ComparableSale
from appraisal.models.zone import Zone
from appraisal.models.property_tag import PropertyTag
from appraisal.models.image import Image
import bz2
import sys
import os
import json
from azure.storage.blob import BlockBlobService, PublicAccess
import os
from google.cloud import storage

from pyramid.config import Configurator
from pprint import pprint
from pymongo import MongoClient
import gridfs
import pickle
from mongoengine import connect, register_connection
from mongoengine.context_managers import switch_db
import pkg_resources

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)


def loadObjects(model, ):
    print("Loading ", model.__name__)

    objects = model.objects()

    return objects


def saveObjects(model, objects, newOwner):
    print("Saving ", model.__name__)

    newObjects = []

    idMap = {}
    reverseIdMap = {}

    for object in objects:
        data = json.loads(object.to_json())

        # pprint(data)

        del data['_id']
        data['owner'] = newOwner

        newObject = model(**data)

        oldId = str(object.id)

        newObject.save(validate=False)

        newId = str(newObject.id)

        newObjects.append(newObject)

        idMap[newId] = oldId
        reverseIdMap[oldId] = newId

    return newObjects, idMap, reverseIdMap


def clearObjects(model, owner):
    print("Clearing ", model.__name__)

    model.objects(owner=owner).delete()


def updateImageUrl(jointIdMap, oldUrl, oldEnv, newEnv):
    newUrl = oldUrl.replace(f"{oldEnv}.swiftlyai.com", f"{newEnv}.swiftlyai.com")

    for newId, oldId in jointIdMap.items():
        if oldId in newUrl:
            newUrl = newUrl.replace(oldId, newId)

    return newUrl


def downloadData(storageBucket, azureBlobStorage):
    appraisals = loadObjects(Appraisal)
    files = loadObjects(File)
    fileContents = {}
    fileImages = {}
    for file in files:
        print(f"Downloading file data for {str(file.id)}")
        fileContents[str(file.id)] = file.downloadFileData(storageBucket, azureBlobStorage)
        if file.pages:
            fileImages[str(file.id)] = [file.downloadRenderedImage(page, storageBucket, azureBlobStorage) for page in range(file.pages)]

    tags = loadObjects(PropertyTag)
    zones = loadObjects(Zone)
    comparableSales = loadObjects(ComparableSale)
    comparableLeases = loadObjects(ComparableLease)
    images = loadObjects(Image)
    imageDatas = {}
    imageDatasCropped = {}
    for image in images:
        print(f"Downloading image data for {str(image.id)}")
        imageDatas[str(image.id)] = image.downloadImageData(storageBucket, azureBlobStorage, cropped=False)
        imageDatasCropped[str(image.id)] = image.downloadImageData(storageBucket, azureBlobStorage, cropped=True)

    return {
        "appraisals": appraisals,
        "files": files,
        "fileContents": fileContents,
        "fileImages": fileImages,
        "tags": tags,
        "zones": zones,
        "comparableSales": comparableSales,
        "comparableLeases": comparableLeases,
        "images": images,
        "imageDatas": imageDatas,
        "imageDatasCropped": imageDatasCropped
    }


def uploadData(data, dbAlias, storageBucket, newOwner, oldEnv, newEnv):
    with switch_db(Appraisal, dbAlias) as TargetAppraisal:
        clearObjects(TargetAppraisal, newOwner)
        newAppraisals, appraisalIDMap, appraisalIDReverseMap = saveObjects(TargetAppraisal, data['appraisals'], newOwner)

    with switch_db(File, dbAlias) as TargetFile:
        clearObjects(TargetFile, newOwner)
        newFiles, fileIDMap, fileIDReverseMap = saveObjects(TargetFile, data['files'], newOwner)

    with switch_db(Zone, dbAlias) as TargetZone:
        clearObjects(TargetZone, newOwner)
        newZones, zoneIdMap, zoneIDReverseMap = saveObjects(TargetZone, data['zones'], newOwner)

    with switch_db(PropertyTag, dbAlias) as TargetPropertyTag:
        clearObjects(TargetPropertyTag, newOwner)
        newProprertyTags, propertyTagIdMap, propertyIDReverseMap = saveObjects(TargetPropertyTag, data['tags'], newOwner)

    with switch_db(ComparableSale, dbAlias) as TargetComparableSale:
        clearObjects(TargetComparableSale, newOwner)
        newComparableSales, compSaleIdMap, compSaleIdReverseMap = saveObjects(TargetComparableSale, data['comparableSales'], newOwner)

    with switch_db(ComparableLease, dbAlias) as TargetComparableLease:
        clearObjects(TargetComparableLease, newOwner)
        newComparableLeases, compLeaseIdMap, compLeaseIdReverseMap = saveObjects(TargetComparableLease, data['comparableLeases'], newOwner)

    with switch_db(Image, dbAlias) as TargetImage:
        clearObjects(TargetImage, newOwner)
        newImages, imageIdMap, imageIdReverseMap = saveObjects(TargetImage, data['images'], newOwner)

    jointIdMap = {}
    jointIdMap.update(appraisalIDMap)
    jointIdMap.update(fileIDMap)
    jointIdMap.update(zoneIdMap)
    jointIdMap.update(propertyTagIdMap)
    jointIdMap.update(compSaleIdMap)
    jointIdMap.update(compLeaseIdMap)
    jointIdMap.update(imageIdMap)

    jointReverseIdMap = {}
    jointReverseIdMap.update(appraisalIDReverseMap)
    jointReverseIdMap.update(fileIDReverseMap)
    jointReverseIdMap.update(zoneIDReverseMap)
    jointReverseIdMap.update(propertyIDReverseMap)
    jointReverseIdMap.update(compSaleIdReverseMap)
    jointReverseIdMap.update(compLeaseIdReverseMap)
    jointReverseIdMap.update(imageIdReverseMap)

    with switch_db(Appraisal, dbAlias) as TargetAppraisal:
        for newAppraisal in newAppraisals:
            if newAppraisal.imageUrl:
                newAppraisal.imageUrl = updateImageUrl(jointIdMap, newAppraisal.imageUrl, oldEnv, newEnv)

            newAppraisal.comparableSalesCapRate = [compSaleIdReverseMap[oldId] for oldId in newAppraisal.comparableSalesCapRate if oldId in compSaleIdReverseMap]
            newAppraisal.comparableSalesDCA = [compSaleIdReverseMap[oldId] for oldId in newAppraisal.comparableSalesDCA if oldId in compSaleIdReverseMap]

            newAppraisal.comparableLeases = [compLeaseIdReverseMap[oldId] for oldId in newAppraisal.comparableLeases if oldId in compLeaseIdReverseMap]
            if newAppraisal.zoning:
                newAppraisal.zoning = zoneIDReverseMap[newAppraisal.zoning]

            newAppraisal.save(validate=False)

    with switch_db(ComparableSale, dbAlias) as TargetComparableSale:
        for newComp in newComparableSales:
            if newComp.imageUrl:
                newComp.imageUrl = updateImageUrl(jointIdMap, newComp.imageUrl, oldEnv, newEnv)
            if newComp.zoning:
                newComp.zoning = zoneIDReverseMap[newComp.zoning]
            newComp.save(validate=False)

    with switch_db(ComparableLease, dbAlias) as TargetComparableLease:
        for newComp in newComparableLeases:
            if newComp.imageUrl:
                newComp.imageUrl = updateImageUrl(jointIdMap, newComp.imageUrl, oldEnv, newEnv)
            newComp.save(validate=False)

    with switch_db(File, dbAlias) as TargetFile:
        for newFile in newFiles:
            print("Uploading file data on", str(newFile.id))

            newFile.appraisalId = None if newFile.appraisalId not in appraisalIDReverseMap else appraisalIDReverseMap[newFile.appraisalId]
            newFile.save(validate=False)

            contents = data['fileContents'][fileIDMap[str(newFile.id)]]
            newFile.uploadFileData(storageBucket, contents)

            if newFile.pages:
                for page in range(newFile.pages):
                    pageImage = data['fileImages'][fileIDMap[str(newFile.id)]][page]
                    newFile.uploadRenderedImage(page, storageBucket, pageImage)

    with switch_db(Image, dbAlias) as TargetImage:
        for newImage in newImages:
            print("Uploading image data on", str(newImage.id))

            imageData = data['imageDatas'][imageIdMap[str(newImage.id)]]
            if imageData:
                newImage.uploadImageData(storageBucket, imageData, cropped=False)

            croppedImageData = data['imageDatasCropped'][imageIdMap[str(newImage.id)]]
            if croppedImageData:
                newImage.uploadImageData(storageBucket, croppedImageData, cropped=True)

            newImage.url = updateImageUrl(jointIdMap, newImage.url, oldEnv, newEnv)
            newImage.save(validate=False)

