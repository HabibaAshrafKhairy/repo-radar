import { createTheme } from "@mui/material/styles";

/** Single shared MUI theme, so every component in the app (and Storybook, if added later) looks consistent. */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6feb" },
    secondary: { main: "#f2b90c" },
    background: { default: "#f4f6fb" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none" },
      },
    },
  },
});
