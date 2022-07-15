import React, {useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const MySelect = ({options, name="kek", onChange, value}) => {

    return (
        <Autocomplete
            disablePortal
            id="combo-box-demo"
            value={value}
            options={options}
            onChange={(event, newValue) => onChange(newValue)}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={name} />}
        />
    );
}

export default MySelect;