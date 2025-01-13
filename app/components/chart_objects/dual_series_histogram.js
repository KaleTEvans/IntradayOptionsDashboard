import React, { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";

import { getTimeZoneOffset } from "@/app/utils/timezone";

export const HistogramChart = props => {
    const {
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
    } = props;

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    const series1 = useRef(null); // call volume
    const series2 = useRef(null); // put volume

    const [series1Data, setSeries1Data] = useState(null);
    const [series2Data, setSeries2Data] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const timeZoneOffset = getTimeZoneOffset();
}