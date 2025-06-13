import { ChangeEvent, FC, FormEvent, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, Paper, TextField } from "@mui/material";

import { useAppContext } from "../AppContext";

const Search: FC = () => {
  const { setText, setIsOpenMenu, mobile } = useAppContext();

  const [inputText, setInputText] = useState("");
  const set = (e: FormEvent) => {
    e.preventDefault();
    if (inputText !== "") {
      setText(inputText);
      setInputText("");

      if (mobile) {
        setIsOpenMenu(false);
      }
    }
  };

  return (
    <Paper>
      <form onSubmit={set} style={{ width: "100%" }}>
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
                  <IconButton type="submit">
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

export default Search;
