import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Paper, TextField } from "@mui/material";

import { useAppContext } from "../AppContext";

const Search = () => {
  const { setText, setIsOpenMenu, mobile } = useAppContext();

  const [inputText, setInputText] = useState("");
  const set = (e) => {
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
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Global search..."
          InputProps={{
            endAdornment: (
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </form>
    </Paper>
  );
};

export default Search;
