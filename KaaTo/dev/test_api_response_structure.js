// Test específico para verificar la estructura de respuesta de la API
const { default: fetch } = require('node-fetch');

async function testAPIResponse() {
    console.log("🔍 VERIFICANDO ESTRUCTURA DE RESPUESTA DE LA API");
    console.log("===============================================");
    
    try {
        const response = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/'
            },
            body: JSON.stringify({ query: "naruto" })
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("📊 RESPUESTA COMPLETA:");
        console.log("Tipo:", typeof data);
        console.log("Es array:", Array.isArray(data));
        console.log("Longitud:", data.length);
        console.log("Keys:", Object.keys(data));
        console.log("");
        
        console.log("📋 CONTENIDO DETALLADO:");
        console.log(JSON.stringify(data, null, 2));
        
        if (Array.isArray(data) && data.length > 0) {
            console.log("\n🎯 PRIMER ELEMENTO:");
            console.log(JSON.stringify(data[0], null, 2));
            
            console.log("\n🎯 CAMPOS DISPONIBLES EN PRIMER ELEMENTO:");
            const fields = Object.keys(data[0]);
            fields.forEach(field => {
                console.log(`   - ${field}: ${typeof data[0][field]} = ${data[0][field]}`);
            });
        }
        
    } catch (error) {
        console.log("💥 Error:", error.message);
    }
}

testAPIResponse().catch(console.error);
