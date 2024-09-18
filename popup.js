// import { updateAlbumArt } from './albumFunctions.js';
import { updateSongInfo } from './songFunctions.js';
import { sendMessageToYoutubeTab } from './messageFunctions.js';

// Função para inicializar os elementos do DOM
function initializeDOMElements() {
    return {
        contentWrapper: document.getElementById('content-wrapper'),
        playPauseButton: document.getElementById('play-pause'),
        previousButton: document.getElementById('previous'),
        nextButton: document.getElementById('next'),
        volumeButton: document.getElementById('volume-button'),
        volumeSlider: document.getElementById('volume-slider'),
        albumArt: document.getElementById('album-art'),
        songName: document.getElementById('song-title'),
        songInfo: document.getElementById('full-info')
    };
}

// Função para adicionar event listeners
function addEventListeners(elements) {
    elements.playPauseButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'playPause' });
        togglePlayPauseIcon(elements.playPauseButton);
    });

    elements.nextButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'next' });
        // Atualiza as informações da música após um breve delay
        setTimeout(() => updateSongInfo(elements), 500);
    });

    elements.previousButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'previous' });
        // Atualiza as informações da música após um breve delay
        setTimeout(() => updateSongInfo(elements), 500);
    });

    elements.volumeButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'toggleMute' });
        toggleVolumeIcon(elements.volumeButton);
    });

    elements.volumeSlider.addEventListener('input', (event) => {
        const volume = event.target.value;
        sendMessageToYoutubeTab({ command: 'setVolume', volume: volume });
        updateVolumeIcon(elements.volumeButton, volume);
    });
}

function togglePlayPauseIcon(button) {
    const playIcon = button.querySelector('.play-icon');
    const pauseIcon = button.querySelector('.pause-icon');
    
    if (playIcon.style.display === 'none') {
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
    }
}

function toggleVolumeIcon(button) {
    const volumeIcon = button.querySelector('.volume-icon');
    const muteIcon = button.querySelector('.mute-icon');
    
    if (volumeIcon.style.display === 'none') {
        volumeIcon.style.display = 'inline-block';
        muteIcon.style.display = 'none';
    } else {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'inline-block';
    }
}

function updateVolumeIcon(button, volume) {
    const volumeIcon = button.querySelector('.volume-icon');
    const muteIcon = button.querySelector('.mute-icon');
    
    if (volume === '0') {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'inline-block';
    } else {
        volumeIcon.style.display = 'inline-block';
        muteIcon.style.display = 'none';
    }
}

// Função principal de inicialização
function initialize() {
    const elements = initializeDOMElements();
    addEventListeners(elements);

    updateSongInfo(elements);
}

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);
