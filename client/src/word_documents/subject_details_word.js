import React from 'react'
import renderDocument from "./render_doc";
import PropertyImages from "./property_images";
import AppraisalModel from "../models/AppraisalModel";

class SubjectDetailsWord extends React.Component {
    render()
    {
        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h1>Subject Details</h1>
            <br/>
            <br/>
            <PropertyImages appraisal={this.props.appraisal} accessToken={this.props.accessToken} />
            </body>
            </html>
        )
    }
}

renderDocument((data) =>
{
    const appraisal = AppraisalModel.create(data.appraisal, null);

    return <SubjectDetailsWord
            appraisal={appraisal}
            accessToken={data.accessToken}
    />;
});

