//upload script
var dropZones = document.getElementsByClassName("drop-zone");
var fileInputs = document.getElementsByClassName("file");
var urlInputs = document.getElementsByClassName("url");
var uploadIcons = document.getElementsByClassName("upload-icon");
var fileNameElements = document.getElementsByClassName("file-name");

function setCameraBlockPointerEvents(enabled) {
  var cameraBlock = document.querySelector('.camera-block');
  if (cameraBlock) {
    cameraBlock.style.pointerEvents = enabled ? 'auto' : 'none';
  }
}

function isCameraActive() {
  var cameraBlock = document.querySelector('.camera-block');
  // Replace the condition below with your actual condition to check if the camera is active
  return cameraBlock && cameraBlock.style.pointerEvents === 'none';
}

var isCameraActive = false;

var cameraBlock = document.querySelector('.camera-block');
cameraBlock.addEventListener("click", function () {
  // Set isCameraActive to true when the camera block is clicked
  isCameraActive = true;

  // Disable the file and URL inputs
  for (let i = 0; i < fileInputs.length; i++) {
    fileInputs[i].disabled = true;
    urlInputs[i].disabled = true;
  }
});

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
      if (!isCameraActive) {
        urlInput.disabled = true;
      }
      setCameraBlockPointerEvents(false);
    } else {
      fileNameElement.textContent = "";
      uploadIcon.style.display = "";
      if (!isCameraActive) {
        urlInput.disabled = false;
      }
      setCameraBlockPointerEvents(true);
    }
  });

  urlInput.addEventListener("input", function () {
    if (this.value) {
      if (!isCameraActive) {
        fileInput.disabled = true;
      }
      setCameraBlockPointerEvents(false);
    } else {
      if (!isCameraActive) {
        fileInput.disabled = false;
      }
      setCameraBlockPointerEvents(true);
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
    } else {
      // If no file is selected, hide the removeFileButton
      removeFileButton.style.display = "none";
      uploadIcon.style.display = "block";
      urlInput.disabled = false;
      setCameraBlockPointerEvents(true);
    }
  });

  removeFileButton.addEventListener("click", function (event) {
    event.stopPropagation();
    fileInput.value = "";
    fileNameElement.textContent = "";
    this.style.display = "none";
    uploadIcon.style.display = "block";
    urlInput.disabled = false;
    setCameraBlockPointerEvents(true);
  });
});

//camera script
document.querySelector('.start-camera').addEventListener('click', function () {
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
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    result.width = canvas.width;
    result.height = canvas.height;
  };

  window.addEventListener('resize', () => {
    // Update canvas dimensions to match new video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    result.width = canvas.width;
    result.height = canvas.height;
  });

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


document.getElementById('cancel').addEventListener('click', function () {
  location.reload();
});