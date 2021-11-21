import { MutableRefObject } from "react"
import {FcFrame} from 'react-icons/fc'
import { CurrentActionRef, SetDoneT, SetState } from "./_types"
import UseState from "./_UseState"


const AddBorder = ({
    ImageRef,
    dataUrl,
    setDone,
    currentActionRef,
    setFocalPoint
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    dataUrl: string;
    setDone: SetDoneT;
    currentActionRef: CurrentActionRef,
    setFocalPoint: SetState<{
        x: number, y: number
    }>

}) => {
    const [padding, setPadding] = UseState<number>(0)
    const [color, setColor] = UseState<string>("#ffffff")
    const [isAddingBorder, setAddingBorder] = UseState<boolean>(false)
    if(isAddingBorder) currentActionRef.current = {
        name: "border",
        data: {
            padding,
            color
        }
    }
    return (<>
        <button className={isAddingBorder ? "selected" : ""} onClick={() => {
            if(isAddingBorder) return setDone(null)
            setAddingBorder(true)
            setDone(() => {
                setPadding(0)
                setColor("#ffffff")
                setAddingBorder(false)
            })
        }}><FcFrame/></button>
        {isAddingBorder && <div>
            <div><label htmlFor="padding">padding</label><input id="padding" type="number" value={padding} onChange={e => {
                const Value = parseInt(e.target.value)
                setPadding(Value)
                const IMG = new Image()
                setFocalPoint(({
                    x,
                    y
                }) => ({
                    x: x + Value,
                    y: y + Value
                }))
                IMG.src = dataUrl
                IMG.onload = () => {
                    ImageRef.current[0].width = IMG.width + 2 * Value
                    ImageRef.current[0].height = IMG.height + 2 * Value
                    const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                    context.fillStyle = color
                    context?.fillRect(0, 0, ImageRef.current[0].width, ImageRef.current[0].height)
                    context?.drawImage(IMG, Value, Value, IMG.width, IMG.height)
                }

            }} /></div>
            <div><label htmlFor="color">color</label><input id="color" type="color" value={color} onChange={e => {
                setColor(e.target.value)
                const IMG = new Image()
                IMG.src = dataUrl
                IMG.onload = () => {
                    const context = ImageRef.current[0].getContext("2d") as CanvasRenderingContext2D
                    context.fillStyle = e.target.value
                    context?.fillRect(0, 0, ImageRef.current[0].width, ImageRef.current[0].height)
                    context?.drawImage(IMG, padding, padding, IMG.width, IMG.height)
                }
            }} /></div>
        </div>}
    </>)
}

export default AddBorder
