import React from 'react';
import {defaultViewerZoom, viewerPointerPosition, viewerScrollPosition} from './file-viewer/domain';
import FileViewerPreviewSurface from './FileViewerPreviewSurface';
import {viewportHeight, viewportScrollPosition} from '../../components/platform/browserViewport';
import {setBrowserTimer} from '../../components/platform/browserTimers';

export interface FileViewerWord {
    bottom: number;
    index?: number;
    left: number;
    page: number;
    right: number;
    top: number;
    word?: string;
}

export interface FileViewerDocument {
    _id: string;
    appraisalId?: string;
    pages?: number;
    pageTypes?: unknown[];
    words?: FileViewerWord[];
}

type ViewerPointerEvent = React.MouseEvent<HTMLElement> | React.WheelEvent<HTMLDivElement>;

interface ViewerState {
    currentPage: number;
    document: { _id: Record<string, never>; words: FileViewerWord[]; pageTypes: unknown[] };
    height: number;
    hilightWords: number[];
    imageZoom: number;
    innerScrollLeft: number;
    innerScrollTop: number;
    isDraggingImage: boolean;
    previewError: boolean;
    slowTransition?: boolean;
    width: number;
}

interface ViewerDragState {
    dragStartElementScrollX?: number;
    dragStartElementScrollY?: number;
    dragStartX?: number;
    dragStartY?: number;
    isDraggingImage: boolean;
    selecting?: boolean;
}

interface FileViewerProps {
    defaultPage?: number;
    document: FileViewerDocument;
    hilightWords?: number[];
}

function computeDefaultZoom(document: Pick<FileViewerDocument, 'words'>) {
        return defaultViewerZoom(document.words ?? [], viewportHeight());
}

