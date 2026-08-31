import type {MouseEvent} from 'react';
import {useEffect, useState} from 'react';
import {useDeleteFile} from '@api/hooks';
import {Button} from 'reactstrap';
import type {FileDTO} from '@api/types';
import {confirmBrowserAction} from '../../components/platform/browserActions';

interface UploadedFileListItemProps {
    appraisalId: string;
    file: FileDTO;
    handleDeletion(file: FileDTO): void;
    navigate?(path: string): void;
    search?: string;
}

function UploadedFileListItem(props: UploadedFileListItemProps)
{
    const [file, setFile] = useState<FileDTO>();
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const deleteFile = useDeleteFile(props.appraisalId);

    useEffect(() =>
    {
        setFile(props.file);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- preserve the legacy mount-only file snapshot.

    function onDeleteFile(evt: MouseEvent<HTMLButtonElement>)
    {

        evt.stopPropagation();
        if (confirmBrowserAction(`Are you sure you want to remove “${file!.fileName}”?`))
        {
            setDeleting(true);
            setDeleteError(null);
            deleteFile.mutateAsync(file!._id).then(() =>
            {
                props.handleDeletion(props.file);
            }).catch(() => {
                setDeleting(false);
                setDeleteError("The file could not be removed. Please try again.");
            });
        }
    }

    if (!file)
    {
        return <tr></tr>;
    }

    return (
        <tr className="uploaded-file-list-item">
            <td>{file.fileName}</td>
            <td>
                <span>{file.reviewStatus || "fresh"}</span>
                {file.extractionError && <small className="d-block text-danger">{file.extractionError}</small>}
            </td>
            {/*<td>*/}
            {/*<select value={file.fileType} onChange={onFileTypeChanged} onClick={(evt) => evt.stopPropagation()}>*/}
            {/*<option value={"lease"}>Lease</option>*/}
            {/*<option value={"financials"}>Financial Statement</option>*/}
            {/*<option value={"comparable"}>Comparable Sale</option>*/}
            {/*<option value={"rentroll"}>Rent Roll</option>*/}
            {/*</select>*/}
            {/*</td>*/}
            <td>
                <Button color="danger" disabled={deleting} onClick={onDeleteFile}>
                    {deleting ? "Removing…" : "Remove"}
                </Button>
                {deleteError ? <small className="d-block text-danger" role="alert">{deleteError}</small> : null}
            </td>
        </tr>
    );
}


export default UploadedFileListItem;
