import React, { Component } from 'react'

import { StudentForm, BackButton } from '../';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListSubheader from '@material-ui/core/ListSubheader';

import axios from 'axios';

export default class StudentProfilePage extends Component {

    constructor() {
        super();

        this.state = {
            data: [],
            selectedTraits: [],
            classes: [],
            yourName: "",
            studentName: "",
            studentClass: "",
            year_semester: 212,
            viewMethod: "web",
            generatingPdf: false,
            alertActive: false,
            alertText: "",
            hasSubmitted: false,

            id: null,
        }

        // Uncontrolled
        // this.input = React.createRef()

        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.buttonClick = this.buttonClick.bind(this);
        this.handleYearSemesterChange = this.handleYearSemesterChange.bind(this);
        this.pushSuccessNotification = this.pushSuccessNotification.bind(this);
    }

    // TODO: Ideally, this should be componentDidMount
    // WillMount is called twice, while DidMount is called once
    async componentWillMount() {
        if (!sessionStorage.traits) {
           var traits = await axios.get('/api/traits');
            
           sessionStorage.traits = JSON.stringify(traits.data);
        }

        this.setState({ data: JSON.parse(sessionStorage.traits) });

        if (window.location.href.includes("edit")) {

            // Do student lookup from id, and then fill data/set state
            const { id } = this.props.match.params;

            var student = await axios.get(`/api/student?id=${id}`);
            student = student.data;

            this.setState({
                studentName: student.studentName,
                studentClass: student.studentClass,
                year_semester: student.year_semester,
                selectedTraits: student.selectedTraits,
                id
            });
        }

        var classes = await axios.get('/api/classes');
        this.setState({ classes: classes.data });
    }

    async handleCheckboxChange(e) {
        var selectedTraits = this.state.selectedTraits;

        var temp = JSON.parse(e.target.value);

        console.log(temp)

        // Add to selected
        if (e.target.checked) {
            selectedTraits.push(temp);
        }

        // Remove from selected (via filtering)
        else {
            // The problem lies HERE
            var index = selectedTraits.findIndex(tr => tr.name === temp.name);
            selectedTraits = selectedTraits.filter(tr => selectedTraits.indexOf(tr) !== index);
        }

        await this.setState({ selectedTraits });
    }

    handleRadioChange(e) {
        this.setState({ viewMethod: e.target.value });
    }
    
    async handleYearSemesterChange(e) {
        this.setState({ year_semester: e.target.value });

        const { id } = this.props.match.params;

        // If in edit mode, attempt to load traits associated with selected year/semester
        if (window.location.href.includes("edit")) {
            var { data } = await axios.get(`/api/student?id=${id}&semesterYear=${e.target.value}`); 

            this.setState({ selectedTraits: data.selectedTraits });
        }
    }

    async saveStudent() {
        var body = {
            selectedTraits: this.state.selectedTraits,
            yourName: this.state.yourName,
            studentName: this.state.studentName,
            studentClass: this.state.studentClass,
            semesterYear: this.state.year_semester
        }

        var url = "/api/student";
        
        if (window.location.href.includes("edit") || this.state.hasSubmitted) {
            url += `/${this.state.id}`;
        } else {
            url += "s";
        }

        var req = await axios.post(url, body);

        this.setState({ hasSubmitted: true, id: req.data.id });
        this.pushSuccessNotification("Save successful");

    }

    pushSuccessNotification(msg="Success") {
        
        this.setState({ alertActive: true, alertText: msg });

        setTimeout(() => {
            this.setState({ alertActive: false })
        }, 3000);
    }

    async updateStudent() {
        var body = {
            selectedTraits: this.state.selectedTraits,
            yourName: this.state.yourName,
            studentName: this.state.studentName,
            studentClass: this.state.studentClass,
            year_semester: this.state.year_semester
        }

        const id = this.props.match.params;

        axios.put(`/api/students?id=${id}`);
    }

    async buttonClick() {
        var body = {
            selectedTraits: this.state.selectedTraits,
            yourName: this.state.yourName,
            studentName: this.state.studentName,
            studentClass: this.state.studentClass,
            semesterYear: this.state.year_semester
        }

        this.setState({ generatingPdf: true })
        let res = await axios.post('/generatePdf', body, { responseType: "arraybuffer" });
        this.setState({ generatingPdf: false })

        let { data } = res;

        var blob = new Blob([data, { type: "application/pdf" }]);
        var urlObj = URL.createObjectURL(blob);

        if (this.state.viewMethod === 'web') {

            var encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));

