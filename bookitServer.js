const express = require("express");
const fs = require("fs");
const crypto = require('crypto');

const { request } = require("http");
const nodemailer = require('nodemailer');

const app = express();
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const port = 8004;

const cyphers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const randomCyphers = (length) => {
	if (!length) {
		length = 10;
	}
    let randomString = "";
    for (i = 0; i < length; i++) {
        randomString += cyphers[Math.floor(Math.random() * cyphers.length)];
    }
    return randomString;
}

const hash = (string) => {
    let cryptoArray = [];
    let salt = randomCyphers(12);
    let saltedString = salt + string;
    let hashed = crypto.createHash('sha256').update(saltedString).digest('hex');
    cryptoArray.push(salt, hashed);
    return cryptoArray;
}

const checkHash = (salt, pepper) => {
    let saltedPepper = salt + pepper;
    return crypto.createHash('sha256').update(saltedPepper).digest('hex');
}

// ##########################
// ### READ DATA TO CACHE ###
// ##########################

let bookingsCache;
fs.readFile("./bookit_db/bookings.json", "utf8", (err, bookings) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    bookingsCache = JSON.parse(bookings);
});

let roomsCache;
fs.readFile("./bookit_db/rooms.json", "utf8", (err, rooms) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    roomsCache = JSON.parse(rooms);
});

let cateringCache;
fs.readFile("./bookit_db/catering.json", "utf8", (err, catering) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    cateringCache = JSON.parse(catering);
});

let seatingsCache;
fs.readFile("./bookit_db/seatings.json", "utf8", (err, seatings) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    seatingsCache = JSON.parse(seatings);
});

let equipmentCache;
fs.readFile("./bookit_db/equipment.json", "utf8", (err, equipment) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    equipmentCache = JSON.parse(equipment);
});

let feesCache;
fs.readFile("./bookit_db/fees.json", "utf8", (err, fees) => {
    if (err) {
        console.error("error: ", err);
        return;
    }
    feesCache = JSON.parse(fees);
});


// #############
// ### EMAIL ###
// #############

const transporter = nodemailer.createTransport({
    host: "smtp.strato.de",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: "noreply@fablog.eu",
      pass: "mxvNfgAWFWps",
    }
});

