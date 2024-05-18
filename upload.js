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
// Get all camera containers
var cameraContainers = document.getElementsByClassName("camera-container");

for (let i = 0; i < cameraContainers.length; i++) {
  let cameraContainer = cameraContainers[i];

  // Get the elements within the current camera container
  let startCameraImage =
    cameraContainer.getElementsByClassName("start-camera")[0];
  let video = cameraContainer.getElementsByClassName("video")[0];
  let captureImage = cameraContainer.getElementsByClassName("capture")[0];
  let canvas = cameraContainer.getElementsByClassName("canvas")[0];

  let stream;

  startCameraImage.addEventListener("click", function () {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Try to access the rear camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(function (mediaStream) {
          handleSuccess(mediaStream);
        })
        .catch(function (err) {
          // If accessing the front camera fails, try to access any available camera
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (mediaStream) {
              handleSuccess(mediaStream);
            })
            .catch(function (err) {
              console.error("Failed to access the camera: " + err);
            });
        });
    }

    function handleSuccess(mediaStream) {
      stream = mediaStream;
      video.srcObject = stream;
      video.setAttribute("playsinline", ""); // required on iOS
      video.muted = true; // required on iOS to autoplay
      video.play();
      video.style.display = "";
      captureImage.style.display = "";
      startCameraImage.style.display = "none";
    }
  });

  function onOpenCvReady() {
    console.log('OpenCV.js is ready');
  }

  captureImage.addEventListener("click", function () {
    var context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    // Get image data from the canvas
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Convert the image to grayscale
    let gray = new cv.Mat();
    cv.cvtColor(imageData, gray, cv.COLOR_RGBA2GRAY);

    // Use Canny edge detection
    let edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 100, 3, false);

    // Find contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Assuming the largest contour is the document, sort the contours by area and pick the largest one.
    contours.sort((a, b) => cv.contourArea(b) - cv.contourArea(a));
    let contour = contours.get(0);

    // Get the bounding rectangle of the largest contour
    let rect = cv.boundingRect(contour);

    // Crop the image
    let cropped = gray.roi(rect);

    // Convert the cropped image back to a canvas and get the data URL
    let croppedCanvas = document.createElement("canvas");
    cv.imshow(croppedCanvas, cropped);
    var data = croppedCanvas.toDataURL("image/png");

    // Send the data to the server
    fetch("upload.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Rest of your fetch code...
    });
  });
}

// Get all tab links
var tabLinks = document.getElementsByClassName("tab-link");

for (let i = 0; i < tabLinks.length; i++) {
  let tabLink = tabLinks[i];

  // Stop the camera and hide the video element when a tab link is clicked
  tabLink.addEventListener("click", function () {
    for (let j = 0; j < cameraContainers.length; j++) {
      let cameraContainer = cameraContainers[j];
      let video = cameraContainer.getElementsByClassName("video")[0];
      let stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        video.style.display = "none"; // Hide the video element
      }
    }
  });
}
