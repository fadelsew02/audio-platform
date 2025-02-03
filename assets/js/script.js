let secondsElapsed = 0;
let isRecording = false;
let isPaused = false;
let mediaRecorder;
let audioChunks = [];
let timerInterval;

const recordModal = document.getElementById('recordModal');
const timerDisplay = document.getElementById('timer');
const audioPlayback = document.getElementById('audio-playback');
const actionButtons = document.getElementById('action-buttons');
const stopButton = document.getElementById('stop-recording');
const deleteButton = document.getElementById('delete-recording');
const translateButton = document.querySelectorAll('.translate-recording');
const resumeButton = document.createElement('button');
const openModalButton = document.getElementById('openModal');

resumeButton.textContent = 'Continuer';
resumeButton.classList.add('btn', 'btn-link');
resumeButton.style.display = 'none';
actionButtons.appendChild(resumeButton);

function showLoader() {
    const aboutSection = document.getElementById('about');
    const loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'loader-overlay';
    loaderOverlay.innerHTML = '<div class="spinner"></div>';
    aboutSection.style.position = 'relative';
    aboutSection.appendChild(loaderOverlay);
}

function hideLoader() {
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.remove();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioURL;
            audioPlayback.style.display = 'block';
            actionButtons.style.display = 'flex';
            resumeButton.style.display = 'block';
        };

        mediaRecorder.start();
        isRecording = true;
        startTimer();
    } catch (err) {
        console.error('Erreur lors de l’accès au micro:', err);
    }
}


function playAudio(event) {
    const file = event.target.files[0]; 
    if (file) {
        const audioPlayer = document.getElementById('audioPlayer');
        const fileURL = URL.createObjectURL(file); 
        audioPlayer.src = fileURL; 
        document.getElementById('transcribeButton').style.display = 'block';

        const transcribeButton = document.getElementById('transcribeButton');
        transcribeButton.onclick = () => {
            translateAudio(file, true);
        };
    }
}



function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerDisplay.textContent = secondsElapsed;
        }, 1000);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(timerInterval);
        timerInterval = null;
        isRecording = false;
        isPaused = true;
    }
}

function deleteRecording() {
    audioChunks = [];
    audioPlayback.src = '';
    audioPlayback.style.display = 'none';
    actionButtons.style.display = 'none';
    resumeButton.style.display = 'none';
    clearInterval(timerInterval);
    timerInterval = null;
    secondsElapsed = 0;
    timerDisplay.textContent = secondsElapsed;
}

async function translateAudio(audioBlob, upload = false) {
    showLoader();
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        console.log(audioBlob)
        console.log("cc12")
        document.getElementById('about').style.display = 'block';
        document.getElementById('recordedAudio').src = URL.createObjectURL(audioBlob);
        document.getElementById('recordedAudio').style.display = 'block';
        document.getElementById('transcription-text').readOnly = true;
        if(!upload){
            // Fermer la modale
            const modal = document.getElementById('recordModal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
        }

        const response = await fetch('http://127.0.0.1:8000/transcriber/api/transcribe/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Transcription result:', result);
        document.getElementById('transcription-text').value = result.message;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('transcription-text').value = result.message;
    } finally {
        hideLoader(); 
    }
}

resumeButton.addEventListener('click', () => {
    if (isPaused) {
        startRecording();
        isPaused = false;
        resumeButton.style.display = 'none';
    }
});

stopButton.addEventListener('click', stopRecording);
deleteButton.addEventListener('click', deleteRecording);
// translateButton.addEventListener('click', () => {
//     if (audioChunks.length > 0) {
//         const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//         translateAudio(audioBlob);
//     } else {
//         console.error('No audio file to translate.');
//     }
// });

translateButton.forEach((element) => {
    element.addEventListener('click', () => {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            translateAudio(audioBlob);
        } else {
            console.error('No audio file to translate.');
        }
    });
})


document.addEventListener('DOMContentLoaded', function() {

    const modal = document.getElementById('recordModal');

    modal.addEventListener('hidden.bs.modal', function () {
      document.getElementById('about').style.display = 'block'
      setTimeout(() => {
        document.getElementById('about').scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    });
  });

document.getElementById('edit-icon').addEventListener('click', () => {
    const textarea = document.getElementById('transcription-text');
    textarea.readOnly = !textarea.readOnly;
    if (!textarea.readOnly) {
        textarea.focus();
    }
});







// document.getElementById('translate-icon').addEventListener('click', translateToGun);

// function translateToGun() {
//     const textToTranslate = document.getElementById('transcription-text').value;

//     if (!textToTranslate) {
//         alert("Aucun texte disponible pour la traduction.");
//         return;
//     }

//     // Simulation d'appel à une API de traduction
//     console.log("Traduction vers le Gun en cours...");

//     fetch('http://127.0.0.1:8000/transcriber/api/translate-to-gun/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: textToTranslate })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.translatedText) {
//             document.getElementById('transcription-text').value = data.translatedText;
//         } else {
//             alert("Erreur de traduction.");
//         }
//     })
//     .catch(error => {
//         console.error('Erreur de traduction:', error);
//         alert("Impossible de traduire pour le moment.");
//     });
// }
