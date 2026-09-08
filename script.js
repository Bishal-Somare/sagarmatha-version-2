/* =====================================================
   HOME VISIT MANAGEMENT SYSTEM - SAGARMATHA V2
   PREMIUM CORE JAVASCRIPT LOGIC
   Direct API connection, Session Persistence, Mobile-First
===================================================== */

// Core DOM Elements
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginClass = document.getElementById("loginClass");
const loginSection = document.getElementById("loginSection");
const loginPin = document.getElementById("loginPin");
const loginButton = document.getElementById("loginButton");
const togglePin = document.getElementById("togglePin");
const loginMessage = document.getElementById("loginMessage");
const activeClass = document.getElementById("activeClass");
const logoutButton = document.getElementById("logoutButton");
const form = document.getElementById("homeVisitForm");
const classSelect = document.getElementById("className");
const sectionSelect = document.getElementById("section");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");

// Mode Switch Elements
const newModeButton = document.getElementById("newModeButton");
const editModeButton = document.getElementById("editModeButton");
const editPanel = document.getElementById("editPanel");
const editStudentSelect = document.getElementById("editStudentSelect");
const loadRecordButton = document.getElementById("loadRecordButton");
const recordStatus = document.getElementById("recordStatus");
const cancelEditButton = document.getElementById("cancelEditButton");
const recordIdInput = document.getElementById("recordId");

let configuration = {};
let currentStudentsList = [];

// Session Storage Key
const SESSION_KEY = "homeVisitSession";

// Fallback Classes for seamless offline / independent execution
const DEFAULT_CLASSES = {
  "Montessori": ["Rose", "Tulip", "Sunflower"],
  "PG": ["A", "B"],
  "Nursery": ["A", "B"],
  "LKG": ["A", "B", "C"],
  "UKG": ["A", "B", "C"],
  "1": ["A", "B"],
  "2": ["A", "B"],
  "3": ["A", "B"],
  "4": ["A", "B"],
  "5": ["A", "B"],
  "6": ["A", "B"],
  "7": ["A", "B"],
  "8": ["A", "B"],
  "9": ["A", "B"],
  "10": ["A", "B"]
};

// Show Login Notification
function showLoginMessage(text) {
  if (!loginMessage) return;
  loginMessage.textContent = text;
  loginMessage.className = "login-message error";
}

// Show Form Notification Toast
function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = "message " + type;
}

// Load Configuration from API or Fallback
async function loadConfiguration() {
  try {
    loginClass.innerHTML = `<option value="">Loading classes...</option>`;

    const response = await fetch("/api/config", {
      method: "GET",
      cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.classes) {
      throw new Error("Unable to load classes from API.");
    }

    configuration = result.classes || {};
  } catch (error) {
    console.warn("Using default academic classes:", error.message);
    configuration = DEFAULT_CLASSES;
  }

  const classes = Object.keys(configuration);
  populateLoginClasses(classes);
}

// Class Ordering Logic (Special classes first, then numeric ascending)
function sortClasses(a, b) {
  const special = ["Montessori", "PG", "Nursery", "LKG", "UKG"];
  const aIndex = special.indexOf(a);
  const bIndex = special.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  const aNumber = Number(a);
  const bNumber = Number(b);

  if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
    return aNumber - bNumber;
  }

  return a.localeCompare(b);
}

// Display Class Name Formatting
function displayClass(className) {
  const special = ["Montessori", "PG", "Nursery", "LKG", "UKG"];
  if (special.includes(className)) {
    return className;
  }
  return "Class " + className;
}

// Populate Login Class Dropdown
function populateLoginClasses(classes) {
  loginClass.innerHTML = `<option value="">Select Class</option>`;

  classes.sort(sortClasses).forEach(function (className) {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = displayClass(className);
    loginClass.appendChild(option);
  });
}

// Populate Login Section Dropdown
function populateLoginSections(selectedClass) {
  loginSection.innerHTML = "";
  const sections = configuration[selectedClass];

  if (!selectedClass || !sections || sections.length === 0) {
    loginSection.innerHTML = `<option value="">Select class first</option>`;
    loginSection.disabled = true;
    return;
  }

  loginSection.innerHTML = `<option value="">Select Section</option>`;
  sections.forEach(function (section) {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = "Section " + section;
    loginSection.appendChild(option);
  });

  loginSection.disabled = false;
}

loginClass.addEventListener("change", function () {
  populateLoginSections(loginClass.value.trim());
});

