import axios from 'axios'
import React, { Component } from 'react'

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import CircularProgress from '@material-ui/core/CircularProgress';

import { Pie } from 'react-chartjs-2';
import YearSemesterPicker from '../YearSemesterPicker/YearSemesterPicker';

import { Link } from 'react-router-dom';

import { BackButton } from '../';

export default class ClassBreakdownPage extends Component {
    
    constructor() {
      super();

      this.state = {
        data: [],
        traits: [],
        classCode: "",

        year_semester: 212,
        selectedTrait: { name: "None", id: null },
        selectedStudents: [],

        pieAnimationDuration: 0,

        isLoading: false,
      }

      this.yearSemesterChange = this.yearSemesterChange.bind(this);
      this.formatDataForChartJs = this.formatDataForChartJs.bind(this);
      this.setSelectedTrait = this.setSelectedTrait.bind(this);
    }

    async componentDidMount() {
        var classCode = this.props.match.params.class;
        this.setState({ classCode });

        // Fetch class distribution statistics
        var data = await axios.get(`/api/trends/classes/${classCode}?year_semester=212`);

        this.formatDataForChartJs(data.data);
    }

    formatDataForChartJs(data) {
      // Create labels
      var labels = [];

      // Create dataset
      var datasets = {
        label: "Number of students",
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
      }

      if (data.length === 0) {
        return this.setState({ data: undefined });
      }

      // Fill labels and dataset
      data.forEach((item) => {
        labels.push(item.name);
        datasets.data.push(item.num_students);
        this.state.traits.push({ name: item.name, id: item.id });
      });

      var formattedData = {
        labels, 
        datasets: [datasets]
      };

      this.setState({ data: formattedData });
    }

    async yearSemesterChange(e) {
      this.setState({ year_semester: e.target.value, traits: [], selectedStudents: [], selectedTrait: { name: "None" } });

      // Fetch class distribution statistics
      var data = await axios.get(`/api/trends/classes/${this.state.classCode}?year_semester=${e.target.value}`);  

      this.formatDataForChartJs(data.data);
    }

    async setSelectedTrait(evt, element) {

      if (element.length > 0) {

        var { index } = element[0];

        this.setState({ selectedTrait: this.state.traits[index], isLoading: true });

        var students = await axios.get(`/api/studentsInClassWithTrait?class=${this.state.classCode}&trait=${this.state.selectedTrait.id}&year_semester=${this.state.year_semester}`);
        students = students.data;

        this.setState({ selectedStudents: students, isLoading: false });
      }
    }
  
    render() {

      return (
        <>

            <BackButton url="/trends" />

            <Paper style={{ margin: "auto", width: "60rem", height: "460px", border: "solid 2px black", padding: "20px" }}>

            <Typography variant="h5" style={{ textAlign: "center", margin: "30px", fontWeight: "bold" }}>Class breakdown for {this.state.classCode}</Typography>

            <Grid container direction="row">
              <Grid item direction="column" xs={6}>
                
                <YearSemesterPicker year_semester={this.state.year_semester} onChange={(e) => this.yearSemesterChange(e)} width={"90%"} textLabel="" />


                {/* Selected trait */}

                {this.state.data !== undefined && (
                  <>
                      <Typography variant="h6" fontWeight="bold" style={{ marginLeft: "10px", marginTop: "10px" }}><b>Selected trait:</b> {this.state.selectedTrait.name}</Typography>

                      <List style={{ display: this.state.isLoading }}>
    
                      {this.state.isLoading && <CircularProgress />}
    
                      {/* Display each student as a row-link */}
                      {this.state.selectedStudents.map((student) => {
                        return (
                          <ListItem key={student} style={{ display: `${this.state.isLoading}` }}>
                            <Link key={student.id} to={{ pathname: `/edit/${student.id}` }} target="_blank" style={{ textDecoration: "none" }}>
                              <ListItemText primary={`• ${student.name}`} style={{ display: this.state.isLoading }} />
                            </Link>
                          </ListItem>
                        )
                      })}
    
                      </List>
                    </>
                )}

              </Grid>
              <Grid item direction="row" xs={6}>
                {this.state.data !== undefined &&
                    <Pie
                      height={280}
                      options={{ 
                        maintainAspectRatio: false,
                        onClick: ((evt, element) => this.setSelectedTrait(evt, element)),
                        legend: { display: true, position: "left" },
                        animation: {
                          duration: this.state.pieAnimationDuration,
                        },
                        position: "left"
                      }}
                      data={this.state.data}
                      style={{ margin: "30px" }}
                    />  
                  }
              </Grid>
            </Grid>


            {/* i.e. There is no data available for the selected semester/year */}
            {this.state.data === undefined &&   
              <Typography variant="h6" style={{ margin: "auto", textAlign: "center", margin: "50px" }}>No data available for selected year/semester.</Typography>
            }
 
            </Paper>
        </>
      )
  }
}
