const express = require('express');
const html2Pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const app = express();
app.use(require('body-parser').json());

// IIS crap
const port = process.env.PORT || 3030;
var virtualDirPath = process.env.virtualDirPath || '';

// Specify location where static files will be served from
app.use(express.static(path.join(virtualDirPath, 'client/build')));

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

/**
 * Send React application
 */
app.get(virtualDirPath + '/', (req, res) => {
	return res.sendFile(path.join(virtualDirPath, 'index.html'));
});

/**
 * Generates a pdf printout in buffer form, and sends it back
 */
app.post(virtualDirPath + '/generatePdf', (req, res) => {

    var data = req.body;
    data.date = getFormattedDate();

    // Populate template file with body data
    var templateHtml = fs.readFileSync('template.hbs').toString();
    var compiled = Handlebars.compile(templateHtml)(data);
    
    // Generate pdf buffer and send it back
    html2Pdf.create(compiled, { format: "A4" }).toBuffer((err, buffer) => {

        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=studentprofile.pdf');
        res.setHeader('Content-Length', 3000);

        return res.send(buffer);
    });
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
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
