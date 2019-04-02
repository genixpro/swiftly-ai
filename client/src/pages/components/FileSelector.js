import React from 'react';
import { FormGroup } from 'reactstrap';
import axios from "axios/index";


class FileSelector extends React.Component
{
    state = {
        files: []
    };

    componentDidMount()
    {
        this.refresh();
    }

    refresh()
    {
        axios.get(`/appraisal/${this.props.appraisalId}/files`).then((response) =>
        {
            this.setState({files: response.data.files});
            this.onChangeValue(response.data.files[0]._id['$oid'])
        });
    }

    onChangeValue(newValue)
    {
        if (this.props.onChange)
        {
            if (newValue !== this.props.value)
            {
                this.props.onChange(newValue);
            }
        }
    }

    onBlur()
    {
        if (this.props.onBlur)
        {
            this.props.onBlur();
        }
    }

    onRef(select)
    {
        if (this.props.innerRef)
        {
            this.props.innerRef(select);
        }
    }

    render()
    {
        return (
            <select
                defaultValue=""
                className="custom-select"
                onClick={(evt) => this.onChangeValue(evt.target.value)}
                onBlur={(evt) => this.onBlur()}
                ref={(ref) => this.onRef(ref)}
                value={this.props.value}
                disabled={this.props.disabled}

            >
                {
                    this.state.files.map((file) =>
                        <option value={file._id['$oid']} key={file._id['$oid']}>{file.fileName}</option>
                    )
                }
            </select>
        );
    }
}


export default FileSelector;