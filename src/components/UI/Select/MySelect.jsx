import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Autocomplete from "@mui/material/Autocomplete";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";


const MyTextField = styled(TextField)(() => ({
    "& .MuiInputBase-input.MuiAutocomplete-input": {

        color: "white",
        fontSize: "1rem",
        marginLeft: "25px",
        zIndex: 0
    },
    "& #custom-autocomplete-label": {
        //or could be targeted through a class
        color: "#8A8A8A",
        marginLeft: "25px",
        fontSize: "1rem",
        zIndex: 0
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2E2E2E"
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2E2E2E"
    },
    "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
        color: "#8A8A8A"
    },
    "& .MuiInputLabel-shrink": {
        display: "none"
    }
}));

const MyPaper = styled(Paper)(() => ({
    "& .MuiAutocomplete-listbox": {
        backgroundColor: "#2E2E2E",
        color: "#8A8A8A"
    }
}));

const CustomPopper = function (props) {
    return <MyPaper {...props} style={{ backgroundColor: "#2E2E2E", color: "#8A8A8A" }}/>;
};

const MySelect = ({ options, name = "", onChange, value, leftIcon }) => {
    return (
        <Autocomplete
            disablePortal
            id="custom-autocomplete"
            value={value}
            options={options}
            onChange={(event, newValue, reason) => {
                if (reason === "selectOption") {
                    onChange(newValue);
                } else {
                    onChange("clear");
                }
            }}
            sx={{
                width: "100%", display: "flex", alignItems: "center", "& .MuiOutlinedInput-root": {
                    "& > fieldset": {
                        border: "none"
                    }
                }
            }}
            renderInput={(params) => <MyTextField {...params} variant="outlined" label={name} style={{
                backgroundColor: "#2E2E2E",
                borderRadius: "8px",
                backgroundImage: `url(${leftIcon})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 10px center"
            }}/>}
            popupIcon={<ExpandMoreIcon/>}
            PaperComponent={CustomPopper}
        />
    );
};

export default MySelect;
