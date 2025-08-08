// Test con fetch real para analizar el HTML actual
const https = require('https');
const http = require('http');

async function realFetch(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function testRealPage() {
    console.log('🔍 Analizando https://kaa.to/anime?alphabet=N');
    
    try {
        const html = await realFetch('https://kaa.to/anime?alphabet=N');
        
        console.log('📄 HTML Length:', html.length);
        console.log('\n📋 Primeros 500 caracteres:');
        console.log(html.substring(0, 500));
        console.log('\n🔎 Buscando patrones de Naruto:');
        
        // Buscar cualquier mención de Naruto
        const narutoMatches = html.match(/[Nn]aruto[^<>\n]{0,100}/g);
        if (narutoMatches) {
            narutoMatches.forEach((match, i) => {
                console.log(`${i+1}. ${match}`);
            });
        } else {
            console.log('❌ No se encontró "Naruto" en el HTML');
        }
        
        console.log('\n🏷️ Buscando enlaces kaa.to:');
        const linkMatches = html.match(/kaa\.to\/[a-zA-Z0-9\-_]+/g);
        if (linkMatches) {
            const uniqueLinks = [...new Set(linkMatches)].slice(0, 5);
            uniqueLinks.forEach(link => console.log(`- ${link}`));
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testRealPage();
