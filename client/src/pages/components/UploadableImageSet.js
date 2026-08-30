import React from 'react';
import axios from "axios";
import Dropzone from 'react-dropzone'
import {Button,
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption} from 'reactstrap';
import _ from 'underscore';
import {NonDroppableFieldDisplayEdit} from "./FieldDisplayEdit";

class UploadableImageSet extends React.Component
{
    static defaultProps = {
        editable: true
    };

    static uniqueIdCounter = 0;

    state = {
        activeIndex: 0,
        loading: false
    };

    constructor()
    {
        super();

        this.uniqueId = UploadableImageSet.uniqueIdCounter;
        UploadableImageSet.uniqueIdCounter += 1;
    }

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


    changeCaption(newCaption)
    {
        const captions = this.props.captions;
        captions[this.state.activeIndex] = newCaption;
        this.props.onChangeCaptions(captions);
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
            document.getElementById(`uploadable-image-set-${this.uniqueId}`).requestFullscreen();
            this.setState({fullscreen: true});
        }
    }

    onExiting()
    {
        this.animating = true;
    }

    onExited()
    {
        this.animating = false;
    }

    getUrlsForDisplay()
    {
        let urls = [];

        if (this.props.value)
        {
            // The local demo has no token-protected media gateway. Persisted image URLs
            // are already directly retrievable from the local API.
            urls = this.props.value.slice();
        }

        if (urls.length === 0)
        {
            urls.push("/img/no_building_image.png");
        }

        return urls;
    }

    next()
    {
        if (this.animating) return;
        const nextIndex = this.state.activeIndex === this.getUrlsForDisplay().length - 1 ? 0 : this.state.activeIndex + 1;
        this.setState({ activeIndex: nextIndex });
    }

    previous()
    {
        if (this.animating) return;
        const nextIndex = this.state.activeIndex === 0 ? this.getUrlsForDisplay().length - 1 : this.state.activeIndex - 1;
        this.setState({ activeIndex: nextIndex });
    }

    goToIndex(newIndex) {
        if (this.animating) return;
        this.setState({ activeIndex: newIndex });
    }


    render()
    {
        const editableClass = this.props.editable ? " editable" : "";

        const urls = this.getUrlsForDisplay();

        return (
            <div className={`uploadable-image ${editableClass} ${this.state.fullscreen ? "fullscreen" : ""}`} id={`uploadable-image-set-${this.uniqueId}`}>
                <div className={`uploadable-image-wrapper`}>
                    <div>

                        <Carousel
                            activeIndex={this.state.activeIndex}
                            next={this.next.bind(this)}
                            previous={this.previous.bind(this)}
                            interval={false}
                            ride={false}
                        >
                            {
                                urls.length > 1 ?
                                    <CarouselIndicators items={urls} activeIndex={this.state.activeIndex} onClickHandler={this.goToIndex.bind(this)} />
                                    : null
                            }

                            {
                                urls.map((url) =>
                                {
                                    return <CarouselItem
                                        onExiting={this.onExiting.bind(this)}
                                        onExited={this.onExited.bind(this)}
                                        key={url}
                                    >
                                        <img src={url} alt={this.props.address ? `Property at ${this.props.address}` : "Property"} />
                                        {/*<CarouselCaption captionText={item.caption} captionHeader={item.caption} />*/}
                                    </CarouselItem>
                                })
                            }
                            {
                                urls.length > 1 ?
                                    <CarouselControl direction="prev" directionText="Previous"
                                                     onClickHandler={this.previous.bind(this)}/>
                                    : null
                            }
                            {
                                urls.length > 1 ?
                                    <CarouselControl direction="next" directionText="Next"
                                                     onClickHandler={this.next.bind(this)}/>
                                    : null
                            }
                        </Carousel>
                        {
                            (this.props.value && this.props.value.length > 0) ?
                                <NonDroppableFieldDisplayEdit
                                    type={"text"}
                                    placeholder={"Caption..."}
                                    value={this.props.captions[this.state.activeIndex]}
                                    onChange={(newValue) => this.changeCaption(newValue)}
                                /> : null
                        }

                        {/*<AliceCarousel ref={(el) => this.Carousel = el} buttonsDisabled={true} dotsDisabled={true} items={urls.map((url) => <img src={url}/>)} />*/}
                        <nav className={"uploadable-icons-nav"}>
                            {
                                (this.props.value || []).map((item, itemIndex) =>
                                {
                                    return <div className={"image-wrapper"} key={item} onClick={() => this.setState({activeIndex: itemIndex})} >
                                            <img src={item + "?access_token=" + this.props.accessToken} className={"uploadable-image-carousel-image"} alt={`Property thumbnail ${itemIndex + 1}`} />
                                            {
                                                this.props.editable ?
                                                    <Button
                                                        color="secondary"
                                                        className={"delete-image-button"}
                                                        onClick={(evt) => this.deleteImage(itemIndex)}
                                                        title={"Delete image"}
                                                        aria-label={`Delete property image ${itemIndex + 1}`}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </Button> : null
                                            }
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
                                _.range(3 - (this.props.value || []).length % 4 - (this.state.loading ? 1 : 0)).map((spacer, spacerIndex) =>
                                {
                                    return <div key={spacerIndex} className={"uploadable-image-carousel-spacer"} />
                                })
                            }
                            {
                                this.props.editable ?
                                <Dropzone
                                    onDrop={acceptedFiles => this.onFileUpload(acceptedFiles)}
                                    className={"file-upload-box"}
                                    inputProps={{'aria-label': 'Upload property images'}}
                                >
                                    <Button type="button" className={"uploadable-image-new-image-button"} title="Add property image" aria-label="Add property image">
                                        <i className={"fa fa-plus"} aria-hidden="true" />
                                    </Button>
                                </Dropzone> : null
                            }
                        </nav>
                    </div>
                </div>
                <div className={"full-screen-button"}>
                    <Button color={"secondary"} onClick={() => this.toggleFullscreen()} title="View image fullscreen" aria-label="View property image fullscreen"><i className={"fa fa-expand"} /> </Button>
                </div>
            </div>
        );
    }
}


export default UploadableImageSet;
