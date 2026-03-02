import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface AuthState{
    accessToken: string | null;
    id: string | null;
    role: string | null;

}

const initialState = {id: null, role: null, accessToken: null} as AuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action){
            console.log('set auth', state)
            state.accessToken = action.payload.accessToken
            state.id = action.payload.id
            state.role = action.payload.role 
            localStorage.setItem('id', state.id as string)
            localStorage.setItem('role', state.role as string)
            localStorage.setItem('accessToken', state.accessToken as string)
            console.log('set auth check', localStorage.getItem('accessToken'))



        },

        getAuth(state){
            state.id = localStorage.getItem('id')
            state.role = localStorage.getItem('role')
            state.accessToken = localStorage.getItem('accessToken')

        },

        clearAuth(state){
            console.log('clear auth', state)

            state.id = null
            state.role = null
            state.accessToken = null
            localStorage.removeItem('id')
            localStorage.removeItem('role')
            localStorage.removeItem('accessToken')

        }

    }
})

export const {setAuth, clearAuth, getAuth} = authSlice.actions
export const authSelector = (state: RootState) => state.auth
export default authSlice.reducer