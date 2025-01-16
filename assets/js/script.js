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
const translateButton = document.getElementById('translate-recording');
const resumeButton = document.createElement('button');
const openModalButton = document.getElementById('openModal');

resumeButton.textContent = 'Continuer';
resumeButton.classList.add('btn', 'btn-link');
resumeButton.style.display = 'none';
actionButtons.appendChild(resumeButton);

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

async function translateAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        console.log(audioBlob)
        const response = await fetch('https://speech-api-3p64.onrender.com:3001/api/submit', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Transcription result:', result);
        // Handle the transcription result here (e.g., display it on the page)
    } catch (error) {
        console.error('Error:', error);
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
translateButton.addEventListener('click', () => {
    if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        translateAudio(audioBlob);
    } else {
        console.error('No audio file to translate.');
    }
});