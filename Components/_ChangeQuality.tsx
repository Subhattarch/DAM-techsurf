import { MutableRefObject, useEffect, useState, useRef } from "react";
import {RiImageEditFill} from 'react-icons/ri'
import bytesToGBAndMiddleConverter from "./_bytesToGBAndMiddleConverter";
import { SetState, DataToSave, SetDoneT, CurrentActionRef } from "./_types";
import UseState from "./_UseState";

const ChangeQuality = ({
    ImageRef,
    dataUrl,
    setDone,
    currentActionRef
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    dataUrl: string;
    setDone: SetDoneT;
    currentActionRef: CurrentActionRef
}) => {
    const [quality, setQuality] = UseState<number>(92);
    const [PrevImage, setPrevImage] =
        UseState<JQuery<HTMLCanvasElement> | null>((): null => null);
    const [prevSize, setPrevSize] = UseState<number>(0);
    const [nextSize, setNextSize] = UseState<number>(0);
    const [isChangingQuality, setIsChangingQuality] = UseState<boolean>(false)
    const ChangeTimeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    if(isChangingQuality) currentActionRef.current = {
        name: "quality",
        data: quality
    }
    useEffect(() => {
        const IMG = new Image();
        IMG.src = dataUrl;
        IMG.onload = () => {
            const canvas = $(
                `<canvas height="${IMG.height}" width="${IMG.width}"></canvas>`
            ) as JQuery<HTMLCanvasElement>;
            const context = canvas[0].getContext("2d");
            context?.drawImage(IMG, 0, 0, IMG.width, IMG.height);
            setPrevImage(canvas);
            canvas[0]?.toBlob(blob => {
                setPrevSize(blob?.size ?? 0);
                setNextSize(blob?.size ?? 0);
            }, "image/jpeg");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUrl]);
    return (
        <>
            <button className={isChangingQuality ? "selected" : ""} onClick={() => {
                if(isChangingQuality) return setDone(null)
                setIsChangingQuality(true)
                setQuality(92)
                setDone((AddAction: (newState: DataToSave | DataToSave[]) => void) => {
                    // AddAction({
                    //     name: "quality",
                    //     data: quality
                    // })
                    setIsChangingQuality(false)
                })
            }}><RiImageEditFill/></button>
            {isChangingQuality && <div>
                <div>
                    <label htmlFor='quality'>quality</label>
                    <input
                        type='range'
                        name='quality'
                        id='quality'
                        min={0}
                        max={100}
                        value={quality}
                        onChange={e => {
                            if(ChangeTimeOutRef.current) clearTimeout(ChangeTimeOutRef.current)
                            const value = parseInt(e.target.value);
                            const IMG = new Image();
                            IMG.src =
                                PrevImage?.[0].toDataURL(
                                    "Image/jpeg",
                                    parseInt(e.target.value) / 100
                                ) ?? "";
                            IMG.onload = () => ImageRef.current.prop({
                                    height: IMG.height,
                                    width: IMG.width
                                }).clearCanvas().drawImage({
                                    source: IMG,
                                    x: 0,
                                    y: 0,
                                    width: IMG.width,
                                    height: IMG.height,
                                    fromCenter: false,
                                    load: () => ChangeTimeOutRef.current = setTimeout(() => ImageRef.current[0].toBlob(blob => setNextSize(blob?.size ?? 0), "image/jpeg"), 10)
                                })
                            setQuality(value)
                        }}
                    />
                </div>
                <p>
                    original size: {bytesToGBAndMiddleConverter(prevSize)} -{">"} new size {bytesToGBAndMiddleConverter(nextSize)}
                </p>
                <p>
                    Please note that this size may vary from format to formate.
                </p>
            </div>}
        </>
    );
};

export default ChangeQuality;
