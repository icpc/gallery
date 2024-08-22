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

const filterOptions = createFilterOptions({ limit: 200 });

const Selector = ({
  leftIcon,
  onChange,
  name,
  value,
  options,
  disableClearable = false,
}) => {
  return (
    <Paper>
      <Autocomplete
        filterOptions={filterOptions}
        fullWidth
        disablePortal
        value={value}
        options={options}
        isOptionEqualToValue={(option, value) => option.data === value}
        onChange={(event, newValue, reason) => {
          if (reason === "selectOption") {
            onChange(newValue);
          } else {
            onChange("clear");
          }
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
