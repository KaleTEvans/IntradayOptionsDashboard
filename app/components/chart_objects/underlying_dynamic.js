import React, { useState, useEffect, useRef } from 'react';
import { Container, CircularProgress } from '@mui/material';

import { getTimeZoneOffset } from '@/app/utils/timezone';
import { darkModeChartOptions, redAndGreenCandles, volumeChartOptions } from '../chart_components/basic_components';
import { Chart, Series } from '../chart_components/dynamic_chart';
import { fetchUnderlyingOneMinCandles } from '@/app/utils/queries';

export const UnderlyingDynamicChart = (props) => {
    const {
        colors: {
            backgroundColor = '222',
            textColor = '#DDD',
        } = {},
        grid = {
            vertLines: { color: "#444"},
            horzLines: { color: "#444"}
        },
        timescale = {
            timeVisible: true,
            secondVisible: true
        },
        pricescale = {  borderColor: '#71649C' },
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
        series2PriceScaleId = 'volume-overlay'
    } = props;

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    const series1 = useRef(null);
    const series2 = useRef(null);
    const [started, setStarted] = useState(false);
    const [isSecondSeriesActive, setIsSecondSeriesActive] = useState(false);

    const [series1Data, setSeries1Data] = useState(null);
    const [series2Data, setSeries2Data] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const oneMinData = await fetchUnderlyingOneMinCandles("SPX");
                const timeZoneOffset = getTimeZoneOffset();
            
                const oneMinCandles = oneMinData.map((candle) => ({
                    time: candle.time - timeZoneOffset,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                }));

                setSeries1Data(oneMinCandles);

                const totalOptionVol = oneMinData.map((candle) => ({
                    time: candle.time - timeZoneOffset,
                    value: candle.total_call_volume + candle.total_put_volume,
                    color: 'blue'
                }));

                setSeries2Data(totalOptionVol);

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
    
    if (isLoading) {
        return (
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem', backgroundColor: '#222' }}>
                <CircularProgress /> {/* Loading spinner */}
            </Container>
        );
    }

    if (!series1Data) {
        return (
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p>Error loading chart data.</p> {/* Error message */}
            </Container>
        );
    }

    return (
        <>
            <button type="button" onClick={() => setIsSecondSeriesActive(current => !current)}>
                {isSecondSeriesActive ? 'Remove second series' : 'Add second series'}
            </button>
            <Container maxWidth="md">
                <Chart layout={chartLayoutOptions} grid={grid} timeScale={timescale} priceScale={pricescale}>
                    <Series
                        ref={series1}
                        type={'candlestick'}
                        data={series1Data}
                        color={redAndGreenCandles}
                        priceScale={series1PriceScale}
                    />
                    {isSecondSeriesActive && <Series
                        ref={series2}
                        type={'histogram'}
                        priceFormat={series2PriceFormat}
                        priceScaleId={series2PriceScaleId}
                        priceScale={series2PriceScale}
                        data={series2Data}
                    />}
                </Chart>
            </Container>
        </>
    );
}