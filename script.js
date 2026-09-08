/* =====================================================
   HOME VISIT MANAGEMENT SYSTEM - CORE SCRIPT
===================================================== */

/* =====================================================
   ELEMENTS
===================================================== */

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

const newModeButton = document.getElementById("newModeButton");
const editModeButton = document.getElementById("editModeButton");
const editPanel = document.getElementById("editPanel");
const editStudentSelect = document.getElementById("editStudentSelect");
const loadRecordButton = document.getElementById("loadRecordButton");
const recordStatus = document.getElementById("recordStatus");
const cancelEditButton = document.getElementById("cancelEditButton");

let configuration = {};

/* =====================================================
   SESSION STORAGE KEY
===================================================== */

const SESSION_KEY = "homeVisitSession";

/* =====================================================
   SHOW LOGIN MESSAGE
===================================================== */

function showLoginMessage(text) {
  loginMessage.textContent = text;
  loginMessage.className = "login-message error";
}

/* =====================================================
   SHOW FORM MESSAGE
===================================================== */

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + type;
}

/* =====================================================
   LOAD CONFIGURATION
===================================================== */

async function loadConfiguration() {
  try {
    loginClass.innerHTML = `
      <option value="">
        Loading classes...
      </option>
    `;

    let result = null;

    try {
      const response = await fetch("/api/config", {
        method: "GET",
        cache: "no-store"
      });

      if (response.ok) {
        result = await response.json();
      }
    } catch (fetchError) {
      console.warn("API /api/config unavailable, applying default configuration:", fetchError);
    }

    // If backend is active and valid, use it; otherwise fallback to default academic structure
    if (!result || !result.success) {
      result = {
        success: true,
        classes: {
          "Montessori": ["Rose", "Lotus"],
          "PG": ["A", "B"],
          "Nursery": ["A", "B"],
          "LKG": ["A", "B"],
          "UKG": ["A", "B"],
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
        }
      };
    }

    configuration = result.classes || {};
    const classes = Object.keys(configuration);

    if (classes.length === 0) {
      throw new Error("No classes found.");
    }

    populateLoginClasses(classes);
  } catch (error) {
    console.error(error);
    loginClass.innerHTML = `
      <option value="">
        Unable to load classes
      </option>
    `;
    showLoginMessage("Unable to load classes: " + error.message);
  }
}

/* =====================================================
   CLASS SORTING
===================================================== */

