// Debug usando EXACTAMENTE el formato que funcionó
function searchResults(keyword) {
    const testResults = [
        {
            title: "DEBUG 1: fetchv2 = " + (typeof fetchv2 !== 'undefined' ? 'SI' : 'NO'),
            link: "https://kaa.to/anime/debug-fetchv2",
            image: "https://kaa.to/image/poster/debug1.webp"
        },
        {
            title: "DEBUG 2: fetch = " + (typeof fetch !== 'undefined' ? 'SI' : 'NO'),
            link: "https://kaa.to/anime/debug-fetch",
            image: "https://kaa.to/image/poster/debug2.webp"
        },
        {
            title: "DEBUG 3: keyword = " + (keyword || 'vacio'),
            link: "https://kaa.to/anime/debug-keyword",
            image: "https://kaa.to/image/poster/debug3.webp"
        },
        {
            title: "DEBUG 4: Promise = " + (typeof Promise !== 'undefined' ? 'SI' : 'NO'),
            link: "https://kaa.to/anime/debug-promise",
            image: "https://kaa.to/image/poster/debug4.webp"
        },
        {
            title: "DEBUG 5: console = " + (typeof console !== 'undefined' ? 'SI' : 'NO'),
            link: "https://kaa.to/anime/debug-console",
            image: "https://kaa.to/image/poster/debug5.webp"
        }
    ];
    
    return JSON.stringify(testResults);
}

function extractDetails(url) {
    return JSON.stringify({
        title: "Debug Anime",
        description: "Debug information for: " + url,
        releaseDate: "2024",
        status: "ongoing",
        genres: ["Debug", "Test"],
        otherTitles: ["Debug Module"],
        image: "https://kaa.to/image/poster/debug.webp"
    });
}

function extractEpisodes(url) {
    return JSON.stringify([
        {
            title: "Debug Episode 1",
            link: url + "/episode/1",
            episode: 1
        },
        {
            title: "Debug Episode 2", 
            link: url + "/episode/2",
            episode: 2
        }
    ]);
}

function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        type: "mp4",
        headers: {}
    });
}