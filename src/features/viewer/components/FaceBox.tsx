import { Box } from "@mui/material";
import type { FC } from "react";
import type { Person } from "@/types/gallery";

interface FaceBoxProps {
  person: Person;
  hidden: boolean;
  setFace: (person: Person | null) => void;
}

export const FaceBox: FC<FaceBoxProps> = ({ person, hidden, setFace }) => {
  if (!person.position) {
    return null;
  }

  const { top, bottom, left, right } = person.position;
  const centerX = (left + right) / 2;
  const placeAbove = bottom > 0.85;
  const horizontalAnchor =
    centerX < 0.08
      ? { left: 0 }
      : centerX > 0.92
        ? { right: 0 }
        : { left: "50%", transform: "translateX(-50%)" };

  return (
    <Box
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
      sx={{
        position: "absolute",
        top: `${top * 100}%`,
        left: `${left * 100}%`,
        width: `${Math.max(0, right - left) * 100}%`,
        height: `${Math.max(0, bottom - top) * 100}%`,
        border: "2px solid",
        borderColor: "warning.light",
        borderRadius: 1,
        boxSizing: "border-box",
        opacity: hidden ? 0 : 1,
        transition: "opacity 150ms ease",
        pointerEvents: "auto",
      }}
    >
      <Box
        component="span"
        sx={{
          position: "absolute",
          ...(placeAbove
            ? { bottom: "calc(100% + 4px)" }
            : { top: "calc(100% + 4px)" }),
          ...horizontalAnchor,
          bgcolor: "rgba(0, 0, 0, 0.82)",
          color: "common.white",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontSize: "0.75rem",
          fontWeight: 600,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {person.name}
      </Box>
    </Box>
  );
};
