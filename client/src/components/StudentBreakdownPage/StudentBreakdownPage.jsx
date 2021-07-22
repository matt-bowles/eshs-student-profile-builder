import React, { Component } from 'react'

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { BackButton, YearSemesterPicker } from '..';
import axios from 'axios';

export default class StudentBreakdownPage extends Component {

    constructor() {
        super();

        this.state = {
            studentId: null,
            studentName: "",

            ys1: null,
            ys2: null,

            ys1Traits: [],
            ys2Traits: [],
            
            remained: [],
            removed: [],
            contracted: []
        }

        this.processTraits = this.processTraits.bind(this);
        this.changeYearSemester = this.changeYearSemester.bind(this);
    }

    async componentDidMount() {

        var studentId = this.props.match.params.student;

        var student = await axios.get(`/api/studentDetails/${studentId}`);
        var student = student.data;
        var studentName = student.name;
        var studentClass = student.class;


        // Get current year semester, and then set ys1/ys2 (ys2 being the current)
        var cys = await axios.get('/api/currentYearSemester');

        var ys2 = cys.data;
        var ys1;

        // Get last semester year according to current
        if (ys2.substr(2, 3) == "2") {
            ys1 = String(ys2 - 1);
        } else {
            ys1 = ys2.substr(0, 2) + "2";
        }

        var req = await axios.get(`/api/trends/students/${studentId}?ys1=${ys1}&ys2=${ys2}`);
        var { data } = req;

        await this.setState({ studentId, studentClass, studentName, ys1Traits: data[0], ys2Traits: data[1], ys1, ys2 });

        await this.processTraits();
    }

    async changeYearSemester(e, ys) {
        var { value } = e.target;

        if (value === undefined) {
            console.log(`User has clicked on a "blank" dropdown `);
        }

        // Change ysx here
        if (ys === "ys1") {
            await this.setState({ ys1: value });
        } else if (ys === "ys2") {
            await this.setState({ ys2: value });
        }

        // Fetch data
        var req = await axios.get(`/api/trends/students/${this.state.studentId}?ys1=${this.state.ys1}&ys2=${this.state.ys2}`);
        var { data } = req;

        // Process data
        await this.setState({ ys1Traits: data[0], ys2Traits: data[1] });
        await this.processTraits();
    }
 
    async processTraits() {
        var remained, removed, contracted = [];

        // Find traits which are present in both semesters for the student
        remained = this.state.ys1Traits.filter((tr) => this.state.ys2Traits.find(x => x.id === tr.id));
        
        // Find new traits that were not present in the first session
        contracted = this.state.ys2Traits.filter(tr => (!this.state.ys1Traits.find(x => x.id === tr.id)));

        // Find traits present in ys1, but not in ys2 (i.e. REMOVED)
        removed = this.state.ys1Traits.filter((tr) => !this.state.ys2Traits.find(x => x.id === tr.id))

        this.setState({ remained, contracted, removed });
    }

    render() {
        return (
        <>
            <BackButton url="/trends" />

            <Paper style={{ margin: "auto", width: "60rem", height: "460px", padding: "50px", border: "solid 2px black" }}>

                <Typography variant="h4" style={{ textAlign: "center", marginBottom: "50px" }}><b>Student breakdown - {this.state.studentName} ({this.state.studentClass})</b></Typography>

                <Grid container direction="row" style={{ marginTop: "10px" }}>
                    <Grid item direction="column" xs={4}>
                        <YearSemesterPicker year_semester={this.state.ys1} onChange={(e) => this.changeYearSemester(e, "ys1")} width="80%" textLabel="" />
                        
                        {this.state.ys1Traits.length === 0 && (
                            <Typography>No traits for selected year/semester.</Typography>
                        )}

                        {this.state.ys1Traits.map((trait) => {
                            return <Typography variant="h6" style={{ fontSize: "16px" }}>• {trait.name}</Typography>
                        })}
                    </Grid>
                    <Grid item direction="column" xs={4.5}>
                        <YearSemesterPicker year_semester={this.state.ys2} onChange={(e) => this.changeYearSemester(e, "ys2")} width="80%" textLabel="" />

                        {this.state.ys2Traits.length === 0 && (
                            <Typography>No traits for selected year/semester.</Typography>
                        )}

                        {this.state.ys2Traits.map((trait) => {
                            return <Typography variant="h6" style={{ fontSize: "16px" }}>• {trait.name}</Typography>
                        })}
                    </Grid>
                    <Grid item direction="column" xs={3.5} style={{ borderLeft: "1px solid gray", paddingLeft: "50px", marginLeft: "80px" }}>
                        <Typography variant="h4">Summary</Typography>
                        
                        {/* Removed */}
                        <div style={{ display: (this.state.removed.length > 0) ? "" : "none"  }}>
                            <Typography variant="h6" style={{ marginTop: "20px" }}>Removed traits</Typography>
                            {this.state.removed.map((trait) => {
                                return <Typography variant="h6" style={{ fontSize: "14px", color: "#099e34" }}>• {trait.name}</Typography>
                            })}
                        </div>

                        {/* Contracted */}
                        <div style={{ display: (this.state.contracted.length > 0) ? "" : "none"  }}>
                            <Typography variant="h6" style={{ marginTop: "20px" }}>New traits</Typography>
                            {this.state.contracted.map((trait) => {
                                return <Typography variant="h6" style={{ fontSize: "14px", color: "#8f1b1b" }}>• {trait.name}</Typography>
                            })}
                        </div>

                        {/* Remained */}
                        <div style={{ display: (this.state.remained.length > 0) ? "" : "none"  }}>
                            <Typography variant="h6" style={{ marginTop: "20px" }}>Persisting traits</Typography>
                            {this.state.remained.map((trait) => {
                                return <Typography variant="h6" style={{ fontSize: "14px" }}>• {trait.name}</Typography>
                            })}
                        </div>

                    </Grid>
                </Grid>
            </Paper>

        </>
        )
    }
}
