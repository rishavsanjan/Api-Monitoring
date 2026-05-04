"use client"
import { User } from "@/type/props";
import axios from "axios";
import { createContext, SetStateAction, useContext, useEffect, useState } from "react";


type UserContext = {
    user: User | null,
    isFetchingUser: boolean
    setUser: React.Dispatch<SetStateAction<User | null>>
    saveToken: (token: string) => void
    logOut : () => void

}

const UserContext = createContext<UserContext | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isFetchingUser, setIsFetchingUser] = useState(true)
    const [token, setToken] = useState<string | null>(null)
    console.log(user)

    const handleSaveToken = (newToken: string) => {
        localStorage.setItem("api", newToken);
        setToken(newToken);
    };


    const handleLogout = () => {
        localStorage.removeItem("api")
        setUser(null)
    }

    useEffect(() => {
        const fetchUser = async () => {
            setIsFetchingUser(true)
            try {
                const token = localStorage.getItem("api")
                if (!token) {
                    setUser(null)
                    setIsFetchingUser(false)
                    return
                }

                const res = await axios.get("http://localhost:8080/api/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                setUser(res.data.user)
            } catch {
                setUser(null)
            } finally {
                setIsFetchingUser(false)
            }
        }

        fetchUser()
    }, [token])


    return (
        <UserContext.Provider value={{ user, isFetchingUser, setUser, saveToken:handleSaveToken, logOut:handleLogout }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used inside UserProvider");
    return context;
}