import type {KeyboardEvent} from 'react';
import {useRef, useState} from 'react';
import type {NavigateFunction} from 'react-router';
import type {DropzoneRef} from 'react-dropzone';
import { mapSeries } from '@utils/promises';
import {Row, Col, Card, CardBody} from 'reactstrap';
import {useFiles, useUploadFile} from '@api/hooks';
import Dropzone from '../components/Common/DropzoneCompat';
import UploadedFileList from "./components/UploadedFileList"
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import Checklist, {type ChecklistAppraisal} from "./components/Checklist";

interface UploadFilesProps {
    appraisalId: string;
    appraisal: {_id: string; [field: string]: unknown};
    navigate: NavigateFunction;
    reloadAppraisal(): void;
    search?: string;
}

function UploadFiles(props: UploadFilesProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const dropzone = useRef<DropzoneRef | null>(null);
    const uploadInProgress = useRef(false);
    const filesQuery = useFiles(props.appraisalId);
    const uploadFile = useUploadFile(props.appraisalId);
    const files = filesQuery.data ?? [];

    function refreshFileList()
    {
        void filesQuery.refetch();
    }

    function onFileDeleted()
    {
        props.reloadAppraisal();
        refreshFileList();
    }

    function onDrop(nextFiles: File[])
    {
        if (uploadInProgress.current || !nextFiles || nextFiles.length === 0)
        {
            return;
        }

        uploadInProgress.current = true;
        setUploading(true);
        setUploadError(null);
        mapSeries(nextFiles, (file: File) => {
            const data = new FormData();
            data.set("fileName", file.name);
            data.set("file", file);
            return uploadFile.mutateAsync(data);
        }).then(() => {
            refreshFileList();
            props.reloadAppraisal();
        }).catch(() => {
            setUploadError("One or more files could not be uploaded. Please try again.");
            refreshFileList();
        }).finally(() => {
            uploadInProgress.current = false;
            setUploading(false);
        });
    }

    function onUploadKeyDown(evt: KeyboardEvent<HTMLDivElement>)
    {
        if (!uploading && (evt.key === 'Enter' || evt.key === ' '))
        {
            evt.preventDefault();
            dropzone.current?.open();
        }
    }

        return (
            <div className={"upload-files-page"}>
                <AppraisalContentHeader appraisal={props.appraisal} title="Upload Files" />
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <div>
                                    {/*<Row>*/}
                                        {/*<Col xs={12}>*/}
                                            {/*<h3>Upload</h3>*/}
                                            {/*<br/>*/}
                                        {/*</Col>*/}
                                    {/*</Row>*/}
                                    <Row>
                                        <Col xs={12} className={"upload-zone-column"}>
                                            <Dropzone className="card card-default upload-zone"
                                                              ref={dropzone}
                                                              multiple
                                                              disableClick={uploading}
                                                              onDrop={onDrop}
                                                              onKeyDown={onUploadKeyDown}
                                                              role="button"
                                                              tabIndex={uploading ? -1 : 0}
                                                              aria-label="Upload appraisal files"
                                                              aria-busy={uploading}
                                                              inputProps={{'aria-label': 'Choose appraisal files to upload'}}
                                                              align="center"
                                                    >
                                                        <div className={"drop-zone-content-wrapper"}>
                                                            <i className={"fa fa-upload drop-zone-upload-icon"} aria-hidden="true"/>
                                                            <br/>
                                                            <br/>
                                                            <span>Drop files here or click here to upload</span>

                                                            {
                                                                uploading &&
                                                                <div className="upload-files-loader ball-pulse" role="status" aria-label="Uploading files">
                                                                    <div></div>
                                                                    <div></div>
                                                                    <div></div>
                                                                </div>
                                                            }
                                                            {uploadError ? <div className="alert alert-danger mt-3" role="alert">{uploadError}</div> : null}
                                                        </div>
                                            </Dropzone>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} className={"checklist-column"}>
                                            <Checklist
                                                appraisal={props.appraisal as unknown as ChecklistAppraisal}
                                                files={files}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        {/*<Col xs={12}>*/}
                                            {/*<h3>Existing Files</h3>*/}
                                        {/*</Col>*/}
                                        <Col xs={12}>
                                            <UploadedFileList appraisalId={props.appraisalId}
                                                              files={files}
                                                              navigate={props.navigate} search={props.search}
                                                              onDeleteFile={onFileDeleted}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
}

export default UploadFiles;
