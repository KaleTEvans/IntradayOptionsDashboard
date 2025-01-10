// FastApi queries 
import { getTimeZoneOffset } from "./timezone";

export const py_server_path = "http://192.168.12.136:8000";
export const py_ws_path = "ws://192.168.12.136:8000";

export async function fetchBroadTapeNews() {
    const response = await fetch(`${py_server_path}/option-data/news`)
    const data = await response.json();

    return data;
}

export async function fetchUnderlyingOneMinCandles(ticker) {
    try {
        const response = await fetch(`${py_server_path}/option-data/${ticker}/underlying/get-today-candles`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}