import React from 'react';


class UploadedFileListItem extends React.Component
{
    render()
    {
        const file = this.props.file;
        return (
            <tr className={"uploaded-file-list-item"}>
                <td>{file.fileName}</td>
                <td>{file.type}</td>
            </tr>
        );
    }
}


export default UploadedFileListItem;
