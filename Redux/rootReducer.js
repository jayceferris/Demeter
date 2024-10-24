import { combineReducers } from "@reduxjs/toolkit";
import itemReducer from "./itemReducer";

const rootReducer = combineReducers({
    items: itemReducer
})

export default rootReducer