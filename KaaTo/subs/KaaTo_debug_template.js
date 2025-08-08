// Debug usando estructura del TEMPLATE oficial de Sora
async function searchResults(keyword) {
    try {
        // Resultados de debug en el formato EXACTO del template
        const results = [
            {
                title: "DEBUG 1: fetchv2 = " + (typeof fetchv2 !== 'undefined' ? 'SI' : 'NO'),
                image: "https://via.placeholder.com/300x400/007acc/white?text=fetchv2",
                href: "debug://fetchv2"
            },
            {
                title: "DEBUG 2: fetch = " + (typeof fetch !== 'undefined' ? 'SI' : 'NO'),
                image: "https://via.placeholder.com/300x400/28a745/white?text=fetch",
                href: "debug://fetch"
            },
            {
                title: "DEBUG 3: keyword = " + (keyword || 'vacio'),
                image: "https://via.placeholder.com/300x400/ffc107/black?text=keyword",
                href: "debug://keyword"
            },
            {
                title: "DEBUG 4: Promise = " + (typeof Promise !== 'undefined' ? 'SI' : 'NO'),
                image: "https://via.placeholder.com/300x400/dc3545/white?text=Promise",
                href: "debug://promise"
            },
            {
                title: "DEBUG 5: Modulo funcionando",
                image: "https://via.placeholder.com/300x400/20c997/white?text=Working",
                href: "debug://working"
            }
        ];
        
        return JSON.stringify(results);
    } catch (error) {
        console.log('Error en debug: ' + error.message);
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
    try {
        return JSON.stringify({
            title: "Debug Details",
            description: "Información de debug para URL: " + url,
            releaseDate: "2024",
            status: "Debug activo",
            genres: ["Debug", "Test"],
            image: "https://via.placeholder.com/300x400/6f42c1/white?text=Details"
        });
    } catch (error) {
        console.log('Error en extractDetails: ' + error.message);
        return JSON.stringify({});
    }
}

async function extractEpisodes(url) {
    try {
        return JSON.stringify([
            {
                title: "Debug Episode 1",
                href: url + "/episode/1",
                episode: 1
            },
            {
                title: "Debug Episode 2",
                href: url + "/episode/2", 
                episode: 2
            }
        ]);
    } catch (error) {
        console.log('Error en extractEpisodes: ' + error.message);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "1080p",
            type: "mp4",
            headers: {}
        });
    } catch (error) {
        console.log('Error en extractStreamUrl: ' + error.message);
        return JSON.stringify({});
    }
}
