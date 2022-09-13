import React, {useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles, createStyles } from "@material-ui/core/styles";

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
                color: "#8A8A8A",
                zIndex: 0
            },
            "& #custom-autocomplete-label": {
                //or could be targeted through a class
                color: "#8A8A8A",
                zIndex: 0
            },
            "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
                color: "#8A8A8A"
            }
        }
    })
);

const CustomPopper = function (props) {
    const classes = useStyles();
    return <Paper {...props} className={classes.root}/>;
};


const MySelect = ({options, name="", onChange, value}) => {

    const classes = useStyles();
    return (
        <Autocomplete
            disablePortal
            id="custom-autocomplete"
            value={value}
            options={options}
            onChange={(event, newValue) => onChange(newValue)}
            sx={{ width: "25%", color: "white" }}
            renderInput={(params) => <TextField {...params} variant="outlined" label={name} style={{ backgroundColor: "#2E2E2E", borderRadius: "8px", color: "white"}} className={classes.textfield} />}
            style={{padding:"5px"}}
            popupIcon={<ExpandMoreIcon />}
            PaperComponent={CustomPopper}
            //required (as far as I can tell) in order to target popper elements for custom styling

        />
    );
}

export default MySelect;