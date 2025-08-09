/**
 * Descifrador KaaTo - Versión simplificada
 */

console.log('🚀 Iniciando descifrador KaaTo...');

const ENCRYPTED_DATA = "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:5102de47b703679c59256bb5502bd296";

try {
    console.log('📦 Separando datos...');
    const [dataB64, hash] = ENCRYPTED_DATA.split(':');
    console.log('✅ Hash:', hash);
    console.log('✅ Data length:', dataB64.length);

    console.log('🔓 Decodificando base64...');
    const decodedData = Buffer.from(dataB64, 'base64').toString('binary');
    console.log('✅ Decoded length:', decodedData.length);

    // Probar rotación específica que parecía más prometedora
    console.log('🔄 Probando rotación 16...');
    
    function decryptWithRotation(data, rotation) {
        let result = '';
        for (let i = 0; i < data.length; i++) {
            let charCode = data.charCodeAt(i);
            charCode = ((charCode - 32 + rotation) % 95) + 32;
            result += String.fromCharCode(charCode);
        }
        return result;
    }
    
    const decrypted16 = decryptWithRotation(decodedData, 16);
    console.log('Preview rotación 16:', decrypted16.substring(0, 100));
    
    // Buscar JSON en rotación 16
    const jsonStart16 = decrypted16.indexOf('{');
    if (jsonStart16 !== -1) {
        console.log('✅ JSON encontrado en posición:', jsonStart16);
        
        const jsonPart = decrypted16.substring(jsonStart16);
        console.log('JSON preview:', jsonPart.substring(0, 200));
        
        // Buscar el final del JSON
        let braceCount = 0;
        let jsonEnd = -1;
        
        for (let i = 0; i < jsonPart.length; i++) {
            if (jsonPart[i] === '{') braceCount++;
            if (jsonPart[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
        
        if (jsonEnd !== -1) {
            const completeJson = jsonPart.substring(0, jsonEnd);
            console.log('📦 JSON completo length:', completeJson.length);
            
            try {
                const parsed = JSON.parse(completeJson);
                console.log('🎉 ¡DESCIFRADO EXITOSO!');
                console.log('📊 Estructura:', Object.keys(parsed));
                
                // Buscar streams
                function findStreams(obj, path = '') {
                    if (typeof obj === 'string' && obj.includes('.m3u8')) {
                        console.log(`📺 Stream: ${obj}`);
                    } else if (Array.isArray(obj)) {
                        obj.forEach((item, index) => findStreams(item, `${path}[${index}]`));
                    } else if (typeof obj === 'object' && obj !== null) {
                        Object.keys(obj).forEach(key => findStreams(obj[key], path ? `${path}.${key}` : key));
                    }
                }
                
                findStreams(parsed);
                
                console.log('\n📄 CONTENIDO COMPLETO:');
                console.log(JSON.stringify(parsed, null, 2));
                
            } catch (parseError) {
                console.log('❌ Error parseando JSON:', parseError.message);
                console.log('Primer parte del JSON:');
                console.log(completeJson.substring(0, 500));
            }
        } else {
            console.log('❌ No se encontró final del JSON');
        }
    } else {
        console.log('❌ No se encontró inicio de JSON en rotación 16');
        
        // Probar otras rotaciones rápidamente
        for (let rot = 13; rot <= 25; rot++) {
            const test = decryptWithRotation(decodedData, rot);
            const start = test.indexOf('{');
            if (start !== -1 && start < 50) {
                console.log(`🔍 Rotación ${rot} tiene JSON en posición ${start}`);
                console.log('Preview:', test.substring(start, start + 100));
            }
        }
    }

} catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error.stack);
}
