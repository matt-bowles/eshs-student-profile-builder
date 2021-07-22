import React, { Component } from 'react'

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Skeleton from '@material-ui/lab/Skeleton';

import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';

import { Link } from 'react-router-dom';

import { BackButton, ListFilter } from '..';
import axios from 'axios';

export default class TrendsPage extends Component {
  
  constructor() {
    super();

    this.state = {
      classList: [],
      filteredClassList: [],

      studentList: [],
      filteredStudentList: []
    };

    this.filterClass = this.filterClass.bind(this);
    this.filterStudent = this.filterStudent.bind(this);
  }

  async componentDidMount() {
    // API calls here
    var classList = await axios.get('/api/classes');
    classList = classList.data;

    var studentList = await axios.get('/api/students');
    studentList = studentList.data;

    this.setState({ classList, studentList, filteredClassList: classList, filteredStudentList: studentList });
  }

  filterClass(e) {
    var { value } = e.target;
    value = value.toUpperCase();

    var filteredClassList = this.state.classList.filter((cls) => {
      return (cls.toUpperCase()).includes(value);
  });

    this.setState({ filteredClassList });
  }

  filterStudent(e) {
    var { value } = e.target;
    value = value.toUpperCase();

    var filteredStudentList = this.state.studentList.filter((student) => {
      return ( (student.name.toUpperCase()).includes(value) || student.class.toUpperCase().includes(value) );
    });

    this.setState({ filteredStudentList });
  }
  
  render() {

    const buttonStyles = { padding: "20px" }
    const headingStyles = { marginBottom: "10px" }

    return (
      <div>
        <BackButton />

        <Paper style={{ margin: "auto", width: "60rem", height: "460px", border: "solid 2px black" }}>
        <Grid container direction="row" justify="center" alignItems="stretch">

          {/* Class column */}
          <Grid container item direction="column" xs={6}>
              <Paper elevation={2} style={buttonStyles} style={{ margin: "18px", padding: "18px" }}>
                  <Typography variant="h4" style={headingStyles}>Class breakdowns <PeopleIcon /></Typography>
                  <Typography>Analyse student traits on a class-by-class basis</Typography>

                  <ListFilter labelText="Search by class code" filterSearch={(e) => this.filterClass(e)} />

                  {this.state.filteredClassList.length === 0 ? (
                        <><br />
                          <br />
                          <Skeleton variant="rect" height={20} width={"75%"} />
                          <br />
                          <Skeleton variant="rect" height={20} width={"90%"} />
                          <br />
                          <Skeleton variant="rect" height={20} width={"85%"} />
                      </>
                  ) :
                    <List style={{ maxHeight: 200, overflow: "auto" }}>

                    {this.state.filteredClassList.map((cls) => {
                      return (
                        <ListItem key={cls}>
                            <Link key={cls} to={{ pathname: `/trends/classes/${cls}` }} style={{ textDecoration: "none" }}>
                              {/* <ListItemText primary={cls} secondary={"XX students "} /> */}
                              <ListItemText primary={cls} />
                            </Link>
                        </ListItem>
                      )
                    })}
                  </List>
                  }

              </Paper>
            </Grid>

            <Grid container direction="column" item xs={6}>
                <Paper elevation={2} style={buttonStyles} style={{ margin: "18px", padding: "18px" }}>
                    <Typography variant="h4" style={headingStyles}>Student breakdowns <PersonIcon /></Typography>
                    <Typography>Compare students' traits between semesters</Typography>

                    <ListFilter labelText="Search by student name or class code" filterSearch={(e) => this.filterStudent(e)} />

                    {this.state.filteredStudentList.length === 0 ? (
                        <><br />
                          <br />
                          <Skeleton variant="rect" height={20} width={"75%"} />
                          <br />
                          <Skeleton variant="rect" height={20} width={"90%"} />
                          <br />
                          <Skeleton variant="rect" height={20} width={"85%"} />
                      </>
                  ) :
                    <List style={{ maxHeight: 200, overflow: "auto" }}>

                    {this.state.filteredStudentList.map((student) => {
                      return (
                        <ListItem key={student.id}>
                            <Link key={student.id} to={{ pathname: `/trends/students/${student.id}` }} style={{ textDecoration: "none" }} studentName="name" studentClass="class">
                              <ListItemText primary={student.name} secondary={student.class} />
                            </Link>
                        </ListItem>
                      )
                    })}
                  </List>
                  }

                </Paper>
            </Grid>

          </Grid>
        </Paper>
      </div>
    )
  }
}
