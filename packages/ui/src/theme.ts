import { alpha, createTheme, responsiveFontSizes, type PaletteMode, type Theme } from "@mui/material/styles";

/** One shared theme definition, parameterized by light/dark mode so both stay visually consistent. */
export function getTheme(mode: PaletteMode): Theme {
  const isLight = mode === "light";

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: isLight ? "#2563eb" : "#60a5fa" },
      secondary: { main: isLight ? "#059669" : "#34d399" },
      background: isLight
        ? { default: "#f8fafc", paper: "#ffffff" }
        : { default: "#0b0f19", paper: "#141a24" },
      divider: isLight ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.12)",
    },
    shape: { borderRadius: 10 },
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
            borderColor: isLight
              ? "rgba(15, 23, 42, 0.08)"
              : "rgba(255, 255, 255, 0.12)",
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow: isLight
                ? "0 8px 24px rgba(15, 23, 42, 0.08)"
                : "0 8px 24px rgba(0, 0, 0, 0.5)",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: "none" },
        },
      },
      MuiLink: {
        defaultProps: { underline: "hover" },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
          filled: ({ theme: t }) => ({
            backgroundColor: alpha(
              t.palette.text.primary,
              isLight ? 0.05 : 0.08,
            ),
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      // To fix gaps in mobile layouts
      MuiStack: {
        defaultProps: { useFlexGap: true },
      },
    },
  });

  return responsiveFontSizes(theme);
}

/** Default (light) theme — used anywhere that doesn't need mode switching. */
export const theme = getTheme("light");
