/* =====================================================
   HOME VISIT MANAGEMENT SYSTEM
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const loginScreen =
  document.getElementById(
    "loginScreen"
  );

const app =
  document.getElementById(
    "app"
  );

const loginClass =
  document.getElementById(
    "loginClass"
  );

const loginSection =
  document.getElementById(
    "loginSection"
  );

const loginPin =
  document.getElementById(
    "loginPin"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const togglePin =
  document.getElementById(
    "togglePin"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );

const activeClass =
  document.getElementById(
    "activeClass"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

const form =
  document.getElementById(
    "homeVisitForm"
  );

const classSelect =
  document.getElementById(
    "className"
  );

const sectionSelect =
  document.getElementById(
    "section"
  );

const submitButton =
  document.getElementById(
    "submitButton"
  );

const captureLocationButton =
  document.getElementById(
    "captureLocationButton"
  );

const visitLocationInput =
  document.getElementById(
    "visitLocation"
  );

const visitLocationDisplay =
  document.getElementById(
    "visitLocationDisplay"
  );

const message =
  document.getElementById(
    "message"
  );

const newModeButton =
  document.getElementById(
    "newModeButton"
  );

const editModeButton =
  document.getElementById(
    "editModeButton"
  );

const editPanel =
  document.getElementById(
    "editPanel"
  );

const editStudentSelect =
  document.getElementById(
    "editStudentSelect"
  );

const loadRecordButton =
  document.getElementById(
    "loadRecordButton"
  );

const recordStatus =
  document.getElementById(
    "recordStatus"
  );

const cancelEditButton =
  document.getElementById(
    "cancelEditButton"
  );

const recordIdInput =
  document.getElementById(
    "recordId"
  );


let configuration = {};


/*
 * "create" -> submitting the form saves a brand new
 *             home visit (existing behaviour).
 * "update" -> submitting the form updates the record
 *             currently loaded from the edit panel.
 */
let submitMode = "create";


/* =====================================================
   SESSION STORAGE KEY
===================================================== */

const SESSION_KEY =
  "homeVisitSession";


/* =====================================================
   SHOW LOGIN MESSAGE
===================================================== */

function showLoginMessage(
  text
) {

  loginMessage.textContent =
    text;

  loginMessage.className =
    "login-message error";

}


/* =====================================================
   SHOW FORM MESSAGE
===================================================== */

function showMessage(
  text,
  type
) {

  message.textContent =
    text;

  message.className =
    "message " +
    type;

}


/* =====================================================
   LOAD CONFIGURATION
===================================================== */

async function loadConfiguration() {

  try {

    loginClass.innerHTML =
      `
      <option value="">
        Loading classes...
      </option>
      `;


    const response =
      await fetch(
        "/api/config",
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.error ||
        "Unable to load classes."
      );

    }


    configuration =
      result.classes || {};


    const classes =
      Object.keys(
        configuration
      );


    if (
      classes.length === 0
    ) {

      throw new Error(
        "No classes found."
      );

    }


    populateLoginClasses(
      classes
    );


  }

  catch (error) {

    console.error(
      error
    );


    loginClass.innerHTML =
      `
      <option value="">
        Unable to load classes
      </option>
      `;


    showLoginMessage(
      "Unable to load classes: " +
      error.message
    );

  }

}


/* =====================================================
   CLASS SORTING
===================================================== */

function sortClasses(
  a,
  b
) {

  const special = [
    "Montessori",
    "PG",
    "Nursery",
    "LKG",
    "UKG"
  ];


  const aIndex =
    special.indexOf(a);

  const bIndex =
    special.indexOf(b);


  if (
    aIndex !== -1 ||
    bIndex !== -1
  ) {

    if (
      aIndex === -1
    ) {

      return 1;

    }


    if (
      bIndex === -1
    ) {

      return -1;

    }


    return (
      aIndex -
      bIndex
    );

  }


  const aNumber =
    Number(a);

  const bNumber =
    Number(b);


  if (
    !Number.isNaN(aNumber) &&
    !Number.isNaN(bNumber)
  ) {

    return (
      aNumber -
      bNumber
    );

  }


  return a.localeCompare(
    b
  );

}


/* =====================================================
   LOGIN CLASS DROPDOWN
===================================================== */

