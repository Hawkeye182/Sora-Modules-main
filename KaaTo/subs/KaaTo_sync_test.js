// 🎯 KaaTo Módulo Síncrono - SIN llamadas HTTP, solo resultados de prueba
// Esta versión NO hace llamadas a API, solo retorna datos estáticos para probar

function searchResults(keyword) {
    console.log("🔍 [SYNC] Búsqueda síncrona para:", keyword);
    
    // Resultados de prueba que imitan la estructura real de kaa.to
    const testResults = [
        {
            title: "Bleach",
            link: "https://kaa.to/anime/bleach",
            image: "https://kaa.to/image/poster/123.webp"
        },
        {
            title: "Bleach: Thousand-Year Blood War",
            link: "https://kaa.to/anime/bleach-tybw",
            image: "https://kaa.to/image/poster/456.webp"
        },
        {
            title: "Dragon Ball Z",
            link: "https://kaa.to/anime/dragon-ball-z",
            image: "https://kaa.to/image/poster/789.webp"
        },
        {
            title: "Naruto",
            link: "https://kaa.to/anime/naruto",
            image: "https://kaa.to/image/poster/321.webp"
        },
        {
            title: "One Piece",
            link: "https://kaa.to/anime/one-piece",
            image: "https://kaa.to/image/poster/654.webp"
        }
    ];
    
    // Filtrar resultados que contengan el término de búsqueda
    const filteredResults = testResults.filter(anime => 
        anime.title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Si no hay coincidencias, mostrar todos
    const finalResults = filteredResults.length > 0 ? filteredResults : testResults;
    
    console.log("📤 [SYNC] Retornando", finalResults.length, "resultados");
    return finalResults;
}

function extractDetails(url) {
    console.log("📋 [SYNC] extractDetails para:", url);
    
    // Extraer slug de la URL
    const slug = url.split('/').pop();
    
    return {
        title: `Detalles de ${slug}`,
        description: `Esta es la descripción del anime ${slug}. Un anime épico lleno de aventuras y personajes increíbles.`,
        image: "https://kaa.to/image/poster/" + Math.floor(Math.random() * 1000) + ".webp",
        releaseDate: "2020",
        aliases: [`Alias 1 de ${slug}`, `Alias 2 de ${slug}`]
    };
}

function extractEpisodes(url) {
    console.log("📺 [SYNC] extractEpisodes para:", url);
    
    // Extraer slug de la URL
    const slug = url.split('/').pop();
    
    // Generar episodios de prueba
    const episodes = [];
    for (let i = 1; i <= 12; i++) {
        episodes.push({
            title: `${slug} - Episodio ${i}`,
            link: `${url}/episode/${i}`,
            episode: i
        });
    }
    
    return episodes;
}

function extractStreamUrl(url) {
    console.log("🎥 [SYNC] extractStreamUrl para:", url);
    
    // URL de video de prueba que funciona
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
