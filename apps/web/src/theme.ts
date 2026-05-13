import { createTheme } from '@mui/material/styles'

const billingThemeDefinition = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#F26522',
      light: '#FF8A50',
      dark: '#D45618',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8DC63F',
      light: '#A8D866',
      dark: '#6FA82E',
      contrastText: '#1a1a1a',
    },
    success: {
      main: '#8DC63F',
      dark: '#6FA82E',
      contrastText: '#ffffff',
    },
    divider: '#E8E8EA',
    background: {
      default: '#f7f6f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#58595B',
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { margin: 0, padding: 0, WebkitTextSizeAdjust: '100%' },
        body: { margin: 0, padding: 0, backgroundColor: '#f7f6f4' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' as const },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          borderBottom: '1px solid #E8E8EA',
          boxShadow: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
}

/** Create at runtime (avoid module-level Theme object for Next.js RSC static generation). */
export function createBillingTheme() {
  return createTheme(billingThemeDefinition)
}
