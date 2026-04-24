"use client"
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
    name: string,
    email: string
}

type UserContext = {
    user: User | null

}

const UserContext = createContext<UserContext | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("api")
                if (!token) {
                    setUser(null)
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
            }
        }

        fetchUser()
    }, [])


    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used inside UserProvider");
    return context;
}