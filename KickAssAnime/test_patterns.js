// Script de prueba para verificar los patrones regex del módulo KickAssAnime

// HTML de muestra obtenido de kaa.to/anime?alphabet=B
const sampleHTML = `
[2023](https://kaa.to/b-project-3rd-season-73ad)
## B-Project: Passion*Love Call

 TV Finished SUB[2019](https://kaa.to/b-project-zecchouemotion-4007)
## B-Project: Zecchou*Emotion

 TV Finished SUB DUB[2021](https://kaa.to/my-acg-parents-173e)
## My ACG Parents

 ONA Finished DUB[2007](https://kaa.to/baccano-637f)
## Baccano!

 TV Finished SUB DUB[2010](https://kaa.to/baka-test-summon-the-beasts-7b3b)
## Baka & Test - Summon the Beasts

 TV Finished SUB DUB[2009](https://kaa.to/bakemonogatari-a762)
## Bakemonogatari
`;

// Patrón principal corregido
const animePattern = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;

console.log("=== PRUEBA DE BÚSQUEDA ===");
console.log("Palabra clave: 'baka'");
console.log();

const keyword = "baka";
const keywordLower = keyword.toLowerCase();
const results = [];

const matches = sampleHTML.matchAll(animePattern);
const matchesArray = Array.from(matches);

console.log(`Encontradas ${matchesArray.length} coincidencias con el patrón regex`);
console.log();

for (const match of matchesArray) {
    console.log("--- Match encontrado ---");
    console.log("Grupos capturados:");
    console.log("1. Año:", match[1]);
    console.log("2. URL completa:", match[2]);
    console.log("3. Slug:", match[3]);
    console.log("4. Título:", match[4]);
    
    const title = match[4]?.trim() || 'Título no disponible';
    
    // Filtrar por palabra clave
    if (title.toLowerCase().includes(keywordLower)) {
        results.push({
            title: title,
            image: "https://kaa.to/favicon.ico",
            href: match[2]
        });
        console.log("✅ COINCIDE con palabra clave!");
    } else {
        console.log("❌ No coincide con palabra clave");
    }
    console.log();
}

console.log("=== RESULTADOS FINALES ===");
console.log(`Total de resultados para '${keyword}':`, results.length);
results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   URL: ${result.href}`);
});

console.log();
console.log("=== PRUEBA DE OTRO TÉRMINO ===");
console.log("Palabra clave: 'project'");

const keyword2 = "project";
const keywordLower2 = keyword2.toLowerCase();
const results2 = [];

const matches2 = sampleHTML.matchAll(animePattern);
const matchesArray2 = Array.from(matches2);

for (const match of matchesArray2) {
    const title = match[4]?.trim() || 'Título no disponible';
    
    if (title.toLowerCase().includes(keywordLower2)) {
        results2.push({
            title: title,
            href: match[2]
        });
    }
}

console.log(`Total de resultados para '${keyword2}':`, results2.length);
results2.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   URL: ${result.href}`);
});
