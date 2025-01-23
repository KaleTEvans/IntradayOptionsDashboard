import React, { useState, useEffect, useRef } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';

import { getTimeZoneOffset } from '@/app/utils/timezone';
import { darkModeChartOptions, redAndGreenCandles, volumeChartOptions } from '../chart_components/basic_components';
import { Chart, Series } from '../chart_components/dynamic_chart';
import { fetchUnderlyingOneMinCandles } from '@/app/utils/queries';
import { useWebSocket } from '../websocket_components/ws_manager';

export const UnderlyingDynamicChart = (props) => {
    const {
        ticker = "SPX",
        colors: {
            backgroundColor = '222',
            textColor = '#DDD',
        } = {},
        height = 400,
        grid = {
            vertLines: { visible: false },
            horzLines: { visible: false }
        },
        timescale = {
            timeVisible: true,
            secondVisible: true
        },
        pricescale = {  
            borderColor: '#71649C',
        },
        series1PriceScale = {
            scaleMargins: {
                top: 0.3,
                bottom: 0.4
            }
        },
        series2PriceScale = {
            scaleMargins: {
                top: 0.7,
                bottom: 0
            }
        },
        series2PriceFormat = { type: 'volume' },
        series2PriceScaleId = 'volume-overlay',
        series3PriceFormat = { type: 'volume' },
        series4PriceFormat = { type: 'volume' },
    } = props;

    const { message } = useWebSocket();

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    const chart1 = useRef(null); // Minute candles and change in option volume
    const chart2 = useRef(null); // Total call vs total put volume
    const chart3 = useRef(null); // Option IV
    const series1 = useRef(null); // Candlesticks
    const series2 = useRef(null); // Option Volume Delta
    const series3 = useRef(null); // Call Option Volume
    const series4 = useRef(null); // Put Option Volume
    const series5 = useRef(null); // Option IV
    const chart1Legend1 = useRef(null); 
    const chart1Legend2 = useRef(null);
    const lastClosePrice = useRef(null); // Last close price of candles pulled from api
    const lastMinuteCandleTime = useRef(null); // Time of last candle pulled from api

    const [chartsReady, setChartsReady] = useState(false);
    const [allSeriesReady, setAllSeriesReady] = useState(false);
    const [series1Data, setSeries1Data] = useState(null);
    const [series2Data, setSeries2Data] = useState(null);
    const [series3Data, setSeries3Data] = useState(null);
    const [series4Data, setSeries4Data] = useState(null);
    const [series5Data, setSeries5Data] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const timeZoneOffset = getTimeZoneOffset();

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const oneMinData = await fetchUnderlyingOneMinCandles(ticker);

                if (oneMinData.length > 0) {
                    let lastClose = oneMinData[oneMinData.length - 1].close;
                    lastClosePrice.current = lastClose;
                }

                const series1Data = [];
                const series2Data = [];
                const series3Data = [];
                const series4Data = [];
                const series5Data = [];

                oneMinData.forEach((candle) => {
                    const adjustedTime = candle.time - timeZoneOffset;

                    // Series 1: One-minute candles
                    series1Data.push({
                        time: adjustedTime,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                    });

                    // Series 2: Total option volume delta
                    series2Data.push({
                        time: adjustedTime,
                        value: candle.call_volume_delta + candle.put_volume_delta,
                        color: 'gray',
                    });

                    // Series 3: Call volume
                    series3Data.push({
                        time: adjustedTime,
                        value: candle.total_call_volume,
                    });

                    // Series 4: Put volume (negative)
                    series4Data.push({
                        time: adjustedTime,
                        value: candle.total_put_volume,
                    });

                    // Series 5: Option Implied Volatility
                    series5Data.push({
                        time: adjustedTime,
                        value: candle.option_implied_volatility * 100 // Times 100 for percent values
                    })
                });

                setSeries1Data(series1Data);
                setSeries2Data(series2Data);
                setSeries3Data(series3Data);
                setSeries4Data(series4Data);
                setSeries5Data(series5Data);

                let lastMinuteTime = series1Data[series1Data.length - 1].time;
                lastMinuteCandleTime.current = lastMinuteTime;

            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            } finally {
                setIsLoading(false); 
            }
        }

        fetchChartData();
    }, []);

    useEffect(() => {
        setChartLayoutOptions({
            background: {
                color: backgroundColor,
            },
            textColor,
        });
    }, [backgroundColor, textColor]);

    // Ensure all chart references are ready
    useEffect(() => {
        const interval = setInterval(() => {
            if (chart1.current && chart2.current && chart3.current) {
                setChartsReady(true);
                clearInterval(interval);
            }
        }, 100); // Poll every 100ms
        return () => clearInterval(interval);
    }, []);

    // Ensure all series references are ready
    useEffect(() => {
        const interval = setInterval(() => {
            if (series1.current && series2.current && series3.current && series4.current && series5.current) {
                setAllSeriesReady(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Sync charts 
    useEffect(() => {
        if (!chartsReady) return;

        // Time scale sync
        chart1.current.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
            chart2.current.timeScale().setVisibleLogicalRange(timeRange);
            chart3.current.timeScale().setVisibleLogicalRange(timeRange);
        });
        chart2.current.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
            chart1.current.timeScale().setVisibleLogicalRange(timeRange);
            chart3.current.timeScale().setVisibleLogicalRange(timeRange);
        });
        chart3.current.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
            chart1.current.timeScale().setVisibleLogicalRange(timeRange);
            chart2.current.timeScale().setVisibleLogicalRange(timeRange);
        });

        function getCrosshairDataPoint(series, param) {
            if (!param.time) {
                return null;
            }
            const dataPoint = param.seriesData.get(series);
            return dataPoint || null;
        }

        function syncCrosshair(chart, series, dataPoint) {
            if (dataPoint) {
                chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
                return;
            }
            chart.clearCrosshairPosition();
        }

        // Crosshair Sync
        chart1.current.subscribeCrosshairMove(param => {
            const dataPoint = getCrosshairDataPoint(series1.current, param);
            syncCrosshair(chart2.current, series3.current, dataPoint);
            syncCrosshair(chart3.current, series5.current, dataPoint);

            if (!chart1Legend1.current) return;
            const open = dataPoint?.open !== undefined ? `O:${dataPoint?.open}` : '';
            const high = dataPoint?.high !== undefined ? `H:${dataPoint?.high}` : '';
            const low = dataPoint?.low !== undefined ? `L:${dataPoint?.low}` : '';
            const close = dataPoint?.close !== undefined ? `C:${dataPoint?.close}` : '';
            chart1Legend1.current.innerHTML = `${ticker} <strong>${open} ${high} ${low} ${close}</strong>`;

            if (!chart1Legend2.current) return;
            chart1Legend2.current.innerHTML = `${ticker} (Total Option Volume)`; 
        });
        chart2.current.subscribeCrosshairMove(param => {
            const dataPoint = getCrosshairDataPoint(series3.current, param);
            syncCrosshair(chart1.current, series1.current, dataPoint);
            syncCrosshair(chart3.current, series5.current, dataPoint);
        });
        chart3.current.subscribeCrosshairMove(param => {
            const dataPoint = getCrosshairDataPoint(series5.current, param);
            syncCrosshair(chart1.current, series1.current, dataPoint);
            syncCrosshair(chart2.current, series3.current, dataPoint);
        });
    })

    const newCandleAdded = useRef(false);

    // Live updates from websocket
    useEffect(() => {
        if (!series1.current || isLoading) return;

        if (message?.type === "underlying" && message.underlying?.tick) {

            const { time, price } = message.underlying.tick;
            const timestamp = Math.floor(time / 1000) - timeZoneOffset;
            const minuteTimestamp = lastMinuteCandleTime.current + 60;
            
            if (timestamp < minuteTimestamp) return;

            let currentCandle = series1.current.currentCandle;

            if (!currentCandle || newCandleAdded.current) {
                newCandleAdded.current = false;
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

                series1.current.update(currentCandle);
            }
            // Update or create the candle in the series
            series1.current.update(currentCandle);
            series1.current.currentCandle = currentCandle;
        }

        if (!allSeriesReady) return;

        if (message?.type == "underlying" && message.underlying?.candle) {
            const { 
                time, 
                open, 
                high, 
                low, 
                close, 
                total_call_volume, 
                total_put_volume, 
                option_implied_volatility,
                candle_returns,
                call_volume_delta,
                put_volume_delta,
            } = message.underlying.candle;

            let adjustedTime = time - timeZoneOffset;

            let s1Data = {
                time: adjustedTime,
                open: open,
                high: high,
                low: low,
                close: close
            };
            let s2Data = { time: adjustedTime, value: (call_volume_delta + put_volume_delta), color: 'gray'};
            let s3Data = { time: adjustedTime, value: total_call_volume };
            let s4Data = { time: adjustedTime, value: total_put_volume };
            let s5Data = { time: adjustedTime, value: option_implied_volatility*100 };

            series1.current.update(s1Data);
            series2.current.update(s2Data);
            series3.current.update(s3Data);
            series4.current.update(s4Data);
            series5.current.update(s5Data);

            lastMinuteCandleTime.current = adjustedTime;
            lastClosePrice.current = close;
            series1.current.currentCandle = s1Data;
            newCandleAdded.current = true;
        }
    }, [message]);
    
    if (isLoading) {
        return (
            <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '2rem', backgroundColor: '#222' }}>
                <CircularProgress /> {/* Loading spinner */}
            </Container>
        );
    }

    if (!series1Data) {
        return (
            <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p>Error loading chart data.</p> {/* Error message */}
            </Container>
        );
    }

    return (
        <>
            <Box sx={{ border: 4, borderRadius: 2, backgroundColor: 'primary.main', borderColor: 'primary.main' }}>
                {/* <Button variant='contained' onClick={() => setIsSecondSeriesActive(current => !current)}>
                    {isSecondSeriesActive ? 'Remove second series' : 'Add second series'}
                </Button> */}
                <Box sx={{ position: 'relative', width: 1, height: 300 }}>
                    <Chart 
                        ref={chart1} 
                        layout={chartLayoutOptions} 
                        grid={grid} 
                        timeScale={timescale} 
                        priceScale={pricescale}
                    >
                        <Series
                            ref={series1}
                            type={'candlestick'}
                            data={series1Data}
                            color={redAndGreenCandles}
                            priceScale={series1PriceScale}
                        />
                        <Series
                            ref={series2}
                            type={'histogram'}
                            priceFormat={series2PriceFormat}
                            priceScaleId={series2PriceScaleId}
                            priceScale={series2PriceScale}
                            data={series2Data}
                        />
                    </Chart>
                    <Box 
                        ref={chart1Legend1} 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '12px', 
                            zIndex: '1', 
                            fontSize: '14px', 
                            fontFamily: 'sans-serif', 
                            lineHeight: '18px', 
                            fontWeight: '300', 
                            color: 'white',
                            pointerEvents: 'none'
                        }}
                    >
                        {ticker}
                    </Box>
                    <Box 
                        ref={chart1Legend2} 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            bottom: '64px', 
                            zIndex: '1', 
                            fontSize: '10px', 
                            fontFamily: 'sans-serif', 
                            lineHeight: '18px', 
                            fontWeight: '300', 
                            color: 'white',
                            pointerEvents: 'none'
                        }}
                    >
                        {ticker}
                    </Box>
                </Box>

                <Box style={{ position: 'relative', width: '100%', height: 200 }}>
                    <Chart ref={chart2} layout={chartLayoutOptions} grid={grid} timeScale={timescale}>
                        <Series 
                            ref={series3}
                            type={'area'}
                            data={series3Data}
                            priceFormat={series3PriceFormat}
                            lineColor={'rgb(15, 255, 80)'}
                            topColor={'rgb(50, 205, 50)'}
                            bottomColor={'rgb(144, 238, 144, 0)'}
                        />
                        <Series 
                            ref={series4}
                            type={'area'}
                            data={series4Data}
                            priceFormat={series4PriceFormat}
                            lineColor={'rgb(255, 49, 49)'}
                            topColor={'rgb(220, 20, 60)'}
                            bottomColor={'rgb(248, 131, 121, 0)'}
                        />
                    </Chart>
                    <Box 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '12px', 
                            zIndex: '1', 
                            fontSize: '12px', 
                            fontFamily: 'sans-serif', 
                            lineHeight: '18px', 
                            fontWeight: '300', 
                            color: 'white',
                            pointerEvents: 'none'
                        }}
                    >
                        Total Option Volume
                    </Box>
                </Box>

                <Box style={{ position: 'relative', width: '100%', height: 200 }}>
                    <Chart ref={chart3} layout={chartLayoutOptions} grid={grid} timeScale={timescale}>
                        <Series
                            ref={series5}
                            type={'area'}
                            data={series5Data}
                        />
                    </Chart>
                    <Box 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '12px', 
                            zIndex: '1', 
                            fontSize: '12px', 
                            fontFamily: 'sans-serif', 
                            lineHeight: '18px', 
                            fontWeight: '300', 
                            color: 'white',
                            pointerEvents: 'none'
                        }}
                    >
                        Option Implied Volatility
                    </Box>
                </Box>
            </Box>
        </>
    );
}