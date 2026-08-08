export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, script } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    if (!script) {
      return res.status(400).json({ error: "Script is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Vercel"
      });
    }

    const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid image format"
      });
    }

    const mimeType = match[1];
    const imageData = match[2];

    const prompt = `
Create a cinematic AI video based on the uploaded image.

Story/script:
${script}

Keep the main subject and visual identity from the uploaded image.
Use natural camera movement, realistic motion, cinematic lighting,
and make the scene visually match the story.
Generate synchronized audio when supported.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
              image: {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            }
          ],
          parameters: {
            aspectRatio: "16:9",
            durationSeconds: 8,
            resolution: "720p"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Veo API request failed",
        details: data
      });
    }

    if (!data.name) {
      return res.status(500).json({
        error: "Video operation was not created",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      operation: data.name,
      message: "Video generation started"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
