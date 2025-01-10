'use client';

import React, { useState, useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material';

import { getChartFormattedUnderlyingCandles } from '../utils/chart_formatted_queries';
import { ChartComponent, darkModeChartOptions } from '../components/chart_components/basic_components';

import { DynamicChart } from '../components/chart_components/dynamic_chart';
import { UnderlyingDynamicChart } from '../components/chart_objects/underlying_dynamic';

import Navbar from '../components/navbar';

// const SampleChart = (props) => {
//     const [chartData, setChartData] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const fetchChartData = async () => {
//             try {
//                 const data = await getChartFormattedUnderlyingCandles("SPX");
//                 setChartData(data); 
//             } catch (error) {
//                 console.error("Failed to fetch chart data:", error);
//             } finally {
//                 setIsLoading(false); 
//             }
//         }

//         fetchChartData();
//     }, []);
    
//     if (isLoading) {
//         return (
//             <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem', backgroundColor: '#222' }}>
//                 <CircularProgress /> {/* Loading spinner */}
//             </Container>
//         );
//     }

//     if (!chartData) {
//         return (
//             <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem' }}>
//                 <p>Error loading chart data.</p> {/* Error message */}
//             </Container>
//         );
//     }

//     return (
//         <Container maxWidth="md">
//             <ChartComponent {...props} data={chartData} />
//         </Container>
//     );
// }


export default function MarketOverview(props) {
    return (
        <>
            <Navbar />
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h1>Market Overview</h1>
                <UnderlyingDynamicChart {...props} />
            </div>
        </>
    );
}