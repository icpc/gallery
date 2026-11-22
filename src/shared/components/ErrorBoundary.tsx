import { Box, Button, Stack, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled UI error:", error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#1A1A1A",
            color: "#FFFFFF",
            p: 3,
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 480, textAlign: "center" }}>
            <Typography variant="h5" component="h1">
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {this.state.error.message}
            </Typography>
            <Box>
              <Button variant="contained" onClick={this.handleReload}>
                Reload gallery
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}
