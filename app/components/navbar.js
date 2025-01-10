import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Container } from '@mui/material';

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ backgroundColor: '#222' }}>
            <Container>
                <Toolbar sx={{ justifyContent: 'center' }}>
                    <Button component={Link} href="/" sx={{ color: '#fff', mx: 2 }}>
                        Home
                    </Button>
                    <Button component={Link} href="/market-overview" sx={{ color: '#fff', mx: 2 }}>
                        Market Overview
                    </Button>
                    <Button component={Link} href="/analytics" sx={{ color: '#fff', mx: 2 }}>
                        Analytics
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;