function populateLoginClasses(
  classes
) {

  loginClass.innerHTML =
    `
    <option value="">
      Select Class
    </option>
    `;


  classes
    .sort(sortClasses)
    .forEach(
      function(className) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          className;


        option.textContent =
          displayClass(
            className
          );


        loginClass.appendChild(
          option
        );

      }
    );

}


/* =====================================================
   LOGIN SECTION DROPDOWN
===================================================== */

function populateLoginSections(
  selectedClass
) {

  loginSection.innerHTML =
    "";


  const sections =
    configuration[
      selectedClass
    ];


  if (
    !selectedClass ||
    !sections ||
    sections.length === 0
  ) {

    loginSection.innerHTML =
      `
      <option value="">
        Select class first
      </option>
      `;

    loginSection.disabled =
      true;

    return;

  }


  loginSection.innerHTML =
    `
    <option value="">
      Select Section
    </option>
    `;


  sections.forEach(
    function(section) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        section;

      option.textContent =
        section;


      loginSection.appendChild(
        option
      );

    }
  );


  loginSection.disabled =
    false;

}


loginClass.addEventListener(
  "change",
  function() {

    populateLoginSections(
      loginClass.value.trim()
    );

  }
);


/* =====================================================
   DISPLAY CLASS
===================================================== */

function displayClass(
  className
) {

  const special = [
    "Montessori",
    "PG",
    "Nursery",
    "LKG",
    "UKG"
  ];


  if (
    special.includes(
      className
    )
  ) {

    return className;

  }


  return (
    "Class " +
    className
  );

}


/* =====================================================
   PIN VISIBILITY
===================================================== */

togglePin.addEventListener(
  "click",
  function() {

    if (
      loginPin.type ===
      "password"
    ) {

      loginPin.type =
        "text";

      togglePin.textContent =
        "Hide";

    }

    else {

      loginPin.type =
        "password";

      togglePin.textContent =
        "Show";

    }

  }
);


/* =====================================================
   LOGIN
===================================================== */

async function login() {

  const className =
    loginClass.value.trim();


  const section =
    loginSection.value.trim();


  const pin =
    loginPin.value.trim();


  if (!className) {

    showLoginMessage(
      "Please select a class."
    );

    return;

  }


  if (!section) {

    showLoginMessage(
      "Please select a section."
    );

    return;

  }


  if (!pin) {

    showLoginMessage(
      "Please enter the class PIN."
    );

    loginPin.focus();

    return;

  }


  loginButton.disabled =
    true;


  loginButton.innerHTML =
    `
    <span>
      Verifying...
    </span>
    `;


  loginMessage.className =
    "login-message";


  try {

    const response =
      await fetch(
        "/api/auth",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              className:
                className,

              section:
                section,

              pin:
                pin

            })

        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.error ||
        "Authentication failed."
      );

    }


    const session = {

      token:
        result.sessionToken,

      className:
        result.className,

      section:
        result.section,

      createdAt:
        Date.now(),

      expiresAt:
        Date.now() +
        (
          result.expiresIn *
          1000
        )

    };


    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        session
      )
    );


    openPortal(
      session
    );


  }

  catch (error) {

    console.error(
      error
    );


    showLoginMessage(
      error.message
    );

  }

  finally {

    loginButton.disabled =
      false;

    loginButton.innerHTML =
      `
      <span>
        Enter Portal
      </span>

      <span>
        →
      </span>
      `;

  }

}


/* =====================================================
   LOGIN BUTTON
===================================================== */

loginButton.addEventListener(
  "click",
  login
);


/* =====================================================
   ENTER KEY FOR PIN
===================================================== */

loginPin.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key ===
      "Enter"
    ) {

      login();

    }

  }
);


/* =====================================================
   OPEN PORTAL
===================================================== */

function openPortal(
  session
) {

  loginScreen.classList.add(
    "hidden"
  );

  app.classList.remove(
    "hidden"
  );


  activeClass.textContent =
    displayClass(
      session.className
    ) +
    " - " +
    session.section;


  populateFormClass(
    session.className
  );


  populateFormSection(
    session.section
  );


  setDefaultDate();


  showPanel(
    "new"
  );


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );

}


/* =====================================================
   POPULATE FORM CLASS
===================================================== */

function populateFormClass(
  selectedClass
) {

  classSelect.innerHTML =
    "";


  const option =
    document.createElement(
      "option"
    );


  option.value =
    selectedClass;


  option.textContent =
    displayClass(
      selectedClass
    );


  classSelect.appendChild(
    option
  );


  classSelect.value =
    selectedClass;

}


