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

// Recebe mensagens do popup e executa comandos
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
        default:
            executeCommand(message.command, message.volume);
            sendResponse({ status: 'success' });
    }

    return true; // Mantém a conexão aberta para sendResponse assíncrono
});