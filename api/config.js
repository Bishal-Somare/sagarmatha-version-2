export default async function handler(req, res) {

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


    const response =
      await fetch(
        scriptUrl +
          "?action=config",
        {
          method: "GET",
          redirect: "follow",
          cache: "no-store"
        }
      );


    const text =
      await response.text();


    if (!response.ok) {

      return res.status(502).json({

        success: false,

        error:
          "Apps Script HTTP " +
          response.status,

        details:
          text.substring(
            0,
            1000
          )

      });

    }


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
      .status(200)
      .json(data);

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