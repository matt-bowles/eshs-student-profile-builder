const express = require('express');
const { query } = require('express');
const html2Pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
// const { sso } = require('node-expose-sspi');

require('dotenv').config();

const { Sequelize, DataTypes, QueryTypes, json } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.USERNAME, process.env.PASSWORD, {
    host: "eshs-student-profile-builder.db",
    dialect: "sqlite",
    logging: false
});

// Traits and their "checklist items"
const data = require("./data/data.json");

const Student = require('./models/Student'); 
const Trait = require('./models/Trait');

// ???

/**
 * SEQUELIZE ASSOCIATIONS
 */
// Student.hasOne(Class, { foreignKey: "student" });
// Class.hasMany(Student, { foreignKey: "class" });

// Student.belongsToMany(Class, { through: "STUDENT_CLASS", foreignKey: "student_id"});
// Class.belongsToMany(Student, { through: "STUDENT_CLASS", foreignKey: "class_id"});

try {
    sequelize.authenticate().then(() => {
        console.log("Connected to the database");
    });
} catch(err) {
    console.log("Unable to connect to database:", err);
}

const app = express();
// app.use(sso.auth());
app.use(bodyParser.json());

const PORT = 3030;
const CURRENT_YEAR_SEMESTER = getCurrentYearSemester();

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use(express.static(__dirname + "/client/build", { index: false }));

app.get('/api/students', async (req, res) => {
    var students = await sequelize.query(`SELECT * FROM STUDENTS`, { model: Student } );

    students = students.sort((a, b) => (a.name.split(" ")[1] > b.name.split(" ")[1]) ? 1 : -1);

    return res.send(students);
});

// Basically, get name/class from student ID
app.get('/api/studentDetails/:id', async (req, res) => {
    var student = await Student.findByPk(req.params.id);
    return res.send(student);
});

app.get('/api/student', async (req, res) => {

    var { id, semesterYear } = req.query;

    // Firstly, get student deets
    var student = await Student.findByPk(id);

    var selectedTraits;

    var query = `
    SELECT TRAITS.id, TRAITS.name, TRAITS.category
    FROM STUDENTS_TRAITS
    LEFT JOIN STUDENTS ON STUDENTS.id = student_id
    LEFT JOIN TRAITS ON TRAITS.id = trait_id
    WHERE STUDENTS.id = ${id}
    `;

    if (semesterYear == undefined) {

        // Attempt to get latest year_semester value
        semesterYear = await sequelize.query(`SELECT year_semester FROM STUDENTS_TRAITS WHERE student_id = ${id} ORDER BY year_semester DESC LIMIT 1`);

        // I.e. no trait records in the database for the student
        if (semesterYear.length == 1) {
            semesterYear = semesterYear[0].year_semester;
        } else {
            semesterYear = semesterYear[0][0].year_semester;
            // year_semester = null;
        }
    }

    // Basically, either a year_semester was specified, or a record with a year_semester was found
    if (typeof semesterYear !== 'object') {
        query = `${query} AND year_semester = ${semesterYear}`;
    }

    // WIll just return an empty array if nothing is found
    selectedTraits = await sequelize.query(query, { model: Student });

    var st = {
        id: student.id,
        studentName: student.name,
        studentClass: student.class,
        year_semester: semesterYear === undefined ? null : semesterYear,
        selectedTraits: selectedTraits
    }

    return res.send(st);
});

app.get('/api/traits', async (req, res) => {
    const traits = await Trait.findAll();

    return res.json(traits);
});

/**
 * Create new student
 */
app.post('/api/students', async (req, res) => {

    // Create student
    var student = await Student.create({ name: req.body.studentName, class: req.body.studentClass });

    // Grab ID of newly created student
    var id = student.get("id");

    // Add traits
    var { semesterYear } = req.body;

    var valString = "";
    req.body.selectedTraits.forEach((selTrait, i) => {
        valString += `(${id}, ${selTrait.id}, ${semesterYear})`

        if (i < (req.body.selectedTraits.length -1)) {
            valString += ", ";
        }
    });

    // Run query that inserts multiple traits
    await sequelize.query(`INSERT INTO STUDENTS_TRAITS(student_id, trait_id, year_semester) VALUES ${valString}`);

    return res.send({ id });
});

/**
 * Edit existing student
 */