/* =====================================================
   POPULATE FORM SECTION
   Locks the home-visit form's section field to the
   section chosen at login, so it never needs to be
   picked again.
===================================================== */

function populateFormSection(
  selectedSection
) {

  sectionSelect.innerHTML =
    "";


  const option =
    document.createElement(
      "option"
    );


  option.value =
    selectedSection;


  option.textContent =
    selectedSection;


  sectionSelect.appendChild(
    option
  );


  sectionSelect.value =
    selectedSection;

}


/* =====================================================
   SET DATE
===================================================== */

function setDefaultDate() {

  const dateInput =
    document.getElementById(
      "visitDate"
    );


  if (
    dateInput &&
    !dateInput.value
  ) {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    dateInput.value =
      `${year}-${month}-${day}`;

  }

}


/* =====================================================
   SHOW PANEL
   Switches between the "New Home Visit" form and the
   "Edit Existing Record" student picker.
===================================================== */

function showPanel(
  target
) {

  if (
    target === "new"
  ) {

    newModeButton.classList.add(
      "active"
    );

    editModeButton.classList.remove(
      "active"
    );

    editPanel.classList.add(
      "hidden"
    );

    form.classList.remove(
      "hidden"
    );

    cancelEditButton.classList.add(
      "hidden"
    );

    submitMode =
      "create";

    recordIdInput.value =
      "";

    submitButton.innerHTML =
      `
      <span>
        Submit Home Visit
      </span>

      <span>
        →
      </span>
      `;

  }

  else {

    editModeButton.classList.add(
      "active"
    );

    newModeButton.classList.remove(
      "active"
    );

    form.classList.add(
      "hidden"
    );

    editPanel.classList.remove(
      "hidden"
    );

    cancelEditButton.classList.add(
      "hidden"
    );

    recordStatus.textContent =
      "";

    recordStatus.className =
      "record-status";

    loadStudentList();

  }

}


newModeButton.addEventListener(
  "click",
  function() {

    showPanel(
      "new"
    );

  }
);


editModeButton.addEventListener(
  "click",
  function() {

    showPanel(
      "edit"
    );

  }
);


cancelEditButton.addEventListener(
  "click",
  function() {

    const session =
      getSession();


    if (session) {

      resetFormForSession(
        session
      );

    }


    showPanel(
      "edit"
    );

  }
);


/* =====================================================
   LOAD STUDENT LIST
   Populates the "Edit Existing Record" dropdown with the
   students already recorded for the logged-in class and
   section.
===================================================== */

async function loadStudentList() {

  const session =
    getSession();


  if (!session) {

    logout();

    return;

  }


  editStudentSelect.innerHTML =
    `
    <option value="">
      Loading students...
    </option>
    `;

  editStudentSelect.disabled =
    true;


  try {

    const params =
      new URLSearchParams(
        {
          className: session.className,
          section: session.section,
          sessionToken: session.token
        }
      );


    const response =
      await fetch(
        "/api/students?" +
        params.toString(),
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.error ||
        "Unable to load students."
      );

    }


    const students =
      result.students ||
      [];


    if (
      students.length === 0
    ) {

      editStudentSelect.innerHTML =
        `
        <option value="">
          No records found yet
        </option>
        `;

      editStudentSelect.disabled =
        true;

      return;

    }


    editStudentSelect.innerHTML =
      `
      <option value="">
        Select a student
      </option>
      `;

    editStudentSelect.disabled =
      false;


    students.forEach(
      function(student) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          student.recordId;


        const rollLabel =
          student.rollNo
            ? " (Roll " + student.rollNo + ")"
            : "";

        const dateLabel =
          student.visitDate
            ? " - " + student.visitDate
            : "";


        option.textContent =
          student.studentName +
          rollLabel +
          dateLabel;


        editStudentSelect.appendChild(
          option
        );

      }
    );

  }

  catch (error) {

    console.error(
      error
    );


    editStudentSelect.innerHTML =
      `
      <option value="">
        Unable to load students
      </option>
      `;

    editStudentSelect.disabled =
      true;


    recordStatus.textContent =
      error.message;

    recordStatus.className =
      "record-status error";

  }

}


/* =====================================================
   LOAD RECORD
   Fetches the full record for the selected student and
   fills the home-visit form with it, ready for editing.
===================================================== */

