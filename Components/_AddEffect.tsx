import { MutableRefObject, useEffect } from "react";
import {BsCircleHalf} from 'react-icons/bs'
import { SetState, DataToSave, SetDoneT, CurrentActionRef } from "./_types";
import UseState from "./_UseState";

const AddEffect = ({
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
    const [isAddingEffect, setIsAddingEffect] = UseState<boolean>(false)
    const [brightness, setBrightness] = UseState<number>(100);
    const [contrast, setContrast] = UseState<number>(100);
    const [saturation, setSaturation] = UseState<number>(100);
    const [grayScale, setGrayScale] = UseState<number>(0);
    const [invert, setInvert] = UseState<number>(0);
    const [blur, setBlur] = UseState<number>(0);
    if(isAddingEffect) currentActionRef.current = {
        data: {brightness,invert,
        contrast,
        saturation,
        grayScale,
        blur},
        name: "effects"

    }
    useEffect(() => {
        const context = ImageRef.current[0]?.getContext("2d");
        if (!context) return;
        (context as CanvasRenderingContext2D).filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        grayscale(${grayScale}%)
        invert(${invert}%)
        blur(${blur}px)
        `;
        const image = new Image();
        image.src = dataUrl;
        image.onload = () => {
            context?.clearRect(0, 0, image.width, image.height);
            context.drawImage(image, 0, 0, image.width, image.height);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brightness, contrast, saturation, grayScale, invert, blur]);
    return (
        <>
            <button className={isAddingEffect ? "selected" : ""} onClick={() => {
                if(isAddingEffect) {
                    setDone(null)
                    return
                }
                setDone((AddAction: (newState: DataToSave | DataToSave) => void) => {
                    // AddAction({
                    //     name: "effects",
                    //     data: {
                    //         brightness,
                    //         contrast,
                    //         saturation,
                    //         grayScale,
                    //         invert,
                    //         blur
                    //     }
                    // })
                    setIsAddingEffect(false)
                })
                setIsAddingEffect(true)
            }}><BsCircleHalf/></button>
            {isAddingEffect && <div>
                <div>
                    <label htmlFor='brightness'>brightness</label>
                    <input
                        type='range'
                        name='brightness'
                        id='brightness'
                        min={-100}
                        max={100}
                        value={brightness - 100}
                        onChange={e =>
                            setBrightness(parseInt(e.target.value) + 100)
                        }
                    />
                </div>
                <div>
                    <label htmlFor='contrast'>contrast</label>
                    <input
                        type='range'
                        name='contrast'
                        id='contrast'
                        min={0}
                        max={200}
                        value={contrast}
                        onChange={e => setContrast(parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor='saturation'>saturation</label>
                    <input
                        type='range'
                        name='saturation'
                        id='saturation'
                        min={-100}
                        max={100}
                        value={saturation}
                        onChange={e => setSaturation(parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor='grayscale'>gray scale</label>
                    <input
                        type='range'
                        name='grayscale'
                        id='grayscale'
                        min={0}
                        max={100}
                        value={grayScale}
                        onChange={e => setGrayScale(parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor='invert'>invert</label>
                    <input
                        type='range'
                        name='invert'
                        id='invert'
                        min={0}
                        max={100}
                        value={invert}
                        onChange={e => setInvert(parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor='blur'>blur</label>
                    <input
                        type='range'
                        name='blur'
                        id='blur'
                        min={0}
                        max={100}
                        value={blur}
                        onChange={e => setBlur(parseInt(e.target.value))}
                    />
                </div>
            </div>}
        </>
    );
};

export default AddEffect