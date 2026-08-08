const btn = document.getElementById("generateBtn");
const status = document.getElementById("status");

btn.addEventListener("click", async () => {
  const imageInput = document.getElementById("image");
  const scriptInput = document.getElementById("script");
  const voiceInput = document.getElementById("voice");

  const image = imageInput.files[0];
  const script = scriptInput.value.trim();
  const voice = voiceInput.value;

  if (!image) {
    status.innerText = "❌ প্রথমে একটি ছবি নির্বাচন করুন।";
    return;
  }

  if (!script) {
    status.innerText = "❌ প্রথমে একটি স্ক্রিপ্ট লিখুন।";
    return;
  }

  btn.disabled = true;
  btn.innerText = "⏳ Processing...";
  status.innerText = "🤖 Gemini AI স্ক্রিপ্ট উন্নত করছে...";

  try {
    const response = await fetch("/api/enhance-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script: script,
        voice: voice
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    status.innerText =
      "✅ AI Script Ready!\n\n" +
      data.script +
      "\n\n🎬 পরের ধাপে Video Generation যুক্ত করা হবে।";

  } catch (error) {
    console.error(error);
    status.innerText =
      "❌ সমস্যা হয়েছে: " + error.message;
  } finally {
    btn.disabled = false;
    btn.innerText = "Generate Video";
  }
});
