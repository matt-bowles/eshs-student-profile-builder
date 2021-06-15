import React, { Component } from 'react'

import { StudentForm } from './components';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';

import axios from 'axios';

export default class App extends Component {

  constructor() {
    super();

    this.state = {
      data: [],
      selectedTraits: [],
      yourName: "",
      studentName: "",
      viewMethod: "web",
      generatingPdf: false
    }

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
  }

  async componentDidMount() {
    this.setState({ data: await require('./data/data.json') });
  }

handleCheckboxChange(e) {
  var selectedTraits = this.state.selectedTraits;

  var temp = JSON.parse(e.target.value);

  // TODO: This is crazy inefficient... but I am too tired to think of anything else
  this.state.data.categories.forEach((cat) => {
    cat.traits.forEach((trait) => {
      if (trait.name === temp.name) {
        temp.category = cat.name;
        temp.isLearningTrait = ["Academic", "Behaviour", "Communication", "Development"].includes(cat.name);
        return;
      }
    })
  });

  // Add to selected
  if (e.target.checked) {
    selectedTraits.push(temp);
  }

  // Remove from selected (via filtering)
  else {
    selectedTraits = selectedTraits.filter((tr) => { return tr.name !== temp.name });
  }

  this.setState({ selectedTraits });
}
  
handleRadioChange(e) {
  this.setState({ viewMethod: e.target.value });
}

/**
 * i.e. When the GENERATE PDF button is clicked
 */
async buttonClick() {
  
  // The data to be POSTed to the API
  var body = {
    selectedTraits: this.state.selectedTraits,
    yourName: this.state.yourName,
    studentName: this.state.studentName,
  }

  // Change button text to "Generating pdf..." temporarily
  this.setState({ generatingPdf: true })
  let res = await axios.post('/generatePdf', body, { responseType: "arraybuffer" });
  this.setState({ generatingPdf: false })

  let { data } = res;

  var blob = new Blob([data, { type: "application/pdf" }]);
  var urlObj = URL.createObjectURL(blob);

  // Open pdf in a new tab (note: they can only view and print, but not save)
  if (this.state.viewMethod === 'web') {

    // This is straight up dumb
    var encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));

    var path = "data:application/pdf;base64," + encoded;

    var w = window.open(path);

    // Create the iframe that will serve as a pdf viewer.
    w.document.write('<iframe src="' + path  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
  }
  
  // Download the pdf to the user's computer
  else if (this.state.viewMethod === 'download') {
    const link = document.createElement('a');
    link.href = urlObj;
    link.download = `IndividualisedPlanningDocument-${new Date()}.pdf`;
    link.click();
  }
    
}

render() {
  return (
    <div className="App" style={{ marginBottom: "50px" }}>
      <Typography variant="h4" style={{ textAlign: "center", marginBottom: "1%" }}><b>ESHS Student Profile Builder</b></Typography>

      <Paper style={{ width: "900px", border: "solid 2px black", margin: "auto", padding: "1%" }}>
        <Typography>This tool will allow you to create an <i>Individualised Planning Document</i> for each student. Choose each specific <i>Learning Trait</i> to get started. The document can be previewed in your browser or downloaded as a PDF.</Typography>

        <div style={{ marginTop: "2%" }}>
          <TextField id="yourNameInput" label="Your name (optional)" style={{ width: "100%" }} onChange={(e) => this.setState({ yourName: e.target.value })}></TextField>
          <br />
          <TextField id="studentNameInput" label="Student's name (optional)" style={{ width: "100%" }} onChange={(e) => this.setState({ studentName: e.target.value })}></TextField>
        </div>

        <StudentForm
          data = {this.state.data}
          handleChange={this.handleCheckboxChange}
        />

        <hr style={{ margin: "20px" }} />

        <RadioGroup value={this.state.viewMethod} style={{ marginBottom: "30px" }}>
          <FormControlLabel value="web" control={ <Radio color="primary" selected /> } color="primary" label="Preview in my web browser" onChange={(e) => this.handleRadioChange(e)} />
          <FormControlLabel value="download" control={ <Radio color="primary" /> } color="primary" label="Save to my computer" onChange={(e) => this.handleRadioChange(e)} />
        </RadioGroup>

        <Button variant="contained" fullWidth color="primary" disabled={ this.state.selectedTraits.length < 1 } onClick={() => this.buttonClick()}>{this.state.generatingPdf ? `Generating PDF...` : 'Generate PDF'}</Button>

      </Paper>
    </div>
  )
}
}