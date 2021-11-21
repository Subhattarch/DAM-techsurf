/* eslint-disable react-hooks/exhaustive-deps */
import { fabric } from "fabric";
import $ from "jquery";
import jcanvas from "jcanvas";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UseState from "./_UseState";
import { SetState, DataToSave, SetDoneT, CurrentActionRef } from "./_types";
import { faImages } from "@fortawesome/free-solid-svg-icons";

const AddOverlay = ({
    ImageRef,
    setDone,
    setDataUrl,
    currentActionRef,
    addAction
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    setDone: SetDoneT;
    setDataUrl: SetState<string>;
    currentActionRef: CurrentActionRef;
    addAction: (newState: DataToSave | DataToSave[]) => void
}) => {
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const overlayPreviewRef = useRef<HTMLCanvasElement | null>(null);
    const [Overlays, setOverlays] = useState<fabric.Image[]>([]);
    const [selected, setSelected] = UseState<number>(0);
    const [overlayWidth, setOverlayWidth] = UseState<number>(0);
    const [overlayHeight, setOverlayHeight] = UseState<number>(0);
    const [overlayURL, setOverlayURL] = UseState<string>("");
    const [isAddingOverlay, setIsAddingOverlay] = UseState<boolean>(false);
    const [originalDimensions, setOriginalDimensions] = UseState<{
        height: number,
        width: number
    }>({
        height: 0,
        width: 0
    })
    const ResizeEvent = useRef<() => void>(() => {})
    useEffect(() => {

        if(!isAddingOverlay) {

            currentActionRef.current = {
                name: "overlays",
                data: JSON.stringify({
                    objects: fabricCanvasRef.current?.getObjects()
                })
            }
        } 
    }, [isAddingOverlay])
    return (
        <>
            <button className={isAddingOverlay ? "selected" : "" }
                onClick={() => {
                    if (isAddingOverlay) return setDone(null);
                    setDone((AddAction: (newState: DataToSave | DataToSave[], replaceLast?: boolean) => void, isCanceled: boolean) => {
                        const zoom = (fabricCanvasRef.current?.getZoom() ?? 1) * originalDimensions.width / (fabricCanvasRef.current?.getWidth() ?? 1)
                        fabricCanvasRef.current?.setDimensions(originalDimensions)
                        fabricCanvasRef.current?.setZoom(zoom)
                        fabricCanvasRef.current?.renderAll()
                        const IMG = new Image();
                        IMG.src =
                            fabricCanvasRef.current
                                ?.discardActiveObject()
                                .renderAll()
                                .toDataURL() ?? ImageRef.current[0].toDataURL();
                        IMG.onload = () => {
                            AddAction({
                                name: "overlays",
                                data: JSON.stringify({
                                    objects: fabricCanvasRef.current?.getObjects()
                                })
                            }, true)
                            if(!isCanceled) setDataUrl(IMG.src);
                            fabricCanvasRef.current?.dispose();
                            fabricCanvasRef.current = null;
                            ImageRef.current.prop(originalDimensions)
                            ImageRef.current.drawImage({
                                source: IMG,
                                x: 0,
                                y: 0,
                                fromCenter: false,
                                ...originalDimensions
                            }).siblings().remove();
                            setOverlays([]);
                        };
                        setIsAddingOverlay(false);
                        setSelected(0);
                        setOverlayWidth(0);
                        setOverlayHeight(0);
                        setOverlayURL("");
                        $(window).off("resize", ResizeEvent.current)
                    });
                    setIsAddingOverlay(true);
                    setTimeout(() => {
                        const dataUrl = ImageRef.current[0].toDataURL();
                        const IMG = new Image();
                        IMG.src = dataUrl;
                        const originalDimention = {
                            width: ImageRef.current[0].width,
                            height: ImageRef.current[0].height
                        }
                        setOriginalDimensions(originalDimention)
                        IMG.onload = () => {
                            const fabricImage = new fabric.Image(IMG);
                            const dimentions = {
                                height: ImageRef.current[0].clientHeight,
                                width: ImageRef.current[0].clientWidth
                            }
                            // fabricImage
                            //     .scaleToHeight(ImageRef.current[0].clientHeight)
                            //     .scaleToWidth(ImageRef.current[0].clientWidth);
                            fabricCanvasRef.current?.dispose();
                            fabricCanvasRef.current = new fabric.Canvas(
                                ImageRef.current[0], {
                                    height: ImageRef.current[0].height,
                                    width: ImageRef.current[0].width
                                }
                            );
                            const scale = dimentions.width / fabricCanvasRef.current.getWidth()
                            fabricCanvasRef.current.setDimensions(dimentions)
                            $(".lower-canvas").css("position", "relative")
                            $(".upper-canvas").css("position", "absolute")
                            fabricCanvasRef.current.setViewportTransform([scale, 0, 0, scale, 0, 0])
                            ResizeEvent.current = () => {
                                ImageRef.current.prop(originalDimention).css({
                                    maxWidth: "100%",
                                    maxHeight: "100%"
                                    })//.parent("div").css("width", "100%").css("height", "fit-content").css("max-height", "100%")
                                    $(".upper-canvas, .lower-canvas").prop(dimentions).css({
                                        display: "block",
                                        height: "auto",
                                        maxWidth: "100%",
                                        width: "auto",
                                        maxHeight: "100%",
                                        // aspectRatio: ImageRef.current.css("aspect-ratio")
                                    }).parent("div").css("width", "100%").css("height", "fit-content").css("max-height", "100%")
                                    ImageRef.current.prop(originalDimention).css({
                                        maxWidth: "100%",
                                        maxHeight: "100%"
                                    })
                                    setTimeout(() => {
                                        const scale = ImageRef.current[0].clientWidth / (fabricCanvasRef.current?.getWidth() ?? 1)
                                        fabricCanvasRef.current?.setDimensions({
                                            height: ImageRef.current[0].clientHeight,
                                            width: ImageRef.current[0].clientWidth
                                        })
                                        const zoom = scale * (fabricCanvasRef.current?.getZoom() ?? 1)
                                        fabricCanvasRef.current?.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
                                        fabricCanvasRef.current?.renderAll()
                                    }, 400)
                                }
                            
                            $(window).resize(ResizeEvent.current)
                                // ImageRef.current.resize()
                            fabricCanvasRef.current
                                ?.setBackgroundImage(
                                    fabricImage,
                                    fabricCanvasRef.current.renderAll.bind(
                                        fabricCanvasRef.current
                                    ),
                                    {}
                                )
                                .on("object:added", object => {
                                    setOverlays(state => [
                                        ...state,
                                        object.target as fabric.Image,
                                    ]);
                                });
                        };
                    }, 400);
                }}
            >
                <FontAwesomeIcon icon={faImages}/>
            </button>
            {isAddingOverlay && (
                <div>
                    <div>
                        <label htmlFor='Overlay'>Choose overlay image</label>
                        <input
                            type='file'
                            id='overlay'
                            accept='image/*'
                            onChange={e => {
                                const RawImage = e?.target?.files?.[0];
                                if (RawImage) {
                                    (window as any).$ = $;
                                    jcanvas($, window);
                                    const Reader = new FileReader();
                                    Reader.readAsDataURL(RawImage);
                                    const IMG = new Image();
                                    Reader.onload = () =>
                                        (IMG.src = Reader.result as string);
                                    IMG.onload = () => {
                                        setOverlayWidth(IMG.width);
                                        setOverlayHeight(IMG.height);
                                        setOverlayURL(IMG.src);
                                        $(
                                            overlayPreviewRef.current as HTMLCanvasElement
                                        )
                                            .prop({
                                                height: IMG.height,
                                                width: IMG.width,
                                            })
                                            .drawImage({
                                                source: IMG,
                                                x: 0,
                                                y: 0,
                                                fromCenter: false,
                                            });
                                    };
                                }
                            }}
                        />
                    </div>
                    {overlayURL.length > 0 && (
                        <div>
                            <div>
                                <p>preview</p>
                                <canvas ref={overlayPreviewRef} style={{maxWidth: "100%"}} />
                            </div>
                            <div>
                                <div>
                                    <label htmlFor='overlay-width'>width</label>
                                    <input
                                        type='text'
                                        name='overlay-width'
                                        id='overlay-width'
                                        value={overlayWidth}
                                        onChange={e => {
                                            const width = parseInt(
                                                e.target.value
                                            );
                                            setOverlayWidth(width);
                                            const IMG = new Image();
                                            IMG.src = overlayURL;
                                            IMG.onload = () =>
                                                $(
                                                    overlayPreviewRef.current as HTMLCanvasElement
                                                )
                                                    .prop("width", width)
                                                    .drawImage({
                                                        source: IMG,
                                                        x: 0,
                                                        y: 0,
                                                        fromCenter: false,
                                                        width,
                                                    });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor='overlay-height'>
                                        height
                                    </label>
                                    <input
                                        type='text'
                                        name='overlay-height'
                                        id='overlay-height'
                                        value={overlayHeight}
                                        onChange={e => {
                                            const height = parseInt(
                                                e.target.value
                                            );
                                            setOverlayHeight(height);
                                            const IMG = new Image();
                                            IMG.src = overlayURL;
                                            IMG.onload = () =>
                                                $(
                                                    overlayPreviewRef.current as HTMLCanvasElement
                                                )
                                                    .prop("height", height)
                                                    .drawImage({
                                                        source: IMG,
                                                        x: 0,
                                                        y: 0,
                                                        fromCenter: false,
                                                        height,
                                                    });
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const IMG = new Image();
                                    IMG.src = (
                                        overlayPreviewRef.current as HTMLCanvasElement
                                    ).toDataURL();
                                    IMG.onload = () =>
                                        fabricCanvasRef.current?.add(
                                            new fabric.Image(IMG).on(
                                                "selected",
                                                e => {
                                                    const Index =
                                                        fabricCanvasRef.current
                                                            ?.getObjects()
                                                            .indexOf(
                                                                e.target as fabric.Image
                                                            ) ?? 0;
                                                    setSelected(Index);
                                                }
                                            )
                                        );
                                }}
                            >
                                add layer
                            </button>
                        </div>
                    )}
                    {Overlays.length > 0 && (
                        <div>
                            <select
                                value={selected}
                                onChange={e => {
                                    fabricCanvasRef.current
                                        ?.setActiveObject(
                                            fabricCanvasRef.current?.item(
                                                parseInt(e.target.value)
                                            ) as unknown as fabric.Object
                                        )
                                        .renderAll();
                                }}
                            >
                                {Overlays.map((object, id) => (
                                    <option value={id} key={id}>
                                        layer {id + 1}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    fabricCanvasRef.current?.remove(
                                        Overlays.splice(selected, 1)[0]
                                    );
                                    setOverlays([...Overlays]);
                                    setSelected(Selected =>
                                        Selected === Overlays.length
                                            ? Selected - 1
                                            : Selected
                                    );
                                }}
                            >
                                dellete layer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AddOverlay;
