import {Table} from 'reactstrap';
import type {FileDTO} from '../../api/types';
import UploadedFileListItem from './UploadedFileListItem';

interface UploadedFileListProps {
    files: FileDTO[];
    appraisalId: string;
    onDeleteFile(): void;
    navigate(path: string): void;
    search?: string;
}

export default function UploadedFileList({files, appraisalId, onDeleteFile, navigate, search}: UploadedFileListProps) {
    if (files.length === 0) return null;
    return <Table striped bordered hover responsive>
        <thead><tr><th>File Name</th><th>Extraction</th><th>Action</th></tr></thead>
        <tbody>{files.map(file => <UploadedFileListItem
            key={file._id}
            file={file}
            appraisalId={appraisalId}
            handleDeletion={onDeleteFile}
            navigate={navigate}
            search={search}
        />)}</tbody>
    </Table>;
}
