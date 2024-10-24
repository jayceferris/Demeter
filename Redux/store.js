import { configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { thunk } from "redux-thunk";
import { getDefaultConfig } from "@react-native/metro-config";
import persistStore from "redux-persist/es/persistStore";
import rootReducer from "./rootReducer";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";


const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    middleware: [thunk]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDeafultMiddleware) =>
        getDeafultMiddleware({
            serializableCheck: false
        }),
})

const persistor = persistStore(store)

export { store, persistor }