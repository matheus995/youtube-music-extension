import { sendMessageToYoutubeTab } from './messageFunctions.js';

// export function updateAlbumArt(elements) {
//     sendMessageToYoutubeTab({ command: 'getAlbumArt' }, (response) => handleAlbumArtResponse(response, elements));
// }

// function handleAlbumArtResponse(response, elements) {
//     console.log('Album art response received:', response);

//     if (response.status !== 'success') {
//         console.error('Failed to get album art URL:', response.message);
//         clearAlbumArt(elements.albumArt);
//         return;
//     }

//     const { albumArtUrl } = response;

//     if (!albumArtUrl) {
//         clearAlbumArt(elements.albumArt);
//         return;
//     }

//     setAlbumArt(elements.albumArt, albumArtUrl);
// }

// function setAlbumArt(albumArtElement, url) {
//     if (!albumArtElement) {
//         console.error('Album art element not found');
//         return;
//     }
//     const cacheBuster = new Date().getTime();
//     albumArtElement.src = `${url}?cb=${cacheBuster}`;
//     albumArtElement.style.display = 'block';
// }

// function clearAlbumArt(albumArtElement) {
//     if (!albumArtElement) {
//         console.error('Album art element not found');
//         return;
//     }
//     albumArtElement.src = '';
//     albumArtElement.style.display = 'none';
// }