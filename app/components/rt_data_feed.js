import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Chip,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { FixedSizeList } from 'react-window';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import dayjs from 'dayjs';

import { fetchTradeData } from '../utils/queries';

const convertTimestamp = (unix) => dayjs(unix).format('HH:mm:ss');

const RTTradeItem = (props) => {
  const {
    index,
    style,
    data,
    addToWatchlist
  } = props;

  let bidPrice = data.current_bid;
  if (bidPrice < 0) bidPrice = 0;

  const timestamp = convertTimestamp(data.timestamp);
  const optionType = `${data.strike}${data.right}`;
  const spread = `${bidPrice}-${data.current_ask}`;

  const rtmText = data.current_rtm.includes("ITM") ? 'ITM' : 'OTM';
  const rtmColor = rtmText == 'ITM' ? 'default' : 'warning';

  const chipText =
    data.price > data.current_ask ? 'Above Ask'
    : data.price == data.current_ask ? 'At Ask'
    : data.price == data.current_bid ? 'At Bid'
    : data.price < data.current_bid ? 'Below Bid'
    : 'Mid';

  const circleColor =
    (data.right == 'P') && (chipText == 'Above Ask' || chipText == 'At Ask') ? 'error'
    : (data.right == 'P') && (chipText == 'Below Bid' || chipText == 'At Bid') ? 'success'
    : (data.right == 'C') && (chipText == 'Above Ask' || chipText == 'At Ask') ? 'success'
    : (data.right == 'C') && (chipText == 'Below Bid' || chipText == 'At Bid') ? 'error'
    : 'default';

  const handleListItemClick = (event, index) => {
    console.log("Index", index);
  };

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton
        sx={{
          height: 25,
          bgcolor: '#222',
          m: 1,
          borderRadius: 1,
          border: 1,
        }}
        onClick={() => addToWatchlist(data)}
      >
        <Grid container alignItems={'center'} sx={{width: 1}}>
          <Grid size={5} >
            <ListItemText 
              primary={`${timestamp} | ${optionType} | $${data.price}`} 
              sx={{ textAlign: 'left', mr: 1, width: 1 }} 
            />
          </Grid>
          <Grid size={1}>
            <Chip
              label={data.quantity}
              size="small"
              sx={{ ml: 1, width: 1 }}
            />
          </Grid>
          <Grid size={2}>
            <ListItemText primary={`(${spread})`} sx={{ textAlign: 'center' }} />
          </Grid>
          <Grid size={1}>
            <Chip
              label={rtmText}
              color={rtmColor}
              size="small"
              sx={{ mr: 1, width:1 }}
            />
          </Grid>
          <Grid size={1.5}>
            <Chip
              label={chipText}
              color={circleColor}
              size="small"
              sx={{ ml: 1, width: 1 }}
            />
          </Grid>
          <Grid size={1.5}>
            <Chip
              label={`$${Math.round(data.total_cost * 100)/100}`}
              color={'secondary'}
              size="small"
              sx={{ ml: 1, width: 1 }}
            />
          </Grid>
        </Grid>
      </ListItemButton>
    </ListItem>
  );
};