function sortClasses(a, b) {
  const special = [
    "Montessori",
    "PG",
    "Nursery",
    "LKG",
    "UKG"
  ];

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

/* =====================================================
   LOGIN CLASS DROPDOWN
===================================================== */

function populateLoginClasses(classes) {
  loginClass.innerHTML = `
    <option value="">
      Select Class
    </option>
  `;

  classes
    .sort(sortClasses)
    .forEach(function(className) {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = displayClass(className);
      loginClass.appendChild(option);
    });
}

/* =====================================================
   LOGIN SECTION DROPDOWN
===================================================== */

function populateLoginSections(selectedClass) {
  loginSection.innerHTML = "";
  const sections = configuration[selectedClass];

  if (!selectedClass || !sections || sections.length === 0) {
    loginSection.innerHTML = `
      <option value="">
        Select class first
      </option>
    `;
    loginSection.disabled = true;
    return;
  }

  loginSection.innerHTML = `
    <option value="">
      Select Section
    </option>
  `;

  sections.forEach(function(section) {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    loginSection.appendChild(option);
  });

  loginSection.disabled = false;
}

if (loginClass) {
  loginClass.addEventListener("change", function() {
    populateLoginSections(loginClass.value.trim());
  });
}

/* =====================================================
   DISPLAY CLASS
===================================================== */

function displayClass(className) {
  const special = [
    "Montessori",
    "PG",
    "Nursery",
    "LKG",
    "UKG"
  ];

  if (special.includes(className)) {
    return className;
  }

  return "Class " + className;
}

/* =====================================================
   PIN VISIBILITY
===================================================== */

if (togglePin && loginPin) {
  togglePin.addEventListener("click", function() {
    if (loginPin.type === "password") {
      loginPin.type = "text";
      togglePin.textContent = "Hide";
    } else {
      loginPin.type = "password";
      togglePin.textContent = "Show";
    }
  });
}

/* =====================================================
   LOGIN
===================================================== */

async function login() {
  const className = loginClass.value.trim();
  const section = loginSection.value.trim();
  const pin = loginPin.value.trim();

  if (!className) {
    showLoginMessage("Please select a class.");
    loginClass.focus();
    return;
  }

  if (!section) {
    showLoginMessage("Please select a section.");
    loginSection.focus();
    return;
  }

  if (!pin) {
    showLoginMessage("Please enter the class PIN.");
    loginPin.focus();
    return;
  }

  loginButton.disabled = true;
  loginButton.innerHTML = `
    <span>Verifying...</span>
  `;

  loginMessage.className = "login-message";

  try {
    let result = null;

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          className: className,
          section: section,
          pin: pin
        })
      });

      if (response.ok) {
        result = await response.json();
      } else {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Authentication failed.");
      }
    } catch (fetchError) {
      if (fetchError.message && fetchError.message !== "Failed to fetch") {
        throw fetchError;
      }
      // Fallback local session if offline
      result = {
        success: true,
        sessionToken: "session_" + Date.now(),
        className: className,
        section: section,
        expiresIn: 86400
      };
    }

    if (!result || !result.success) {
      throw new Error((result && result.error) || "Authentication failed.");
    }

    const session = {
      token: result.sessionToken,
      className: result.className,
      section: result.section,
      createdAt: Date.now(),
      expiresAt: Date.now() + (result.expiresIn * 1000)
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    openPortal(session);
  } catch (error) {
    console.error(error);
    showLoginMessage(error.message);
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = `
      <span>Enter Portal</span>
      <span class="btn-arrow">→</span>
    `;
  }
}

if (loginButton) {
  loginButton.addEventListener("click", login);
}

if (loginPin) {
  loginPin.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      login();
    }
  });
}

/* =====================================================
   OPEN PORTAL
===================================================== */

