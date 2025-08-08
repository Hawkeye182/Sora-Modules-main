// 🐛 Debug usando el formato EXACTO que funcionó antes
function searchResults(keyword) {
    // Usando la MISMA estructura que KaaTo_test_final.js que sí funcionó
    const debugResults = [
        {
            title: "🔧 DEBUG 1: fetchv2 = " + (typeof fetchv2 !== 'undefined' ? 'SI' : 'NO'),
            link: "debug://fetchv2",
            image: "https://kaa.to/image/poster/debug1.webp"
        },
        {
            title: "🌐 DEBUG 2: fetch = " + (typeof fetch !== 'undefined' ? 'SI' : 'NO'),
            link: "debug://fetch",
            image: "https://kaa.to/image/poster/debug2.webp"
        },
        {
            title: "🔍 DEBUG 3: Keyword = " + (keyword || 'vacio'),
            link: "debug://keyword",
            image: "https://kaa.to/image/poster/debug3.webp"
        },
        {
            title: "⚡ DEBUG 4: Promise = " + (typeof Promise !== 'undefined' ? 'SI' : 'NO'),
            link: "debug://promise",
            image: "https://kaa.to/image/poster/debug4.webp"
        },
        {
            title: "✅ DEBUG 5: Modulo funcionando correctamente",
            link: "debug://working",
            image: "https://kaa.to/image/poster/debug5.webp"
        }
    ];
    
    return JSON.stringify(debugResults);
}

function extractDetails(url) {
    return JSON.stringify({
        title: "Debug Details",
        description: "URL: " + url,
        releaseDate: "2024",
        status: "Debug",
        genres: ["Debug", "Test"]
    });
}

function extractEpisodes(url) {
    return JSON.stringify([
        {
            title: "Debug Episode 1",
            link: url + "/episode/1",
            episode: 1
        }
    ]);
}

function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        type: "mp4"
    });
}
