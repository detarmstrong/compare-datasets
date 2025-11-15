import * as React from 'react'
import { Box, Typography } from '@mui/material'

interface FooterProps {
  sqliteVersion: string
}

export default function Footer({ sqliteVersion }: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        textAlign: 'center',
        padding: '16px 0',
        marginTop: 'auto',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: '#999',
        }}
      >
        SQLite version {sqliteVersion}
      </Typography>
    </Box>
  )
}