loadRecordButton.addEventListener(
  "click",
  async function() {

    const session =
      getSession();


    if (!session) {

      logout();

      return;

    }


    const recordId =
      editStudentSelect.value;


    if (!recordId) {

      recordStatus.textContent =
        "Please select a student first.";

      recordStatus.className =
        "record-status error";

      return;

    }


    loadRecordButton.disabled =
      true;


    const originalLabel =
      loadRecordButton.textContent;


    loadRecordButton.textContent =
      "Loading...";


    recordStatus.textContent =
      "";

    recordStatus.className =
      "record-status";


    try {

      const params =
        new URLSearchParams(
          {
            className: session.className,
            section: session.section,
            sessionToken: session.token,
            recordId: recordId
          }
        );


      const response =
        await fetch(
          "/api/record?" +
          params.toString(),
          {
            method: "GET",
            cache: "no-store"
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.error ||
          "Unable to load record."
        );

      }


      populateFormWithRecord(
        result.record
      );


      submitMode =
        "update";


      editPanel.classList.add(
        "hidden"
      );

      form.classList.remove(
        "hidden"
      );

      cancelEditButton.classList.remove(
        "hidden"
      );


      submitButton.innerHTML =
        `
        <span>
          Update Home Visit
        </span>

        <span>
          →
        </span>
        `;


      window.scrollTo(
        {
          top: 0,
          behavior: "smooth"
        }
      );

    }

    catch (error) {

      console.error(
        error
      );


      recordStatus.textContent =
        error.message;

      recordStatus.className =
        "record-status error";

    }

    finally {

      loadRecordButton.disabled =
        false;

      loadRecordButton.textContent =
        originalLabel;

    }

  }
);


/* =====================================================
   POPULATE FORM WITH RECORD
   Fills every matching form field (text, textarea, radio)
   from a record object returned by /api/record.
===================================================== */

function populateFormWithRecord(
  record
) {

  const fields =
    form.querySelectorAll(
      "[name]"
    );


  fields.forEach(
    function(field) {

      const key =
        field.name;


      if (
        !(key in record)
      ) {

        return;

      }


      const value =
        record[key] !== undefined &&
        record[key] !== null
          ? record[key]
          : "";


      if (
        field.type === "radio"
      ) {

        field.checked =
          String(field.value) ===
          String(value);

      }

      else {

        field.value =
          value;

      }

    }
  );


  if (
    record.visitLocation
  ) {

    const coords =
      String(record.visitLocation)
        .replace(
          "https://www.google.com/maps?q=",
          ""
        );

    visitLocationDisplay.value =
      coords;

  }

  else {

    visitLocationDisplay.value =
      "";

  }

}


/* =====================================================
   RESET FORM FOR SESSION
   Shared reset logic: clears the home-visit form back to
   a blank "new visit" state for the logged-in class and
   section. Used after a successful submit/update, and
   when cancelling out of the edit panel.
===================================================== */

function resetFormForSession(
  session
) {

  form.reset();


  classSelect.innerHTML =
    "";


  const classOption =
    document.createElement(
      "option"
    );


  classOption.value =
    session.className;


  classOption.textContent =
    displayClass(
      session.className
    );


  classSelect.appendChild(
    classOption
  );


  classSelect.value =
    session.className;


  populateFormSection(
    session.section
  );


  setDefaultDate();


  visitLocationDisplay.value =
    "";

}


/* =====================================================
   CAPTURE VISIT LOCATION
   Uses the device's GPS (via the browser Geolocation API) to
   record where the home visit is taking place, saved as a
   Google Maps link.
===================================================== */

