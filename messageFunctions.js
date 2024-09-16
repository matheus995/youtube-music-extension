// Função para enviar mensagem para a aba do YouTube Music
export function sendMessageToYoutubeTab(message, callback) {
    console.log('Sending message to YouTube tab:', message);

    chrome.tabs.query({}, (tabs) => { // Obtemos todas as abas
        let youtubeTabFound = false;

        for (let tab of tabs) {
            // Verifica se a URL da aba corresponde ao YouTube Music
            if (tab.url && tab.url.includes("music.youtube.com")) {
                youtubeTabFound = true;

                // Envia a mensagem para a aba do YouTube Music
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                        // Chama o callback com um erro
                        if (callback) {
                            callback({ status: 'error', message: chrome.runtime.lastError.message });
                        }
                    } else {
                        // Chama o callback com a resposta recebida
                        if (callback) {
                            callback(response);
                        }
                    }
                });
                break; // Enviamos a mensagem e saímos do loop
            }
        }

        // Caso nenhuma aba do YouTube Music seja encontrada
        if (!youtubeTabFound) {
            console.warn('YouTube Music tab not found.');
            // Chama o callback com um erro
            if (callback) {
                callback({ status: 'error', message: 'YouTube Music tab not found.' });
            }
        }
    });
}