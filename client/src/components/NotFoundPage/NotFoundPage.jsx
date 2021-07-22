import React from 'react';

import Typography from '@material-ui/core/Typography';

import { BackButton } from '..';

export default function NotFoundPage() {
  return (
    <>
        <BackButton />

        {/* <table>
          <thead>
            <th>Student</th>
            <th>Class</th>
          </thead>
          <tbody>
            <tr>
              {this.props.students.map((student) => {
                return <td>{student.name}</td>
              })}
            </tr>
          </tbody>
        </table>
         */}
        <Typography variant="h3" style={{ margin: "auto", textAlign: "center", marginTop: "10%" }}>404 - page not found</Typography>
    </>
  );
}
