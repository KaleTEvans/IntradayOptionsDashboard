export function createWebSocket(url, onMessage, onClose) {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data); // Now this will be an array
            if (Array.isArray(data)) {
                data.forEach((item) => {
                    if (onMessage) {
                        onMessage(item);
                        //console.log(item)
                    }
                });
            } else {
                if (onMessage) {
                    onMessage(data);
                    //console.log(data);
                }
            }
        } catch (error) {
            console.error("Failed to parse WebSocket message:", error, event.data);
        }
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed");
        if (onClose) onClose();
    };

    return ws;
}