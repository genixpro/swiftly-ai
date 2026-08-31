import React from 'react';
import { mapSeries } from '@utils/promises';
import { Col, Row} from 'reactstrap';
import Dropzone from '../components/Common/DropzoneCompat';
import {useUploadFile} from '@api/hooks';


interface ClientDropBoxProps {
    appraisalId: string;
    reloadAppraisal(): void;
}

function ClientDropBox(props: ClientDropBoxProps) {
    const uploadFile = useUploadFile(props.appraisalId);
    const [uploading, setUploading] = React.useState(false);
    const fileListRef = React.useRef<{refresh(): void} | null>(null);
    const onDrop = (files: File[]) => {
        setUploading(true);
        mapSeries(files, (file: File) => {
            return new Promise<void>((resolve) => {
                const data = new FormData();
                data.set("fileName", file.name);
                data.set("file", file);
                const uploadPromise = uploadFile.mutateAsync(data);

                uploadPromise.then(() => {
                    resolve();
                    // setTimeout(() => {
                    // const upProg = this.state.upProg;
                    // upProg[file.name] = 100;
                    // this.setState({upProg});
                    // }, 50);
                }, () => {
                    resolve();
                });
                uploadPromise.catch(() => resolve());
            })
        }).then(() => {
            setUploading(false);
            props.reloadAppraisal();
            fileListRef.current?.refresh();
        }, () => {
            setUploading(false);
        });
    };

        return (
            <div className="block-center mt-4 wd-xl">
                <div className="card card-flat">
                    <div className="card-header text-center">
                        {/*<a href="">*/}
                            <img className="block-center rounded" src="/img/test-client-logo.png" alt="Logo"/>
                        {/*</a>*/}
                    </div>
                    <div className="card-body">
                        <p className="text-center py-2">Please Upload Your Documents</p>

                        <Row>
                            <Col xs={12} className={"upload-zone-column"}>
                                <Dropzone className="card card-default upload-zone"
                                          ref={fileListRef as never}
                                          multiple
                                          onDrop={onDrop}
                                          align="center"
                                >
                                    <div className={"drop-zone-content-wrapper"}>
                                        <i className={"fa fa-upload drop-zone-upload-icon"}/>
                                        <br/>
                                        <br/>
                                        <span>Drop files here or click here to upload</span>

                                        {
                                            uploading &&
                                            <div className="upload-files-loader ball-pulse">
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                            </div>
                                        }
                                    </div>
                                </Dropzone>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="p-3 text-center">
                    <span className="me-2">&copy;</span>
                    <span>{new Date().getFullYear()}</span>
                    <span className="mx-2">-</span>
                    <span>Swiftly AI Inc.</span>
                </div>
            </div>
        );
}

export default ClientDropBox;
