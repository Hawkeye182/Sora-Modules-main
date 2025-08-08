// Script de prueba para verificar la extracción de episodios

// HTML simulado más realista de la página del reproductor con episodios
const episodePageHTML = `
     [](https://kaa.to/)        PREVFAVORITEDOWNLOADNEXTREPORT SERVER:VIDSTREAMING    Sub/Dub English (DUB)   Page 01-06    EP Num  Episodes     
     
     EP 01    PLAYING  href="/dan-da-dan-season-2-9686/ep-1-0b3b12"    
     EP 02  href="/dan-da-dan-season-2-9686/ep-2-abc123"    
     EP 03  href="/dan-da-dan-season-2-9686/ep-3-def456"    
     EP 04  href="/dan-da-dan-season-2-9686/ep-4-ghi789"    
     EP 05  href="/dan-da-dan-season-2-9686/ep-5-jkl012"    
     EP 06  href="/dan-da-dan-season-2-9686/ep-6-mno345"
     
     [](https://kaa.to/dan-da-dan-season-2-9686) 
`;

console.log("=== PRUEBA DE EXTRACCIÓN DE EPISODIOS ===");
console.log();

const episodes = [];

// Probar los patrones de episodios del módulo
const episodeListPatterns = [
    // Patrón principal para episodios
    /EP\s*(\d+)[\s\S]*?href="([^"]*\/ep-\d+-[^"]*)"/g,
    // Patrón alternativo
    /href="([^"]*\/ep-(\d+)-[^"]*)"[^>]*>[\s\S]*?EP\s*\d+/g,
    // Patrón directo de enlaces
    /href="([^"]*\/ep-(\d+)-[^"]*)"/g
];

console.log("Probando patrones de regex...");

for (let i = 0; i < episodeListPatterns.length; i++) {
    const pattern = episodeListPatterns[i];
    console.log(`\n--- Patrón ${i + 1} ---`);
    
    const matches = episodePageHTML.matchAll(pattern);
    const matchesArray = Array.from(matches);
    
    console.log(`Encontradas ${matchesArray.length} coincidencias`);
    
    for (const match of matchesArray) {
        let episodeNum, episodeUrl;
        
        if (pattern === episodeListPatterns[0]) {
            // EP NUMBER ... href="URL"
            episodeNum = parseInt(match[1]);
            episodeUrl = match[2];
        } else if (pattern === episodeListPatterns[1]) {
            // href="URL" ... EP
            episodeNum = parseInt(match[2]);
            episodeUrl = match[1];
        } else {
            // Patrón directo
            episodeNum = parseInt(match[2]);
            episodeUrl = match[1];
        }

        if (episodeNum && episodeUrl) {
            const fullUrl = episodeUrl.startsWith('http') 
                ? episodeUrl 
                : 'https://kaa.to' + episodeUrl.replace(/^\/+/, '/');
            
            // Verificar que no esté duplicado
            if (!episodes.find(ep => ep.number === episodeNum)) {
                episodes.push({
                    number: episodeNum,
                    href: fullUrl
                });
                
                console.log(`  ✅ Episodio ${episodeNum}: ${fullUrl}`);
            }
        }
    }
    
    if (episodes.length > 0) {
        console.log(`\n🎉 Patrón ${i + 1} funcionó! Encontrados ${episodes.length} episodios`);
        break;
    }
}

// Ordenar episodios por número
episodes.sort((a, b) => a.number - b.number);

console.log("\n=== RESULTADOS FINALES ===");
console.log(`Total de episodios encontrados: ${episodes.length}`);

episodes.forEach(episode => {
    console.log(`Episodio ${episode.number}: ${episode.href}`);
});

console.log("\n=== FORMATO JSON (como devolvería el módulo) ===");
console.log(JSON.stringify(episodes, null, 2));
