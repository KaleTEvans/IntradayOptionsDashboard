"use client"; // Add this directive at the very top

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { py_ws_path } from "@/app/utils/queries";

// Create WebSocket Context
const WebSocketContext = createContext(null);

// WebSocket Provider
export const WebSocketProvider = ({ children }) => {
    const [message, setMessage] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(`${py_ws_path}/hf-data/ws`);

        ws.current.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessage(newMessage);
        };

        return () => {
            ws.current.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ message }}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom Hook to use WebSocket
export const useWebSocket = () => useContext(WebSocketContext);
