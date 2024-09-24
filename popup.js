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
        songInfo: document.getElementById('full-info'),
        expandQueueButton: document.getElementById('expand-queue'),
        collapseQueueButton: document.getElementById('collapse-queue'),
        queueList: document.getElementById('queue-list')
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
        updateVolumeSliderBackground(elements.volumeSlider, volume);
        sendMessageToYoutubeTab({ command: 'setVolume', volume: parseInt(volume) }, (response) => {
            if (response.status === 'success') {
                updateVolumeIcon(elements.volumeButton, volume !== '0');
            } else {
                console.error('Failed to set volume');
            }
        });
    });

    elements.expandQueueButton.addEventListener('click', () => {
        console.log('Expand queue button clicked'); // Log para depuração
        sendMessageToYoutubeTab({ command: 'getQueue' }, (response) => {
            console.log('Response from getQueue:', response); // Log para depuração
            if (response.status === 'success') {
                displayQueue(response.queue, elements.queueList);
                elements.expandQueueButton.classList.add('hidden');
                elements.collapseQueueButton.classList.remove('hidden');
                elements.queueList.style.display = 'block'; // Mostrar a lista de músicas
                adjustPopupHeight(true); // Ajustar a altura do popup para expandir
                localStorage.setItem('queueExpanded', 'true'); // Salvar estado de expansão
            } else {
                console.error('Failed to get queue:', response.message);
            }
        });
    });

    elements.collapseQueueButton.addEventListener('click', () => {
        elements.queueList.style.display = 'none';
        elements.expandQueueButton.classList.remove('hidden');
        elements.collapseQueueButton.classList.add('hidden');
        adjustPopupHeight(false); // Ajustar a altura do popup para recolher
        localStorage.setItem('queueExpanded', 'false'); // Salvar estado de recolhimento
    });
}

function updateVolumeSliderBackground(volumeSlider, volume) {
    const percentage = volume + '%';
    volumeSlider.style.background = `linear-gradient(to right, #ff0000 0%, #ff0000 ${percentage}, #4d4d4d ${percentage}, #4d4d4d 100%)`;
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
                    updateVolumeSliderBackground(elements.volumeSlider, volumeResponse.volume);
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

function displayQueue(queue, queueList) {
    queueList.innerHTML = '';
    queue.forEach((item, index) => {
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <img src="${item.albumArt}" alt="Album Art">
            <div class="info">
                <div class="title">${item.title}</div>
                <div class="artist">${item.artist}</div>
            </div>
        `;
        queueItem.addEventListener('click', () => {
            sendMessageToYoutubeTab({ command: 'selectQueueItem', index: index });
        });
        queueList.appendChild(queueItem);
    });
}

function adjustPopupHeight(expand) {
    const popup = document.documentElement;
    if (expand) {
        popup.style.height = '364px'; // Altura expandida
    } else {
        popup.style.height = '122px'; // Altura original
    }
}

// Função principal de inicialização
function initialize() {
    const elements = initializeDOMElements();
    addEventListeners(elements);

    updateSongInfo(elements);
    updatePlayerState(elements);

    // Verificar estado de expansão/recolhimento salvo
    const queueExpanded = localStorage.getItem('queueExpanded') === 'true';
    if (queueExpanded) {
        elements.expandQueueButton.classList.add('hidden');
        elements.collapseQueueButton.classList.remove('hidden');
        elements.queueList.style.display = 'block';
        adjustPopupHeight(true);
        // Carregar a fila de músicas ao inicializar se expandido
        sendMessageToYoutubeTab({ command: 'getQueue' }, (response) => {
            if (response.status === 'success') {
                displayQueue(response.queue, elements.queueList);
            } else {
                console.error('Failed to get queue:', response.message);
            }
        });
    } else {
        elements.expandQueueButton.classList.remove('hidden');
        elements.collapseQueueButton.classList.add('hidden');
        elements.queueList.style.display = 'none';
        adjustPopupHeight(false);
    }
}

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);