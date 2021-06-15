import React from 'react';

import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

export default function CheckboxList({ data, handleChange }) {
  return (
    <Grid container direction="row">
      {data.map((cat) => {
        return <div key={cat.name} style={{ marginTop: "5%" }}>
          <Typography variant="h6" style={{ marginBottom: "12px" }}><b>{cat.name}</b></Typography>
            {cat.traits.map((trait) => {
              return <FormControlLabel
              style={{ margin: "-18px 0 -18px 0", display: "block" }}
                value="end"
                color="primary"
                control={<Checkbox value={JSON.stringify(trait)} color="primary" />}
                label={trait.name}
                key={trait.name}
                onChange={(e) => handleChange(e)}
                >
                  {trait}
                </FormControlLabel>
            })}

            <br />

        </div>
      })} 

      <br />

    </Grid>
  );
}
