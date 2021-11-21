import $ from "jquery";
import jcanvas from "jcanvas";
import { useResizeDetector } from "react-resize-detector";
import { MutableRefObject, useEffect } from "react";
import { SetState } from "./_types";

const Preview = ({
    src,
    ImageRef,
    focalPoint,
    setFocalPoint,
    cropCallbackRef,
}: {
    src: string;
    ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>;
    focalPoint: { x: number; y: number };
    setFocalPoint: SetState<{ x: number; y: number }>;
    cropCallbackRef: MutableRefObject<Function>;
}) => {
    // $(".canvas-container").css({
    //     width: "100%",
    //     height: "100%",
    // });
    const { width, height, ref } = useResizeDetector({
        onResize: ((width: number, height: number) => {
            const isCropping = $(".cropper-container").length > 0;
            ImageRef.current.cropper?.("destroy");
            // if(width < ImageRef.current[0].clientWidth) return ImageRef.current.css(
            //     "width",
            //     "100%"
            // )
            // if (height < ImageRef.current[0].clientHeight) {
            //     ImageRef.current.css(
            //         "height",
            //         "100%"
            //     ); //.css("width", "100%")
            //     return
            // }
            const Width = ImageRef.current[0].clientWidth
            

            if (height > ImageRef.current[0].clientHeight) {
                $(".canvas-container").css(
                    "height",
                    ImageRef.current[0].clientHeight
                ); //.css("width", "100%")
            }
            if (width > ImageRef.current[0].clientWidth) {
                $(".canvas-container").css(
                    "width",
                    ImageRef.current[0].clientWidth
                ); //.css("height", "100%")
            }
            if (isCropping) {
                setTimeout(() => {
                    ImageRef.current.cropper({
                        ready: () => {
                            $(".cropper-container").css({
                                top: "-0.23rem",
                                right: "0.23rem",
                                position: "relative"
                            }).css(
                                "transform",
                                `scale(${
                                    Width /
                                ($<HTMLDivElement>(
                                    ".cropper-container"
                                ).width() as number) 
                                })`
                            );
                        },
                        crop: cropCallbackRef.current as (data?: any) => void,
                    });
                }, 500);
            }
        }) as (width?: number, height?: number) => void,
    });
    useEffect(() => {
        const WindowResize = () => {
            $(".canvas-container").css({
                width: "100%",
                height: "100%",
            });
        };
        $(window).resize(WindowResize);
        setTimeout(
            () =>
                $(".canvas-container").css({
                    height: "100%",
                    width: "100%",
                }),
            500
        );
        return () => {
            $(window).off("resize", WindowResize);
        };
    }, []);
    useEffect(() => {
        (window as any).$ = $;
        jcanvas($, window);
        const img = new Image();
        img.src = src;
        img.onload = () => {
            if (focalPoint.x === 0 && focalPoint.y === 0)
                setFocalPoint({ x: img.width / 2, y: img.height / 2 });
            ImageRef.current
                .attr("height", img.height)
                .attr("width", img.width)
                .css("aspect-ratio", img.width / img.height)
                .removeLayer("image")
                .drawImage({
                    source: img,
                    x: 0,
                    y: 0,
                    fromCenter: false,
                    layer: true,
                    name: "image",
                })
                .parent("div")
                .css({ 
                    "aspect-ratio": img.width / img.height,
                 })
            setTimeout(
                () =>
                    $(".canvas-container").css({
                        height: "100%",
                        width: "100%",
                    }),
                500
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);
    useEffect(() =>
        focalPoint.x === 0 && focalPoint.y === 0
            ? setFocalPoint({
                  x: ImageRef.current[0].clientWidth / 2,
                  y: ImageRef.current[0].clientHeight / 2,
              })
            : undefined
    );
    return (
        <div
            className='canvas-container'
            style={{
                border: "0.23rem solid black",
                height: "100%",
                width: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
            }}
            ref={ref}
        >
                <canvas
                    ref={(Ref: HTMLCanvasElement) => {
                        ImageRef.current = $(Ref);
                        //try {$(Ref).siblings().remove()} catch{}
                    }}
                    style={{
                        display: "block",
                        maxWidth: "100%",
                        maxHeight: "100%",
                    }}
                ></canvas>
        </div>
    );
};

export default Preview;
