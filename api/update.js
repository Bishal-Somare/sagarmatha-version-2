export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      error:
        "Only POST is allowed."

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


    const body = {

      ...req.body,

      action:
        "update"

    };


    const response =
      await fetch(
        scriptUrl,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(
              body
            ),

          redirect:
            "follow"

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
