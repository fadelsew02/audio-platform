let mediaRecorder;
let audioChunks = [];
let timerInterval;
let secondsElapsed = 0;
let isRecording = false;

const recordModal = document.getElementById('recordModal');
const timerDisplay = document.getElementById('timer');
const audioPlayback = document.getElementById('audio-playback');
const actionButtons = document.getElementById('action-buttons');
const stopButton = document.getElementById('stop-recording');
const deleteButton = document.getElementById('delete-recording');
const translateButton = document.getElementById('translate-recording');
const resumeButton = document.createElement('button'); 

resumeButton.textContent = 'Reprendre';
resumeButton.classList.add('btn', 'btn-link');
actionButtons.appendChild(resumeButton);
// resumeButton.style.display = 'none'; 

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
            resumeButton.style.display = 'none'; 
        };

        mediaRecorder.start();
        isRecording = true;
        startTimer();
    } catch (err) {
        console.error('Erreur lors de l’accès au micro:', err);
    }
}

function startTimer() {
    secondsElapsed = 0;
    timerDisplay.textContent = secondsElapsed;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerDisplay.textContent = secondsElapsed;
    }, 1000);
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(timerInterval);
    }
    isRecording = false;
    console.log("cc1")
    resumeButton.style.display = 'block'; 
}

function resumeRecording() {
    if (!isRecording) {
        audioChunks = []; 
        mediaRecorder.start();
        isRecording = true;
        resumeButton.style.display = 'none'; 
        startTimer();
    }
}

function resetRecording() {
    audioChunks = [];
    audioPlayback.src = '';
    audioPlayback.style.display = 'none';
    actionButtons.style.display = 'none';
    timerDisplay.textContent = '0';
    clearInterval(timerInterval);
    isRecording = false;
    resumeButton.style.display = 'none'; 

    document.getElementById('recordModal').classList.add = "hide";  
}


function translateAudio() {
    alert('La traduction sera bientôt disponible.');
}

// Événements de contrôle
recordModal.addEventListener('shown.bs.modal', startRecording);
stopButton.addEventListener('click', stopRecording);
resumeButton.addEventListener('click', resumeRecording);
deleteButton.addEventListener('click', resetRecording);
translateButton.addEventListener('click', translateAudio);
