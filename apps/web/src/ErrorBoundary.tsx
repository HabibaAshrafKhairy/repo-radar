import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render-time errors anywhere below it so one broken component doesn't blank the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in Repo Radar:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Stack spacing={2} sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
          <Alert severity="error">Something went wrong.</Alert>
          <Typography variant="body2" color="text.secondary">
            {this.state.error.message}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Stack>
      );
    }
    return this.props.children;
  }
}
