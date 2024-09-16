import { sendMessageToYoutubeTab } from './messageFunctions.js';

// Função para atualizar as informações da música
// export function updateSongInfo(elements) {
//     sendMessageToYoutubeTab({ command: 'getSongInfo' }, (response) => {
//         console.log('Response received:', response);
        
//         if (response.status !== 'success') {
//             console.error('Failed to get song info:', response.message);
//             setSongInfo(elements.songInfo, 'Unable to retrieve music information');
//             setSongTitle(elements.songName, 'Unknown');
//             return;
//         }

//         const { songInfo, songTitle } = response;
//         console.log('Received song info:', songInfo);
        
//         setSongInfo(elements.songInfo, songInfo || 'Unknown music and album');
//         setSongTitle(elements.songName, songTitle || 'Unknown');
//     });
// }

// // Função auxiliar para definir as informações da música
// function setSongInfo(songInfoElement, text) {
//     if (!songInfoElement) {
//         console.error('Song info element not found');
//         return;
//     }
//     songInfoElement.textContent = text;
// }

// // Função auxiliar para definir o título da música
// function setSongTitle(songNameElement, title) {
//     if (!songNameElement) {
//         console.error('Song title element not found');
//         return;
//     }
//     songNameElement.textContent = title;
// }

// export function updateSongInfo(elements) {
//     console.log('updateSongInfo called with elements:', elements);

//     if (!elements || !elements.contentWrapper) {
//         console.error('Required elements are missing');
//         return;
//     }

//     sendMessageToYoutubeTab({ command: 'getSongInfo' }, (response) => {
//         console.log('Response received in updateSongInfo:', response);
        
//         if (response.status !== 'success') {
//             console.error('Failed to get song info:', response.message);
//             updateUI(null, elements); // Chama updateUI com null para ocultar as informações
//             return;
//         }

//         const { songInfo, songName, albumArtUrl } = response;
//         console.log('Received song info:', songInfo);
        
//         // Chama updateUI com as informações recebidas
//         updateUI({
//             albumArtUrl: albumArtUrl,
//             name: songName,
//             info: songInfo,
//         }, elements);
//     });
// }

export function updateSongInfo(elements) {
    console.log('updateSongInfo called with elements:', elements);

    // Função para fazer uma única chamada ao content script
    const getSongData = (command) => {
        return new Promise((resolve) => {
            sendMessageToYoutubeTab({ command }, (response) => {
                console.log(`Response received for ${command}:`, response);
                resolve(response);
            });
        });
    };

    // Fazendo todas as chamadas em paralelo
    Promise.all([
        getSongData('getAlbumArt'),
        getSongData('getSongName'),
        getSongData('getSongInfo')
    ]).then(([albumArtResponse, songNameResponse, songInfoResponse]) => {
        if (albumArtResponse.status !== 'success' || 
            songNameResponse.status !== 'success' || 
            songInfoResponse.status !== 'success') {
            console.error('Failed to get complete song info');
            updateUI(null, elements);
            return;
        }

        const songInfo = {
            albumArtUrl: albumArtResponse.albumArtUrl,
            name: songNameResponse.songName,
            info: songInfoResponse.songInfo
        };

        console.log('Processed song info:', songInfo);
        
        updateUI(songInfo, elements);
    }).catch(error => {
        console.error('Error updating song info:', error);
        updateUI(null, elements);
    });
}

function updateUI(songInfo, elements) {
    console.log('updateUI called with:', { songInfo, elements });

    const { contentWrapper, albumArt, songName, songInfo: fullInfo } = elements;

    if (!contentWrapper) {
        console.error('Content wrapper element not found');
        return;
    }

    if (songInfo && songInfo.albumArtUrl) {
        albumArt.src = songInfo.albumArtUrl;
        songName.textContent = songInfo.name || 'Unknown Song Name';
        fullInfo.textContent = songInfo.info || 'Unknown Song Info';
        contentWrapper.classList.remove('hidden');
        console.log('UI updated with song info');
    } else {
        contentWrapper.classList.add('hidden');
        console.log('UI hidden due to lack of song info');
    }
}

export function updateAlbumArt(elements) {
    sendMessageToYoutubeTab({ command: 'getAlbumArt' }, (response) => handleAlbumArtResponse(response, elements));
}

function handleAlbumArtResponse(response, elements) {
    console.log('Album art response received:', response);

    if (response.status !== 'success') {
        console.error('Failed to get album art URL:', response.message);
        clearAlbumArt(elements.albumArt);
        return;
    }

    const { albumArtUrl } = response;

    if (!albumArtUrl) {
        clearAlbumArt(elements.albumArt);
        return;
    }

    setAlbumArt(elements.albumArt, albumArtUrl);
}

function setAlbumArt(albumArtElement, url) {
    if (!albumArtElement) {
        console.error('Album art element not found');
        return;
    }
    const cacheBuster = new Date().getTime();
    albumArtElement.src = `${url}?cb=${cacheBuster}`;
    albumArtElement.style.display = 'block';
}

function clearAlbumArt(albumArtElement) {
    if (!albumArtElement) {
        console.error('Album art element not found');
        return;
    }
    albumArtElement.src = '';
    albumArtElement.style.display = 'none';
}