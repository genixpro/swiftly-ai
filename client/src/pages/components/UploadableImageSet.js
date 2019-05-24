import React from 'react';
import axios from "axios/index";
import Dropzone from 'react-dropzone'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import AliceCarousel from 'react-alice-carousel';
import {Button} from 'reactstrap';
import _ from 'underscore';

class UploadableImageSet extends React.Component
{
    static defaultProps = {
        editable: true
    };

    state = {
        loading: false
    };

    onFileUpload(files)
    {
        const file = files[0];

        const data = new FormData();
        data.set("fileName", file.name);
        data.set("file", file);
        const options = {
            method: 'post',
            url: "/images",
            data: data
        };

        const uploadPromise = axios(options);

        uploadPromise.then((response) => {
            if (this.props.onChange)
            {
                const newUrls = this.props.value;
                newUrls.push(response.data.url);
                this.props.onChange(newUrls);
                this.setState({loading: false});
            }

        }, (error) => {
            console.log(error);
            console.log(JSON.stringify(error, null, 2));
            this.setState({loading: false});
        });

        this.setState({loading: true});
    }

    deleteImage(index)
    {
        const images = this.props.value;
        images.splice(index, 1);
        this.props.onChange(images);
    }
    



    toggleFullscreen()
    {
        if (this.state.fullscreen)
        {
            document.exitFullscreen();
            this.setState({fullscreen: false});
        }
        else
        {
            document.getElementById("uploadable-image-set").requestFullscreen();
            this.setState({fullscreen: true});
        }
    }


    render()
    {
        const editableClass = this.props.editable ? " editable" : "";

        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=${this.props.address}`;

        let urls = this.props.value.map((url) => url + "?access_token=" + this.props.accessToken);

        if (urls.length === 0 && this.props.address)
        {
            urls.push(streetViewUrl);
        }
        else if(urls.length === 0)
        {
            urls.push("/img/no_building_image.png");
        }

        return (
            <div className={`uploadable-image ${editableClass} ${this.state.fullscreen ? "fullscreen" : ""}`} id={"uploadable-image-set"}>
                <div className={`uploadable-image-wrapper`}>
                    <div>
                        <AliceCarousel ref={(el) => this.Carousel = el} buttonsDisabled={true} dotsDisabled={true} items={urls.map((url) => <img src={url}/>)} />
                        <nav className={"uploadable-icons-nav"}>
                            {
                                this.props.value.map((item, itemIndex) =>
                                {
                                    return <div className={"image-wrapper"} key={item} onClick={() => this.Carousel._onDotClick(itemIndex)} >
                                            <img src={item + "?access_token=" + this.props.accessToken} className={"uploadable-image-carousel-image"} />
                                            <Button
                                                color="secondary"
                                                className={"delete-image-button"}
                                                onClick={(evt) => this.deleteImage(itemIndex)}
                                                title={"Delete Expense"}
                                            >
                                                <i className="fa fa-times"></i>
                                            </Button>
                                        </div>
                                })
                            }
                            {
                                this.state.loading ?
                                    <div className={`loading-icon-box`}>
                                        <div className="ball-pulse">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div> : null
                            }
                            {
                                _.range(3 - this.props.value.length % 4 - (this.state.loading ? 1 : 0)).map(() =>
                                {
                                    return <div className={"uploadable-image-carousel-spacer"} />
                                })
                            }
                            {
                                <Dropzone onDrop={acceptedFiles => this.onFileUpload(acceptedFiles)} className={"file-upload-box"}>
                                    <Button className={"uploadable-image-new-image-button"}>
                                        <i className={"fa fa-plus"} />
                                    </Button>
                                </Dropzone>
                            }
                        </nav>
                    </div>
                </div>
                <div className={"full-screen-button"} onClick={() => this.toggleFullscreen()}>
                    <Button color={"secondary"}><i className={"fa fa-expand"} /> </Button>
                </div>
            </div>
        );
    }
}


export default UploadableImageSet;