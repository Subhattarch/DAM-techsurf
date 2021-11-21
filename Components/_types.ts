import { MutableRefObject } from "react"

type SetState<type> = (newState: type | ((prevState: Required<type>) => type))=> void

type CropperData = {
    x: number,
    y: number,
    width: number,
    height: number,
    rotate: number,
    scaleX: number,
    scaleY: number
}
type TransformData = {
    Height: number,
    Width: number,
    flipHorizontal: boolean,
    flipVertical: boolean,
    rotateDeg: number
}

type Effects = {
    brightness: number,
    contrast: number,
    saturation: number,
    grayScale: number,
    invert: number,
    blur: number
}

type Border = {
    padding: number,
    color: string
}

type SetDoneT = SetState<((AddAction: ((newState: DataToSave | DataToSave[]) => void), isCanceled: boolean) => string | void) | null>

type dataName = "Crop" | "Transform" | "FocalPoint" | "effects" | "overlays" | "quality" | "border"

type dataActions = CropperData | TransformData | {
    x: number,
    y: number
} | Effects | string | number | Border

type DataToSave = {name: dataName, data: dataActions}

type CurrentActionRef = MutableRefObject<DataToSave>

export type {
    SetState,
    CropperData,
    DataToSave,
    SetDoneT,
    dataActions,
    dataName,
    TransformData,
    CurrentActionRef,
    Effects,
    Border
}