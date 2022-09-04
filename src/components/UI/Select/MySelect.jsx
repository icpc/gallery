import React, {useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const MySelect = ({options, name="kek", onChange, value}) => {

    const path = process.env.PUBLIC_URL + `/cc.svg`;

    return (
        <Autocomplete
            disablePortal
            id="combo-box-demo"
            value={value}
            options={options}
            onChange={(event, newValue) => onChange(newValue)}
            sx={{ width: "25%" }}
            renderInput={(params) => <TextField {...params} label={name} style={{ backgroundColor: "#2E2E2E", backgroundImage: `url(${path})`, backgroundRepeat: "no-repeat", borderRadius: "8px", color: "white"}} />}
            style={{padding:"5px"}}

        />
    );
}

export default MySelect;