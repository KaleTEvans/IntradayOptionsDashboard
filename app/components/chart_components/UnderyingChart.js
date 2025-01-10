import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useWebSocket } from "../websocket_components/ws_manager";
import { fetchUnderlyingOneMinCandles } from "@/app/utils/queries";
import { getTimeZoneOffset } from "@/app/utils/timezone";

const TradingViewChart = ({ ticker }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    let lastClosePrice = useRef(null);

    const timeZoneOffset = getTimeZoneOffset();

    // Wait until fetchAndSetData is loaded before providing candle updates
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { message } = useWebSocket();

    useEffect(() => {
        // Initialize the chart
        const chartOptions = {
            layout: {
                textColor: "#DDD",
                background: { color: "222" },
            },
            grid: {
                vertLines: { color: '#444' },
                horzLines: { color: '#444' },
            },
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            },
            priceScale: {
                borderColor: '#71649C'
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chartRef.current = chart;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const series = chart.addCandlestickSeries({
            upColor: "#26a69a",
            downColor: "#ef5350",
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        });
        seriesRef.current = series;    

        window.addEventListener('resize', handleResize);

        const fetchAndSetData = async () => {
            // Fetch previous candles and format for chart
            const oneMinData = await fetchUnderlyingOneMinCandles("SPX");
            console.log(oneMinData)

            const formattedData = oneMinData.map((candle) => ({
                time: candle.time - timeZoneOffset,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));

            series.setData(formattedData);
            chart.timeScale().fitContent();

            // Store the last close price for continuity
            if (formattedData.length > 0) {
                lastClosePrice.current = formattedData[formattedData.length - 1].close;
            }

            setIsDataLoaded(true);
        }

        fetchAndSetData();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!seriesRef.current || !isDataLoaded) return;

        if (message?.type === "underlying" && message.underlying?.tick) {
            const { time, price } = message.underlying.tick;
            const timestamp = Math.floor(time / 1000);
            const minuteTimestamp = (Math.floor(timestamp / 60) * 60) - timeZoneOffset;
            //console.log(minuteTimestamp)

            let currentCandle = seriesRef.current.currentCandle;

            if (!currentCandle || currentCandle.time !== minuteTimestamp) {
                if (currentCandle) {
                    seriesRef.current.update(currentCandle);
                    lastClosePrice.current = currentCandle.close; 
                }

                currentCandle = {
                    time: minuteTimestamp,
                    open: lastClosePrice.current ?? price,
                    high: price,
                    low: price,
                    close: price,
                };
            } else {
                currentCandle.close = price;
                currentCandle.high = Math.max(currentCandle.high, price);
                currentCandle.low = Math.min(currentCandle.low, price);

                seriesRef.current.update(currentCandle);
            }
            // Update or create the candle in the series
            seriesRef.current.update(currentCandle);

            seriesRef.current.currentCandle = currentCandle;
        }
    }, [message]);

    return <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />;
};

export default TradingViewChart;
