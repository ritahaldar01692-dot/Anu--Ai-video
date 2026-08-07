const generateBtn = document.getElementById("generateBtn");
const status = document.getElementById("status");

generateBtn.addEventListener("click", async () => {
  const image = document.getElementById("image").files[0];
  const text = document.getElementById("script").value.trim();

  if (!image) {
    alert("Please select an image.");
    return;
  }

  if (!text) {
    alert("Please write a script.");
    return;
  }

  status.innerHTML = "⏳ Generating video...";

  setTimeout(() => {
    status.innerHTML = "⚠️ Video API is not connected yet.";
  }, 2000);
});

document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("preview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
});
