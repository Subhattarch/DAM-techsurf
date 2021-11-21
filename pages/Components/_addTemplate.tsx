import { useEffect } from 'react'
import { get } from 'jquery'
import Image from 'next/image'
import UseStateArray from './_UseStateArray'
import {DataToSave, SetState} from './_types'
import getTemplatedCanvas from './_getTemplatedCanvas'
import UseState from './_UseState'


const AddTemplate = ({
    src,
    setImage,
    setFocalPoint,
    setSteps,
    setFocalSteps,
    setActions,
    endCallback
}: {
    src: string;
    setActions: SetState<DataToSave[]>;
    setImage: SetState<string>;
    setFocalPoint: SetState<{
        x: number;
        y: number
    }>;
    setSteps: SetState<string[]>;
    setFocalSteps: SetState<{x: number, y: number}[]>;
    endCallback: () => void
}) => {
    const [Templates, setTemplates] = UseStateArray<{Name: string, src: string, focalPoint: {
        x: number,
        y: number
    }, steps: string[], focalSteps: {
        x: number;
        y: number;
    }[]; Actions: DataToSave[]}>([])
    const [dataUrl, setDataUrl] = UseState<string>("/Stephen.jpg")
    useEffect(() => {
        get("/api/save", (data:{
            Name: string,
            Actions: DataToSave[]
        }[]) => {
            console.log(data)
            const Template: {Name: string, src: string, focalPoint: {
                x: number,
                y: number
            }, steps: string[], focalSteps: {
                x: number;
                y: number;
            }[]; Actions: DataToSave[]}[] = []
            data.forEach(({Name, Actions}, index) => {
                getTemplatedCanvas(src, Actions, (src: string, focalPoint: {
                    x: number;
                    y: number;
                }, steps: string[], focalSteps: {
                    x: number;
                    y: number;
                }[]) => {
                    Template.push({
                        Name,
                        src,
                        focalPoint,
                        steps,
                        focalSteps,
                        Actions
                    })
                    if(data.length - 1 === index) setTemplates(Template)
                })
            })
        })
    }, [src, setTemplates])
    return (<div style={{
        display:"grid",
        gridTemplateColumns: "1fr 1fr 1fr"
    }}>
        {Templates.map((template, index) => {
            return (<button key={index} onClick={() => {
                setImage(template.src)
                setFocalPoint(template.focalPoint)
                setSteps(template.steps)
                setFocalSteps(template.focalSteps)
                setActions(template.Actions)
                endCallback()
            }}><div className='Preview--container'>
                <Image src={template.src} layout="fill" className="preview" alt={template.Name}/>
            </div><p style={{width: "100%", textAlign: "center"}}>{template.Name}</p></button>)
        })}
    </div>)
}

export default AddTemplate