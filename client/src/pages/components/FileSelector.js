import React from 'react';
import axios from "axios/index";
import FileModel from "../../models/FileModel";


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
            this.setState({files: response.data.files.map((file) => FileModel.create(file)) });

            let defaultSet = false;
            if (this.props.defaultFile)
            {
                response.data.files.forEach((file) =>
                {
                    if (file._id === this.props.defaultFile)
                    {
                        this.onChangeValue(file._id);
                        defaultSet = true;
                    }
                });
            }

            if (!defaultSet && response.data.files.length > 0)
            {
                this.onChangeValue(response.data.files[0]._id)
            }
        });
    }

    onChangeValue(newValue)
    {
        if (this.props.onChange)
        {
            if (newValue !== this.props.value && newValue !== "")
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
                className="custom-select"
                onBlur={(evt) => this.onBlur()}
                ref={(ref) => this.onRef(ref)}
                value={this.props.value}
                disabled={this.props.disabled}
                onChange={(evt) => this.onChangeValue(evt.target.value)}
                style={this.state.files.length === 0 ? {"color": "lightgray"} : null}
            >
                {
                    this.state.files.length === 0 ?
                        <option value={""}>No files attached to appraisal</option>
                        : null
                }
                {
                    this.state.files.map((file) =>
                        <option value={file._id} key={file._id}>{file.fileName}</option>
                    )
                }
            </select>
        );
    }
}


export default FileSelector;