app.post('/api/student/:id', async (req, res) => {

    var { id } = req.params;

    console.log("ID:", id);

    // Obtain copy of current traits for semester
    var year_semester = req.body.semesterYear;

    var previousTraits = await sequelize.query(`
        SELECT trait_id AS id, year_semester
        FROM STUDENTS_TRAITS
        WHERE student_id = "${id}" AND year_semester = ${year_semester}
    `, { model: Student, raw: true });

    var currentTraits = req.body.selectedTraits;

    // Find out which traits are new
    var traitsToBeAdded = currentTraits.filter(tr => (!previousTraits.find(x => x.id === tr.id)));

    // Find out which traits need to be removed
    var traitsToBeRemoved = previousTraits.filter((tr) => !currentTraits.find(x => x.id === tr.id));

    if (traitsToBeRemoved.length > 0) {

        var removeString = `DELETE FROM STUDENTS_TRAITS WHERE student_id = "${id}" AND year_semester = "${year_semester}" AND trait_id IN (`;

        var trait_id_string = "";

        traitsToBeRemoved.forEach((tr) => {
            trait_id_string += `"${tr.id}",`;
        });

        // Remove last comma and add final bracket
        trait_id_string = trait_id_string.substr(0, trait_id_string.length - 1);
        trait_id_string += ")";

        removeString += trait_id_string;

        await sequelize.query(removeString);
    }

    if (traitsToBeAdded.length > 0) {
        var addString = "INSERT INTO STUDENTS_TRAITS (student_id, trait_id, year_semester) VALUES ";

        traitsToBeAdded.forEach((tr) => {
            addString += `(${id}, ${tr.id}, ${year_semester}),`;
        });

        // Remove last comma
        addString = addString.substr(0, addString.length - 1);

        // Perform both operations
        await sequelize.query(addString);
    }

    // Update name and class
    await sequelize.query(`UPDATE STUDENTS SET name="${req.body.studentName}", class="${req.body.studentClass}" WHERE id = "${id}"`);

    return res.send({ id });
});

app.delete('/api/student', async (req, res) => {

    await sequelize.query(`DELETE FROM STUDENTS_TRAITS WHERE student_id = "${req.body.id}"`);

    await Student.destroy({
        where: {
            id: req.body.id
        }
    });

    res.sendStatus(200);
});

app.get('/api/classes', async (req, res) => {
    var classes = await sequelize.query(`
    SELECT DISTINCT class, (SELECT COUNT(DISTINCT class) FROM STUDENTS) AS num_students 
    FROM STUDENTS
    `, { model: Student });

    var classArr = [];

    classes.forEach((cls) => {
        classArr.push(cls.class.padStart(5, '*'));
    });

    // ... and now for a really dodgy sorting method (e.g. 9A --> 10B --> 10C --> 11E, etc.)
    classArr = classArr.sort();
    classArr = classArr.map((cl) => { return cl.replace(/\*/g, "") });

    return res.send(classArr);
});

/**
 * Fetches a summary of the number of students that have a certain learning trait for a specified class
 */
app.get('/api/trends/classes/:classCode', async(req, res) => {

    var classCode = req.params.classCode;
    var year_semester = req.query.year_semester || CURRENT_YEAR_SEMESTER;

    console.log("Class code:", classCode);
    console.log("Year/semester:", year_semester);

    var data = await sequelize.query(`
    SELECT COUNT(student_id) AS num_students, TRAITS.name, TRAITS.id
    FROM STUDENTS_TRAITS
    JOIN STUDENTS ON STUDENTS.id = STUDENTS_TRAITS.student_id
    JOIN TRAITS ON TRAITS.id = STUDENTS_TRAITS.trait_id
    WHERE STUDENTS.class = "${classCode}" AND STUDENTS_TRAITS.year_semester = "${year_semester}"
    GROUP BY trait_id
    `, { model: Student });

    return res.json(data);
});

/**
 * Compares the traits of a specified student between 2 year_semester periods
 */
