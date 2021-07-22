import React from 'react';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListSubheader from '@material-ui/core/ListSubheader';

export default function YearSemesterPicker({ onChange, year_semester, textLabel="Year/semester", width="49%" }) {
  return (
      <FormControl style={{ width: width, paddingTop: "20px" }}>
        <InputLabel>{textLabel}</InputLabel>

        <Select label="Year" onChange={ (e) => onChange(e) } value={year_semester} >
            <ListSubheader>2021</ListSubheader>
            <MenuItem value={211}>Semester 1, 2021</MenuItem>
            <MenuItem value={212}>Semester 2, 2021</MenuItem>
            <ListSubheader>2022</ListSubheader>
            <MenuItem value={221}>Semester 1, 2022</MenuItem>
            <MenuItem value={222}>Semester 2, 2022</MenuItem>
            <ListSubheader>2023</ListSubheader>
            <MenuItem value={231}>Semester 1, 2023</MenuItem>
            <MenuItem value={232}>Semester 2, 2023</MenuItem>
            <ListSubheader>2024</ListSubheader>
            <MenuItem value={241}>Semester 1, 2024</MenuItem>
            <MenuItem value={242}>Semester 2, 2024</MenuItem>
            <ListSubheader>2025</ListSubheader>
            <MenuItem value={251}>Semester 1, 2025</MenuItem>
            <MenuItem value={252}>Semester 2, 2025</MenuItem>
        </Select>
    </FormControl>
  );
}
