import {useCallback, useState} from 'react'

const UseStateArray = <type>(arrayState: Array<type>): [Array<type>, ((newItem: type | Array<type>, replaceLast?: boolean) => void)] => {
    const [ArrayState, SetArrayState] = useState<Array<type>>(arrayState)
    const setArrayState = useCallback(((newItem: type | Array<type>, replaceLast: boolean = false) => Array.isArray(newItem) ? SetArrayState(newItem) : SetArrayState(state => replaceLast ? state.map((State, index) => state.length - 1 === index ? newItem as type : State) : [...state, newItem as type])), [SetArrayState])
    return [ArrayState, setArrayState]
}

export default UseStateArray