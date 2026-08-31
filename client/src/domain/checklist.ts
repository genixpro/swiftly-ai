export interface ChecklistFile {
    _id: unknown;
    fileName: string;
}

export interface ChecklistReference {
    fileId?: unknown;
}

/** Retains the checklist's reference order and legacy first-name de-duplication. */
export function checklistFileNames(
    dataTypeReferences: Record<string, ChecklistReference[] | undefined>,
    files: ReadonlyArray<ChecklistFile> | undefined,
    dataTypes: ReadonlyArray<string>,
): string[] {
    const fileNames: string[] = [];

    dataTypes.forEach((dataType) => {
        const references = dataTypeReferences[dataType];
        if (references && files) {
            references.forEach((reference) => {
                files.forEach((file) => {
                    if (file._id === reference.fileId && fileNames.indexOf(file.fileName) === -1) {
                        fileNames.push(file.fileName);
                    }
                });
            });
        }
    });

    return fileNames;
}
