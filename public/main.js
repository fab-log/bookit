// ### GET DATA FROM DATABASE ###

const getBookings = async () => {
	console.log("=> fn getBookings triggered");
    try {
      const response = await fetch("/bookit.getBookings");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      bookings = data.bookings;
    } catch (error) {
      console.error(error.message);
    }
}

const getCatering = async () => {
	console.log("=> fn getCatering triggered");
    try {
      const response = await fetch("/bookit.getCatering");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      catering = data.catering;
    } catch (error) {
      console.error(error.message);
    }
}

const getRooms = async () => {
	console.log("=> fn getRooms triggered");
    try {
      const response = await fetch("/bookit.getRooms");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      rooms = data.rooms;
    } catch (error) {
      console.error(error.message);
    }
}

const getSeatings = async () => {
	console.log("=> fn getSeatings triggered");
    try {
      const response = await fetch("/bookit.getSeatings");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      seatings = data.seatings;
    } catch (error) {
      console.error(error.message);
    }
}

const getFees = async () => {
	console.log("=> fn getFees triggered");
    try {
      const response = await fetch("/bookit.getFees");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      fees = data.fees;
    } catch (error) {
      console.error(error.message);
    }
}

const getEquipment = async () => {
	console.log("=> fn getEquipment triggered");
    try {
      const response = await fetch("/bookit.getEquipment");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }  
      const data = await response.json();
      let status = data.status;
      console.log({ status });
      equipment = data.equipment;
    } catch (error) {
      console.error(error.message);
    }
}


// ### DEFINITIONS ###

let bookings = [];
let rooms = [];
let seatings = [];
let equipment = [];
let catering = [];
let fees = {};

const modals = document.querySelectorAll(".modal");
const modalMax = document.querySelector(".modal-max");
const modalPopUp = document.querySelector(".modal-pop-up");
const header = document.querySelector(".header");
const divAlert = document.querySelector("#alert");
const toggleIcon = document.querySelector(".toggle-icon");

let chave = "";
let chaveDoChefe = "";

let paginator;


// ### RANDOM CYPHERS ###

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


// ### CURRENTDATE ###

const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September","Oktober", "November", "Dezember"];
const daysOfTheWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

let currentDate = {};
let currentDateString = "";

const getCurrentDate = () => {
	let date = new Date(Date.now());
	currentDate.year = date.getFullYear();
	currentDate.month = date.getMonth() + 1;
	currentDate.monthString = currentDate.month < 10 ? `0${currentDate.month}` : currentDate.month;
	currentDate.monthAsWord = months[date.getMonth()];
	currentDate.day = date.getDate();
	currentDate.dayString = currentDate.day < 10 ? `0${currentDate.day}` : currentDate.day;
	currentDate.dayOfTheWeek = daysOfTheWeek[date.getDay()];
	currentDateString = `${currentDate.year}-${currentDate.monthString}-${currentDate.dayString}`;
}

getCurrentDate();

const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
}

let selectedYear = currentDate.year;
let selectedMonth = currentDate.month;
let selectedDay = currentDate.day;


// ### SHOWALERT ###

const showAlert = (text, duration) => {
	console.log(`=> fn showAlert saying: "${text}" triggered`);
	let ms;
	duration ? ms = duration : ms = 3000;
	divAlert.innerHTML = `<p>${text}</p>`;
	divAlert.style.display = "block";
	setTimeout(() => {
        divAlert.innerHTML = "";
		divAlert.style.display = "none";
	}, ms);
};

const closeAlert = () => {
  divAlert.style.display = "none";
}


// ### MODALS ###

const closeAllModals = () => {
	modals.forEach(e => {
		e.style.display = "none";
	});
}


// ### STYLE ###

const style = document.createElement('style');
document.head.appendChild(style);

const addCSSRule = (rule) => {
    style.sheet.insertRule(rule, style.sheet.cssRules.length);
}

const removeCSSRule = (index) => {
    style.sheet.deleteRule(index);
}