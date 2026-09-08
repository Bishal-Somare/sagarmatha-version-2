export default async function handler(req, res) {

  if (req.method !== "GET") {

    return res.status(405).json({

      success: false,

      error:
        "Only GET is allowed."

    });

  }


  try {

    const scriptUrl =
      process.env.APPS_SCRIPT_URL;


    if (!scriptUrl) {

      return res.status(500).json({

        success: false,

        error:
          "APPS_SCRIPT_URL is not configured in Vercel."

      });

    }


    const className =
      req.query.className || "";

    const section =
      req.query.section || "";

    const sessionToken =
      req.query.sessionToken || "";


    const url =
      scriptUrl +
      "?action=students" +
      "&className=" +
      encodeURIComponent(className) +
      "&section=" +
      encodeURIComponent(section) +
      "&sessionToken=" +
      encodeURIComponent(sessionToken);


    const response =
      await fetch(
        url,
        {
          method: "GET",
          redirect: "follow",
          cache: "no-store"
        }
      );


    const text =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(
          text
        );

    }

    catch (error) {

      return res.status(502).json({

        success: false,

        error:
          "Apps Script did not return JSON.",

        details:
          text.substring(
            0,
            1000
          )

      });

    }


    return res
      .status(
        response.ok
          ? 200
          : 502
      )
      .json(
        data
      );

  }

  catch (error) {

    console.error(
      error
    );


    return res.status(500).json({

      success: false,

      error:
        error.message

    });

  }

}