const sendConfirmationEmail = (userEmail, booking, type) => {

    let room1Index = roomsCache.findIndex(e => e.id === booking.rooms[0]);
    let room1 = `${roomsCache[room1Index].location}, ${roomsCache[room1Index].roomName}`;
    let roomsString = `<tr><td>Hauptraum</td><td>${room1}</td></tr>`;
    if (booking.rooms[1]) {
        let room2Index = roomsCache.findIndex(e => e.id === booking.rooms[1]);
        let room2 = `${roomsCache[room2Index].location}, ${roomsCache[room2Index].roomName}`;
        roomsString += `<tr><td>Nebenraum 1</td><td>${room2}</td></tr>`;
    };
    if (booking.rooms[2]) {
        let room3Index = roomsCache.findIndex(e => e.id === booking.rooms[2]);
        let room3 = `${roomsCache[room3Index].location}, ${roomsCache[room3Index].roomName}`;
        roomsString += `<tr><td>Nebenraum 2</td><td>${room3}</td></tr>`;
    };

    let cateringString = "";
    booking.catering.forEach(e => {
        let index = cateringCache.findIndex(el => el.id === e);
        cateringString += `<tr><td>- ${cateringCache[index].name}</td><td></td></tr>`;
    });

    let startDate = booking.startDate;
    let endDate = booking.endDate;
    let startDateString = `${startDate.substring(8)}.${startDate.substring(5, 7)}.${startDate.substring(0, 4)}`;
    let endDateString = `${endDate.substring(8)}.${endDate.substring(5, 7)}.${endDate.substring(0, 4)}`;

    let equipmentString = "";
    booking.equipment.forEach(e => {
        let index = equipmentCache.findIndex(el => el.id === e[1]);
        equipmentString += `<tr><td>${equipmentCache[index].name}</td><td>${e[0]} x</td></tr>`;
    });

    let subject = booking.state != "active" ? "Stornierungsbestätigung bookit" : "Buchungsbestätigung bookit";
    const mailOptions = {
        from: 'noreply@fablog.eu',
        to: userEmail,
        subject,
        html: `
            <style>
                body {
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 1.1rem;
                    line-height: 1.2;
                    margin: 0;
                    padding: 25px;
                }
            </style>
            <h1>${subject}</h1>
            <h3>${type}</h3>
            <table>
                <tr>
                    <td><b>Termin</b></td><td></td>
                </tr>
                <tr>
                    <td>${startDateString} - ${endDateString}</td><td></td>
                </tr>
                <tr>
                    <td>${booking.startTime} - ${booking.endTime}</td><td></td>
                </tr>
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>Teilnehmerzahl</b></td><td></td>
                </tr>
                <tr>
                    <td>${booking.participants}</td><td></td>
                </tr>
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>Titel</b></td><td></td>
                </tr>
                <tr>
                    <td>${booking.title}</td><td></td>
                </tr>
                <tr>
                    <td>${booking.description}</td><td></td>
                </tr>
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>AnsprechparterIn</b></td><td></td>
                </tr>
                <tr>
                    <td>${booking.firstName} ${booking.lastName}</td><td></td>
                </tr>
                <tr>
                    <td><a href="mailto:${booking.email}">${booking.email}</a></td><td></td>
                </tr>
                <tr>
                    <td><a href="tel:+49${booking.phone1.substring(1).replaceAll(" ", "").replaceAll("/", "").replaceAll("-", "")}">${booking.phone1}</a></td><td></td>
                </tr>
                <tr>
                    <td><a href="tel:+49${booking.phone2.substring(1).replaceAll(" ", "").replaceAll("/", "").replaceAll("-", "")}">${booking.phone2}</a></td><td></td>
                </tr>
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>Raum</b></td><td></td>
                </tr>
                ${roomsString}
                <tr>
                    <td>Bestuhlung</td><td>${booking.seating}</td>
                </tr>
                ${equipmentString}
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>Catering</b></td><td></td>
                </tr>
                ${cateringString}
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td><b>Abrechnung</b></td><td></td>
                </tr>
                <tr>
                    <td>Kostenstelle</td><td>${booking.account}</td>
                </tr>
                <tr>
                    <td>Kostenkonto</td><td>${booking.account2}</td>
                </tr>
                <tr>
                    <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
                <tr>
                    <td>Summe Raumbuchungen</td><td style="text-align: right;">€ ${booking.totalRooms.toFixed(2)}</td>
                </tr>

                <tr>
                    <td>Summe Catering</td><td style="text-align: right;">€ ${booking.totalCatering.toFixed(2)}</td>
                </tr>

                <tr>
                    <td style="text-align: right;"><b><u>Gesamt</u></b></td><td style="text-align: right;"><b><u>€ ${booking.total.toFixed(2)}</u></b></td>
                </tr>
            </table>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error occurred: ' + error.message);
        }
        console.log('Email sent: ' + info.response);
    });
};


// ### PASSWORDS ###

app.post("/bookit.loginUser", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/passwords.json", "utf8", (err, passwords) => {
        if (err) {
            res.status = "error reading './bookit_db/passwords.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedPasswords = JSON.parse(passwords);
        if (parsedPasswords.userPassword[1] != checkHash(parsedPasswords.userPassword[0], data.password)) {
            res.status = "password incorrect";
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
    });
});

app.post("/bookit.updateUserPassword", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/passwords.json", "utf8", (err, passwords) => {
        if (err) {
            res.status = "error reading './bookit_db/passwords.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedPasswords = JSON.parse(passwords);
        parsedPasswords.userPassword = hash(data.userPassword);
        let passwordString = JSON.stringify(parsedPasswords);
        fs.writeFile("./bookit_db/passwords.json", passwordString, (err) => {
            if (err) {
                res.status = err;
                response.json(res);
                return;
            }
            res.status = "OK";
            response.json(res);
        });
    });
});

app.post("/bookit.loginAdmin", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/passwords.json", "utf8", (err, passwords) => {
        if (err) {
            res.status = "error reading './bookit_db/passwords.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedPasswords = JSON.parse(passwords);
        if (parsedPasswords.adminPassword[1] != checkHash(parsedPasswords.adminPassword[0], data.password)) {
            res.status = "password incorrect";
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
    });
});

app.post("/bookit.updateAdminPassword", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/passwords.json", "utf8", (err, passwords) => {
        if (err) {
            res.status = "error reading './bookit_db/passwords.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedPasswords = JSON.parse(passwords);
        parsedPasswords.adminPassword = hash(data.adminPassword);
        let passwordString = JSON.stringify(parsedPasswords);
        fs.writeFile("./bookit_db/passwords.json", passwordString, (err) => {
            if (err) {
                res.status = err;
                response.json(res);
                return;
            }
            res.status = "OK";
            response.json(res);
        });
    });
});


// ### ROOMS ##

app.get("/bookit.getRooms", (request, response) => {
    let res = {};
    fs.readFile("./bookit_db/rooms.json", "utf8", (err, rooms) => {
        if (err) {
            res.status = "error reading './bookit_db/rooms.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedRooms = JSON.parse(rooms);
        res.status = "OK";
        res.rooms = parsedRooms;
        response.json(res);
    });
});

app.post("/bookit.updateRooms", (request, response) => {
    let data = request.body;
    let res = {};
    let dataString = JSON.stringify(data);
    fs.writeFile("./bookit_db/rooms.json", dataString, (err) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
        roomsCache = data;
    });
});


// ### CATERING ###

app.get("/bookit.getCatering", (request, response) => {
    let res = {};
    fs.readFile("./bookit_db/catering.json", "utf8", (err, catering) => {
        if (err) {
            res.status = "error reading './bookit_db/catering.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedCatering = JSON.parse(catering);
        res.status = "OK";
        res.catering = parsedCatering;
        response.json(res);
    });
});

app.post("/bookit.updateCatering", (request, response) => {
    let data = request.body;
    let res = {};
    let dataString = JSON.stringify(data);
    fs.writeFile("./bookit_db/catering.json", dataString, (err) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
        cateringCache = data;
    });
});


// ### SEATINGS ###

app.get("/bookit.getSeatings", (request, response) => {
    let res = {};
    fs.readFile("./bookit_db/seatings.json", "utf8", (err, seatings) => {
        if (err) {
            res.status = "error reading './bookit_db/seatings.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedSeatings = JSON.parse(seatings);
        res.status = "OK";
        res.seatings = parsedSeatings;
        response.json(res);
    });
});

app.post("/bookit.updateSeatings", (request, response) => {
    let data = request.body;
    let res = {};
    let dataString = JSON.stringify(data);
    fs.writeFile("./bookit_db/seatings.json", dataString, (err) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
        seatingsCache = data;
    });
});


// ### FEES ###

app.get("/bookit.getFees", (request, response) => {
    let res = {};
    fs.readFile("./bookit_db/fees.json", "utf8", (err, fees) => {
        if (err) {
            res.status = "error reading './bookit_db/fees.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedFees = JSON.parse(fees);
        res.status = "OK";
        res.fees = parsedFees;
        response.json(res);
    });
});

app.post("/bookit.updateFees", (request, response) => {
    let data = request.body;
    let res = {};
    let dataString = JSON.stringify(data);
    fs.writeFile("./bookit_db/fees.json", dataString, (err) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
        feesCache = data;
    });
});


// ### EQUIPMENT ###

app.get("/bookit.getEquipment", (request, response) => {
    let res = {};
    fs.readFile("./bookit_db/equipment.json", "utf8", (err, equipment) => {
        if (err) {
            res.status = "error reading './bookit_db/equipment.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedEquipment = JSON.parse(equipment);
        res.status = "OK";
        res.equipment = parsedEquipment;
        response.json(res);
    });
});

app.post("/bookit.updateEquipment", (request, response) => {
    let data = request.body;
    let res = {};
    let dataString = JSON.stringify(data);
    fs.writeFile("./bookit_db/equipment.json", dataString, (err) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        }
        res.status = "OK";
        response.json(res);
        equipmentCache = data;
    });
});


// ### BOOKINGS ###

app.get("/bookit.getBookings", (request, response) => {
    // let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/bookings.json", "utf8", (err, bookings) => {
        if (err) {
            res.status = "error reading './bookit_db/bookings.json'";
            response.json(res);
            console.error("error: ", err);
            return;
        }
        let parsedBookings = JSON.parse(bookings);
        res.status = "OK";
        res.bookings = parsedBookings;
        response.json(res);
    });
});

app.post("/bookit.newBooking", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/bookings.json", "utf8", (err, bookings) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        } 
        let parsedBookings = JSON.parse(bookings);
        parsedBookings.push(data);
        let bookingsString = JSON.stringify(parsedBookings);
        fs.writeFile("./bookit_db/bookings.json", bookingsString, (err) => {
            if (err) {
                res.status = err;
                response.json(res);
                return;
            }
            res.status = "OK";
            res.bookings = parsedBookings;
            response.json(res);
            sendConfirmationEmail(`f.ruin@diakonie-kreis-re.de, ${data.email}`, data, "Neue Buchung");
        });
    });
});

app.post("/bookit.updateBookings", (request, response) => {
    let data = request.body;
    let res = {};
    fs.readFile("./bookit_db/bookings.json", "utf8", (err, bookings) => {
        if (err) {
            res.status = err;
            response.json(res);
            return;
        } 
        let parsedBookings = JSON.parse(bookings);
        let index = parsedBookings.findIndex(e => e.id === data.id);
        let type = data.state === "cancelled" ? "Stornierung" : "Änderung";
        parsedBookings.splice(index, 1, data);
        let bookingsString = JSON.stringify(parsedBookings);
        fs.writeFile("./bookit_db/bookings.json", bookingsString, (err) => {
            if (err) {
                res.status = err;
                response.json(res);
                return;
            }
            res.status = "OK";
            res.bookings = parsedBookings;
            response.json(res);

            sendConfirmationEmail(`f.ruin@diakonie-kreis-re.de, ${data.email}`, data, type);
        });
    });
});


// ### START SERVER ###

const server = app.listen(port, () => console.log(`listening at ${port}`));