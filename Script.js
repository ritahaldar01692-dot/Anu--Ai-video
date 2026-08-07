const generateBtn = document.getElementById("generateBtn");
const status = document.getElementById("status");

generateBtn.addEventListener("click", function () {

  const image = document.getElementById("image").files[0];
  const text = document.getElementById("script").value.trim();
  const voice = document.getElementById("voice").value;

  if (!image) {
    alert("Please select an image.");
    return;
  }

  if (!text) {
    alert("Please write a script.");
    return;
  }

  status.innerHTML = "⏳ Processing...";

  setTimeout(function () {

    status.innerHTML = "✅ Voice Started";

    const speech = new SpeechSynthesisUtterance(text);

    if (voice === "Hindi Voice") {
      speech.lang = "hi-IN";
    } else if (voice === "Bengali Voice") {
      speech.lang = "bn-BD";
    } else {
      speech.lang = "en-US";
    }

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
speech.onstart = function () {
  status.innerHTML = "🔊 Speaking...";
};

speech.onerror = function (e) {
  status.innerHTML = "❌ Error: " + e.error;
};
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

  }, 1000);

});
document.getElementById("image").onchange = function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    document.getElementById("preview").src = e.target.result;
    document.getElementById("preview").style.display = "block";
  };

  reader.readAsDataURL(file);
};