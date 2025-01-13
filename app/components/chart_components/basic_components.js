//==================================================
// Create a basic candlestick chart in dark mode
//==================================================

import React, {
    createContext,
    useContext,
    useRef,
    useEffect,
    useLayoutEffect,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';
import { createChart } from "lightweight-charts";

export const darkModeChartOptions = {
    grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
    },
    timeScale: {
        timeVisible: true,
        secondsVisible: true,
    },
    priceScale: {
        borderColor: '#71649C'
    },

};

export const redAndGreenCandles = {
    upColor: "#26a69a",
    downColor: "#ef5350",
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
}

export const ChartComponent = props => {
    const {
        data,
        chartOptions = darkModeChartOptions,
    } = props;

    const chartContainerRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chart.timeScale().fitContent();

        const series = chart.addCandlestickSeries(redAndGreenCandles);
        series.setData(data);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, [data, chartOptions]);

    return (
        <div ref={chartContainerRef} />
    );
}



// export const StaticCandlestick = ({ data, chartOptions }) => {
//     const chartContainerRef = useRef(null);
//     const chartRef = useRef(null);
//     const seriesRef = useRef(null);

//     useEffect(() => {
//         const handleResize = () => {
//             chart.applyOptions({ width: chartContainerRef.current.clientWidth });
//         };

//         const chart = createChart(chartContainerRef.current, chartOptions);
//         chartRef.current = chart;

//         const series = chart.addCandlestickSeries({
//             upColor: "#26a69a",
//             downColor: "#ef5350",
//             wickUpColor: "#26a69a",
//             wickDownColor: "#ef5350",
//         });
//         seriesRef.current = series;  

//         window.addEventListener('resize', handleResize);

//         series.setData(data);
//         chart.timeScale().fitContent();

//         return () => {
//             window.removeEventListener('resize', handleResize);
//             chart.remove();
//         };
//     }, []);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />;
// }

// const defaultContextValue = { chart: null, isReady: false };

// export const createChartContext = () => createContext(defaultContextValue);

// export const Chart = ({ children, chartOptions, chartContext: ChartContext, ...rest }) => {
//     const containerRef = useRef(null);
//     const chartRef = useRef(null);  // Keep track of chart instance
//     const [contextValue, setContextValue] = useState(defaultContextValue);

//     useLayoutEffect(() => {
//         if (!containerRef.current) return;

//         try {
//             // Store chart instance in ref
//             chartRef.current = createChart(containerRef.current, {
//                 ...rest,
//                 ...chartOptions,
//                 width: containerRef.current.clientWidth,
//                 height: 400,
//             });

//             chartRef.current.timeScale().fitContent();
            
//             // Update context with the chart instance
//             setContextValue({ 
//                 chart: chartRef.current, 
//                 isReady: true 
//             });

//             const handleResize = () => {
//                 if (containerRef.current && chartRef.current) {
//                     chartRef.current.applyOptions({ 
//                         width: containerRef.current.clientWidth 
//                     });
//                 }
//             };
            
//             window.addEventListener('resize', handleResize);

//             return () => {
//                 window.removeEventListener('resize', handleResize);
//                 if (chartRef.current) {
//                     chartRef.current.remove();
//                     chartRef.current = null;
//                 }
//                 setContextValue(defaultContextValue);
//             };
//         } catch (error) {
//             console.error('Error creating chart:', error);
//             setContextValue(defaultContextValue);
//         }
//     }, [chartOptions, rest]);

//     // Debug output
//     useEffect(() => {
//         console.log('Chart context value:', contextValue);
//     }, [contextValue]);

//     return (
//         <ChartContext.Provider value={contextValue}>
//             <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
//                 {contextValue.isReady && children}
//             </div>
//         </ChartContext.Provider>
//     );
// };

// export const Series = forwardRef(({ type, data, options, chartContext: ChartContext }, ref) => {
//     const { chart, isReady } = useContext(ChartContext);
//     const seriesRef = useRef(null);
//     const currentCandleRef = useRef(null);  // Define the missing ref

//     // Debug output
//     useEffect(() => {
//         console.log('Series received chart:', chart);
//         console.log('Series isReady:', isReady);
//     }, [chart, isReady]);

//     useLayoutEffect(() => {
//         if (!isReady || !chart) {
//             console.log('Series creation conditions not met:', { isReady, hasChart: !!chart });
//             return;
//         }

//         try {
//             const series = type === 'candlestick' 
//                 ? chart.addCandlestickSeries(options)
//                 : type === 'line'
//                 ? chart.addLineSeries(options)
//                 : chart.addAreaSeries(options);

//             if (data?.length) {
//                 series.setData(data);
//             }
            
//             seriesRef.current = series;
//             console.log('Series created successfully');

//             return () => {
//                 if (chart && series) {
//                     try {
//                         chart.removeSeries(series);
//                         seriesRef.current = null;
//                     } catch (error) {
//                         console.error('Error removing series:', error);
//                     }
//                 }
//             };
//         } catch (error) {
//             console.error('Error creating series:', error);
//         }
//     }, [chart, isReady, type, options, data]);

//     useImperativeHandle(ref, () => ({
//         update: (candle) => {
//             if (seriesRef.current) {
//                 try {
//                     seriesRef.current.update(candle);
//                 } catch (error) {
//                     console.error('Error updating series:', error);
//                 }
//             }
//         },
//         get currentCandle() {
//             return currentCandleRef.current;
//         },
//         set currentCandle(value) {
//             currentCandleRef.current = value;
//         },
//         get isReady() {
//             return !!seriesRef.current;
//         }
//     }), []);

//     return null;
// });