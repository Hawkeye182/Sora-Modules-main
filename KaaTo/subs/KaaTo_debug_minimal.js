// Debug ultra-simple - Solo datos estáticos garantizados
function searchResults(keyword) {
    return JSON.stringify([
        {
            title: "🔧 TEST 1: Módulo cargado correctamente",
            link: "debug://loaded",
            image: "https://via.placeholder.com/300x400/007acc/fff?text=LOADED+OK"
        },
        {
            title: "🔍 TEST 2: Keyword = " + (keyword || "vacio"),
            link: "debug://keyword", 
            image: "https://via.placeholder.com/300x400/28a745/fff?text=KEYWORD+OK"
        },
        {
            title: "🎯 TEST 3: JSON stringify funciona",
            link: "debug://json",
            image: "https://via.placeholder.com/300x400/ffc107/fff?text=JSON+OK"
        },
        {
            title: "⚡ TEST 4: Funciones básicas OK",
            link: "debug://functions",
            image: "https://via.placeholder.com/300x400/dc3545/fff?text=FUNCTIONS+OK"
        },
        {
            title: "✅ TEST 5: Debug completo funcionando",
            link: "debug://complete",
            image: "https://via.placeholder.com/300x400/20c997/fff?text=DEBUG+COMPLETE"
        }
    ]);
}

function extractDetails(url) {
    return JSON.stringify({
        title: "Debug Details",
        description: "URL: " + url,
        image: "https://via.placeholder.com/300x400/333/fff?text=DETAILS",
        releaseDate: "2024"
    });
}

function extractEpisodes(url) {
    return JSON.stringify([
        { title: "Episode 1", link: url + "/1", episode: 1 }
    ]);
}

function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p"
    });
}
