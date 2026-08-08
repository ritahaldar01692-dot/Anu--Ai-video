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
    status.innerText = "❌ প্রথমে একটি Script লিখুন।";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Processing...";
  status.innerText = "🤖 Gemini AI Script তৈরি করছে...";

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

    if (data.script) {
      scriptInput.value = data.script;
      status.innerText =
        "✅ Script প্রস্তুত! এখন Video Generation-এর পরের ধাপ যোগ করব।";
    } else {
      throw new Error("Gemini কোনো script ফেরত দেয়নি।");
    }

  } catch (error) {
    console.error(error);
    status.innerText = "❌ Error: " + error.message;
  }

  btn.disabled = false;
  btn.innerText = "Generate Video";
});
