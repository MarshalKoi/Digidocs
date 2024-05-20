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
      var file = this.files[0];
      var fileSize = file.size / 1024 / 1024; // in MB

      if (fileSize > 25) {
        alert("File size exceeds 25MB. Please select a smaller file.");
        this.value = ""; // Clear the input
        return;
      }

      fileNameElement.textContent = file.name;
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

window.addEventListener("DOMContentLoaded", (event) => {
  const fileInput = document.querySelector(".file");
  const removeFileButton = document.querySelector(".remove-file");
  const fileNameElement = document.querySelector(".file-name");
  const uploadIcon = document.querySelector(".upload-icon");
  const urlInput = document.querySelector(".url"); // Use '.url' as the selector

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      fileNameElement.textContent = this.files[0].name;
      removeFileButton.style.display = "block";
      uploadIcon.style.display = "none";
      urlInput.disabled = true;
    }
  });

  removeFileButton.addEventListener("click", function (event) {
    event.stopPropagation();
    fileInput.value = "";
    fileNameElement.textContent = "";
    this.style.display = "none";
    uploadIcon.style.display = "block";
    urlInput.disabled = false;
  });
});

//camera script
document.querySelector('.start-camera').addEventListener('click', function() {
  document.getElementById('videoContainer').style.display = 'block';

  const scanner = new jscanify();
  const canvas = document.getElementById("canvas");
  const result = document.getElementById("result");
  const video = document.getElementById("video");
  const captureButton = document.getElementById('capture'); 
  const previewImage = document.getElementById('preview'); 

  function handleSuccess(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", ""); // required on iOS
    video.muted = true; // required on iOS to autoplay
    video.play();
    video.style.display = "";
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
    })
    .then(handleSuccess)
    .catch((err) => {
      console.error("Error accessing webcam: ", err);
    });

  video.onloadedmetadata = () => {
    const maxDimension = Math.min(video.videoWidth, video.videoHeight, 1024); // iOS limit
    const aspectRatio = video.videoWidth / video.videoHeight;
    if (video.videoWidth > video.videoHeight) {
      canvas.width = maxDimension;
      canvas.height = maxDimension / aspectRatio;
    } else {
      canvas.width = maxDimension * aspectRatio;
      canvas.height = maxDimension;
    }
    result.width = canvas.width;
    result.height = canvas.height;
  };

  video.onplay = () => {
    const canvasCtx = canvas.getContext("2d");
    const resultCtx = result.getContext("2d");

    setInterval(() => {
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const resultCanvas = scanner.highlightPaper(canvas);
      resultCtx.drawImage(resultCanvas, 0, 0, result.width, result.height);
    }, 100);
  };

  // Capture functionality
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const resultCanvas = scanner.extractPaper(canvas, canvas.width, canvas.height);
  const dataUrl = resultCanvas.toDataURL();
  previewImage.src = dataUrl;
});

