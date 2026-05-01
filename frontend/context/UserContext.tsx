"use client"
import { User } from "@/type/props";
import axios from "axios";
import { createContext, SetStateAction, useContext, useEffect, useState } from "react";


type UserContext = {
    user: User | null,
    isFetchingUser:boolean
    setUser:React.Dispatch<SetStateAction<User | null>>

}

const UserContext = createContext<UserContext | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const[isFetchingUser, setIsFetchingUser] = useState(true)
    console.log(user)
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
            } finally{
                setIsFetchingUser(false)
            }
        }

        fetchUser()
    }, [])


    return (
        <UserContext.Provider value={{ user, isFetchingUser, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used inside UserProvider");
    return context;
}