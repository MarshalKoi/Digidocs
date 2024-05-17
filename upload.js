//upload script
var dropZones = document.getElementsByClassName("drop-zone");
var fileInputs = document.getElementsByClassName("file");
var urlInputs = document.getElementsByClassName("url");
var uploadIcons = document.getElementsByClassName("upload-icon");
var fileNameElements = document.getElementsByClassName("file-name");

for (let i = 0; i < dropZones.length; i++) {
  let dropZone = dropZones[i];
  let fileInput = fileInputs[i];
  let urlInput = urlInputs[i];
  let uploadIcon = uploadIcons[i];
  let fileNameElement = fileNameElements[i];

  dropZone.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
      fileNameElement.textContent = this.files[0].name;
      uploadIcon.style.display = "none";
      urlInput.disabled = true;
    } else {
      fileNameElement.textContent = "";
      uploadIcon.style.display = "";
      urlInput.disabled = false;
    }
  });

  urlInput.addEventListener("input", function () {
    if (this.value) {
      fileInput.disabled = true;
      dropZone.style.pointerEvents = "none";
    } else {
      fileInput.disabled = false;
      dropZone.style.pointerEvents = "";
    }
  });

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.background = "#f0f0f0";
  });

  dropZone.addEventListener("dragleave", function (e) {
    this.style.background = "none";
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.background = "none";
    fileInput.files = e.dataTransfer.files;
    fileNameElement.textContent = e.dataTransfer.files[0].name;
    uploadIcon.style.display = "none";
    urlInput.disabled = true;
  });
}

//camera script
var startCameraImage = document.getElementById("start-camera");
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var captureImage = document.getElementById("capture");

startCameraImage.addEventListener("click", function () {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
        video.style.display = "";
        captureImage.style.display = "";
        startCameraImage.style.display = "none";
      });
  }
});

captureImage.addEventListener("click", function () {
  var context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 640, 480);
  var data = canvas.toDataURL("image/png");
  // Send the data to the server
  fetch("upload.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: data }),
  }).then(function (response) {
    if (response.ok) {
      console.log("Image was captured and sent to the server");
    } else {
      console.error("Failed to send image to the server");
    }
  });
});