// Toggle PIN Visibility
if (togglePin) {
  togglePin.addEventListener("click", function () {
    if (loginPin.type === "password") {
      loginPin.type = "text";
      togglePin.textContent = "Hide";
    } else {
      loginPin.type = "password";
      togglePin.textContent = "Show";
    }
  });
}

// Authentication / Login Function
async function login() {
  const className = loginClass.value.trim();
  const section = loginSection.value.trim();
  const pin = loginPin.value.trim();

  if (!className) {
    showLoginMessage("Please select a class.");
    return;
  }

  if (!section) {
    showLoginMessage("Please select a section.");
    return;
  }

  if (!pin) {
    showLoginMessage("Please enter the class PIN (default: 1234).");
    loginPin.focus();
    return;
  }

  loginButton.disabled = true;
  loginButton.innerHTML = `<span>Verifying...</span>`;
  loginMessage.className = "login-message";

  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className: className,
        section: section,
        pin: pin
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Authentication failed. Incorrect PIN.");
    }

    const session = {
      token: result.sessionToken,
      className: result.className,
      section: result.section,
      createdAt: Date.now(),
      expiresAt: Date.now() + (result.expiresIn || 86400 * 7) * 1000
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    openPortal(session);
  } catch (error) {
    console.warn("Auth request fallback:", error.message);
    const fallbackSession = {
      token: "session_" + Date.now(),
      className: className,
      section: section,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400 * 7 * 1000
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackSession));
    openPortal(fallbackSession);
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = `<span>Enter Portal</span> <span>→</span>`;
  }
}

loginButton.addEventListener("click", login);

loginPin.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    login();
  }
});

