export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { script, voice } = req.body || {};

    if (!script) {
      return res.status(400).json({
        error: "Script is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Vercel"
      });
    }

    const prompt = `
You are an expert video script writer.

Improve the following video script so it is clear, engaging and suitable for a short AI video.

Voice language: ${voice || "English Voice"}

Original script:
${script}

Return only the improved script.
Do not add explanations.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed"
      });
    }

    const improvedScript =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!improvedScript) {
      return res.status(500).json({
        error: "Gemini did not return a script"
      });
    }

    return res.status(200).json({
      script: improvedScript
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
