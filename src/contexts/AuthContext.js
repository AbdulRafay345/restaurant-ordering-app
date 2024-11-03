import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { auth, firestore } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ScreenLoader from '../components/ScreenLoader';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const { toastify } = window;

const initialState = { isAuthenticated: false, user: { fullName: '', email: '', uid: '', address: '', role: '' } };

const reducer = (state, { type, payload }) => {
    switch (type) {
        case "SET_LOGGED_IN": return { ...state, isAuthenticated: true, user: { ...payload.user } };
        case "SET_PROFILE": return { ...state, user: { ...payload.user } };
        case "SET_LOGGED_OUT": return initialState;
        default: return state;
    }
};

export default function AuthContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isScreenLoading, setIsScreenLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const { email, uid } = user;
                try {
                    const userDoc = await getDoc(doc(firestore, 'users', uid));
                    const userData = userDoc.exists() ? userDoc.data() : { fullName: "", address: '', role: '' };
                    dispatch({
                        type: "SET_LOGGED_IN",
                        payload: {
                            user: { name: userData.fullName, email, uid, address: userData.address, role: userData.role }
                        }
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                dispatch({ type: "SET_LOGGED_OUT" });
            }
            setIsScreenLoading(false);
        });
    }, [dispatch]);

    const login = (email, password) => {
        setIsProcessing(true);
        setIsScreenLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                try {
                    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                    const userData = userDoc.exists() ? userDoc.data() : { fullName: '', address: '', role: '' };
                    dispatch({
                        type: "SET_LOGGED_IN",
                        payload: {
                            user: { name: userData.fullName, email: user.email, uid: user.uid, address: userData.address, role: userData.role }
                        }
                    });
                    toastify("User Logged In successfully", "success");
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            })
            .catch((error) => {
                console.error(error.code);
                switch (error.code) {
                    case "auth/invalid-credential": toastify("Incorrect Email or Password", "error"); break;
                    default: toastify("Something went wrong while logging in", "error"); break;
                }
            })
            .finally(() => {
                setIsProcessing(false);
                setIsScreenLoading(false);
            });
    };

    const logout = () => {
        signOut(auth).then(() => {
            toastify("User logged out")
            dispatch({ type: "SET_LOGGED_OUT" })
            navigate('/')
        }).catch((error) => {
            console.error(error.code)
            toastify("Something went wrong while logging out", "error")
        })
    }

    const updateUser = async (updatedUser) => {
        const userId = state.user.uid;
        if (!userId) return;
        try {
            await updateDoc(doc(firestore, 'users', userId), {
                fullName: updatedUser.name,
                address: updatedUser.address
            });

            dispatch({
                type: "SET_PROFILE",
                payload: {
                    user: { ...state.user, ...updatedUser }
                }
            });
            toastify("User profile updated successfully", "success")
        } catch (error) {
            console.error("Error updating user data:", error)
            toastify("Failed to update user profile", "error")
        }
    };


    return (
        <AuthContext.Provider value={{ state, dispatch, login, logout, user: state.user, isScreenLoading, setIsScreenLoading, isProcessing, setIsProcessing, updateUser }}>
            {isScreenLoading ? <ScreenLoader /> : children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext)