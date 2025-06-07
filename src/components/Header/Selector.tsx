import { FC } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Autocomplete,
  Paper,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const TextFieldWithIcon = styled(TextField)(() => ({
  "& .MuiInputBase-input.MuiAutocomplete-input": {
    marginLeft: "25px",
  },
  "& .MuiInputLabel-root": {
    marginLeft: "25px",
  },
}));

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
        isOptionEqualToValue={(option: Option, val: Option) =>
          option.data === val.data
        }
        onChange={(_, newValue) => {
          onChange(newValue ? newValue.data : "clear");
        }}
        renderInput={(params) => (
          <TextFieldWithIcon
            {...params}
            placeholder={name}
            style={{
              backgroundImage: `url(${leftIcon})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 10px center",
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
