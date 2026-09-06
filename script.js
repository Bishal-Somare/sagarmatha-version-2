/* =====================================================
   HOME VISIT SYSTEM - FRONTEND
   ===================================================== */


/* =====================================================
   ELEMENTS
   ===================================================== */

const classSelect =
  document.getElementById(
    "className"
  );


const sectionSelect =
  document.getElementById(
    "section"
  );


const pinInput =
  document.getElementById(
    "pin"
  );


const unlockButton =
  document.getElementById(
    "unlockButton"
  );


const accessCard =
  document.getElementById(
    "accessCard"
  );


const formCard =
  document.getElementById(
    "formCard"
  );


const form =
  document.getElementById(
    "homeVisitForm"
  );


const message =
  document.getElementById(
    "message"
  );


const selectedClassBadge =
  document.getElementById(
    "selectedClassBadge"
  );


const formClass =
  document.getElementById(
    "formClass"
  );


const formSection =
  document.getElementById(
    "formSection"
  );


const submitButton =
  document.getElementById(
    "submitButton"
  );


/* =====================================================
   STORE CONFIG
   ===================================================== */

let classConfiguration = {};


/* =====================================================
   MESSAGE
   ===================================================== */

function showMessage(
  text,
  type = "info"
) {

  message.textContent =
    text;

  message.className =
    "message show " +
    type;

}


function hideMessage() {

  message.textContent =
    "";

  message.className =
    "message";

}


/* =====================================================
   LOAD CLASSES
   ===================================================== */

async function loadConfiguration() {

  try {

    showMessage(
      "Loading classes...",
      "info"
    );


    classSelect.disabled =
      true;

    sectionSelect.disabled =
      true;

    pinInput.disabled =
      true;

    unlockButton.disabled =
      true;


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
        "Unable to load class configuration."
      );

    }


    classConfiguration =
      result.classes || {};


    populateClasses();


    showMessage(
      "Classes loaded successfully.",
      "success"
    );


    setTimeout(
      hideMessage,
      1800
    );

  }

  catch (error) {

    console.error(error);


    showMessage(
      "Unable to load Class/Section: " +
      error.message,
      "error"
    );


    classSelect.disabled =
      true;

  }

}


/* =====================================================
   POPULATE CLASSES
   ===================================================== */

function populateClasses() {

  classSelect.innerHTML =
    "";


  const defaultOption =
    document.createElement(
      "option"
    );


  defaultOption.value =
    "";


  defaultOption.textContent =
    "Select Class";


  classSelect.appendChild(
    defaultOption
  );


  const classes =
    Object.keys(
      classConfiguration
    );


  classes.forEach(
    function(className) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        className;


      option.textContent =
        className;


      classSelect.appendChild(
        option
      );

    }
  );


  classSelect.disabled =
    classes.length === 0;


  sectionSelect.innerHTML =
    "<option value=''>Select Section</option>";


  sectionSelect.disabled =
    true;

}


/* =====================================================
   CLASS CHANGE
   ===================================================== */

classSelect.addEventListener(
  "change",
  function() {

    const selectedClass =
      classSelect.value;


    sectionSelect.innerHTML =
      "";


    pinInput.value =
      "";


    pinInput.disabled =
      true;


    unlockButton.disabled =
      true;


    if (!selectedClass) {

      sectionSelect.innerHTML =
        "<option value=''>Select Section</option>";

      sectionSelect.disabled =
        true;

      return;

    }


    const sections =
      classConfiguration[
        selectedClass
      ] || [];


    const defaultOption =
      document.createElement(
        "option"
      );


    defaultOption.value =
      "";


    defaultOption.textContent =
      "Select Section";


    sectionSelect.appendChild(
      defaultOption
    );


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


        sectionSelect.appendChild(
          option
        );

      }
    );


    sectionSelect.disabled =
      sections.length === 0;

  }
);


/* =====================================================
   SECTION CHANGE
   ===================================================== */

sectionSelect.addEventListener(
  "change",
  function() {

    pinInput.value =
      "";


    const selectedSection =
      sectionSelect.value;


    pinInput.disabled =
      !selectedSection;


    unlockButton.disabled =
      !selectedSection;


    if (selectedSection) {

      pinInput.focus();

    }

  }
);


/* =====================================================
   PIN ENTER
   ===================================================== */

pinInput.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      if (
        !unlockButton.disabled
      ) {

        verifyPin();

      }

    }

  }
);


/* =====================================================
   VERIFY PIN
   ===================================================== */

async function verifyPin() {

  const className =
    classSelect.value;


  const section =
    sectionSelect.value;


  const pin =
    pinInput.value.trim();


  if (!className) {

    showMessage(
      "Please select a class.",
      "error"
    );

    return;

  }


  if (!section) {

    showMessage(
      "Please select a section.",
      "error"
    );

    return;

  }


  if (!pin) {

    showMessage(
      "Please enter the PIN.",
      "error"
    );

    pinInput.focus();

    return;

  }


  unlockButton.disabled =
    true;


  unlockButton.textContent =
    "Checking PIN...";


  try {

    const response =
      await fetch(
        "/api/submit",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              action:
                "verifyPin",

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
        "Incorrect PIN."
      );

    }


    /* ---------------------------------------------
       UNLOCK
       --------------------------------------------- */

    formClass.value =
      className;


    formSection.value =
      section;


    selectedClassBadge.textContent =
      className +
      " • " +
      section;


    accessCard.classList.add(
      "hidden"
    );


    formCard.classList.remove(
      "hidden"
    );


    showMessage(
      "",
      "success"
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }

  catch (error) {

    console.error(error);


    showMessage(
      error.message,
      "error"
    );


    pinInput.select();

  }

  finally {

    unlockButton.disabled =
      false;


    unlockButton.textContent =
      "🔓 Unlock Form";

  }

}


/* =====================================================
   UNLOCK BUTTON
   ===================================================== */

unlockButton.addEventListener(
  "click",
  verifyPin
);


/* =====================================================
   FORM SUBMISSION
   ===================================================== */

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    if (
      !formClass.value ||
      !formSection.value
    ) {

      alert(
        "Class and Section are required."
      );

      return;

    }


    submitButton.disabled =
      true;


    submitButton.textContent =
      "Saving Home Visit...";


    try {

      const formData =
        new FormData(form);


      const data =
        {};


      formData.forEach(
        function(value, key) {

          data[key] =
            value;

        }
      );


      /*
       * Include PIN so the backend
       * verifies it again before saving.
       */

      data.pin =
        pinInput.value;


      const response =
        await fetch(
          "/api/submit",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(data)

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
          "Unable to save home visit."
        );

      }


     const recordId =
  result.recordId ||
  result.data?.recordId ||
  "Generated successfully";

alert(
  "Home visit saved successfully!\n\n" +
  "Record ID: " +
  recordId
);

      form.reset();


      formClass.value =
        classSelect.value;


      formSection.value =
        sectionSelect.value;


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }

    catch (error) {

      console.error(error);


      alert(
        "Unable to save home visit:\n\n" +
        error.message
      );

    }

    finally {

      submitButton.disabled =
        false;


      submitButton.textContent =
        "Submit Home Visit";

    }

  }
);


/* =====================================================
   START
   ===================================================== */

loadConfiguration();