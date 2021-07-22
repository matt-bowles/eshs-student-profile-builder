import React from 'react';

import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

export default function CheckboxList({ data, handleChange, selectedTraits }) {
  
  // Keeps track of categories that already have a dedicated heading
  var usedCategories = [];

  function getCheckBox(trait) {

    return (
      <FormControlLabel
        style={{ margin: "-18px 0 -18px 0", display: "block" }}
        value="end"
        color="primary"
        control={
          <Checkbox value={JSON.stringify(trait)} color="primary" onChange={(e) => handleChange(e)} />
        }
        label={trait.name}
        onChange={(e) => handleChange(e)}
        
        checked={selectedTraits.some(tr => tr.name === trait.name)}
      />
    )
  }

  return (
    data.map((trait) => {

      if (!usedCategories.includes(trait.category)) {
        usedCategories.push(trait.category);
        return ( 
          <>
            <Typography variant="h6" style={{ margin: "12px" }}><b>{trait.category}</b></Typography>
            {getCheckBox(trait)}
          </>
        )
      } else {
        return <> {getCheckBox(trait)} </>
      }
    })

  );
}
