import $ from "jquery";
import Cropper from "cropperjs";
import "jquery-cropper";
import { MutableRefObject } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faCropAlt, faSquare, faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import {FaRegSquare} from 'react-icons/fa'
import {IoPhoneLandscapeSharp,IoPhonePortraitSharp, IoTabletLandscapeOutline, IoTabletPortraitOutline} from 'react-icons/io5'
import UseState from "./_UseState";
import { SetState, DataToSave, SetDoneT, CropperData, CurrentActionRef } from "./_types";

const Crop = ({
    ImageRef,
    setDone,
    setFocalPoint,
    cropCallbackRef,
    currentActionRef
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    setDone: SetDoneT;
    setFocalPoint: SetState<{x: number, y: number}>;
    cropCallbackRef: MutableRefObject<Function>;
    currentActionRef: CurrentActionRef
}) => {
    const [Width, setWidth] = UseState<number>(
        () =>
            ImageRef.current?.cropper("getData", true)
                ?.width as unknown as number
    );
    const [Height, setHeight] = UseState<number>(
        () =>
            ImageRef.current?.cropper("getData", true)
                ?.height as unknown as number
    );
    const [isCropping, setCropping] = UseState<boolean>(false);
    const AspectRatios: [number, number][] = [
        [1, 1],
        [16, 9],
        [9, 16],
        [4, 3],
        [3, 4],
    ];
    const Icons = [
        <FaRegSquare key={1} />,
        <IoPhoneLandscapeSharp key={2} />,
        <IoPhonePortraitSharp key={3} />,
        <IoTabletLandscapeOutline key={4} />,
        <IoTabletPortraitOutline key={5} />
    ]
    cropCallbackRef.current = (e: {
        detail: {
            width: number,
            height: number
        }
    }) => {
        setWidth(Math.round(e.detail.width));
        setHeight(Math.round(e.detail.height));
    }
    if(isCropping) currentActionRef.current = {name: "Crop", data: (ImageRef.current.cropper("getData") as unknown as CropperData)}
    return (
        <>
            <button className={isCropping ? "selected" : ""}
                onClick={() => {
                    if (isCropping) {
                        setDone(null);
                        return;
                    }
                    setCropping(true)
                    const width = ImageRef.current[0].clientWidth
                    ImageRef.current?.cropper({
                        ready: () => {
                            $(".cropper-container").css({
                                top: "-0.23rem",
                                right: "0.23rem",
                                position: "relative"
                            }).css(
                                "transform",
                                `scale(${
                                    width /
                                ($<HTMLDivElement>(
                                    ".cropper-container"
                                ).width() as number) 
                                })`
                            );
                        },
                        crop: e => {
                            setWidth(Math.round(e.detail.width));
                            setHeight(Math.round(e.detail.height));
                        },
                    })
                    setDone((AddAction: (newState: DataToSave | DataToSave[]) => void, isCanceled: boolean) => {
                        const NewDataUrl = (ImageRef.current?.cropper("getCroppedCanvas") as unknown as HTMLCanvasElement)?.toDataURL()
                        
                        ImageRef.current?.cropper("destroy");
                        setFocalPoint({x: 0, y: 0})
                        setCropping(false);
                        if(isCanceled) return
                        return NewDataUrl
                    });
                }}
            >
                <FontAwesomeIcon icon={faCropAlt} />
            </button>
            {isCropping && (
                <div>
                    <div>
                        <div>
                            <label htmlFor='width'>width</label>
                            <input
                                type='number'
                                name='width'
                                id='width'
                                value={Width}
                                onChange={e => {
                                    ImageRef.current?.cropper("setData", {
                                        width: parseInt(
                                            $(
                                                e.target as HTMLInputElement
                                            ).val() as string
                                        ),
                                    });
                                    setWidth(
                                        parseInt(
                                            $(
                                                e.target as HTMLInputElement
                                            ).val() as string
                                        )
                                    );
                                }}
                            />
                        </div>
                        <div>
                            <label htmlFor='height'>height</label>
                            <input
                                type='number'
                                name='width'
                                id='width'
                                value={Height}
                                onChange={e => {
                                    ImageRef.current?.cropper("setData", {
                                        height: parseInt(
                                            $(
                                                e.target as HTMLInputElement
                                            ).val() as string
                                        ),
                                    });
                                    setHeight(
                                        parseInt(
                                            $(
                                                e.target as HTMLInputElement
                                            ).val() as string
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.3rem"
                    }}>
                        <button
                            onClick={() => {
                                ImageRef.current?.cropper(
                                    "setAspectRatio",
                                    NaN
                                );
                            }}
                        >
                            <FontAwesomeIcon icon={faVectorSquare} /> <p>free</p>
                        </button>
                        {AspectRatios.map(
                            (aspectRatio: [number, number], index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        ImageRef.current?.cropper(
                                            "setAspectRatio",
                                            aspectRatio[0] / aspectRatio[1]
                                        );
                                    }}
                                >
                                    {Icons[index]}
                                    <p>{aspectRatio[0]}:{aspectRatio[1]}</p>
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Crop;