function FileViewer(props: FileViewerProps) {
        const [state, setState] = React.useState<ViewerState>({
            width: 0,
            height: 0,
            currentPage: 1,
            document: {
                _id: {},
                words: [],
                pageTypes: []
            },
            imageZoom: 100,
            previewError: false,
            hilightWords: [],
            innerScrollLeft: 0,
            innerScrollTop: 0,
            isDraggingImage: false,
        });
        const documentIdRef = React.useRef<string | undefined>(undefined);
        const pageSelectRef = React.useRef<HTMLSelectElement | null>(null);
        const imageContainerRef = React.useRef<HTMLDivElement | null>(null);
        const imageRef = React.useRef<HTMLImageElement | null>(null);
        const dragRef = React.useRef<ViewerDragState>({isDraggingImage: false});
        const updateState = (updates: Partial<ViewerState>) => {
            setState((currentState) => ({...currentState, ...updates}));
        };
        const onMouseUp = () => {
        dragRef.current.selecting = false;
        dragRef.current.isDraggingImage = false;
        if (dragRef.current.isDraggingImage)
        {
            updateState({isDraggingImage: false});
        }
        };
        const changePage = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        const newPage = Number(evt.target.value);
        updateState({currentPage: newPage});
        };
        const moveViewTo = (imageX: number, imageY: number, containerX: number, containerY: number, slowTransition?: boolean) => {
        const imageContainer = imageContainerRef.current;
        const image = imageRef.current;
        if (!imageContainer || !image) return;

        updateState({
            slowTransition: (slowTransition ? true : false),
            ...viewerScrollPosition(image.getBoundingClientRect(), imageContainer.getBoundingClientRect(), imageX, imageY, containerX, containerY)
        });
            setBrowserTimer(() => {
                updateState({slowTransition: false});
            });
        };


        const zoomIn = (evt?: ViewerPointerEvent) => {
        const image = imageRef.current;
        const imageContainer = imageContainerRef.current;
        if (!imageContainer || !image) return;

        let containerX;
        let containerY;

        let imageX;
        let imageY;

        if (evt)
        {
            const scroll = viewportScrollPosition();
            ({x: containerX, y: containerY} = viewerPointerPosition(evt.pageX, evt.pageY, imageContainer.getBoundingClientRect(), scroll.x, scroll.y));
            ({x: imageX, y: imageY} = viewerPointerPosition(evt.pageX, evt.pageY, image.getBoundingClientRect(), scroll.x, scroll.y));
        }
        else
        {
            containerX = 0.5;
            containerY = 0.5;

            imageX = (state.innerScrollLeft + imageContainer.getBoundingClientRect().width / 2) / image.getBoundingClientRect().width;
            imageY = (state.innerScrollTop + imageContainer.getBoundingClientRect().height / 2) / image.getBoundingClientRect().height;

        }

        const currentZoom = state.imageZoom;
        if (currentZoom < 150)
        {
            updateState({imageZoom: currentZoom + 25});
            moveViewTo(imageX, imageY, containerX, containerY);
        }
        else if(currentZoom < 250)
        {
            updateState({imageZoom: currentZoom + 50});
            moveViewTo(imageX, imageY, containerX, containerY);
        }
        else
        {
            updateState({imageZoom: currentZoom + 100});
            moveViewTo(imageX, imageY, containerX, containerY);
        }
        };


        const zoomOut = (evt?: ViewerPointerEvent) => {
        const image = imageRef.current;
        const imageContainer = imageContainerRef.current;
        if (!imageContainer || !image) return;

        let containerX;
        let containerY;

        let imageX;
        let imageY;

        if (evt)
        {
            const scroll = viewportScrollPosition();
            ({x: containerX, y: containerY} = viewerPointerPosition(evt.pageX, evt.pageY, imageContainer.getBoundingClientRect(), scroll.x, scroll.y));
            ({x: imageX, y: imageY} = viewerPointerPosition(evt.pageX, evt.pageY, image.getBoundingClientRect(), scroll.x, scroll.y));
        }
        else
        {
            containerX = 0.5;
            containerY = 0.5;

            imageX = (state.innerScrollLeft + imageContainer.getBoundingClientRect().width / 2) / image.getBoundingClientRect().width;
            imageY = (state.innerScrollTop + imageContainer.getBoundingClientRect().height / 2) / image.getBoundingClientRect().height;

        }

        const currentZoom = state.imageZoom;
        if (currentZoom > 250)
        {
            updateState({imageZoom: Math.max(currentZoom - 100, 75)});
            moveViewTo(imageX, imageY, containerX, containerY);
        }
        else if (currentZoom > 150)
        {
            updateState({imageZoom: Math.max(currentZoom - 50, 75)});
            moveViewTo(imageX, imageY, containerX, containerY);
        }
        else
        {
            updateState({imageZoom: Math.max(currentZoom - 25, 75)});
            moveViewTo(imageX, imageY, containerX, containerY);
        }

        };

        const startImageDrag = (evt: React.MouseEvent<HTMLImageElement>) => {
        dragRef.current.dragStartElementScrollX = state.innerScrollLeft;
        dragRef.current.dragStartElementScrollY = state.innerScrollTop;

        dragRef.current.dragStartX = evt.clientX;
        dragRef.current.dragStartY = evt.clientY;
        updateState({isDraggingImage: true});
        dragRef.current.isDraggingImage = true;

        evt.preventDefault();
        };

        const onMouseMove = (evt: React.MouseEvent<HTMLDivElement>) => {
        if (dragRef.current.isDraggingImage)
        {
            const element = imageContainerRef.current;
            const image = imageRef.current;
            if (!element || !image) return;

            updateState({
                innerScrollLeft: Math.min(Math.max(-element.getBoundingClientRect().width*0.8, dragRef.current.dragStartElementScrollX! + dragRef.current.dragStartX! - evt.clientX), image.getBoundingClientRect().width * 0.8 ),
                innerScrollTop: Math.min(Math.max(-element.getBoundingClientRect().height*0.8, dragRef.current.dragStartElementScrollY! + dragRef.current.dragStartY! - evt.clientY), image.getBoundingClientRect().height * 0.8 )
            });
        }
        };

        const onWheel = (evt: React.WheelEvent<HTMLDivElement>) => {
        if (evt.deltaY > 0)
        {
            zoomOut(evt);
        }
        else if (evt.deltaY < 0)
        {
            zoomIn(evt);
        }
        evt.preventDefault();
        };
        React.useEffect(() => {
            if (props.document._id !== documentIdRef.current) {
                documentIdRef.current = props.document._id;
                setState((currentState) => ({
                    ...currentState,
                    currentPage: props.defaultPage || 1,
                    imageZoom: computeDefaultZoom(props.document),
                    previewError: false,
                }));
            }
        }, [props.defaultPage, props.document]);
        const pageCount = Number(props.document.pages || 0);
        const previewAvailable = pageCount > 0 && !state.previewError;

        return <div id="file-viewer" className="file-viewer" onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            <FileViewerPreviewSurface
                currentPage={state.currentPage}
                document={props.document}
                hilightWords={state.hilightWords}
                imageContainerRef={imageContainerRef}
                imageRef={imageRef}
                pageSelectRef={pageSelectRef}
                imageZoom={state.imageZoom}
                innerScrollLeft={state.innerScrollLeft}
                innerScrollTop={state.innerScrollTop}
                onChangePage={changePage}
                onImageError={() => updateState({previewError: true})}
                onImageMouseDown={startImageDrag}
                onWheel={onWheel}
                onZoomIn={() => zoomIn()}
                onZoomOut={() => zoomOut()}
                previewAvailable={previewAvailable}
                slowTransition={state.slowTransition}
            />
        </div>;
}

FileViewer.computeDefaultZoom = computeDefaultZoom;

export default FileViewer;
