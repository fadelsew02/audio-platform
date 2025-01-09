let mediaRecorder;
let audioChunks = [];
let timerInterval;
let secondsElapsed = 0;
let isRecording = false;
let isPaused = false; // Nouvelle variable pour savoir si l'enregistrement est en pause

const recordModal = document.getElementById('recordModal');
const timerDisplay = document.getElementById('timer');
const audioPlayback = document.getElementById('audio-playback');
const actionButtons = document.getElementById('action-buttons');
const stopButton = document.getElementById('stop-recording');
const deleteButton = document.getElementById('delete-recording');
const translateButton = document.getElementById('translate-recording');
const resumeButton = document.createElement('button'); 

resumeButton.textContent = 'Continuer';
resumeButton.classList.add('btn', 'btn-link');
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
            resumeButton.style.display = 'block'; // Afficher le bouton Reprendre après l'arrêt
        };

        mediaRecorder.start();
        isRecording = true;
        startTimer(); // Lancer le timer au début de l'enregistrement
    } catch (err) {
        console.error('Erreur lors de l’accès au micro:', err);
    }
}

function startTimer() {
    // Assurez-vous que le timer est lancé une seule fois au début
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
        clearInterval(timerInterval); // Arrêter le timer lorsque l'enregistrement est arrêté
    }
    isRecording = false;
    resumeButton.style.display = 'block'; // Le bouton Reprendre devient visible
    isPaused = true;  // Marquer comme en pause
}

function resumeRecording() {
    if (!isRecording && isPaused) {
        // Reprendre l'enregistrement et ne pas redémarrer le timer
        mediaRecorder.start();
        isRecording = true;
        resumeButton.style.display = 'none'; // Cacher le bouton Reprendre
        isPaused = false;

        // Redémarrer le timer si nécessaire
        if (!timerInterval) {
            startTimer();
        }
    }
}

function resetRecording() {
    audioChunks = [];
    audioPlayback.src = '';
    audioPlayback.style.display = 'none';
    actionButtons.style.display = 'none';
    timerDisplay.textContent = '0';
    clearInterval(timerInterval);
    secondsElapsed = 0; // Réinitialiser aussi le temps écoulé
    isRecording = false;
    isPaused = false;
    resumeButton.style.display = 'none'; 
    // Fermer la modale après la réinitialisation
    document.getElementById('recordModal').setAttribute('data-bs-dismiss', 'modal');  
    document.getElementById('recordModal').setAttribute('aria-label', 'Close');  
    document.getElementById('recordModal').setAttribute('class', 'btn-close');  
    location.reload();
}

async function translateAudio() {
    try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);

        const transcriptionResponse = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`
            },
            body: audioBlob
        });

        if (!transcriptionResponse.ok) {
            throw new Error("Erreur lors de la transcription de l'audio");
        }

        const transcriptionResult = await transcriptionResponse.json();
        const transcriptionText = transcriptionResult.text;

        const translationResponse = await fetch('https://api-mymachine-translation.com/translate', { // Remplacez par l'API de traduction que vous utilisez
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: transcriptionText,
                target_language: 'fr' // Choisir la langue cible (par exemple, français)
            })
        });

        if (!translationResponse.ok) {
            throw new Error("Erreur lors de la traduction");
        }

        const translationResult = await translationResponse.json();
        const translatedText = translationResult.translated_text;

        // Afficher la traduction à l'utilisateur
        alert(`Traduction : ${translatedText}`);
    } catch (error) {
        console.error('Erreur dans le processus de traduction :', error);
        alert('Une erreur s\'est produite pendant la traduction.');
    }
}


// Événements de contrôle
recordModal.addEventListener('shown.bs.modal', startRecording);
stopButton.addEventListener('click', stopRecording);
resumeButton.addEventListener('click', resumeRecording);
deleteButton.addEventListener('click', resetRecording);
translateButton.addEventListener('click', translateAudio);


