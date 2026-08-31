import React from 'react';
import {useUploadImage} from '@api/hooks';
import Dropzone from '@components/Common/DropzoneCompat'
import {Button,
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators} from 'reactstrap';
import {NonDroppableFieldDisplayEdit} from "./FieldDisplayEdit";
import {exitBrowserFullscreen, requestBrowserFullscreen} from '../../components/platform/mapBrowser';

let uploadableImageSetCounter = 0;

interface UploadableImageSetProps {
    address?: string;
    captions?: string[] | null;
    editable?: boolean;
    onChange?(urls: string[]): void;
    onChangeCaptions?(captions: string[]): void;
    value?: string[] | null;
}

interface UploadableImageSetState {
    activeIndex: number;
    fullscreen?: boolean;
    loading: boolean;
}

function UploadableImageSet(props: UploadableImageSetProps)
{
    const uploadImage = useUploadImage();
    const [state, setState] = React.useState<UploadableImageSetState>({
        activeIndex: 0,
        loading: false
    });
    const uniqueIdRef = React.useRef<number | undefined>(undefined);
    const animatingRef = React.useRef(false);
    const imageSetRef = React.useRef<HTMLDivElement | null>(null);
    if (uniqueIdRef.current === undefined) uniqueIdRef.current = uploadableImageSetCounter++;
    const uniqueId = uniqueIdRef.current;
    const editable = props.editable === undefined ? true : props.editable;
    const updateState = (updates: Partial<UploadableImageSetState>) => setState((currentState) => ({...currentState, ...updates}));
    const getUrlsForDisplay = () => {
        const urls = props.value ? props.value.slice() : [];
        return urls.length === 0 ? ["/img/no_building_image.png"] : urls;
    };
    const onFileUpload = (files: File[]) => {
        const file = files[0];

        const data = new FormData();
        data.set("fileName", file.name);
        data.set("file", file);
        const uploadPromise = uploadImage.mutateAsync(data);

        uploadPromise.then((url) => {
            if (props.onChange)
            {
                const newUrls = props.value!;
                newUrls.push(url);
                props.onChange(newUrls);
                updateState({loading: false});
            }

        }, () => {
            updateState({loading: false});
        });

        updateState({loading: true});
    };
    const deleteImage = (index: number) => {
        const images = props.value!;
        images.splice(index, 1);
        props.onChange!(images);
    };
    const changeCaption = (newCaption: string) => {
        const captions = props.captions!;
        captions[state.activeIndex] = newCaption;
        props.onChangeCaptions!(captions);
    };
    const toggleFullscreen = () => {
        if (state.fullscreen)
        {
            exitBrowserFullscreen();
            updateState({fullscreen: false});
        }
        else
        {
            requestBrowserFullscreen(imageSetRef.current);
            updateState({fullscreen: true});
        }
    };
    const onExiting = () => {
        animatingRef.current = true;
    };
    const onExited = () => {
        animatingRef.current = false;
    };
    const next = () => {
        if (animatingRef.current) return;
        const nextIndex = state.activeIndex === getUrlsForDisplay().length - 1 ? 0 : state.activeIndex + 1;
        updateState({ activeIndex: nextIndex });
    };
    const previous = () => {
        if (animatingRef.current) return;
        const nextIndex = state.activeIndex === 0 ? getUrlsForDisplay().length - 1 : state.activeIndex - 1;
        updateState({ activeIndex: nextIndex });
    };
    const goToIndex = (newIndex: number) => {
        if (animatingRef.current) return;
        updateState({ activeIndex: newIndex });
    };


        const editableClass = editable ? " editable" : "";

        const urls = getUrlsForDisplay();

        return (
            <div ref={imageSetRef} className={`uploadable-image ${editableClass} ${state.fullscreen ? "fullscreen" : ""}`} id={`uploadable-image-set-${uniqueId}`}>
                <div className={`uploadable-image-wrapper`}>
                    <div>

                        <Carousel
                            activeIndex={state.activeIndex}
                            next={next}
                            previous={previous}
                            interval={false}
                            ride={false as never}
                        >
                            {
                                urls.length > 1 ?
                                    <CarouselIndicators items={urls as never} activeIndex={state.activeIndex} onClickHandler={goToIndex} />
                                    : null
                            }

                            {
                                urls.map((url) =>
                                {
                                    return <CarouselItem
                                        onExiting={onExiting}
                                        onExited={onExited}
                                        key={url}
                                    >
                                        <img src={url} alt={props.address ? `Property at ${props.address}` : "Property"} />
                                        {/*<CarouselCaption captionText={item.caption} captionHeader={item.caption} />*/}
                                    </CarouselItem>
                                })
                            }
                            {
                                urls.length > 1 ?
                                    <CarouselControl direction="prev" directionText="Previous"
                                                     onClickHandler={previous}/>
                                    : null
                            }
                            {
                                urls.length > 1 ?
                                    <CarouselControl direction="next" directionText="Next"
                                                     onClickHandler={next}/>
                                    : null
                            }
                        </Carousel>
                        {
                            (props.value && props.value.length > 0) ?
                                <NonDroppableFieldDisplayEdit
                                    type={"text"}
                                    placeholder={"Caption..."}
                                    value={props.captions![state.activeIndex]}
                                    onChange={(newValue) => changeCaption(String(newValue))}
                                /> : null
                        }

                        {/*<AliceCarousel ref={(el) => this.Carousel = el} buttonsDisabled={true} dotsDisabled={true} items={urls.map((url) => <img src={url}/>)} />*/}
                        <nav className={"uploadable-icons-nav"}>
                            {
                                (props.value || []).map((item: string, itemIndex: number) =>
                                {
                                    return <div className={"image-wrapper"} key={item} onClick={() => updateState({activeIndex: itemIndex})} >
                                            <img src={item} className={"uploadable-image-carousel-image"} alt={`Property thumbnail ${itemIndex + 1}`} />
                                            {
                                                editable ?
                                                    <Button
                                                        color="secondary"
                                                        className={"delete-image-button"}
                                                        onClick={() => deleteImage(itemIndex)}
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
                                state.loading ?
                                    <div className={`loading-icon-box`}>
                                        <div className="ball-pulse">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div> : null
                            }
                            {
                                Array.from({length: 3 - (props.value || []).length % 4 - (state.loading ? 1 : 0)}).map((_, spacerIndex) =>
                                {
                                    return <div key={spacerIndex} className={"uploadable-image-carousel-spacer"} />
                                })
                            }
                            {
                                editable ?
                                <Dropzone
                                    onDrop={onFileUpload}
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
                    <Button color={"secondary"} onClick={toggleFullscreen} title="View image fullscreen" aria-label="View property image fullscreen"><i className={"fa fa-expand"} /> </Button>
                </div>
            </div>
        );
}

UploadableImageSet.defaultProps = {editable: true};


export default UploadableImageSet;