app.get('/api/trends/students/:id', async(req, res) => {
    var { id } = req.params;
    var { ys1 } = req.query;
    var { ys2 } = req.query;

    console.log("YS1:", ys1);
    console.log("YS2:", ys2);

    var data = await sequelize.query(`
    SELECT TRAITS.name, TRAITS.id, year_semester
    FROM STUDENTS_TRAITS
    JOIN STUDENTS ON STUDENTS.id = STUDENTS_TRAITS.student_id
    JOIN TRAITS ON TRAITS.id = STUDENTS_TRAITS.trait_id
    WHERE year_semester IN ("${ys1}", "${ys2}") AND STUDENTS.id = "${id}"
    `, { model: Student });

    var ys1Arr = data.filter(d => d.getDataValue('year_semester') == ys1);
    var ys2Arr = data.filter(d => d.getDataValue('year_semester') == ys2);

    return res.json([ys1Arr, ys2Arr]);
});


app.post('/generatePdf', (req, res) => {

    var data = req.body;
    data.date = getFormattedDate();

    console.log(req.body);

    var allTraits = require('./data/data.json');

    const LEARNING_TRAITS = ["Academic", "Behaviour", "Communication", "Development"];

    // Get checklistItems for each selected trait
    req.body.selectedTraits.forEach((selTrait, i) => {
        var chklst = allTraits.filter((tr) => tr.name === selTrait.name);

        chklst = chklst[0].checklistItems;

        req.body.selectedTraits[i].checklistItems = chklst;

        // Mark if learning trait
        req.body.selectedTraits[i].isLearningTrait = LEARNING_TRAITS.includes(selTrait.category);
    });

    // Convert semesterYear to readable format
    req.body.semesterYear = semesterYear2Text(req.body.semesterYear);

    // TODO: Sort traits by ID
    req.body.selectedTraits = req.body.selectedTraits.sort((a, b) => a > b);

    // PDF generation vvv
    var templateHtml = fs.readFileSync('template.html').toString();
    var compiled = Handlebars.compile(templateHtml)(req.body);
    
    html2Pdf.create(compiled, { format: "A4", base: "file:///" + __dirname + path.resolve("/") }).toBuffer((err, buffer) => {

        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=studentprofile.pdf');
        res.setHeader('Content-Length', 3000);

        return res.send(buffer);
    });
});

app.get('/api/studentsInClassWithTrait', async(req, res) => {
    var classCode = req.query.class;
    var { trait } = req.query;
    var { year_semester } = req.query;

    var students = await sequelize.query(`
    SELECT id, name FROM STUDENTS
    JOIN STUDENTS_TRAITS ON STUDENTS.id = STUDENTS_TRAITS.student_id
    WHERE class = "${classCode}" AND trait_id = "${trait}" AND year_semester = "${year_semester}"
    `, { model: Student });

    return res.json(students);
});

app.get('/api/currentYearSemester', (req, res) => {
    return res.json(CURRENT_YEAR_SEMESTER);
});

// Last so that react-router works properly with express
app.get('*', (req, res) => {

    return res.sendFile(path.join(__dirname, '/client/build/index.html'));

    // Restrict application access to staff-only
    if (req.sso.user.groups.includes("SOC\\2183GG_UsrSt1aff")) {
        // Serve app
        console.log("Authenticated and authorised:", req.sso.user.name);
        return res.sendFile(path.join(__dirname, '/client/build/index.html'));
    } else {
        // Kick them out + epic prank
        var firstName = req.sso.user.displayName.split(", ")[1];

        console.log("Not a staff member:", req.sso.user.name);
        res.status(403);
        return res.send("Forbidden");
        // return res.send(`Hello ${firstName}, you are NOT supposed to be accessing this page. <br><br> Your details have been reported to the principal. You should expect to be suspended very soon.`);
    }
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

/**
 * Gets the current date in the format of "1st January 2021"
 */
function getFormattedDate() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var date = new Date();

    var day = date.getDate();

    daysSt = [1, 21, 31];
    daysRd = [3, 23];

    if (daysSt.includes(day)) {
        day = String(day) + "st";
    } else if (daysRd.includes(day)) {
        day = String(day) + "rd";
    } else {
        day = String(day) + "th";
    }

    var month = months[date.getMonth()];
    var year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function semesterYear2Text(semester_year) {
    semester_year = semester_year.toString();

    var year = "20" + semester_year.substr(0, 2);
    var semester = "Semester " + semester_year.charAt(2);

    return `${semester}, ${year}`
}

function getCurrentYearSemester() {
    var date = new Date();

    var ysString = "";

    var year = date.getFullYear();
    var month = date.getMonth();

    ysString += year.toString().substr(2, 3);
    ysString += (month < 6) ? "1" : "2";

    return ysString;
}

//TODO: should have a "catch-all" JSON output endpoint