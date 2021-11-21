import {
    Border,
    CropperData,
    dataActions,
    dataName,
    DataToSave,
    Effects,
    SetState,
    TransformData as TransformDataT,
} from "./_types";
import $ from "jquery";
import "jquery-cropper";
import GetResizedCanvasAndFocalPoint from "./_ResizeConvas";
import { fabric } from "fabric";

type doActionFunction = (
    end:  (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
    canvas: HTMLCanvasElement,
    data: dataActions,
    index: number,
    Actions: DataToSave[],
    focalPoint?: {
        x: number;
        y: number;
    },
    steps?: string[],
    focalSteps?: {
        x: number;
        y: number;
    }[]
) => void;

const doAction: {
    [name: string]: doActionFunction;
} = {
    Crop: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        CropData: CropperData,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const prevUrl = canvas.toDataURL();
        const IMG = new Image();
        IMG.src = prevUrl;
        IMG.onload = () => {
            const croppedCanvas = $<HTMLCanvasElement>(`
            <canvas
                height="${CropData.height}" 
                width="${CropData.width}"
            ></canvas>`)[0];
            croppedCanvas
                .getContext("2d")
                ?.drawImage(
                    IMG,
                    -CropData.x,
                    -CropData.y,
                    IMG.width,
                    IMG.height
                );
            const dataUrl = croppedCanvas.toDataURL();
            const FocalPoint = {
                x: CropData.width / 2,
                y: CropData.height / 2,
            };
            if (Actions.length - 1 === index) return end(dataUrl, FocalPoint,
                [...(steps ?? []), prevUrl],
                [...(focalSteps ?? []), focalPoint ?? {
                    x: 0, y: 0
                }]);
            const nextIndex = index + 1;
            doAction?.[Actions[nextIndex].name]?.(
                end,
                croppedCanvas,
                Actions[nextIndex].data,
                nextIndex,
                Actions,
                FocalPoint,
                [...(steps ?? []), prevUrl],
                [...(focalSteps ?? []), focalPoint ?? {
                    x: 0, y: 0
                }]
            );
        };
    }) as doActionFunction,
    Transform: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        TransFormData: TransformDataT,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const prevDataUrl = canvas.toDataURL();
        const FocalPoint = focalPoint ?? {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        const { newCanvas: $newCanvas, newFocalPoint } =
            GetResizedCanvasAndFocalPoint(
                $(canvas),
                TransFormData.Width,
                TransFormData.Height,
                {
                    flipHorizontal: TransFormData.flipHorizontal,
                    flipVertical: TransFormData.flipVertical,
                    rotateDeg: TransFormData.rotateDeg,
                },
                FocalPoint
            );
        const dataUrl = $newCanvas[0].toDataURL();
        if (Actions.length - 1 === index) return end(dataUrl, newFocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), FocalPoint]);
        const nextIndex = index + 1;
        doAction[Actions[nextIndex].name]?.(
            end,
            $newCanvas[0],
            Actions[nextIndex].data,
            nextIndex,
            Actions,
            newFocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), FocalPoint]
        );
    }) as doActionFunction,
    FocalPoint: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        FocalPoint: {
            x: number;
            y: number;
        },
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const dataUrl = canvas.toDataURL();
        if (Actions.length - 1 === index) return end(dataUrl, FocalPoint,
            [...(steps ?? []), dataUrl],
            [...(focalSteps ?? []), focalPoint ?? {
                x: 0,
                y: 0
            }]);
        const nextIndex = index + 1;
        doAction?.[Actions[nextIndex].name]?.(
            end,
            canvas,
            Actions[nextIndex].data,
            nextIndex,
            Actions,
            FocalPoint,
            [...(steps ?? []), dataUrl],
            [...(focalSteps ?? []), focalPoint ?? {
                x: 0,
                y: 0
            }]
        );
    }) as doActionFunction,
    effects: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        { brightness, contrast, saturation, grayScale, invert, blur }: Effects,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const prevDataUrl = canvas.toDataURL();
        const FocalPoint = focalPoint ?? {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        const newCanvas = $<HTMLCanvasElement>(
            `<canvas
                height="${canvas.height}"
                width="${canvas.width}"
            ></canvas>`
        )[0];
        const context = newCanvas.getContext("2d") as CanvasRenderingContext2D;
        context.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        grayscale(${grayScale}%)
        invert(${invert}%)
        blur(${blur}px)
        `;
        context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        const dataUrl = newCanvas.toDataURL();
        if (Actions.length - 1 === index) return end(dataUrl, FocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), FocalPoint]);
        const nextIndex = index + 1;
        doAction[Actions[nextIndex].name]?.(
            end,
            newCanvas,
            Actions[nextIndex].data,
            nextIndex,
            Actions,
            FocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), FocalPoint]
        );
    }) as doActionFunction,
    overlays: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        overlays: string,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const dataUrl = canvas.toDataURL();
        const originalDimensions = {
            width: canvas.width,
            height: canvas.height,
        };
        const background = new Image();
        background.src = dataUrl;
        background.onload = () => {
            const fabricCanvas = new fabric.Canvas(canvas);
            const Background = new fabric.Image(background);
            fabricCanvas.loadFromJSON(overlays, () => {
                fabricCanvas.renderAll.bind(fabricCanvas);
                fabricCanvas.setBackgroundImage(Background, () => {
                    fabricCanvas.renderAll.bind(fabricCanvas);
                    fabricCanvas.renderAll();
                    const newDataUrl = canvas.toDataURL();
                    const FocalPoint = focalPoint ?? {
                        x: canvas.width / 2,
                        y: canvas.height / 2,
                    }
                    if (Actions.length - 1 === index)
                        return end(
                            newDataUrl,
                            FocalPoint,
                            [...(steps ?? []), dataUrl],
                            [...(focalSteps ?? []), FocalPoint]
                        );
                    const nextIndex = index + 1;
                    const newImage = new Image();
                    newImage.src = newDataUrl;
                    newImage.onload = () => {
                        const newCanvas =
                            $<HTMLCanvasElement>(`<canvas></canvas>`).prop(
                                originalDimensions
                            )[0];
                        const newContext = newCanvas.getContext(
                            "2d"
                        ) as CanvasRenderingContext2D;
                        newContext.drawImage(
                            newImage,
                            0,
                            0,
                            newCanvas.width,
                            newCanvas.height
                        );
                        doAction[Actions[nextIndex].name](
                            end,
                            newCanvas,
                            Actions[nextIndex].data,
                            nextIndex,
                            Actions,
                            focalPoint,
                            [...(steps ?? []), dataUrl],
                            [...(focalSteps ?? []), FocalPoint]
                        );
                    };
                });
            });
        };
    }) as doActionFunction,
    quality: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        quality: number,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const dataUrl = canvas.toDataURL("Image/jpeg", quality / 100);
        const FocalPoint = focalPoint ?? {
            x: canvas.width / 2,
            y: canvas.height / 2,
        }
        if (Actions.length - 1 === index)
            return end(
                dataUrl,
                FocalPoint,
                [...(steps ?? []), dataUrl],
                [...(focalSteps ?? []), FocalPoint]
            );
        const IMG = new Image();
        IMG.src = dataUrl;
        IMG.onload = () => {
            const newCanvas = $<HTMLCanvasElement>(
                `<canvas
                    width="${canvas.width}"
                    height="${canvas.height}"
                ></canvas>`
            )[0];
            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            context.drawImage(IMG, 0, 0, canvas.width, canvas.height);
            const nextIndex = index + 1;
            doAction[Actions[nextIndex].name]?.(
                end,
                newCanvas,
                Actions[nextIndex].data,
                nextIndex,
                Actions,
                focalPoint,
                [...(steps ?? []), dataUrl],
                [...(focalSteps ?? []), FocalPoint]
            );
        };
    }) as doActionFunction,
    border: ((
        end:   (
        src: string,
        focalPoint: {
            x: number;
            y: number;
        },
        steps: string[],
        focalArray: { x: number; y: number }[]
    ) => void,
        canvas: HTMLCanvasElement,
        { padding, color }: Border,
        index: number,
        Actions: DataToSave[],
        focalPoint?: {
            x: number;
            y: number;
        },
        steps?: string[],
        focalSteps?: {
            x: number;
            y: number;
        }[]
    ) => {
        const prevDataUrl = canvas.toDataURL();
        const newCanvas = $<HTMLCanvasElement>(
            `<canvas
                    width="${canvas.width + padding * 2}"
                    height="${canvas.height + padding * 2}"
                ></canvas>`
        )[0];
        const context = newCanvas.getContext("2d") as CanvasRenderingContext2D;
        context.fillStyle = color;
        context.fillRect(0, 0, newCanvas.width, newCanvas.height);
        context.drawImage(
            canvas,
            padding,
            padding,
            canvas.width,
            canvas.height
        );
        const FocalPoint = {
            x:
                focalPoint != null
                    ? focalPoint.x + padding
                    : newCanvas.width / 2,
            y:
                focalPoint != null
                    ? focalPoint.y + padding
                    : newCanvas.height / 2,
        };
        const dataUrl = newCanvas.toDataURL();
        if (Actions.length - 1 === index) return end(dataUrl, FocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), focalPoint ?? {x: 0, y: 0}]);
        const nextIndex = index + 1;
        doAction[Actions[nextIndex].name]?.(
            end,
            newCanvas,
            Actions[nextIndex].data,
            nextIndex,
            Actions,
            FocalPoint,
            [...(steps ?? []), prevDataUrl],
            [...(focalSteps ?? []), focalPoint ?? {x: 0, y: 0}]
        );
    }) as doActionFunction,
};

const getTemplatedCanvas = (
    src: string,
    Actions: DataToSave[],
    endCallback: (src: string, focalPoint: {
        x: number,
        y: number
    }, steps: string[], focalSteps: {x: number, y: number}[]) => void,
    setDataUrl?: SetState<string>,
    setFocalPoint?: SetState<{
        x: number;
        y: number;
    }>,
    setSteps?: SetState<string[]>,
    setFocalSteps?: SetState<{
        x: number;
        y: number;
    }[]>,
) => {
    if (Actions.length === 0) {
        setDataUrl?.(src);
        setFocalPoint?.({x: 0, y: 0})
        setSteps?.([])
        setFocalSteps?.([])
        endCallback?.(src, {x: 0, y: 0}, [], []);
        return;
    }
    const IMG = new Image();
    IMG.src = src;
    IMG.onload = () => {
        const canvas = $<HTMLCanvasElement>(
            `<canvas width="${IMG.width}" height="${IMG.height}"></canvas>`
        )[0];
        const context = canvas.getContext("2d");
        context?.drawImage(IMG, 0, 0, IMG.width, IMG.height);
        doAction[Actions[0].name]?.(
            (src, focalPoint, steps, focalSteps) => {
                setDataUrl?.(src);
                setFocalPoint?.(focalPoint);
                setSteps?.(steps)
                setFocalSteps?.(focalSteps)
                endCallback?.(src, focalPoint, steps, focalSteps);
            },
            canvas,
            Actions[0].data,
            0,
            Actions
        );
    };
};

export default getTemplatedCanvas;
