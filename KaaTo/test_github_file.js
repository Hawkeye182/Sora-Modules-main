// Test para verificar que el archivo en GitHub tiene las correcciones
const https = require('https');

async function testGitHubFile() {
    console.log('🌐 VERIFICANDO ARCHIVO EN GITHUB');
    console.log('================================\n');
    
    const url = 'https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/KaaTo/subs/KaaTo_CORRECTED.js';
    
    console.log('📂 Descargando desde:', url);
    
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                console.log('📊 Archivo descargado, tamaño:', data.length, 'caracteres');
                
                // Verificar que NO tiene el mensaje informativo
                const hasInfoMessage = data.includes('resultados de kaa.to para');
                console.log('❌ Mensaje informativo:', hasInfoMessage ? 'PRESENTE (MAL)' : 'AUSENTE (BIEN)');
                
                // Verificar que tiene el formato correcto de detalles
                const hasCorrectDetails = data.includes('return JSON.stringify([result])');
                console.log('✅ Formato detalles correcto:', hasCorrectDetails ? 'SÍ' : 'NO');
                
                // Verificar que usa fetchv2
                const usesFetchv2 = data.includes('fetchv2(');
                console.log('🔧 Usa fetchv2:', usesFetchv2 ? 'SÍ' : 'NO');
                
                console.log('\n🎯 RESULTADO:');
                if (!hasInfoMessage && hasCorrectDetails && usesFetchv2) {
                    console.log('🟢 ¡ARCHIVO EN GITHUB ESTÁ CORRECTO!');
                    console.log('🚀 Ya puedes usar la URL en Sora');
                } else {
                    console.log('🔴 El archivo en GitHub aún tiene problemas');
                }
                
                resolve();
            });
        }).on('error', reject);
    });
}

testGitHubFile().catch(console.error);
