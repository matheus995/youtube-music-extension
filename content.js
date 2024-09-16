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
        'previous': '//*[@class="previous-button style-scope ytmusic-player-bar"]'
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
        default:
            executeCommand(message.command, message.volume);
            sendResponse({ status: 'success' });
    }

    return true; // Mantém a conexão aberta para sendResponse assíncrono
});