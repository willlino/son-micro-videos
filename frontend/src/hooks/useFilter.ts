import { useState, useReducer } from "react";
import reducer, { INITIAL_STATE } from "../store/filter";

export default function useFilter() {
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [filterState, dispatch] = useReducer(reducer, INITIAL_STATE);

    return {
        filterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}