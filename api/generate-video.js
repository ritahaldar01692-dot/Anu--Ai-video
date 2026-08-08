export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, script, voice } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

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

    // Convert uploaded image to base64 data
    const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid image format"
      });
    }

    const mimeType = match[1];
    const imageData = match[2];

    const prompt = `
Create a cinematic short AI video using the uploaded image as the main visual reference.

Story:
${script}

Voice language:
${voice || "English Voice"}

Instructions:
- Keep the main subject and visual identity from the uploaded image.
- Use natural realistic movement.
- Make the scene visually match the story.
- Use cinematic camera movement.
- Use realistic lighting.
- Create a smooth, engaging short video.
`;

    // Start video generation
    const generateResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
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
            resolution: "720p",
            numberOfVideos: 1
          }
        })
      }
    );

    const generateData = await generateResponse.json();

    if (!generateResponse.ok) {
      return res.status(generateResponse.status).json({
        error:
          generateData?.error?.message ||
          "Veo video generation request failed",
        details: generateData
      });
    }

    if (!generateData.name) {
      return res.status(500).json({
        error: "Video operation was not created",
        details: generateData
      });
    }

    const operationName = generateData.name;

    // Wait for the video to finish
    let operation;

    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000));

      const operationResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
        {
          method: "GET",
          headers: {
            "x-goog-api-key": apiKey
          }
        }
      );

      operation = await operationResponse.json();

      if (!operationResponse.ok) {
        return res.status(operationResponse.status).json({
          error:
            operation?.error?.message ||
            "Could not check video generation status",
          details: operation
        });
      }

      if (operation.done === true) {
        break;
      }
    }

    if (!operation || operation.done !== true) {
      return res.status(202).json({
        status: "processing",
        message:
          "Video is still generating. Please try again shortly.",
        operation: operationName
      });
    }

    if (operation.error) {
      return res.status(500).json({
        error: operation.error.message || "Video generation failed"
      });
    }

    const video =
      operation?.response?.generateVideoResponse?.generatedSamples?.[0]
        ?.video;

    if (!video) {
      return res.status(500).json({
        error: "Video was generated but no video file was returned",
        details: operation
      });
    }

    // Return generated video URL
    return res.status(200).json({
      success: true,
      videoUrl: video.uri,
      voice: voice || "English Voice"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
