import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { CheckboxList } from '../';

export default function StudentForm({ data, handleChange }) {
  
  // Loading catch
  if (data.length < 1) return <Typography>Loading...</Typography>;
  
  const LEFT_COL = ["Academic", "Behaviour", "Communication", "Development"];
  const RIGHT_COL = ["Social/emotional", "Cognitive", "Physical", "Sensory"];

  // Data to be drawn in the left and right columns, respectively
  var left = data.categories.filter((cat) => { return LEFT_COL.includes(cat.name) });
  var right = data.categories.filter((cat) => { return RIGHT_COL.includes(cat.name) });

  return (
    <Grid container spacing={1} style={{ marginTop: "5%" }}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5" style={{ textAlign: "center", fontWeight: "bold" }}>Learning Traits</Typography>
        <CheckboxList data={left} handleChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}  style={{ borderLeft: "1px solid grey", paddingLeft: "50px" }}>
        <Typography variant="h5" style={{ textAlign: "center", fontWeight: "bold" }}>Health and Disability</Typography>
        <CheckboxList data={right} handleChange={handleChange} />
      </Grid>
    </Grid>
  );
}
