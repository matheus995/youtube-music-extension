console.log('Content script loaded');

// Função para obter um elemento usando XPath
function getElementByXPath(xpath) {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

// Função para obter o URL da imagem do álbum
function getAlbumArtUrl() {
    const albumArtElement = getElementByXPath('//*[@class="image style-scope ytmusic-player-bar"]');
    return albumArtElement ? albumArtElement.getAttribute('src') : null;
}

function getSongName() {
    const songInfoElement = getElementByXPath('//*[@class="title style-scope ytmusic-player-bar"]');
    return songInfoElement ? songInfoElement.getAttribute('title') : null;
}

function getSongInfo() {
    const songInfoElement = getElementByXPath('//*[@class="byline style-scope ytmusic-player-bar complex-string"]');
    return songInfoElement ? songInfoElement.getAttribute('title') : null;
}

// Função para executar um comando (playPause, next, previous, setVolume)
function executeCommand(command, volume = null) {
    let button;
    const commandMap = {
        'playPause': '//*[@id="play-pause-button"]',
        'next': '//*[@class="next-button style-scope ytmusic-player-bar"]',
        'previous': '//*[@class="previous-button style-scope ytmusic-player-bar"]',
        'toggleMute': '//*[@class="volume style-scope ytmusic-player-bar"]'
    };

    if (command in commandMap) {
        button = getElementByXPath(commandMap[command]);

        if (button) {
            button.click();
        } else {
            console.error(`Botão de "${command}" não encontrado.`);
        }

    }
}

// Função para verificar o estado atual do botão play/pause
function getPlayerState() {
    const playPauseButton = getElementByXPath('//*[@class="play-pause-button style-scope ytmusic-player-bar"]');
    const isPlaying = playPauseButton && playPauseButton.getAttribute('title') === 'Pausar';
    const volumeButton = getElementByXPath('//*[@class="volume style-scope ytmusic-player-bar"]');
    const isMuted = volumeButton && volumeButton.getAttribute('aria-pressed') === 'true';

    return { isPlaying, isMuted };
}

// Função para simular um clique na barra de volume
function setVolume(volume) {
    const volumeSlider = document.querySelector('#volume-slider #sliderBar');
    if (volumeSlider) {
        // Calcula a posição x do clique baseado no volume desejado
        const rect = volumeSlider.getBoundingClientRect();
        const adjustedVolume = volume === 0 ? 0 : (volume / 100) * (rect.width - 1) + 1; // Ajusta para que 1 no popup corresponda a 1 no YouTube
        const x = rect.left + adjustedVolume;
        const y = rect.top + (rect.height / 2);

        // Simula os eventos de mouse
        const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });

        const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });

        // Dispara os eventos
        volumeSlider.dispatchEvent(mouseDownEvent);
        volumeSlider.dispatchEvent(mouseUpEvent);

        return true;
    }
    return false;
}

// Função para obter o volume atual
function getVolume() {
    const volumeSlider = document.querySelector('tp-yt-paper-slider#volume-slider');
    if (volumeSlider) {
        const volume = volumeSlider.getAttribute('value');
        return volume ? parseInt(volume) : 50;
    }
    return 50; // Valor padrão se não encontrar o slider
}

// Função para obter a fila de músicas
function getQueue() {
    const queueItems = document.querySelectorAll('div#contents.style-scope.ytmusic-player-queue ytmusic-player-queue-item');
    console.log('Queue items found:', queueItems.length); // Log para depuração

    const queue = Array.from(queueItems).map(item => {
        const albumArtElement = item.querySelector('.left-items.style-scope.ytmusic-player-queue-item img#img');
        const titleElement = item.querySelector('.song-info.style-scope.ytmusic-player-queue-item .song-title.style-scope.ytmusic-player-queue-item');
        const artistElement = item.querySelector('.song-info.style-scope.ytmusic-player-queue-item .byline.style-scope.ytmusic-player-queue-item');

        console.log('Album Art Element:', albumArtElement ? albumArtElement.src : 'Not found'); // Log para depuração
        console.log('Title Element:', titleElement ? titleElement.textContent : 'Not found'); // Log para depuração
        console.log('Artist Element:', artistElement ? artistElement.textContent : 'Not found'); // Log para depuração

        if (albumArtElement && titleElement && artistElement) {
            const albumArt = albumArtElement.src;
            if (!albumArt.startsWith('data:image')) { // Ignorar imagens que começam com "data:image"
                const title = titleElement.textContent;
                const artist = artistElement.textContent;
                return { albumArt, title, artist };
            }
        }
        return null;
    }).filter(item => item !== null);

    console.log('Queue:', queue); // Log para depuração
    return queue;
}

// Função para selecionar um item da fila
function selectQueueItem(index) {
    const queueItems = document.querySelectorAll('div#contents.style-scope.ytmusic-player-queue ytmusic-player-queue-item');
    if (queueItems[index]) {
        queueItems[index].click();
    }
}

// Listener de mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    if (!message.command) {
        sendResponse({ status: 'error', message: 'No command provided' });
        return true; // Mantém a conexão aberta para sendResponse assíncrono
    }

    switch (message.command) {
        case 'getAlbumArt':
            sendResponse({ status: 'success', albumArtUrl: getAlbumArtUrl() });
            break;
        case 'getSongName':
            sendResponse({ status: 'success', songName: getSongName() });
            break;
        case 'getSongInfo':
            sendResponse({ status: 'success', songInfo: getSongInfo() });
            break;
        case 'getPlayerState':
            sendResponse({ status: 'success', playerState: getPlayerState() });
            break;
        case 'setVolume':
            const success = setVolume(message.volume);
            sendResponse({ status: success ? 'success' : 'error' });
            break;
        case 'getVolume':
            sendResponse({ status: 'success', volume: getVolume() });
            break;
        case 'getQueue':
            const queue = getQueue();
            if (queue.length > 0) {
                sendResponse({ status: 'success', queue: queue });
            } else {
                sendResponse({ status: 'error', message: 'No queue items found' });
            }
            break;
        case 'selectQueueItem':
            selectQueueItem(message.index);
            sendResponse({ status: 'success' });
            break;
        default:
            executeCommand(message.command, message.volume);
            sendResponse({ status: 'success' });
    }

    return true; // Mantém a conexão aberta para sendResponse assíncrono
});