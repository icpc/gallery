import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, Paper, TextField } from "@mui/material";
import { type ChangeEvent, type FC, type FormEvent, useState } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";

export const SearchBar: FC = () => {
  const { setText, setIsOpenMenu, mobile } = useGallery();
  const [inputText, setInputText] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (inputText.trim() !== "") {
      setText(inputText.trim());
      setInputText("");
      if (mobile) {
        setIsOpenMenu(false);
      }
    }
  };

  return (
    <Paper>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <TextField
          fullWidth
          value={inputText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputText(e.target.value)
          }
          placeholder="Global search..."
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </form>
    </Paper>
  );
};