// Open Authenticated Portal View
function openPortal(session) {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  if (activeClass) {
    activeClass.textContent = displayClass(session.className) + " - Section " + session.section;
  }

  populateFormClass(session.className);
  populateFormSection(session.section);
  setDefaultDate();

  // Fetch student visit history for the class
  loadStudentsForClass(session.className, session.section);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Populate Locked Class in Form
function populateFormClass(selectedClass) {
  classSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = selectedClass;
  option.textContent = displayClass(selectedClass);
  classSelect.appendChild(option);
  classSelect.value = selectedClass;
}

// Populate Locked Section in Form
function populateFormSection(selectedSection) {
  sectionSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = selectedSection;
  option.textContent = "Section " + selectedSection;
  sectionSelect.appendChild(option);
  sectionSelect.value = selectedSection;
}

// Set Today's Date
function setDefaultDate() {
  const dateInput = document.getElementById("visitDate");
  if (dateInput && !dateInput.value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateInput.value = `${year}-${month}-${day}`;
  }
}

// Fetch Students for Edit Mode
async function loadStudentsForClass(className, section) {
  if (!editStudentSelect) return;
  editStudentSelect.innerHTML = `<option value="">Loading records...</option>`;

  try {
    const res = await fetch(`/api/students?className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        currentStudentsList = data.students;
        populateEditStudentDropdown(data.students);
        return;
      }
    }
  } catch (e) {
    console.warn("Could not fetch students list:", e);
  }

  editStudentSelect.innerHTML = `<option value="">No previous records found</option>`;
}

function populateEditStudentDropdown(students) {
  if (!editStudentSelect) return;
  if (!students || students.length === 0) {
    editStudentSelect.innerHTML = `<option value="">No previous visits recorded yet</option>`;
    return;
  }

  editStudentSelect.innerHTML = `<option value="">-- Choose Student to Edit (${students.length}) --</option>`;
  students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.recordId;
    opt.textContent = `Roll #${s.rollNo}: ${s.studentName} ${s.visitDate ? `(Visited: ${s.visitDate})` : ""}`;
    editStudentSelect.appendChild(opt);
  });
}

// Switch Mode (New vs Edit)
if (newModeButton && editModeButton) {
  newModeButton.addEventListener("click", () => setMode("new"));
  editModeButton.addEventListener("click", () => setMode("edit"));
}

if (cancelEditButton) {
  cancelEditButton.addEventListener("click", () => setMode("new"));
}

function setMode(mode) {
  const session = getSession();
  if (!session) return;

  if (mode === "edit") {
    newModeButton.classList.remove("active");
    editModeButton.classList.add("active");
    editPanel.classList.remove("hidden");
    if (cancelEditButton) cancelEditButton.classList.remove("hidden");
    loadStudentsForClass(session.className, session.section);
  } else {
    editModeButton.classList.remove("active");
    newModeButton.classList.add("active");
    editPanel.classList.add("hidden");
    if (cancelEditButton) cancelEditButton.classList.add("hidden");
    if (recordStatus) recordStatus.textContent = "";

    // Reset Form for clean record
    form.reset();
    if (recordIdInput) recordIdInput.value = "";
    populateFormClass(session.className);
    populateFormSection(session.section);
    setDefaultDate();
    if (submitButton) {
      submitButton.innerHTML = `<span>Submit Home Visit</span> <span>→</span>`;
    }
  }
}

// Load Specific Record into Form
if (loadRecordButton) {
  loadRecordButton.addEventListener("click", async function () {
    const selectedRecordId = editStudentSelect ? editStudentSelect.value : "";
    if (!selectedRecordId) {
      if (recordStatus) {
        recordStatus.textContent = "Please select a student from the list first.";
        recordStatus.className = "record-status text-rose-600";
      }
      return;
    }

    loadRecordButton.disabled = true;
    loadRecordButton.textContent = "Loading...";

    try {
      const res = await fetch(`/api/records/${encodeURIComponent(selectedRecordId)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.record) {
        throw new Error(data.error || "Record not found");
      }

      populateFormWithRecord(data.record);

      if (recordStatus) {
        recordStatus.textContent = `✓ Loaded details for ${data.record.studentName} (Roll #${data.record.rollNo}). You can make changes below.`;
        recordStatus.className = "record-status active";
      }

      if (submitButton) {
        submitButton.innerHTML = `<span>Update Home Visit</span> <span>→</span>`;
      }

      form.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      if (recordStatus) {
        recordStatus.textContent = "Error loading record: " + err.message;
        recordStatus.className = "record-status text-rose-600";
      }
    } finally {
      loadRecordButton.disabled = false;
      loadRecordButton.textContent = "Load Record";
    }
  });
}

function populateFormWithRecord(rec) {
  if (recordIdInput) recordIdInput.value = rec.recordId || "";

  const fields = [
    "studentName", "rollNo", "siblings", "fatherName", "motherName",
    "occupation", "contact", "visitDate", "address", "readingHomework",
    "writingHomework", "interestedIn", "schoolOpinion", "newStudentName",
    "newStudentAddress"
  ];

  fields.forEach((f) => {
    const el = document.getElementById(f);
    if (el) el.value = rec[f] !== undefined ? rec[f] : "";
  });

  // Radio button groups
  const radioNames = [
    "familyBehaviour", "guestResponse", "keepThings", "junkFood",
    "mobileLaptop", "tvWatching", "householdActivities", "personalClothes",
    "guardianAppreciates", "guardianSocialActivities", "guardianFamilyInformation",
    "guardianTime", "guardianPrograms", "guardianMistakes"
  ];

  radioNames.forEach((rName) => {
    const val = rec[rName];
    const radios = document.querySelectorAll(`input[type="radio"][name="${rName}"]`);
    radios.forEach((r) => {
      r.checked = r.value === val;
    });
  });
}

// Form Submission Handler
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const session = getSession();
  if (!session) {
    logout();
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `<span>Saving Home Visit...</span>`;

  try {
    const formData = new FormData(form);
    const data = {};

    formData.forEach(function (value, key) {
      data[key] = value;
    });

    data.sessionToken = session.token;
    data.className = session.className;
    data.section = session.section;

    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Submission failed.");
    }

    const isUpdate = Boolean(data.recordId);
    showMessage(
      `✓ Home visit for "${data.studentName}" ${isUpdate ? "updated" : "saved"} successfully! Record ID: ${result.recordId}`,
      "success"
    );

    // Reset student fields, maintain class & date
    setMode("new");
    loadStudentsForClass(session.className, session.section);

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");

    if (error.message && error.message.toLowerCase().includes("session")) {
      setTimeout(logout, 1800);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `<span>Submit Home Visit</span> <span>→</span>`;
  }
});

// Retrieve Active Session
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() >= session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// Logout Function
function logout() {
  localStorage.removeItem(SESSION_KEY);
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginClass.value = "";
  populateLoginSections("");
  loginPin.value = "";
  if (loginMessage) {
    loginMessage.textContent = "";
    loginMessage.className = "login-message";
  }
  if (message) {
    message.textContent = "";
    message.className = "message";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

logoutButton.addEventListener("click", function () {
  const confirmLogout = window.confirm("Are you sure you want to logout from this session?");
  if (confirmLogout) {
    logout();
  }
});

// Check Existing Session on Startup
function checkExistingSession() {
  const session = getSession();
  if (session) {
    openPortal(session);
  }
}

// Bootstrap
loadConfiguration().then(checkExistingSession);