            var path = "data:application/pdf;base64," + encoded;

            var w = window.open(path);
            w.document.write('<iframe src="' + path + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
        } else if (this.state.viewMethod === 'download') {
            const link = document.createElement('a');
            link.href = urlObj;
            link.download = `IndividualisedPlanningDocument-${new Date()}.pdf`;
            link.click();
        }

    }

    render() {
        return (
            <div className="App" style={{ marginBottom: "50px" }}>

                <Snackbar open={this.state.alertActive} autoHideDuration={3000}>
                    <MuiAlert severity="success" elevation={6} variant="filled">
                        Save successful
                    </MuiAlert>
                </Snackbar>

                <BackButton />

                <Paper style={{ width: "900px", border: "solid 2px black", margin: "auto", padding: "1%" }}>
                    
                    <Typography>This tool will allow you to create an <i>Individualised Planning Document</i> for each student. Choose each specific <i>Learning Trait</i> to get started. The document can be previewed in your browser or downloaded as a PDF.</Typography>

                    <div style={{ marginTop: "2%" }}>
                        <TextField id="studentNameInput" label="Student's name (optional)" style={{ width: "49%" }} value={this.state.studentName} onChange={(e) => this.setState({ studentName: e.target.value })}></TextField>
                        <TextField id="yourNameInput" label="Your name (optional)" style={{ width: "49%", marginLeft: "1%" }} value={this.state.yourName} onChange={(e) => this.setState({ yourName: e.target.value })}></TextField>
                        <br />
                        <br />

                        <TextField id="studentNameInput" label="Class (e.g. 9A)" style={{ width: "49%" }} value={this.state.studentClass} onChange={(e) => this.setState({ studentClass: e.target.value })}></TextField>
                        <FormControl style={{ width: "49%", marginLeft: "1%" }}>
                            <InputLabel>Year/semester</InputLabel>
                            <Select label="Year" onChange={ (e) => this.handleYearSemesterChange(e) } value={ this.state.year_semester }>
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

                        {/* <Autocomplete
                            id="classInput"
                            label="Class (e.g. 9A)"
                            value={this.state.studentClass}
                            options={this.state.classes}
                            getOptionLabel={(option) => option.code}
                            renderInput={(params) => <TextField {...params} variant="outlined"/>}
                            style={{ width: "45%", marginRight: "5%" }}
                            onChange={(e) => this.setState({ studentClass: e.target.value })}
                        /> */}

                        {/* <TextField id="classInput" label="Class (e.g. 9A)" style={{ width: "45%", marginRight: "5%" }} value={this.state.studentClass} onChange={(e) => this.setState({ studentClass: e.target.value })}></TextField> */}
                        
                    </div>

                    <StudentForm
                        selectedTraits={this.state.selectedTraits}
                        data={this.state.data}
                        handleChange={this.handleCheckboxChange}

                        mode={this.state.mode}
                    />

                    <hr style={{ margin: "20px" }} />
                    
                    <Typography variant="h6"><b>PDF generation options</b></Typography>

                    <RadioGroup value={this.state.viewMethod} style={{ marginBottom: "30px" }}>
                        <FormControlLabel value="web" control={<Radio color="primary" selected />} color="primary" label="Preview in my web browser" onChange={(e) => this.handleRadioChange(e)} />
                        <FormControlLabel value="download" control={<Radio color="primary" />} color="primary" label="Save to my computer" onChange={(e) => this.handleRadioChange(e)} />
                    </RadioGroup>

                    <Button style={{ width: "49%" }} variant="contained"  color="primary" onClick={() => this.saveStudent()}>Save student details   </Button>
                    <Button style={{ width: "49%", marginLeft: "1%" }} variant="contained"  color="primary" disabled={this.state.selectedTraits.length === 0} onClick={() => this.buttonClick()}>{this.state.generatingPdf ? `Generating PDF...` : 'Generate PDF'}</Button>

                </Paper>
            </div>
        )
    }
}