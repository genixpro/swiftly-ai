import React from 'react'


class PropertyImages extends React.Component {
    render()
    {
        const subImageStyle = {
            "width": "3.2in",
            "height": "2.4in",
            "border": "1.5px solid #92D050"
        };

        const tableCellStyle = {
            "border": "1px solid white",
            "backgroundColor": "white"
        };

        const imageCaptionStyle = {
            "fontSize": "10px",
            "textAlign": "center"
        };

        const imagePairs = [];
        for (let imageUrl of this.props.appraisal.imageUrls)
        {
            if (imagePairs.length > 0)
            {
                if (imagePairs[imagePairs.length - 1].length === 1)
                {
                    imagePairs[imagePairs.length - 1].push(imageUrl);
                }
                else
                {
                    imagePairs.push([imageUrl]);
                }
            }
            else
            {
                imagePairs.push([imageUrl]);
            }
        }

        return (
            <center>
                <table>
                    <tbody>
                    <h1>Photographs</h1>
                    
                    {
                        imagePairs.map((imagePair, imagePairIndex) =>
                        {
                            return <tr key={imagePairIndex}>
                                {
                                    imagePair.map((imageUrl, imageUrlIndex) =>
                                    {
                                        return <td style={tableCellStyle} key={imageUrlIndex}>
                                            <img
                                                src={`${imageUrl}?access_token=${this.props.accessToken}`}
                                                style={subImageStyle}
                                            />
                                            <br/>
                                            <span style={imageCaptionStyle}>{this.props.appraisal.captions[imageUrlIndex]}</span>
                                        </td>;
                                    })
                                }
                            </tr>
                        })
                    }
                    </tbody>
                </table>
            </center>
        )
    }
}

export default PropertyImages;

