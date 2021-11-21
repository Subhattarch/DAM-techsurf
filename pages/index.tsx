import type { NextPage } from "next";
import DAM from './Components/_DAM'
import UseState from "./Components/_UseState";
import AddTemplate from "./Components/_addTemplate";
import { DataToSave } from "./Components/_types";

const Home: NextPage = () => {
    const [image, setImage] = UseState<string>("")
    const [FocalPoint, setFocalPoint] = UseState<{
        x: number,
        y: number
    }>({
        x: 0,
        y: 0

    })
    const [steps, setSteps] = UseState<string[]>([])
    const [focalSteps, setFocalSteps] = UseState<{x: number, y: number}[]>([])
    const [Actions, setActions] = UseState<DataToSave[]>([])
    const [isAddingTemplate, setIsAddingTemplate] = UseState<boolean>(false)
    const [isEditing, setIsEdditing] = UseState<boolean>(false)
    return <>
    {!isEditing && !isAddingTemplate && <div>
        <label htmlFor="ImageToEdit">upload image to start editing</label>
        <input type="file" accept="image/*" id="ImageToEdit" onChange={e => {
            const file = e.target.files?.[0]
            if(file) {
                const fileReader = new FileReader()
                fileReader.readAsDataURL(file)
                fileReader.onload = () => {
                    setImage(fileReader.result as string)
                    setIsAddingTemplate(true)
                }
                return
            }
            return setImage("")
        }}/>
    </div>}
    {isAddingTemplate && <AddTemplate src={image} setActions={setActions} setImage={setImage} setFocalPoint={setFocalPoint} setSteps={setSteps} setFocalSteps={setFocalSteps} endCallback={() => {
        setIsEdditing(true)
        setIsAddingTemplate(false)
    }} />}
    {isEditing && <DAM src={image} FocalPoint={FocalPoint} Steps={steps} FocalSteps={focalSteps} actions={Actions} />}
    </>
};

export default Home;
