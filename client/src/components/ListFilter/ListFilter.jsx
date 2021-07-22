import React from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

export default function ListFilter({ labelText, filterSearch }) {
  return (
    <TextField 
    label={labelText} 
    variant="outlined"
    style={{ width: "100%", marginTop: "20px" }}
    onChange={(e) => filterSearch(e)}
    // onKeyPress={(e) => this.handleKeyPress(e)}

    InputProps={{
        endAdornment: (
            <InputAdornment position="end"><SearchIcon /></InputAdornment>
        )
    }}
    />
  );
}
