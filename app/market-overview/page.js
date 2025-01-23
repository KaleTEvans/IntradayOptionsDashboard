'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, ListItem, ListItemText, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { UnderlyingDynamicChart } from '../components/chart_objects/underlying_dynamic';
import { RTDataFeed } from '../components/rt_data_feed';

import Navbar from '../components/navbar';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
        main: '#000000',
    },
    background: {
        default: '#222'
    },
    success: {
        main: 'rgb(34, 139, 34)',
        contrastText: '#fff'
    },
    error: {
        main: 'rgb(196, 30, 58)'
    },
    warning: {
        main: 'rgb(228, 155, 15)',
        contrastText: '#fff'
    },
    secondary: {
        main: 'rgb(64, 130, 109)'
    }
  },
});

export default function MarketOverview(props) {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Navbar />
            <Grid container spacing={2} sx={{ mt: 2, mx: 6 }}>
                <Grid size={6}>
                    <UnderlyingDynamicChart {...props}/>
                </Grid>
                <Grid size={6}>
                    <RTDataFeed />
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}