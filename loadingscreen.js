// Select the form, loading screen, and loading message
const form = document.querySelector('.Input-form');
const loadingScreen = document.querySelector('.loading-screen');
const loadingMessage = document.querySelector('.loading-message');

// Add an event listener for the custom 'detectionFailed' event at the beginning of loadingscreen.js
document.addEventListener('detectionFailed', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Do not display the loading screen or message
  loadingScreen.style.display = 'none';
  loadingMessage.style.display = 'none';
  
  // Optionally, you can display the form again if it was hidden
  form.style.display = 'block';
});

// Set the source of the loading screen GIF
loadingScreen.src = 'computerloading.gif';

// Add an event listener for the form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Hide the form and show the loading screen and message
  form.style.display = 'none';
  loadingScreen.style.display = 'block';
  loadingMessage.style.display = 'block';

  // Set a timeout for 200 seconds (200000 milliseconds)
  setTimeout(() => {
    // Check if the loading screen is still visible
    if (loadingScreen.style.display === 'block') {
      alert('Timeout! The operation took too long and has been canceled.');
      // Hide the loading screen and message, show the form again
      loadingScreen.style.display = 'none';
      loadingMessage.style.display = 'none';
      form.style.display = 'block';
      
      // Optionally, you can also reset the form or perform other cleanup actions here
    }
  }, 200000); // 200 seconds in milliseconds
});

// Create a mutation observer to watch for changes in the api-output-container
const observer = new MutationObserver((mutationsList, observer) => {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        loadingScreen.style.display = 'none';
        form.style.display = 'block';
        loadingMessage.style.display = 'none';
      }
    }
  });
  
  // Start observing the api-output-container for configured mutations
  observer.observe(document.querySelector('#api-output-container'), { childList: true });