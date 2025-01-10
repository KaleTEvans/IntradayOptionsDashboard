import { fetchUnderlyingOneMinCandles } from "./queries";
import { getTimeZoneOffset } from "./timezone";

export async function getChartFormattedUnderlyingCandles(ticker) {
    const oneMinData = await fetchUnderlyingOneMinCandles(ticker);
    const timeZoneOffset = getTimeZoneOffset();

    const formattedData = oneMinData.map((candle) => ({
        time: candle.time - timeZoneOffset,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    }));

    return formattedData;
}