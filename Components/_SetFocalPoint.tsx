import { MutableRefObject } from 'react'
import 'jquery'
import $ from 'jquery'
import jcanvas from 'jcanvas'
import UseState from './_UseState'
import {MdCenterFocusStrong} from 'react-icons/md'
import { SetState, DataToSave, SetDoneT, CurrentActionRef } from './_types'



function SetFocalPoint({
    ImageRef,
    setDone,
    focalPoint,
    setFocalPoint,
    currentActionRef
}: {
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>,
    setDone: SetDoneT,
    focalPoint: {x: number, y: number},
    setFocalPoint: SetState<{x: number, y: number}>,
    currentActionRef: CurrentActionRef
}): JSX.Element {
    const [isSettingFocalPoint, setIsSettingFocalPoint] = UseState<boolean>(false)
    if(isSettingFocalPoint) currentActionRef.current = {
        name: "FocalPoint",
        data: focalPoint
    }
    return (
        <button className={isSettingFocalPoint ? "selected" : ""} onClick={() => {
            if(isSettingFocalPoint) {
                setDone(null)
                return
            }
            setDone((AddAction: (newState: DataToSave | DataToSave[]) => void) => {
                // AddAction({
                //     name: "FocalPoint",
                //     data: focalPoint
                // })
                setIsSettingFocalPoint(false)
                ImageRef.current.removeLayer("Focal-point").drawLayers()
            })
            setIsSettingFocalPoint(true);
            (window as any).$ = $
            jcanvas($, window)
            const rem = parseInt(getComputedStyle(document.documentElement).fontSize)
            const Width = parseInt(ImageRef.current.attr("width") as string)
            const Height = parseInt(ImageRef.current.attr("height") as string)
            setTimeout(() => ImageRef.current.drawArc({
                fillStyle: "#00000080",
                x: focalPoint.x,
                y: focalPoint.y,
                radius: 1.5 * rem,
                layer: true,
                name: "Focal-point",
                draggable: true,
                drag: layer => {
                    const x = layer.x = layer.x < layer.radius ? layer.radius : layer.x > Width - layer.radius ? Width - layer.radius : layer.x
                    const y = layer.y = layer.y < layer.radius ? layer.radius : layer.y > Height - layer.radius ? Height - layer.radius : layer.y
                    // setFocalPoint({x, y})
                },
                remove: ({x, y}) => {
                    setFocalPoint({
                        x, y
                    })
                }
            }), 200)
        } }><MdCenterFocusStrong /></button>
    )
}

export default SetFocalPoint