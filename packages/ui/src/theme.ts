import { createTheme, type PaletteMode, type Theme } from "@mui/material/styles";

/** One shared theme definition, parameterized by light/dark mode so both stay visually consistent. */
export function getTheme(mode: PaletteMode): Theme {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#1f6feb" },
      secondary: { main: "#f2b90c" },
      background: isLight ? { default: "#f4f6fb" } : { default: "#0d1117", paper: "#161b22" },
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
            border: "1px solid",
            borderColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.12)",
            transition: "box-shadow 0.2s ease",
            "&:hover": { boxShadow: isLight ? "0 8px 24px rgba(15, 23, 42, 0.08)" : "0 8px 24px rgba(0, 0, 0, 0.5)" },
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
}

/** Default (light) theme — used anywhere that doesn't need mode switching. */
export const theme = getTheme("light");
