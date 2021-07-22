import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { CheckboxList } from '../';

export default function StudentForm({ data, handleChange, selectedTraits }) {
  
  const LEFT_COL_CATEGORIES = ["Academic", "Behaviour", "Communication", "Development"];
  const RIGHT_COL_CATEGORIES = ["Social/emotional", "Cognitive", "Physical", "Sensory"];

  var left = data.filter((trait) => { return LEFT_COL_CATEGORIES.includes(trait.category) });
  var right = data.filter((trait) => { return RIGHT_COL_CATEGORIES.includes(trait.category) });

  // Loading catch
  return (data.length === 0) ? (<Typography>Loading...</Typography>) : (

    <Grid container spacing={1} style={{ marginTop: "5%" }}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5" style={{ textAlign: "center", fontWeight: "bold" }}>Learning Traits</Typography>
        <CheckboxList data={left} handleChange={handleChange} selectedTraits={selectedTraits} />
      </Grid>
      <Grid item xs={12} sm={6}  style={{ borderLeft: "1px solid grey", paddingLeft: "50px" }}>
        <Typography variant="h5" style={{ textAlign: "center", fontWeight: "bold" }}>Health and Disability</Typography>
        <CheckboxList data={right} handleChange={handleChange} selectedTraits={selectedTraits} />
      </Grid>
    </Grid>
  )

}
