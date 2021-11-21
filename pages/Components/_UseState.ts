import { useState } from "react";

const UseState = <type>(
    initialState: Required<type> | (() => Required<type>)
): [
    Required<type>,
    (newState: type | ((prevState: Required<type>) => type)) => void
] => {
    const [state, setState] = useState<Required<type>>(initialState);
    if (
        typeof initialState === "object" &&
        initialState != null &&
        !Array.isArray(initialState)
    )
        return [
            state,
            (newState: type | ((prevState: Required<type>) => type)): void =>
                setState(prevState => {
                    const NewState =
                        newState instanceof Function
                            ? (newState as Function)(prevState)
                            : (newState as type);
                    return { ...prevState, ...NewState };
                }),
        ];
    return [
        state,
        (newState: type | ((prevState: Required<type>) => type)): void =>
            setState(
                newState as
                    | Required<type>
                    | ((prevState: Required<type>) => Required<type>)
            ),
    ];
};

export default UseState;
