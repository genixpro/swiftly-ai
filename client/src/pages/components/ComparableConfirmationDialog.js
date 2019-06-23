import React from 'react';
import {Row, Col, Modal, ModalHeader, ModalBody, Table, Button} from "reactstrap";
import ComparableSaleListItem from "./ComparableSaleListItem"
import axios from "axios/index";
import ActionButton from "./ActionButton"
import FileViewer from "./FileViewer"

class ComparableConfirmationDialog extends React.Component
{
    state = {
        selectedComp: 0
    };

    saveUploadedComparable(comparableIndex)
    {
        const comparable = this.props.comparableSales[comparableIndex];

        if (comparable._id)
        {
            return this.changeComparable(comparableIndex, comparable);
        }
        else
        {
            return axios.post(`/comparable_sales`, comparable).then((response) =>
            {
                comparable["_id"] = response.data._id;
                comparable[ComparableSaleListItem._newSale] = true;

                this.props.onChange(this.props.comparableSales);
            }, (err) =>
            {

            });
        }
    }

    changeComparable(comparableIndex, newComparable)
    {
        this.props.comparableSales[comparableIndex] = newComparable;
        this.props.onChange(this.props.comparableSales);
        if(newComparable._id)
        {
            return axios.post(`/comparable_sales/` + newComparable._id, newComparable).then((response) => {
                // console.log(response.data.comparableSales);
                // this.setState({comparableSales: response.data.comparableSales})
            });
        }

        return Promise.resolve();
    }

    render()
    {
        return (
            <Modal isOpen={this.props.visible} toggle={() => this.props.toggle()} className={"comparable-confirmation-dialog"}>
                <ModalHeader toggle={() => this.props.toggle()}>Upload Comparable Sales</ModalHeader>
                <ModalBody>
                    <Row>
                        {
                            this.props.uploading ?
                                <Col xs={12}>
                                    <div>
                                        <div className="comparable-confirmation-dialog-loader ball-pulse">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                </Col> : null
                        }
                        {
                            this.props.comparableSales && this.props.comparableSales.length > 0 ?
                                <Col xs={2}>
                                    <Table hover>
                                        <thead>
                                        <tr>
                                            <th>Address</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.props.comparableSales.map((comparable, comparableIndex) =>
                                            {
                                                return <tr className={`comp-row ${comparableIndex === this.state.selectedComp ? "selected" : ""}`} onClick={() => this.setState({selectedComp: comparableIndex})}>
                                                    <td>{comparable.address ? comparable.address : "No address"}</td>
                                                    <td>
                                                        {
                                                            comparable._id ?
                                                                <i className={"fa fa-check-circle"}/>
                                                                : <i className={"fa fa-exclamation-circle"}/>
                                                        }
                                                    </td>
                                                </tr>;
                                            })
                                        }
                                        </tbody>
                                    </Table>
                                </Col> : null
                        }
                        {
                            this.props.comparableSales && this.props.comparableSales.map((comparable, comparableIndex) =>
                            {
                                if (this.state.selectedComp !== comparableIndex)
                                {
                                    return null;
                                }

                                return <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            <ComparableSaleListItem
                                                appraisal={this.props.appraisal}
                                                headers={[]}
                                                comparableSale={comparable}
                                                openByDefault={true}
                                                onChange={(comp) => this.changeComparable(this.state.selectedComp, comp)}/>

                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12}>
                                            <div className={"bottom-button-area"}>
                                                <ActionButton color={"primary"} onClick={() => this.saveUploadedComparable(this.state.selectedComp)}>Save</ActionButton>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            })
                        }
                        {
                            this.props.comparableSales && this.props.file ?
                            <Col xs={4}>
                                <FileViewer
                                    document={this.props.file}
                                    // hilightWords={this.state.hoverReference ? this.state.hoverReference.wordIndexes : []}
                                />
                            </Col>
                            : null
                        }
                    </Row>

                </ModalBody>
            </Modal>
        );
    }
}

export default ComparableConfirmationDialog;
