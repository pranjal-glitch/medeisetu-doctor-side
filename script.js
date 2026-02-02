// ======== STORAGE KEYS ========
const STORAGE = {
  DOCTOR: "medisetu_doctor",
  APPOINTMENTS: "medisetu_appointments",
  HISTORY: "medisetu_patient_history"
};

// ======== STATE ========
let state = {
  doctor: null,
  appointments: [],
  currentPatient: null
};

// ======== PAGE CONTROL ========
function show(pageId) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  document.getElementById(pageId).classList.add("active");
}

// ======== INIT ========
window.onload = function () {

  // Load saved data
  state.doctor = localStorage.getItem(STORAGE.DOCTOR);
  state.appointments = JSON.parse(localStorage.getItem(STORAGE.APPOINTMENTS) || "[]");

  // Event Bindings
  document.getElementById("login-btn").onclick = login;
  document.getElementById("logout-btn").onclick = logout;
  document.getElementById("book-appointment-btn").onclick = () => show("book-page");
  document.getElementById("back-from-book").onclick = () => show("appointments-page");
  document.getElementById("back-from-patient").onclick = () => show("appointments-page");

  document.getElementById("book-form").onsubmit = bookAppointment;
  document.getElementById("patient-info-form").onsubmit = savePatientInfo;

  // Initial Routing
  if (state.doctor) {
    document.getElementById("header-doctor-id").innerText = state.doctor;
    loadAppointments();
    show("appointments-page");
  } else {
    show("login-page");
  }
};

// ======== LOGIN LOGIC ========
function login() {
  let id = document.getElementById("doctor-id").value.trim();

  if (!id) {
    document.getElementById("login-error").classList.remove("hidden");
    return;
  }

  state.doctor = id;
  localStorage.setItem(STORAGE.DOCTOR, id);

  document.getElementById("header-doctor-id").innerText = id;

  loadAppointments();
  show("appointments-page");
}

function logout() {
  localStorage.removeItem(STORAGE.DOCTOR);
  state.doctor = null;
  show("login-page");
}

// ======== APPOINTMENTS ========
function loadAppointments() {
  let box = document.getElementById("appointments-list");
  box.innerHTML = "";

  if (state.appointments.length === 0) {
    box.innerHTML = "<p>No appointments booked yet</p>";
    return;
  }

  state.appointments.forEach(a => {
    box.innerHTML += `
      <div class="card">
        <h3>${a.name}</h3>
        <p>${a.date} - ${a.time}</p>
        <p>${a.phone}</p>
        <button onclick="openPatient('${a.id}')">View Patient</button>
      </div>
    `;
  });
}

// ======== BOOK APPOINTMENT ========
function bookAppointment(e) {
  e.preventDefault();

  let name = document.getElementById("patient-name").value.trim();
  let phone = document.getElementById("patient-phone").value.trim();
  let age = document.getElementById("patient-age").value.trim();
  let date = document.getElementById("appointment-date").value;
  let time = document.getElementById("appointment-time").value;

  if (!name || !phone || !age || !date || !time) {
    alert("Please fill all fields");
    return;
  }

  let newAppointment = {
    id: "P" + Date.now(),
    name,
    phone,
    age,
    date,
    time
  };

  state.appointments.push(newAppointment);

  localStorage.setItem(
    STORAGE.APPOINTMENTS,
    JSON.stringify(state.appointments)
  );

  alert("Appointment Booked!");

  loadAppointments();
  show("appointments-page");
}

// ======== PATIENT PROFILE ========
function openPatient(id) {

  let patient = state.appointments.find(p => p.id === id);

  if (!patient) {
    alert("Patient not found");
    return;
  }

  state.currentPatient = patient;

  document.getElementById("p-name").innerText = patient.name;
  document.getElementById("p-age").innerText = patient.age;
  document.getElementById("p-phone").innerText = patient.phone;

  loadHistory(id);

  show("patient-page");
}

// ======== SAVE PATIENT INFO ========
function savePatientInfo(e) {
  e.preventDefault();

  if (!state.currentPatient) return;

  let complaint = document.getElementById("current-complaint").value;
  let notes = document.getElementById("doctor-notes").value;
  let bp = document.getElementById("vital-bp").value;
  let pulse = document.getElementById("vital-pulse").value;
  let temp = document.getElementById("vital-temp").value;

  let history = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || "{}");

  if (!history[state.currentPatient.id]) {
    history[state.currentPatient.id] = [];
  }

  history[state.currentPatient.id].push({
    date: new Date().toLocaleString(),
    complaint,
    notes,
    vitals: { bp, pulse, temp }
  });

  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history));

  alert("Patient info saved!");

  document.getElementById("patient-info-form").reset();

  loadHistory(state.currentPatient.id);
}

// ======== LOAD PATIENT HISTORY ========
function loadHistory(patientId) {

  let box = document.getElementById("patient-history");

  let history = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || "{}");

  let records = history[patientId] || [];

  if (records.length === 0) {
    box.innerHTML = "<p>No history records</p>";
    return;
  }

  box.innerHTML = "";

  records.forEach(r => {
    box.innerHTML += `
      <div class="card">
        <p><b>Date:</b> ${r.date}</p>
        <p><b>Complaint:</b> ${r.complaint}</p>
        <p><b>Notes:</b> ${r.notes}</p>
        <p><b>Vitals:</b> BP-${r.vitals.bp}, Pulse-${r.vitals.pulse}, Temp-${r.vitals.temp}</p>
      </div>
    `;
  });
}
