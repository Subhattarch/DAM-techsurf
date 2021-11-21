import { MutableRefObject } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SetState, DataToSave, SetDoneT } from "./_types";
import UseState from "./_UseState";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";


const DownloadImage = ({ImageRef, setDone}: {ImageRef: MutableRefObject<JQuery<HTMLCanvasElement>>, setDone: SetDoneT}) => {
    const Formats = [
        'png',
        'jpg',
        'jpeg',
        'tiff',
        'bmp',
        'gif',
        'eps',
    ]
    const [isDownloading, setDownloading] = UseState<boolean>(false)
    return <>
        <button className={isDownloading ? "selected" : ""} onClick={() => {
            if(isDownloading) return setDone(null)
            setDownloading(true)
            setDone(() => setDownloading(false))
        }}><FontAwesomeIcon icon={faFileDownload}/></button>
        {isDownloading && <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.25rem"
        }}>
            {Formats.map(format => <a key={format} style={{
                aspectRatio: "1"
            }} href={(() => ImageRef.current?.[0].toDataURL(`image/${format}`))() ?? ''} download={`test.${format}`}>{format}</a>)}
        </div>}
    </>
}

export default DownloadImage