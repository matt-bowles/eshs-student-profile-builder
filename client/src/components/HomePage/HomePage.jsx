import React, { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';

import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';

import TextField from '@material-ui/core/TextField';

import Skeleton from '@material-ui/lab/Skeleton';

import PersonIcon from '@material-ui/icons/Person';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';

import { Link } from 'react-router-dom';

import axios from 'axios';

export default class HomePage extends Component {

    constructor() {
        super()

        this.state = {
            studentProfiles: [],
            filtered: [],
        }

        this.filterSearch = this.filterSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.delete = this.delete.bind(this);
    }

    async componentDidMount() {
        // Call API for list of student profiles
        var students = await axios.get('/api/students');
        students = students.data;

        this.setState({ 
            studentProfiles: students,
            filtered: students
        });
    }

    /**
     * Filters the list of students to be displayed in the "edit list"
     * @param {*} e Text input event 
     */
    filterSearch(e) {
        var { value } = e.target;
        value = value.toLowerCase();

        var filtered = this.state.studentProfiles.filter((sp) => {
            return ( (sp.name.toLowerCase()).includes(value) || sp.class.toLowerCase().includes(value) );
        });

        this.setState({ filtered });
    }

    handleKeyPress(e) {
        var { key } = e;

        if (key === "Enter" && this.state.filtered.length === 1) {
            var student = this.state.filtered[0];

            this.props.history.push(`/edit/${student.id}`);
        }
    }

    /**
     * Sends a DELETE request for a student (by ID) and removes them from the edit list
     * @param {*} id Student ID (as per the database)
     */
    async delete(id) {
        if (window.confirm("Are you sure? This is not a reversible process.")) {

            // Send DELETE request to server
            await axios.delete("/api/student", { data: {id: id } });

            // Hide the deleted person
            var filtered = this.state.filtered.filter((student) => {
                return student.id !== id;
            });

            this.setState({ filtered });
        }
    }

    render() {

        const buttonStyles = {
            padding: "20px",
        }

        const headingStyles = {
            marginBottom: "10px"
        }

        return (
            <>
                <Paper style={{ margin: "auto", width: "60rem", height: "460px", border: "solid 2px black" }}>

                <Grid container style={{ display: "block-inline", padding: "50px" }} >
                    
                    {/* Master grid */}
                        
                        {/* Left column */}
                        <Grid container direction="row" xs={6}>
                            <Grid container direction="column" alignItems="stretch">
                                <Link to="/create" style={{ textDecoration: "none" }}>
                                    <Paper elevation={2} style={buttonStyles} style={{ width: "80%", marginBottom: "50px", padding: "18px" }}>
                                        <Typography variant="h4" style={headingStyles}>Create</Typography>
                                        <Typography>Create a new student profile</Typography>
                                    </Paper>
                                </Link>
                            </Grid>
                            <Grid container direction="column" alignItems="stretch">
                                <Link to="/trends" style={{ textDecoration: "none" }}>
                                    <Paper elevaton={2} style={buttonStyles} style={{ width: "80%", padding: "18px" }}>
                                        <Typography variant="h4" style={headingStyles}>Data &amp; analytics</Typography>
                                        <Typography>Analyse trends and analytics</Typography>
                                    </Paper>
                                </Link>
                            </Grid>
                        </Grid>

                        {/* Right column - Load student data and display in edit column */}
                        <Grid item xs={6}>
                            <Paper elevation={2} style={buttonStyles}>
                                <Typography variant="h4" style={headingStyles}>Update/view</Typography>

                                <TextField 
                                    label="Search by student name or class code" 
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                    onChange={(e) => this.filterSearch(e)}
                                    onKeyPress={(e) => this.handleKeyPress(e)}

                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end"><SearchIcon /></InputAdornment>
                                        )
                                    }}
                                />

                                {this.state.filtered.length === 0 ? (
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

                                    {this.state.filtered.map((sp, i) => {
                                        return (
                                        
                                        <ListItem key={i} >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <PersonIcon />
                                                </Avatar>
                                            </ListItemAvatar>

                                            <ListItemText>
                                                <Link key={i} to={{ pathname: `/edit/${sp.id}` }} style={{ textDecoration: "none" }}>{sp.name} ({sp.class})</Link>
                                            </ListItemText>

                                            {/* <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="edit">
                                                    <EditIcon onClick={(e) => this.props.history.push(`/edit/${sp.id}`)} />
                                                </IconButton>
                                            </ListItemSecondaryAction> */}

                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="edit" onClick={() => this.delete(sp.id)} >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>

                                        </ListItem>
                                        )
                                    })}

                                </List>
                            }
                            </Paper>
                        </Grid>
                </Grid>
                </Paper>
            </>
        )
    }
}
