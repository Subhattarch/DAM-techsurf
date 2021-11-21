import {useState, useCallback} from 'react'
import {SetState} from './_types'

const UseSteps = <type>(): [type[], SetState<type[]>, (step: type) => void, () => type | undefined] => {
    const [steps, setSteps] = useState<type[]>([])
    const addStep = useCallback((step: type) => setSteps(prevSteps =>[...prevSteps, step]), [setSteps])
    const removeStep = useCallback(() => {
        const removedStep = steps.pop()
        setSteps(steps)
        return removedStep
    }, [steps, setSteps])
    return [steps, setSteps as SetState<type[]>, addStep, removeStep]
}

export default UseSteps