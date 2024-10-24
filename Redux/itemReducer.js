import { createSlice } from "@reduxjs/toolkit";

const itemSlice = createSlice({
    name: 'items',
    initialState: {
        premium: false,
        list: []
    },
    reducers: {
        addItem: (state, action) => {
            state.list.push(action.payload);
        },
        removeItem: (state, action) => {
            const id = action.payload;
            state.list = state.list.filter(item => item.id !== id);
        },
        updateItem: (state, action) => {
            const updatedItem = action.payload;
            const index = state.list.findIndex(item => item.name === updatedItem.name);
            if(index !== -1){
                state.list[index] = updatedItem
            }
        },
        togglePremium: (state, action) => {
            state.premium = (!state.premium)
        }
    }
});

export const { addItem, updateItem, removeItem } = itemSlice.actions;
export default itemSlice.reducer;
export const selectItems = (state) => state.items.list;
export const selectPremium = (state) => state.items.premium;