captureLocationButton.addEventListener(
  "click",
  function() {

    if (
      !navigator.geolocation
    ) {

      showMessage(
        "Location capture isn't supported on this device/browser.",
        "error"
      );

      return;

    }


    captureLocationButton.disabled =
      true;

    const originalLabel =
      captureLocationButton.textContent;

    captureLocationButton.textContent =
      "Locating...";


    navigator.geolocation.getCurrentPosition(

      function(
        position
      ) {

        const lat =
          position.coords.latitude.toFixed(6);

        const lng =
          position.coords.longitude.toFixed(6);


        visitLocationInput.value =
          "https://www.google.com/maps?q=" +
          lat +
          "," +
          lng;

        visitLocationDisplay.value =
          lat + ", " + lng;


        captureLocationButton.disabled =
          false;

        captureLocationButton.textContent =
          originalLabel;

      },

      function(
        error
      ) {

        captureLocationButton.disabled =
          false;

        captureLocationButton.textContent =
          originalLabel;


        showMessage(
          "Couldn't get location: " +
          (error.message || "permission denied or unavailable."),
          "error"
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

    );

  }
);


/* =====================================================
   SUBMIT FORM
===================================================== */

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const session =
      getSession();


    if (!session) {

      logout();

      return;

    }


    if (
      !sectionSelect.value
    ) {

      showMessage(
        "Please select a section.",
        "error"
      );

      sectionSelect.focus();

      return;

    }


    submitButton.disabled =
      true;


    submitButton.innerHTML =
      `
      <span>
        Saving...
      </span>
      `;


    try {

      const formData =
        new FormData(
          form
        );


      const data = {};


      formData.forEach(
        function(
          value,
          key
        ) {

          data[key] =
            value;

        }
      );


      data.sessionToken =
        session.token;


      const isUpdate =
        submitMode === "update";


      const endpoint =
        isUpdate
          ? "/api/update"
          : "/api/submit";


      const response =
        await fetch(
          endpoint,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                data
              )

          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.error ||
          (
            isUpdate
              ? "Update failed."
              : "Submission failed."
          )
        );

      }


      showMessage(

        (
          isUpdate
            ? "✓ Home visit record updated successfully. Record ID: "
            : "✓ Home visit saved successfully. Record ID: "
        ) +
        result.recordId,

        "success"

      );


      /*
       * Keep class/session.
       * Clear the form and, if we were editing, return
       * to the plain "New Home Visit" view.
       */

      resetFormForSession(
        session
      );


      if (isUpdate) {

        showPanel(
          "new"
        );

      }


      window.scrollTo(
        {
          top: 0,
          behavior: "smooth"
        }
      );


    }

    catch (error) {

      console.error(
        error
      );


      showMessage(
        error.message,
        "error"
      );


      /*
       * If the backend says the session expired,
       * return to PIN screen.
       */

      if (
        error.message
          .toLowerCase()
          .includes(
            "session"
          )
      ) {

        setTimeout(
          logout,
          1800
        );

      }

    }

    finally {

      submitButton.disabled =
        false;


      submitButton.innerHTML =
        `
        <span>
          Submit Home Visit
        </span>

        <span>
          →
        </span>
        `;

    }

  }
);


/* =====================================================
   GET SESSION
===================================================== */

function getSession() {

  try {

    const raw =
      localStorage.getItem(
        SESSION_KEY
      );


    if (!raw) {

      return null;

    }


    const session =
      JSON.parse(
        raw
      );


    /*
     * Local expiration check.
     */

    if (
      Date.now() >=
      session.expiresAt
    ) {

      localStorage.removeItem(
        SESSION_KEY
      );

      return null;

    }


    return session;

  }

  catch (error) {

    localStorage.removeItem(
      SESSION_KEY
    );

    return null;

  }

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

  localStorage.removeItem(
    SESSION_KEY
  );


  app.classList.add(
    "hidden"
  );


  loginScreen.classList.remove(
    "hidden"
  );


  loginClass.value =
    "";


  populateLoginSections(
    ""
  );


  loginPin.value =
    "";


  loginMessage.textContent =
    "";


  loginMessage.className =
    "login-message";


  message.textContent =
    "";

  message.className =
    "message";


  /*
   * Reset the Edit Record panel/mode so the next
   * login always starts on the New Home Visit view.
   */

  newModeButton.classList.add(
    "active"
  );

  editModeButton.classList.remove(
    "active"
  );

  editPanel.classList.add(
    "hidden"
  );

  form.classList.remove(
    "hidden"
  );

  cancelEditButton.classList.add(
    "hidden"
  );

  submitMode =
    "create";

  recordIdInput.value =
    "";


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );

}


logoutButton.addEventListener(
  "click",
  function() {

    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );


    if (
      confirmLogout
    ) {

      logout();

    }

  }
);


/* =====================================================
   CHECK EXISTING SESSION
===================================================== */

function checkExistingSession() {

  const session =
    getSession();


  if (session) {

    openPortal(
      session
    );

  }

}


/* =====================================================
   START
===================================================== */

loadConfiguration()
  .then(
    checkExistingSession
  );