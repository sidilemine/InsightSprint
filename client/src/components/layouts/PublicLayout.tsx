import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PublicContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& img': {
    height: 40,
    marginRight: theme.spacing(2),
  },
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 12,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  flex: 1,
}));

const Footer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <PublicContainer maxWidth="md">
      <Header>
        <Logo>
          <Typography variant="h4" component="div" color="primary" fontWeight="bold">
            Jade Kite
          </Typography>
        </Logo>
      </Header>
      <ContentPaper elevation={0}>
        {children}
      </ContentPaper>
      <Footer>
        <Typography variant="body2">
          © {new Date().getFullYear()} Jade Kite. All rights reserved.
        </Typography>
      </Footer>
    </PublicContainer>
  );
};

export default PublicLayout;
