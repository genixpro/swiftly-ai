

migrations = []
migrationsForType = {}

def registerMigration(model, versionNumber):
    def decorator(func):
        migrationInfo = {
            "versionNumber": versionNumber,
            "func": func,
            "model": model
        }

        migrations.append(migrationInfo)

        typeName = model.__name__

        if typeName not in migrationsForType:
            migrationsForType[typeName] = []

        migrationsForType[typeName].append(migrationInfo)

        return func
    return decorator


