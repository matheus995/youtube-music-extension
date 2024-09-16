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
    });

    elements.nextButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'next' });
    });

    elements.previousButton.addEventListener('click', () => {
        sendMessageToYoutubeTab({ command: 'previous' });
    });

    elements.volumeSlider.addEventListener('input', (event) => {
        const volume = event.target.value;
        sendMessageToYoutubeTab({ command: 'setVolume', volume: volume });
    });
}

// Função principal de inicialização
function initialize() {
    const elements = initializeDOMElements();
    addEventListeners(elements);

    // updateAlbumArt(elements);
    updateSongInfo(elements);
}

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);

// // Função para atualizar a interface
// function updateUI(songInfo) {
//     const contentWrapper = document.getElementById('content-wrapper');
//     const albumArt = document.getElementById('album-art');
//     const songTitle = document.getElementById('song-title');
//     const fullInfo = document.getElementById('full-info');

//     if (songInfo && songInfo.albumArtUrl) {
//         albumArt.src = songInfo.albumArtUrl;
//         songTitle.textContent = songInfo.title || 'Unknown Title';
//         fullInfo.textContent = songInfo.artist ? `${songInfo.artist} - ${songInfo.album || 'Unknown Album'}` : 'Unknown Artist';
//         contentWrapper.classList.remove('hidden');
//     } else {
//         contentWrapper.classList.add('hidden');
//     }
// }

// Chame esta função quando receber informações da música
// Por exemplo:
// updateUI({
//     albumArtUrl: 'https://example.com/album-art.jpg',
//     title: 'Song Title',
//     artist: 'Artist Name',
//     album: 'Album Name'
// });