import React, {useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles, createStyles } from "@material-ui/core/styles";

import AccountCircle from "material-ui-icons/AccountCircle";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            "& .MuiAutocomplete-listbox": {
                backgroundColor: "#2E2E2E",
                color: "#8A8A8A"
            }
        },
        textfield: {
            "& .MuiInputBase-input.MuiAutocomplete-input": {
                color: "white",
                marginLeft: "25px",
                zIndex: 0
            },
            "& #custom-autocomplete-label": {
                //or could be targeted through a class
                color: "#8A8A8A",
                marginLeft: "25px",
                zIndex: 0
            },
            "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2E2E2E"
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor:"#2E2E2E"
            },
            "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
                color: "#8A8A8A"
            },
            "& .MuiInputLabel-shrink": {
                display: "none"
            }

        }
    })
);

const CustomPopper = function (props) {
    const classes = useStyles();
    return <Paper {...props} className={classes.root}/>;
};


const MySelect = ({options, name="", onChange, value, link}) => {
    const path = process.env.PUBLIC_URL + link;
    const classes = useStyles();
    return (
        <Autocomplete
            disablePortal
            id="custom-autocomplete"
            value={value}
            options={options}
            onChange={(event, newValue) => onChange(newValue)}
            sx={{ width: "33%", "& .MuiOutlinedInput-root": {
                    "& > fieldset": {
                        border: "none"
                    }
                } }}
            renderInput={(params) => <TextField {...params} variant="outlined" label={name} style={{ backgroundColor: "#2E2E2E", borderRadius: "8px", backgroundImage: `url(${path})`, backgroundRepeat: "no-repeat", backgroundPosition: "left 10px center"}} className={classes.textfield} />}
            style={{padding:"5px"}}
            popupIcon={<ExpandMoreIcon />}
            PaperComponent={CustomPopper}
            //required (as far as I can tell) in order to target popper elements for custom styling

        />
    );
}

export default MySelect;