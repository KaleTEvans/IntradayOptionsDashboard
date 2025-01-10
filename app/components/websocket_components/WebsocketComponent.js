import React from "react";
import { Typography } from "@mui/material";
import { useWebSocket } from "./ws_manager";

const WebSocketComponent = () => {
    const { message } = useWebSocket();

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                WebSocket Data
            </Typography>
            {message ? (
                <Typography variant="body1">
                    Data Type: {message.type}, 
                    Symbol: {message.underlying ? message.underlying.symbol : "N/A"},
                    Price: {message.underlying?.tick ? message.underlying.tick.price : "N/A"}
                </Typography>
            ) : (
                <Typography variant="body1">Waiting for data...</Typography>
            )}
        </div>
    );
};

export default WebSocketComponent;
