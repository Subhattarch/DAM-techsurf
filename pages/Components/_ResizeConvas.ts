import { realpath } from "fs";
import $ from "jquery";

const getRealDifference = (
    maxDifference: number,
    calculatedDifference: number
): number =>
    maxDifference / calculatedDifference < 0
        ? 0
        : (maxDifference < 0 && maxDifference <= calculatedDifference) ||
          (maxDifference > 0 && maxDifference >= calculatedDifference)
        ? calculatedDifference
        : maxDifference;

const GetResizedCanvasAndFocalPoint = (
    Canvas: String | JQuery<HTMLCanvasElement>,
    width: number,
    height: number,
    {
        flipHorizontal = false,
        flipVertical = false,
        rotateDeg = 0
    }: {
        flipHorizontal?: boolean,
        flipVertical?: boolean,
        rotateDeg?: number
    },
    focalPoint?: { x: number; y: number }
): {
    newCanvas: JQuery<HTMLCanvasElement>;
    newFocalPoint: {
        x: number;
        y: number;
    };
} => {
    const prevCanvas: JQuery<HTMLCanvasElement> = $(Canvas) as unknown as JQuery<HTMLCanvasElement>;
    const prevHeight = parseInt(prevCanvas.attr("height") as string);
    const prevWidth = parseInt(prevCanvas.attr("width") as string);
    const prevFocalPoint = focalPoint ?? {
        x: prevWidth / 2,
        y: prevHeight / 2,
    };
    const newCanvas: JQuery<HTMLCanvasElement> = $(`<canvas height="${height}" width="${width}"></canvas>`);
    const newCanvasContext: CanvasRenderingContext2D = newCanvas[0].getContext("2d") as CanvasRenderingContext2D;
    const newWidth = parseInt(newCanvas.attr("width") as string);
    const newHeight = parseInt(newCanvas.attr("height") as string);
    const heightDifference = newHeight - prevHeight;
    const widthDifference = newWidth - prevWidth;
    const CalculatedFocalDifference = {
        x: newWidth / 2 - prevFocalPoint.x,
        y: newHeight / 2 - prevFocalPoint.y,
    };
    const RealFocalDifference = {
        x: getRealDifference(widthDifference, CalculatedFocalDifference.x),
        y: getRealDifference(heightDifference, CalculatedFocalDifference.y),
    };
    const newFocalPoint = {
        x: prevFocalPoint.x + RealFocalDifference.x,
        y: prevFocalPoint.y + RealFocalDifference.y,
    };
    newCanvasContext.translate(newFocalPoint.x, newFocalPoint.y)
    newCanvasContext.rotate(-rotateDeg*Math.PI/180)
    newCanvasContext.translate(-newFocalPoint.x, -newFocalPoint.y)
    newCanvasContext.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)
    newCanvasContext.drawImage(
        prevCanvas[0],
        RealFocalDifference.x,
        RealFocalDifference.y,
        flipHorizontal ? -prevWidth : prevWidth,
        flipVertical ? -prevHeight : prevHeight
    );
    return {
        newCanvas,
        newFocalPoint,
    };
};

export default GetResizedCanvasAndFocalPoint;
