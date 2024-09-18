import { sendMessageToYoutubeTab } from './messageFunctions.js';

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