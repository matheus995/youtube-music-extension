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
        // Alternar o ícone imediatamente
        const isCurrentlyPlaying = elements.playPauseButton.querySelector('.pause-icon').style.display === 'inline-block';
        updatePlayPauseIcon(elements.playPauseButton, !isCurrentlyPlaying);

        sendMessageToYoutubeTab({ command: 'playPause' }, (response) => {
            if (response.status === 'success') {
                // Atualizar o estado do player após um breve delay
                setTimeout(() => updatePlayerState(elements), 300);
            } else {
                // Se houver um erro, reverter o ícone
                updatePlayPauseIcon(elements.playPauseButton, isCurrentlyPlaying);
            }
        });
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
        // Alternar o ícone imediatamente
        const isCurrentlyMuted = elements.volumeButton.querySelector('.mute-icon').style.display === 'inline-block';
        updateVolumeIcon(elements.volumeButton, !isCurrentlyMuted);

        sendMessageToYoutubeTab({ command: 'toggleMute' }, (response) => {
            if (response.status === 'success') {
                // Atualizar o estado do player após um breve delay
                setTimeout(() => updatePlayerState(elements), 300);
            } else {
                // Se houver um erro, reverter o ícone
                updateVolumeIcon(elements.volumeButton, isCurrentlyMuted);
            }
        });
    });

    elements.volumeSlider.addEventListener('input', (event) => {
        const volume = event.target.value;
        sendMessageToYoutubeTab({ command: 'setVolume', volume: parseInt(volume) }, (response) => {
            if (response.status === 'success') {
                updateVolumeIcon(elements.volumeButton, volume !== '0');
            } else {
                console.error('Failed to set volume');
            }
        });
    });
}

function updatePlayerState(elements) {
    sendMessageToYoutubeTab({ command: 'getPlayerState' }, (response) => {
        if (response.status === 'success') {
            const { isPlaying, isMuted } = response.playerState;
            updatePlayPauseIcon(elements.playPauseButton, isPlaying);
            updateVolumeIcon(elements.volumeButton, !isMuted);
            
            // Obter o volume atual
            sendMessageToYoutubeTab({ command: 'getVolume' }, (volumeResponse) => {
                if (volumeResponse.status === 'success') {
                    elements.volumeSlider.value = volumeResponse.volume;
                }
            });
        }
    });
}

function updatePlayPauseIcon(button, isPlaying) {
    const playIcon = button.querySelector('.play-icon');
    const pauseIcon = button.querySelector('.pause-icon');
    
    playIcon.style.display = isPlaying ? 'none' : 'inline-block';
    pauseIcon.style.display = isPlaying ? 'inline-block' : 'none';
}

function updateVolumeIcon(button, isNotMuted) {
    const volumeIcon = button.querySelector('.volume-icon');
    const muteIcon = button.querySelector('.mute-icon');
    
    volumeIcon.style.display = isNotMuted ? 'inline-block' : 'none';
    muteIcon.style.display = isNotMuted ? 'none' : 'inline-block';
}

// Função principal de inicialização
function initialize() {
    const elements = initializeDOMElements();
    addEventListeners(elements);

    updateSongInfo(elements);
    updatePlayerState(elements);
}

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);