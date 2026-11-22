import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import KeyIcon from "@mui/icons-material/Key";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { apiKey as defaultApiKey } from "@/config/gallery";
import { testFlickrLogin } from "@/services/flickr/api";
import {
  isFlickrAuthComplete,
  useFlickrAuth,
} from "@/services/flickr/authStore";

interface FlickrSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  fromSuggestionPreview?: boolean;
}

const FlickrSettingsDialog = ({
  open,
  onClose,
  fromSuggestionPreview = false,
}: FlickrSettingsDialogProps) => {
  const { credentials, isAuthenticated, save, clear } = useFlickrAuth();

  const [apiKey, setApiKey] = useState(
    () => credentials?.apiKey ?? defaultApiKey,
  );
  const [apiSecret, setApiSecret] = useState(
    () => credentials?.apiSecret ?? "",
  );
  const [oauthToken, setOauthToken] = useState(
    () => credentials?.oauthToken ?? "",
  );
  const [oauthTokenSecret, setOauthTokenSecret] = useState(
    () => credentials?.oauthTokenSecret ?? "",
  );
  const [showSecrets, setShowSecrets] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    severity: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setApiKey(credentials?.apiKey ?? defaultApiKey);
      setApiSecret(credentials?.apiSecret ?? "");
      setOauthToken(credentials?.oauthToken ?? "");
      setOauthTokenSecret(credentials?.oauthTokenSecret ?? "");
      setStatus(null);
    }
  }, [open, credentials]);

  const draft = {
    apiKey: apiKey.trim(),
    apiSecret: apiSecret.trim(),
    oauthToken: oauthToken.trim(),
    oauthTokenSecret: oauthTokenSecret.trim(),
  };
  const canSubmit = isFlickrAuthComplete(draft);

  const handleTest = async () => {
    if (!canSubmit) {
      return;
    }
    setTesting(true);
    setStatus(null);
    const result = await testFlickrLogin(draft);
    setTesting(false);

    if (result.ok) {
      setStatus({
        severity: "success",
        message: `Authenticated with Flickr as "${result.username}".`,
      });
    } else {
      setStatus({
        severity: "error",
        message: result.error,
      });
    }
  };

  const handleSave = () => {
    if (!canSubmit) {
      return;
    }
    save(draft);
    setStatus({
      severity: "success",
      message:
        "Flickr credentials saved locally in this browser. You can now approve suggestions and edit tags directly.",
    });
  };

  const handleClear = () => {
    clear();
    setApiKey(defaultApiKey);
    setApiSecret("");
    setOauthToken("");
    setOauthTokenSecret("");
    setStatus({
      severity: "info",
      message: "Flickr credentials removed from this browser.",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <KeyIcon color={isAuthenticated ? "success" : "action"} />
            <Typography variant="h6">Flickr Admin Settings</Typography>
          </Stack>
          <IconButton onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Configure your Flickr OAuth 1.0a write credentials to approve
            suggested tag changes and modify photo tags directly from the
            gallery interface. Credentials are stored only in{" "}
            <code>localStorage</code> on this device and are never included in
            shared URLs.
          </Typography>

          {fromSuggestionPreview && !isAuthenticated && !status && (
            <Alert severity="info">
              No Flickr token is saved in this browser yet. Add your credentials
              below to approve this suggestion directly on Flickr, or close this
              dialog to keep previewing the suggested changes.
            </Alert>
          )}

          {isAuthenticated && !status && (
            <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>
              Flickr write credentials are active in this browser.
            </Alert>
          )}

          {status && <Alert severity={status.severity}>{status.message}</Alert>}

          <TextField
            label="Flickr API Key (Consumer Key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            variant="filled"
            size="small"
            fullWidth
            autoComplete="off"
          />

          <TextField
            label="Flickr API Secret (Consumer Secret)"
            type={showSecrets ? "text" : "password"}
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            variant="filled"
            size="small"
            fullWidth
            autoComplete="off"
          />

          <TextField
            label="OAuth Access Token"
            value={oauthToken}
            onChange={(e) => setOauthToken(e.target.value)}
            variant="filled"
            size="small"
            fullWidth
            autoComplete="off"
          />

          <TextField
            label="OAuth Token Secret"
            type={showSecrets ? "text" : "password"}
            value={oauthTokenSecret}
            onChange={(e) => setOauthTokenSecret(e.target.value)}
            variant="filled"
            size="small"
            fullWidth
            autoComplete="off"
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => setShowSecrets((prev) => !prev)}
                    aria-label={showSecrets ? "Hide secrets" : "Show secrets"}
                  >
                    {showSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              },
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Tip: You can return to this screen anytime via{" "}
            <code>?settings=true</code>, <code>#settings</code>, or{" "}
            <code>/settings</code>.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          color="error"
          startIcon={<DeleteOutlinedIcon />}
          disabled={!isAuthenticated}
          onClick={handleClear}
        >
          Clear
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            disabled={!canSubmit || testing}
            onClick={() => {
              void handleTest();
            }}
            startIcon={testing ? <CircularProgress size={16} /> : undefined}
          >
            {testing ? "Testing..." : "Test connection"}
          </Button>
          <Button
            variant="contained"
            disabled={!canSubmit}
            onClick={handleSave}
          >
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default FlickrSettingsDialog;
