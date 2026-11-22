import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Autocomplete,
  Box,
  createFilterOptions,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import type { FC } from "react";

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
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={name}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
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
        )}
        popupIcon={<ExpandMoreIcon />}
        disableClearable={disableClearable}
      />
    </Paper>
  );
};

export default Selector;
