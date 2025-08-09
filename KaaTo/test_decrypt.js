/**
 * Probador de descifrado de datos KaaTo
 */

// Datos encriptados reales obtenidos del F12
const ENCRYPTED_DATA = "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:5102de47b703679c59256bb5502bd296";

// Función de descifrado mejorada
function decryptKaaToData(encryptedData) {
    console.log('🔓 Iniciando descifrado de datos KaaTo...');
    
    try {
        // Separar data y hash
        const [dataB64, hash] = encryptedData.split(':');
        console.log('📦 Data B64 length:', dataB64.length);
        console.log('🔑 Hash:', hash);
        
        // Decodificar base64 (Node.js compatible)
        const decodedData = Buffer.from(dataB64, 'base64').toString('binary');
        console.log('📝 Decoded data length:', decodedData.length);
        console.log('📄 Primeros 50 caracteres:', decodedData.substring(0, 50));
        
        // Intentar diferentes métodos de descifrado
        
        // Método 1: XOR simple con hash
        console.log('\n🔄 Probando XOR con hash...');
        try {
            let xorResult = '';
            for (let i = 0; i < decodedData.length; i++) {
                const keyChar = hash[i % hash.length];
                const charCode = decodedData.charCodeAt(i) ^ keyChar.charCodeAt(0);
                xorResult += String.fromCharCode(charCode);
            }
            
            console.log('XOR result preview:', xorResult.substring(0, 100));
            
            // Intentar parsear como JSON
            const jsonResult = JSON.parse(xorResult);
            console.log('✅ XOR descifrado exitoso!');
            return jsonResult;
            
        } catch (xorError) {
            console.log('❌ XOR falló:', xorError.message);
        }
        
        // Método 2: XOR con hash convertido a bytes
        console.log('\n🔄 Probando XOR con hash como bytes...');
        try {
            const hashBytes = [];
            for (let i = 0; i < hash.length; i += 2) {
                hashBytes.push(parseInt(hash.substr(i, 2), 16));
            }
            
            let xorResult = '';
            for (let i = 0; i < decodedData.length; i++) {
                const keyByte = hashBytes[i % hashBytes.length];
                const charCode = decodedData.charCodeAt(i) ^ keyByte;
                xorResult += String.fromCharCode(charCode);
            }
            
            console.log('XOR bytes result preview:', xorResult.substring(0, 100));
            
            const jsonResult = JSON.parse(xorResult);
            console.log('✅ XOR bytes descifrado exitoso!');
            return jsonResult;
            
        } catch (xorBytesError) {
            console.log('❌ XOR bytes falló:', xorBytesError.message);
        }
        
        // Método 3: Descifrado por rotación
        console.log('\n🔄 Probando rotación de caracteres...');
        for (let rotation = 1; rotation <= 25; rotation++) {
            try {
                let rotated = '';
                for (let i = 0; i < Math.min(decodedData.length, 1000); i++) {
                    let charCode = decodedData.charCodeAt(i);
                    charCode = ((charCode - 32 + rotation) % 95) + 32;
                    rotated += String.fromCharCode(charCode);
                }
                
                if (rotated.includes('{') && rotated.includes('}')) {
                    console.log(`Rotación ${rotation} parece prometedora:`, rotated.substring(0, 100));
                    
                    // Aplicar rotación completa
                    let fullRotated = '';
                    for (let i = 0; i < decodedData.length; i++) {
                        let charCode = decodedData.charCodeAt(i);
                        charCode = ((charCode - 32 + rotation) % 95) + 32;
                        fullRotated += String.fromCharCode(charCode);
                    }
                    
                    try {
                        const jsonResult = JSON.parse(fullRotated);
                        console.log('✅ Rotación descifrado exitoso!');
                        return jsonResult;
                    } catch (e) {
                        // Continuar con siguiente rotación
                    }
                }
            } catch (e) {
                // Continuar
            }
        }
        
        // Método 4: Análisis de patrones
        console.log('\n📊 Análisis de patrones en datos...');
        
        const bytes = [];
        for (let i = 0; i < Math.min(decodedData.length, 200); i++) {
            bytes.push(decodedData.charCodeAt(i));
        }
        
        console.log('Primeros 20 bytes:', bytes.slice(0, 20));
        console.log('Rango de valores:', Math.min(...bytes), '-', Math.max(...bytes));
        
        // Buscar patrones comunes de JSON
        const commonPatterns = ['{', '}', '"', 'sources', 'file', 'http', 'm3u8'];
        for (const pattern of commonPatterns) {
            const positions = [];
            for (let i = 0; i < decodedData.length - pattern.length; i++) {
                if (decodedData.substr(i, pattern.length) === pattern) {
                    positions.push(i);
                }
            }
            if (positions.length > 0) {
                console.log(`Patrón "${pattern}" encontrado en posiciones:`, positions.slice(0, 5));
            }
        }
        
        // Si todo falla, retornar información para análisis manual
        return {
            success: false,
            data: decodedData,
            hash: hash,
            analysis: {
                length: decodedData.length,
                firstBytes: bytes.slice(0, 20),
                preview: decodedData.substring(0, 200)
            }
        };
        
    } catch (error) {
        console.error('❌ Error general en descifrado:', error);
        return null;
    }
}

// Función para probar el descifrado
function testDecryption() {
    console.log('🧪 INICIANDO PRUEBA DE DESCIFRADO');
    console.log('=' * 50);
    
    const result = decryptKaaToData(ENCRYPTED_DATA);
    
    if (result) {
        console.log('\n📊 RESULTADO DEL DESCIFRADO:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success === false) {
            console.log('\n🔍 DATOS PARA ANÁLISIS MANUAL:');
            console.log('Hash:', result.hash);
            console.log('Data length:', result.analysis.length);
            console.log('First bytes:', result.analysis.firstBytes);
            console.log('Preview:', result.analysis.preview);
        }
    } else {
        console.log('❌ No se pudo descifrar los datos');
    }
}

// Ejecutar prueba
testDecryption();
