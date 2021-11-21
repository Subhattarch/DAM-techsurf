import { MutableRefObject, useRef, useEffect } from "react";
import {post} from 'jquery'
import "cropperjs/dist/cropper.css";
import Preview from "./_Preview";
import Crop from "./_Crop";
import UseState from "./_UseState";
import { DataToSave, SetState, SetDoneT, dataActions, CurrentActionRef } from "./_types";
import Resize from "./_Resize";
import SetFocalPoint from "./_SetFocalPoint";
import AddEffect from "./_AddEffect";
import AddOverlay from "./_AddOverlay";
import ChangeQuality from "./_ChangeQuality";
import DownloadImage from "./_downloadImage";
import UseStateArray from "./_UseStateArray";
import AddBorder from "./_AddBorder";
import UseSteps from "./_UseSteps";
import Message from "./_message";

const DAM = ({ src, FocalPoint, Steps, FocalSteps, actions }: { src: string, FocalPoint: {
    x: number,
    y: number
}, Steps: string[], FocalSteps: {
    x: number,
    y: number
}[]; actions: DataToSave[] }) => {
    const [Name, setName] = UseState<string>("")
    const [message, setMessage] = UseState<{text: string, error?: boolean}>({text: "", error: false})
    const [isSaving, setIsSaving] = UseState<boolean>(false)
    const canceledRef = useRef<boolean>(false)
    const cropCallbackRef = useRef<Function | null>(() => {}) as MutableRefObject<Function>
    const ImageRef = useRef<JQuery<HTMLCanvasElement> | null>(
        null
    ) as MutableRefObject<JQuery<HTMLCanvasElement>>;
    const [Done, setDone] = UseState<Function | null>(null);
    const [dataUrl, setDataUrl] = UseState<string>(src);
    const [focalPoint, setFocalPoint] = UseState<{
        x: number;
        y: number;
    }>({
        x: 0,
        y: 0,
    });
    const [focalPointSteps, setFocalStep, addFocalStep, removeFocalStep] = UseSteps<{x: number, y: number}>()
    const SetFocalPointF = ((state: {x: number, y: number}) => {
        if(!canceledRef.current) {setFocalPoint(state); addFocalStep(focalPoint)}
    }) as SetState<{x: number, y:number}>
    const [Actions, setAction] = UseStateArray<DataToSave>([]);
    const [steps, setSteps, addSteps, removeSteps] = UseSteps<string>()
    const [RedoSteps, setRedoSteps, addRedoStep, removeRedoStep] = UseSteps<{
        src: string,
        data: DataToSave,
        focalPoint: {x: number, y:number},
        currentSrc: string,
        currentFocalPoint: {x: number, y: number}
    }>()
    const currentActionRef = useRef<DataToSave | null>(null) as CurrentActionRef
    const SetDone: SetDoneT = state => {
        if (Done) Done();
        if (Done && currentActionRef.current && !canceledRef.current) setAction(currentActionRef.current)
        setTimeout(() => $(".canvas-container").css({
            height: "100%",
            width: "100%"
        }), 50)
        // if (canceledRef.current)
        setDone(
            state instanceof Function
                ? prev => () => { setDataUrl(
                          prevState =>{
                            const newDataUrl = (
                                (state as ((
                                    AddAction: (
                                        newState: DataToSave | DataToSave[],
                                        removeLast?: boolean
                                    ) => void,
                                    isCanceled?: boolean
                                ) => string | void)
                            )((
                              newState: DataToSave | DataToSave[],
                              removeLast?: boolean
                          ) => (!canceledRef.current ? setAction(newState, removeLast) : null), canceledRef.current) ??
                            ImageRef.current?.[0].toDataURL() ??
                            prevState)
                            if(canceledRef.current) {
                                const IMG = new Image()
                                IMG.src = prevState
                                IMG.onload = () => ImageRef.current.drawImage({
                                    source: IMG,
                                    x: 0,
                                    y: 0,
                                    fromCenter: false,
                                    width: IMG.width,
                                    height: IMG.height
                                })
                            }
                            if(!canceledRef.current) addSteps(prevState)
                              return (!canceledRef.current ? newDataUrl : prevState)}
                      );
                      setDone(null);
                      canceledRef.current = false
                  }
                : null
        );
    };
    useEffect(() => {
        setSteps(Steps)
        setAction([])
        setFocalStep(FocalSteps)
        setDataUrl(src)
        setAction(actions)
        setRedoSteps([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])
    return (
        <div
        className="DAM--Container"
            style={{
                display: "grid",
                gridTemplateColumns: "min-content 1fr",
                gridTemplateRows: "minmax(auto, 80vh) auto",
                gridGap: "0.5rem",
                position: "fixed",
                top: 0,
                left: 0,
                width: "97vw",
                height: "80vh",
                // overflow: "auto",
                padding: "0.25rem",
                placeItems: "center"
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto",
                    maxWidth: "45vw",
                    maxHeight: "calc(100vh - 2rem)",
                    overflow: "scroll",
                    
                }}
                id='menu-bar'
            >
                <Crop
                    ImageRef={ImageRef}
                    setDone={SetDone}
                    setFocalPoint={SetFocalPointF}
                    cropCallbackRef={cropCallbackRef}
                    currentActionRef={currentActionRef}
                />
                <Resize
                    ImageRef={ImageRef}
                    dataUrl={dataUrl}
                    setDone={SetDone}
                    focalPoint={focalPoint}
                    setFocalPoint={SetFocalPointF}
                    currentActionRef={currentActionRef}
                    Done={Done}
                />
                <SetFocalPoint
                    ImageRef={ImageRef}
                    setDone={SetDone}
                    focalPoint={focalPoint}
                    setFocalPoint={SetFocalPointF}
                    currentActionRef={currentActionRef}
                />
                <AddEffect
                    ImageRef={ImageRef}
                    dataUrl={dataUrl}
                    setDone={SetDone}
                    currentActionRef={currentActionRef}
                />
                <AddOverlay
                    ImageRef={ImageRef}
                    setDone={SetDone}
                    setDataUrl={setDataUrl}
                    currentActionRef={currentActionRef}
                    addAction={setAction}
                />
                <ChangeQuality
                    ImageRef={ImageRef}
                    dataUrl={dataUrl}
                    setDone={SetDone}
                    currentActionRef={currentActionRef}
                />
                <AddBorder ImageRef={ImageRef} dataUrl={dataUrl} setDone={SetDone} currentActionRef={currentActionRef} setFocalPoint={setFocalPoint} />
                <DownloadImage ImageRef={ImageRef} setDone={SetDone} />
            </div>
            <Preview
                src={dataUrl}
                ImageRef={ImageRef}
                focalPoint={focalPoint}
                setFocalPoint={setFocalPoint}
                cropCallbackRef={cropCallbackRef}
            />
            {Actions.length > 0 && (
                <div>
                    <button
                        onClick={() => {
                            setAction([]);
                            setDataUrl(src);
                            SetDone(null);
                            setFocalPoint({ x: 0, y: 0 });
                        }}
                    >
                        Restore
                    </button>
                    <button onClick={() => {
                        setIsSaving(true)
                    }}>Save</button>
                </div>
            )}
            <div className="buttons">
                {steps.length > 0 && FocalSteps.length > 0 && <button onClick={() => {
                    const lastAction = Actions.pop() as DataToSave
                    setAction(Actions)
                    const lastUrl = removeSteps() as string
                    const lstFocalPoint =removeFocalStep() as {x: number, y: number}
                    setFocalPoint(lstFocalPoint ?? {x: 0, y: 0})
                    setDataUrl(lastUrl ?? src)
                    addRedoStep({
                        data: lastAction,
                        src: lastUrl,
                        focalPoint: lstFocalPoint,
                        currentFocalPoint: focalPoint,
                        currentSrc: dataUrl
                    })
                }}>undo</button>}
                {RedoSteps.length > 0 && <button onClick={() => {
                    const {data, src, focalPoint, currentSrc, currentFocalPoint} = removeRedoStep() as {
                        src: string;
                        data: DataToSave;
                        focalPoint: {
                            x: number;
                            y: number;
                        };
                        currentSrc: string;
                        currentFocalPoint: {
                            x: number;
                            y: number;
                        };
                    } 
                    setAction(data)
                    addSteps(src)
                    addFocalStep(focalPoint)
                    setDataUrl(currentSrc)
                    setFocalPoint(currentFocalPoint)
                }}>redo</button>}
                {Done && (
                    <>
                        <button onClick={() => {
                            canceledRef.current = true,
                            Done?.()
                        }}>cancel</button>
                        <button
                            onClick={() => Done?.()}
                            style={{
                                gridColumn: "2 / 3",
                            }}
                        >
                            done
                        </button>
                    </>
                )}
            </div>
            {isSaving && <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "grid",
                placeItems: "center",
                backgroundColor: "#0009"
            }}>
                    <div style={{
                        height: "fit-content",
                        width: "fit-content",
                        backgroundColor: "#fff",
                        padding: "1.3em",
                        borderRadius: "1em"
                    }}>
                        <div><label htmlFor="name">name</label><input type="text" name="name" id="name" value={Name} onChange={e => {
                            setName(e.target.value)
                        }} /></div>
                        <button onClick={() => {
                            if(Name.length === 0) return setMessage({
                                text: "must have a name",
                                error: true
                            })
                            post("/api/save", {
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                data: JSON.stringify({
                                    Name,
                                    Actions
                                })
                            })
                        }}>save</button><button onClick={() => {
                            setIsSaving(false)
                        }}>cancel</button>
                    </div>
                </div>}
                <Message message={message} setMessage={setMessage} />
        </div>
    );
};

export default DAM;