const RTTradeList = (props) => {
  const {
    ticker = "SPX",
    right = "ALL",
    strikes = "ALL",
    tradeQuantity = 0,
    tradeCost = 0,
    addToWatchlist
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [rtData, setRtData] = useState(null);

  const displayLimit = 1000;

  // Call api here with prop filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        let jsonData = await fetchTradeData(ticker, right, strikes, tradeQuantity, tradeCost);

        const initialData = jsonData.map((item, index) => ({
          ...item,
          id: index + 1, // Add id starting from 1
        }));

        setRtData(initialData);

      } catch (error) {
        console.error("Failed to retrieve RT data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticker, right, strikes, tradeQuantity, tradeCost]);

  if (isLoading) {
    return (
      <Box sx={{ width: 1, bgcolor: 'primary.main' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: 1, bgcolor: 'primary.main' }}>
      <FixedSizeList height={400} width='100%' itemSize={25} itemCount={Math.min(rtData.length, displayLimit)}>
        {({ index, style }) => (
          <div style={style} key={rtData[index].id}>
            <RTTradeItem data={rtData[index]} addToWatchlist={addToWatchlist} />
          </div>
        )}
      </FixedSizeList>
    </Box>
  )
}

const Watchlist = ({ items }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Watchlist</Typography>
      <List>
        {items.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={`Strike: ${item.strike}, Price: ${item.price}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export const RTDataFeed = (props) => {
  const {
    ticker = "SPX"
  } = props;

  //const [data, setData] = useState(initialData);
  const [watchlist, setWatchlist] = useState([]);

  const addToWatchlist = (item) => {
    setWatchlist((prev) => {
      // Prevent duplicates
      if (!prev.some((watchlistItem) => watchlistItem.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const [right, setRight] = useState('ALL');
  const [strikes, setStrikes] = useState('ALL');
  const [tradeQuantity, setTradeQuantity] = useState(0);
  const [tradeCost, setTradeCost] = useState(0);

  const handleOptionRightChange = (event) => setRight(event.target.value);
  const handleStrikeChange = (event) => setStrikes(event.target.value);
  const handleQuantityChange = (event) => setTradeQuantity(event.target.value);
  const handleTradeCostChange = (event) => setTradeCost(event.target.value);

  return (
    <Box sx={{ border: 4, borderRadius: 2, borderColor: 'primary.main', backgroundColor: 'primary.main' }}>
      <Accordion sx={{ backgroundColor: 'primary.main' }}>
        <AccordionSummary
          expandIcon={<ArrowDropDown />}
        >
          <Typography component={"span"}>Real Time Trade Feed</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Live feed for real time option trades within the option strike monitoring window (currently 10 ITM and 10 OTM).
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Box sx={{ m: 1, height: 40 }}>
        <FormControl sx={{ width: 0.25, height: 1 }} size='small'>
          <InputLabel id="option-right-label">Right</InputLabel>
          <Select
            labelId="option-right-label"
            id="option-right"
            value={right}
            label="outlined"
            onChange={handleOptionRightChange}
          >
            <MenuItem value={'ALL'}>All</MenuItem>
            <MenuItem value={'CALLS'}>Calls</MenuItem>
            <MenuItem value={'PUTS'}>Puts</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ width: 0.25, height: 1 }} size='small'>
          <InputLabel id="strikes-selection-label">Strikes</InputLabel>
          <Select
            labelId="strikes-selection-label"
            id="strikes-selection"
            value={strikes}
            label="Strikes"
            onChange={handleStrikeChange}
          >
            <MenuItem value={'ALL'}>All</MenuItem>
            <MenuItem value={'ITM'}>ITM</MenuItem>
            <MenuItem value={'OTM'}>OTM</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ width: 0.25, height: 1 }} size='small'>
          <InputLabel id="quantity-selection-label">Trade Quantity</InputLabel>
          <Select
            labelId="quantity-selection-label"
            id="quantity-selection"
            value={tradeQuantity}
            label="Trade Quantity"
            onChange={handleQuantityChange}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={5}>5+</MenuItem>
            <MenuItem value={10}>10+</MenuItem>
            <MenuItem value={25}>25+</MenuItem>
            <MenuItem value={50}>50+</MenuItem>
            <MenuItem value={100}>100+</MenuItem>
            <MenuItem value={250}>250+</MenuItem>
            <MenuItem value={500}>500+</MenuItem>
            <MenuItem value={1000}>1000+</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ width: 0.25, height: 1 }} size='small'>
          <InputLabel id="cost-selection-label">Total Cost</InputLabel>
          <Select
            labelId="cost-selection-label"
            id="cost-selection"
            value={tradeCost}
            label="Total Cost"
            onChange={handleTradeCostChange}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1000}>$1,000+</MenuItem>
            <MenuItem value={5000}>$5,000+</MenuItem>
            <MenuItem value={10000}>$10,000+</MenuItem>
            <MenuItem value={25000}>$25,000+</MenuItem>
            <MenuItem value={50000}>$50,000+</MenuItem>
            <MenuItem value={100000}>$100,000+</MenuItem>
            <MenuItem value={500000}>$500,000+</MenuItem>
            <MenuItem value={1000000}>$1,000,000+</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{width: '100%', alignItems: 'center'}}>
        <Typography variant='subtitle2' gutterBottom sx={{ textAlign: 'center'}}>
          [Time] [Strike/Right] [Spot] [Amt] [Bid-Ask] [Relative Strike] [TradedAt] [Cost]
        </Typography>
      </Box>

      <RTTradeList 
        ticker={ticker} 
        right={right} 
        strikes={strikes} 
        tradeQuantity={tradeQuantity}
        tradeCost={tradeCost}
        addToWatchlist={addToWatchlist}
      />

      <Watchlist items={watchlist} />
    </Box>
  );
}