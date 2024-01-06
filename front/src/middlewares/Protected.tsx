import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Api from "../components/api/auth.api";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { useGlobalContext } from "../context/context";
import { getUser } from "../components/api/auth.api";

export type Props = {
    children: JSX.Element;
};

interface MyTokenPayload extends JwtPayload {
    id: number;
    username: string;
    role: string;
    currency: string;
}

const Protected: React.FC<Props> = ({ children }) => {
    const [cookies] = useCookies(["token"]);
    const [isLoading, setIsLoading] = useState(true);
    const { setUsername,setToken,token,setRole,role,setUserId } = useGlobalContext();


    useEffect(() => {
        const fetchUser = async () => {
            if (cookies.token) {
                try {
                    const decodedToken = jwtDecode<MyTokenPayload>(cookies.token);
                    const id = decodedToken.id.toString();
                    const response = await getUser(id);
                    setUsername(response.username);
                    setRole(response.role);
                    setUserId(response.id);
                    setToken(cookies.token);
                    Api.defaults.headers.common["jwt"] = cookies.token;
                } catch (error) {
                    console.log(error);
                }
            } else {
                setToken("");
                setUsername("");
            }
            setIsLoading(false);
        };

        fetchUser();
    }, [cookies]);

    if (isLoading) {
        return null; // on peut rajouter un spinner au cas ou ça prend longtemps
    }

    if (!token && role !== "guest") {
        return <Navigate to="/" />;
    }

    return children;
};

export default Protected;
