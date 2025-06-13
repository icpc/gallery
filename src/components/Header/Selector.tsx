import { FC } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Autocomplete,
  Box,
  InputAdornment,
  Paper,
  TextField,
  createFilterOptions,
} from "@mui/material";

interface Option {
  data: string;
  label: string;
}

interface Props {
  leftIcon: string;
  onChange: (newValue: string | "clear") => void;
  name: string;
  value: string | null;
  options: Option[];
  disableClearable?: boolean;
}

const Selector: FC<Props> = ({
  leftIcon,
  onChange,
  name,
  value,
  options,
  disableClearable,
}) => {
  const selectedValue = options.find((opt) => opt.data === value) ?? null;

  return (
    <Paper>
      <Autocomplete<Option, undefined, boolean>
        fullWidth
        disablePortal
        filterOptions={createFilterOptions({ limit: 200 })}
        value={selectedValue}
        options={options}
        isOptionEqualToValue={(option, val) => option.data === val.data}
        onChange={(_, newValue) => {
          onChange(newValue ? newValue.data : "clear");
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              placeholder={name}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        component="img"
                        src={leftIcon}
                        alt=""
                        sx={{ width: 20, height: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          );
        }}
        popupIcon={<ExpandMoreIcon />}
        disableClearable={disableClearable}
      />
    </Paper>
  );
};

export default Selector;
