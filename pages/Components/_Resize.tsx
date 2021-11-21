/* eslint-disable react-hooks/exhaustive-deps */
import { MutableRefObject, useEffect } from "react";
import $ from 'jquery'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {GiHorizontalFlip, GiVerticalFlip} from 'react-icons/gi'
import GetResizedCanvasAndFocalPoint from "./_ResizeConvas";
import UseState from "./_UseState";
import { SetState, DataToSave, SetDoneT, CurrentActionRef } from "./_types";
import { faVectorSquare } from "@fortawesome/free-solid-svg-icons";

function Resize({
    ImageRef,
    dataUrl,
    setDone,
    focalPoint,
    setFocalPoint,
    Done,
    currentActionRef
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    dataUrl: string;
    setDone: SetDoneT;
    focalPoint: {x: number; y: number};
    setFocalPoint: SetState<{x: number, y: number}>;
    Done: Function | null;
    currentActionRef: CurrentActionRef
}) {

    const [isTransforming, setTransforming] = UseState<boolean>(false)
    const [PrevImageRef, setImageRef] = UseState<JQuery<HTMLCanvasElement>>(ImageRef.current);
    const [newFocalPoint, setNewFocalPoint] = UseState<{x: number, y: number}>({x: 0, y: 0})
    useEffect(() => {
        const canvas = $("<canvas></canvas>") as JQuery<HTMLCanvasElement>
        const img = new Image()
        img.src = dataUrl
        img.onload = () => {
            const ctx: CanvasRenderingContext2D = canvas[0].getContext("2d") as CanvasRenderingContext2D
            ctx.canvas.width = img.width
            ctx.canvas.height = img.height
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
            setWidth(img.width)
            setHeight(img.height)
            setImageRef(canvas)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUrl])
    const [Width, setWidth] = UseState<number>(parseInt(PrevImageRef?.attr?.("width") as string|| "500"))
    const [Height, setHeight] = UseState<number>(parseInt(PrevImageRef?.attr?.("height") as string|| "500"))
    const [flipHorizontal, setFlipHorizontal] = UseState<boolean>(false)
    const [flipVertical, setFlipVertical] = UseState<boolean>(false)
    const [rotateDeg, setRotateDeg] = UseState<number>(0)
    if(isTransforming) currentActionRef.current = {
        name: "Transform",
        data: {
            Width,
            Height,
            flipHorizontal,
            flipVertical,
            rotateDeg
        }
    }
    useEffect(() => {
        $(window).resize()
    }, [Width, Height])
    return (
        <>
            <button className={isTransforming ? "selected" : ""} onClick={() => {
                if (isTransforming) {
                    setDone(null);
                    return;
                }
                setDone((addData: (newState: DataToSave | DataToSave[]) => void) => {
                    // addData({
                    //     name: "Transform",
                    //     data: {
                    //         Width,
                    //         Height,
                    //         flipHorizontal,
                    //         flipVertical,
                    //         rotateDeg
                    //     }
                    // })
                    setFocalPoint(newFocalPoint)
                    setTransforming(false)
                    setFlipHorizontal(false)
                    setRotateDeg(0)
                })

                setTimeout(() =>setTransforming(true), 100)
                setNewFocalPoint(focalPoint)
                
            }}><FontAwesomeIcon icon={faVectorSquare}/></button>
            {isTransforming && <div>
                <div>
                    <div>
                        <label htmlFor='Width'>Width</label>
                        <input id="Width" type='number' min="1" value={Width || 500} onChange={e => {
                            const newWidth = parseInt(e.target.value || "1") > 0 ? parseInt(e.target.value || "1") : 1
                            setWidth(newWidth)
                            const {newCanvas, newFocalPoint} = GetResizedCanvasAndFocalPoint({...PrevImageRef}, newWidth, Height, {
                                flipHorizontal,
                                flipVertical,
                                rotateDeg
                            },
                            focalPoint)
                            const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                            context.canvas.width = newWidth
                            context.drawImage(newCanvas[0], 0, 0, newWidth, Height)
                            setNewFocalPoint(newFocalPoint)
                        }} />
                    </div>
                    <div>
                        <label htmlFor='Height'>Height</label>
                        <input id="Height" type='number' value={Height} onChange={e => {
                            const newHeight = parseInt(e.target.value || "1") > 0 ? parseInt(e.target.value || "1") : 1
                            setHeight(newHeight)
                            const {newCanvas, newFocalPoint} = GetResizedCanvasAndFocalPoint({...PrevImageRef}, Width, newHeight, {
                                flipHorizontal,
                                flipVertical,
                                rotateDeg
                            },
                            focalPoint)
                            const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                            context.canvas.height = newHeight
                            context.drawImage(newCanvas[0], 0, 0, Width, newHeight)
                            setNewFocalPoint(newFocalPoint)
                        }} />
                    </div>
                </div>
                <div>
                    <button onClick={() => {
                        setFlipHorizontal(prevState => !prevState)
                        const {newCanvas, newFocalPoint} = GetResizedCanvasAndFocalPoint({...PrevImageRef}, Width, Height, {
                                flipHorizontal: !flipHorizontal,
                                flipVertical,
                                rotateDeg
                            },
                            focalPoint)
                            const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                            context.clearRect(0, 0, Width, Height)
                            context.drawImage(newCanvas[0], 0, 0, Width, Height)
                            setNewFocalPoint(newFocalPoint)
                    }}><GiHorizontalFlip/></button>
                    <button onClick={() => {
                        setFlipVertical(prevState => !prevState)
                        const {newCanvas, newFocalPoint} = GetResizedCanvasAndFocalPoint({...PrevImageRef}, Width, Height, {
                                flipHorizontal,
                                flipVertical: !flipVertical,
                                rotateDeg
                            },
                            focalPoint)
                            const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                            context.clearRect(0, 0, Width, Height)
                            context.drawImage(newCanvas[0], 0, 0, Width, Height)
                            setNewFocalPoint(newFocalPoint)
                    }}><GiVerticalFlip/></button>
                </div>
                <div>
                    <input type="range" name="rotateDeg" id="rotateDeg" min="-180" max="180" value={rotateDeg} onChange={e => {
                        const value = parseInt(e.target.value)
                        setRotateDeg(value)
                        const {newCanvas, newFocalPoint} = GetResizedCanvasAndFocalPoint({...PrevImageRef}, Width, Height, {
                            flipHorizontal,
                            flipVertical,
                            rotateDeg: value
                        },
                        focalPoint)
                        const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                        context.clearRect(0, 0, Width, Height)
                        context.drawImage(newCanvas[0], 0, 0, Width, Height)
                        setNewFocalPoint(newFocalPoint)
                    }} />
                </div>
            </div>}
        </>
    );
};

export default Resize;