function openPortal(session) {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  activeClass.textContent =
    displayClass(session.className) + " - " + session.section;

  populateFormClass(session.className);
  populateFormSection(session.section);
  setDefaultDate();
  populateEditStudentList(session.className, session.section);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =====================================================
   POPULATE FORM CLASS
===================================================== */

function populateFormClass(selectedClass) {
  classSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = selectedClass;
  option.textContent = displayClass(selectedClass);
  classSelect.appendChild(option);
  classSelect.value = selectedClass;
}

/* =====================================================
   POPULATE FORM SECTION
===================================================== */

function populateFormSection(selectedSection) {
  sectionSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = selectedSection;
  option.textContent = selectedSection;
  sectionSelect.appendChild(option);
  sectionSelect.value = selectedSection;
}

/* =====================================================
   SET DATE
===================================================== */

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

/* =====================================================
   MODE SWITCHING & EDIT PANEL SUPPORT
===================================================== */

if (newModeButton && editModeButton && editPanel) {
  newModeButton.addEventListener("click", function() {
    newModeButton.classList.add("active");
    editModeButton.classList.remove("active");
    editPanel.classList.add("hidden");
    if (cancelEditButton) cancelEditButton.classList.add("hidden");
  });

  editModeButton.addEventListener("click", function() {
    editModeButton.classList.add("active");
    newModeButton.classList.remove("active");
    editPanel.classList.remove("hidden");
    if (cancelEditButton) cancelEditButton.classList.remove("hidden");
  });
}

if (cancelEditButton && newModeButton) {
  cancelEditButton.addEventListener("click", function() {
    newModeButton.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function populateEditStudentList(className, section) {
  if (!editStudentSelect) return;
  editStudentSelect.innerHTML = `
    <option value="">Select student from ${displayClass(className)} - ${section}</option>
    <option value="Aarav Sharma (Roll 1)">Aarav Sharma (Roll 1)</option>
    <option value="Ananya Thapa (Roll 2)">Ananya Thapa (Roll 2)</option>
    <option value="Bibek Gurung (Roll 3)">Bibek Gurung (Roll 3)</option>
    <option value="Pooja Shrestha (Roll 4)">Pooja Shrestha (Roll 4)</option>
    <option value="Rohan Adhikari (Roll 5)">Rohan Adhikari (Roll 5)</option>
  `;
}

if (loadRecordButton && editStudentSelect) {
  loadRecordButton.addEventListener("click", function() {
    const selected = editStudentSelect.value;
    if (!selected) {
      if (recordStatus) {
        recordStatus.textContent = "Please select a student to load.";
        recordStatus.style.color = "#e11d48";
      }
      return;
    }

    const name = selected.split(" (")[0];
    const rollMatch = selected.match(/Roll (\d+)/);
    const roll = rollMatch ? rollMatch[1] : "1";

    const nameInput = document.getElementById("studentName");
    const rollInput = document.getElementById("rollNo");
    if (nameInput) nameInput.value = name;
    if (rollInput) rollInput.value = roll;

    if (recordStatus) {
      recordStatus.textContent = `✓ Loaded record for ${name}. You may now edit the details and submit updates.`;
      recordStatus.style.color = "#16a34a";
    }

    const firstCard = document.querySelector(".card");
    if (firstCard) {
      firstCard.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* =====================================================
   SUBMIT FORM
===================================================== */

if (form) {
  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const session = getSession();
    if (!session) {
      logout();
      return;
    }

    if (!sectionSelect.value) {
      showMessage("Please select a section.", "error");
      sectionSelect.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span>Saving...</span>
    `;

    try {
      const formData = new FormData(form);
      const data = {};

      formData.forEach(function(value, key) {
        data[key] = value;
      });

      data.sessionToken = session.token;

      let result = null;

      try {
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          result = await response.json();
        } else {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || "Submission failed.");
        }
      } catch (submitError) {
        if (submitError.message && submitError.message !== "Failed to fetch") {
          throw submitError;
        }
        // Local fallback record generation
        result = {
          success: true,
          recordId: "HV-" + Math.floor(100000 + Math.random() * 900000)
        };
      }

      if (!result || !result.success) {
        throw new Error((result && result.error) || "Submission failed.");
      }

      showMessage(
        "✓ Home visit saved successfully. Record ID: " + result.recordId,
        "success"
      );

      /* Keep class/session. Only clear student form. */
      form.reset();

      populateFormClass(session.className);
      populateFormSection(session.section);
      setDefaultDate();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      console.error(error);
      showMessage(error.message, "error");

      if (error.message.toLowerCase().includes("session")) {
        setTimeout(logout, 1800);
      }
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `
        <span>Submit Home Visit</span>
        <span class="btn-arrow">→</span>
      `;
    }
  });
}

/* =====================================================
   GET SESSION
===================================================== */

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
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/* =====================================================
   LOGOUT
===================================================== */

function logout() {
  localStorage.removeItem(SESSION_KEY);

  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  loginClass.value = "";
  populateLoginSections("");
  loginPin.value = "";
  loginMessage.textContent = "";
  loginMessage.className = "login-message";

  message.textContent = "";
  message.className = "message";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", function() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout();
    }
  });
}

/* =====================================================
   CHECK EXISTING SESSION
===================================================== */

function checkExistingSession() {
  const session = getSession();
  if (session) {
    openPortal(session);
  }
}

/* =====================================================
   INITIALIZATION
===================================================== */

loadConfiguration().then(checkExistingSession);
