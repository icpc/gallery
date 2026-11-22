import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { type FC, lazy, Suspense } from "react";
import { theme } from "@/app/theme";
import { description, title } from "@/config/gallery";
import { GalleryBody } from "@/features/gallery/components/GalleryBody";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { Header } from "@/features/navigation/components/Header";
import { DesktopLogo } from "@/features/navigation/components/Logo";
import { YearNav } from "@/features/navigation/components/YearNav";
import { useDocumentSeo } from "@/shared/hooks/useDocumentSeo";

import "@/styles/global.css";

const FlickrSettingsDialog = lazy(
  () => import("@/features/settings/components/FlickrSettingsDialog"),
);

export const App: FC = () => {
  const { data, desktop, isSettingsOpen, closeSettings } = useGallery();

  useDocumentSeo({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: "grid",
          height: "100vh",
          p: 2,
          pb: 0,
          gap: 1,
          gridTemplateColumns: desktop ? "2fr 8fr" : "1fr",
          gridTemplateRows: desktop ? "minmax(130px, auto) 1fr" : "auto 1fr",
          gridTemplateAreas: desktop
            ? `"logo header"\n"sidebar body"`
            : `"header"\n"body"`,
        }}
      >
        {desktop && (
          <>
            <Box
              sx={{
                gridArea: "logo",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DesktopLogo />
            </Box>

            <Box sx={{ gridArea: "sidebar", minHeight: 0 }}>
              <YearNav />
            </Box>
          </>
        )}

        <Box
          sx={{
            gridArea: "header",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Header />
        </Box>

        <Box sx={{ gridArea: "body", minHeight: 0 }}>
          <GalleryBody />
        </Box>
      </Box>

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <FlickrSettingsDialog
            open={isSettingsOpen}
            onClose={closeSettings}
            fromSuggestionPreview={Boolean(data.suggestion)}
          />
        </Suspense>
      )}
    </ThemeProvider>
  );
};
