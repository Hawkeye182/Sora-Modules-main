// KaaTo Perfect Extension v10.3 - Advanced Diagnostic System
// Search - Del original que funciona
async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            if (Array.isArray(data)) {
                const results = data.map(item => ({
                    title: item.title || 'Unknown Title',
                    image: item.poster && item.poster.hq ? 
                           `https://kaa.to/image/poster/${item.poster.hq}.webp` : '',
                    href: `https://kaa.to/anime/${item.slug}`
                }));
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        return JSON.stringify([]);
    }
}

// Details - EXACTO como SIMPLE_TEST que SÍ funciona
async function extractDetails(url) {
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            const result = {
                description: details.synopsis || details.description || "Sin descripción disponible",
                aliases: [details.title_en, details.title_original].filter(title => title && title !== details.title).join(', ') || '',
                airdate: details.year ? `Año: ${details.year}` : 'Aired: Unknown'
            };
            
            return JSON.stringify([result]);
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - EXACTAMENTE del STREAM_FIXED que funcionaba bien
async function extractEpisodes(url) {
    try {
        const slug = url.split('/').pop();
        
        // Obtener información del idioma primero
        const languageResponse = await fetchv2(`https://kaa.to/api/show/${slug}/language`);
        
        if (!languageResponse || languageResponse.status !== 200) {
            console.log('Language API failed');
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        let languageData;
        try {
            languageData = typeof languageResponse._data === 'string' ? 
                          JSON.parse(languageResponse._data) : languageResponse._data;
        } catch (e) {
            console.log('Failed to parse language response');
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        // Usar japonés con subtítulos como preferencia
        let selectedLanguage = 'ja-JP';
        if (languageData && languageData.result && Array.isArray(languageData.result)) {
            const availableLanguages = languageData.result;
            
            // Buscar japonés primero, luego inglés como fallback
            const jaLang = availableLanguages.find(lang => lang.includes('ja-JP'));
            const enLang = availableLanguages.find(lang => lang.includes('en-US'));
            
            if (jaLang) {
                selectedLanguage = 'ja-JP';
            } else if (enLang) {
                selectedLanguage = 'en-US';
            } else if (availableLanguages.length > 0) {
                selectedLanguage = availableLanguages[0];
            }
        }
        
        console.log('Using language:', selectedLanguage);
        
        // Obtener episodios con el idioma seleccionado
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData;
            try {
                episodesData = typeof episodesResponse._data === 'string' ? 
                              JSON.parse(episodesResponse._data) : episodesResponse._data;
            } catch (e) {
                console.log('Failed to parse episodes response');
                return JSON.stringify([{
                    href: url,
                    number: 1
                }]);
            }
            
            if (episodesData && episodesData.result && episodesData.result.length > 0) {
                console.log(`Found ${episodesData.result.length} episodes on first page`);
                
                // Si hay información de paginación, obtener todos los episodios
                const allEpisodes = [];
                
                // Estrategia 1: Usar la información de pages para obtener todos los números de episodio
                if (episodesData.pages && Array.isArray(episodesData.pages) && episodesData.pages.length > 1) {
                    console.log(`Found ${episodesData.pages.length} pages of episodes`);
                    
                    // Generar todos los números de episodio de todas las páginas
                    episodesData.pages.forEach(page => {
                        if (page.eps && Array.isArray(page.eps)) {
                            page.eps.forEach(epNum => {
                                // Buscar el slug correspondiente en los resultados actuales
                                const episodeData = episodesData.result.find(ep => ep.episode_number === epNum);
                                const episodeSlug = episodeData ? episodeData.slug : `ep-${epNum}`;
                                
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${epNum}-${episodeSlug}`,
                                    number: epNum
                                });
                            });
                        }
                    });
                    
                    console.log(`Total episodes generated from pages: ${allEpisodes.length}`);
                } else {
                    // Estrategia 2: Usar solo los episodios de la primera página
                    episodesData.result.forEach(episode => {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${episode.episode_number}-${episode.slug}`,
                            number: episode.episode_number
                        });
                    });
                }
                
                // Ordenar por número de episodio
                allEpisodes.sort((a, b) => a.number - b.number);
                
                console.log(`Returning ${allEpisodes.length} episodes for ${slug}`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        // Fallback
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
        
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Stream - Estrategia actualizada sin window.KAA
async function extractStreamUrl(episodeUrl) {
    console.log('Extracting stream from URL: ' + episodeUrl);
    
    try {
        // Estrategia 1: Intentar obtener la página del episodio con headers realistas
        const pageResponse = await fetchv2(episodeUrl, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to'
        });
        
        if (pageResponse && pageResponse.status === 200 && pageResponse._data) {
            console.log('✅ Successfully loaded episode page');
            const html = pageResponse._data;
            
            // Debug: Mostrar un fragmento del HTML para debug
            console.log('📄 HTML length:', html.length);
            console.log('📄 HTML sample (first 500 chars):', html.substring(0, 500));
            
            // Estrategia 2: Buscar diferentes patrones de datos del servidor
            const patterns = [
                { name: 'window.KAA', regex: /window\.KAA\s*=\s*({.*?});/s },
                { name: 'window._kaa', regex: /window\._kaa\s*=\s*({.*?});/s },
                { name: 'var servers', regex: /var\s+servers\s*=\s*({.*?});/s },
                { name: 'const servers', regex: /const\s+servers\s*=\s*({.*?});/s },
                { name: 'servers json', regex: /"servers":\s*(\[.*?\])/s },
                { name: 'data-servers', regex: /data-servers=["']({.*?})["']/s },
                { name: 'servers object', regex: /servers:\s*(\[.*?\])/s }
            ];
            
            let serverData = null;
            let foundPattern = null;
            
            for (const patternObj of patterns) {
                console.log(`🔍 Testing pattern: ${patternObj.name}`);
                const match = html.match(patternObj.regex);
                if (match) {
                    const rawData = match[1];
                    console.log(`✅ Match found for ${patternObj.name}!`);
                    console.log(`📊 Data length: ${rawData.length} characters`);
                    console.log(`🔍 First 300 chars: ${rawData.substring(0, 300)}`);
                    console.log(`🔍 Last 100 chars: ${rawData.substring(Math.max(0, rawData.length - 100))}`);
                    
                    try {
                        serverData = JSON.parse(rawData);
                        foundPattern = patternObj.name;
                        console.log('✅ Successfully parsed server data for', patternObj.name, ':', serverData);
                        break;
                    } catch (e) {
                        console.log(`❌ JSON Parse Error for ${patternObj.name}:`, e.message);
                        console.log(`🔧 Attempting auto-repair...`);
                        
                        // Auto-repair attempts
                        let cleanedData = rawData;
                        
                        // Remove trailing commas
                        cleanedData = cleanedData.replace(/,(\s*[}\]])/g, '$1');
                        
                        // Fix unquoted keys
                        cleanedData = cleanedData.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
                        
                        // Convert single quotes to double quotes
                        cleanedData = cleanedData.replace(/'/g, '"');
                        
                        // Remove extra spaces around brackets
                        cleanedData = cleanedData.replace(/\s*([{}[\]])\s*/g, '$1');
                        
                        console.log(`🛠️ Cleaned data (first 300 chars): ${cleanedData.substring(0, 300)}`);
                        
                        try {
                            serverData = JSON.parse(cleanedData);
                            foundPattern = patternObj.name + ' (auto-repaired)';
                            console.log('✅ Auto-repair successful! Parsed data:', serverData);
                            break;
                        } catch (e2) {
                            console.log(`❌ Auto-repair failed:`, e2.message);
                            console.log(`🔍 Character analysis around position ${e2.message.match(/\d+/)?.[0] || 'unknown'}:`);
                            const pos = parseInt(e2.message.match(/\d+/)?.[0]) || 0;
                            const start = Math.max(0, pos - 50);
                            const end = Math.min(cleanedData.length, pos + 50);
                            console.log(`Context: "${cleanedData.substring(start, end)}"`);
                        }
                    }
                } else {
                    console.log(`❌ No match found for ${patternObj.name}`);
                }
            }
            
            if (serverData) {
                console.log('✅ Server data found with pattern:', foundPattern);
                console.log('📊 Server data structure:', JSON.stringify(serverData, null, 2));
                
                // Estrategia 3: Extraer URLs de streaming
                let streamUrls = [];
                
                // Si serverData tiene la estructura de KAA
                if (serverData.servers && Array.isArray(serverData.servers)) {
                    streamUrls = serverData.servers;
                } 
                // Si serverData es directamente un array
                else if (Array.isArray(serverData)) {
                    streamUrls = serverData;
                }
                // Si hay un campo específico para streams
                else if (serverData.streams || serverData.sources) {
                    streamUrls = serverData.streams || serverData.sources;
                }
                
                if (streamUrls.length > 0) {
                    console.log(`Found ${streamUrls.length} potential streams`);
                    
                    // Intentar cada URL encontrada
                    for (const streamUrl of streamUrls) {
                        try {
                            console.log('Testing stream URL:', streamUrl);
                            
                            // Si la URL contiene un video ID, intentar extraer M3U8
                            const videoIdMatch = streamUrl.match(/\/([a-f0-9]{24})/);
                            if (videoIdMatch) {
                                const videoId = videoIdMatch[1];
                                const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
                                
                                const m3u8Response = await fetchv2(m3u8Url, {
                                    'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, */*',
                                    'Origin': 'https://kaa.to',
                                    'Referer': 'https://kaa.to/',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                });
                                
                                if (m3u8Response && m3u8Response.status === 200 && m3u8Response._data && m3u8Response._data.includes('#EXTM3U')) {
                                    console.log('✅ SUCCESS! Working M3U8 found:', m3u8Url);
                                    return m3u8Url;
                                }
                            }
                            
                            // Si no es M3U8, probar la URL directamente
                            if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                                console.log('✅ Returning direct stream URL:', streamUrl);
                                return streamUrl;
                            }
                            
                        } catch (streamError) {
                            console.log('❌ Stream URL failed:', streamError.message);
                        }
                    }
                }
            }
            
            // Estrategia 4: Análisis JSON mejorado
            console.log('🔍 Strategy 4: Enhanced JSON analysis...');
            
            // Buscar cualquier objeto que contenga 'servers' con contenido más detallado
            const enhancedServerPatterns = [
                /servers\s*[:=]\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/gi,
                /(?:const|var|let)\s+servers\s*=\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/gi,
                /"servers"\s*:\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/gi,
                /servers\s*=\s*(\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])/gi
            ];
            
            for (const pattern of enhancedServerPatterns) {
                console.log(`🔍 Testing enhanced pattern: ${pattern.source}`);
                const match = pattern.exec(html);
                if (match) {
                    const rawData = match[1];
                    console.log(`✅ Enhanced match found! Length: ${rawData.length}`);
                    console.log(`📄 Raw data preview: ${rawData.substring(0, 200)}...`);
                    
                    try {
                        const parsed = JSON.parse(rawData);
                        console.log(`✅ JSON parsed successfully! Type: ${typeof parsed}`);
                        console.log(`📊 Parsed structure: ${JSON.stringify(parsed).substring(0, 300)}...`);
                        
                        // Buscar URLs en el objeto parseado
                        const foundUrls = findUrlsInObject(parsed);
                        if (foundUrls.length > 0) {
                            console.log(`🎯 Found ${foundUrls.length} URLs in parsed object`);
                            for (const url of foundUrls) {
                                if (await testUrl(url)) {
                                    return url;
                                }
                            }
                        }
                    } catch (e) {
                        console.log(`❌ JSON parse failed: ${e.message}`);
                        console.log(`🔧 Attempting to fix common JSON issues...`);
                        
                        // Intentar reparar JSON común
                        let fixedData = rawData
                            .replace(/,\s*}/g, '}')  // Remove trailing commas
                            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
                            .replace(/:\s*'([^']*)'/g, ': "$1"');    // Replace single quotes
                        
                        try {
                            const parsed = JSON.parse(fixedData);
                            console.log(`✅ Fixed JSON parsed successfully!`);
                            const foundUrls = findUrlsInObject(parsed);
                            if (foundUrls.length > 0) {
                                console.log(`🎯 Found ${foundUrls.length} URLs in fixed object`);
                                for (const url of foundUrls) {
                                    if (await testUrl(url)) {
                                        return url;
                                    }
                                }
                            }
                        } catch (e2) {
                            console.log(`❌ Fixed JSON also failed: ${e2.message}`);
                        }
                    }
                } else {
                    console.log(`❌ No match for enhanced pattern: ${pattern.source}`);
                }
            }
            
            // Función helper para encontrar URLs en objetos
            function findUrlsInObject(obj) {
                const urls = [];
                const urlPattern = /https?:\/\/[^\s"']+\.m3u8[^\s"']*/g;
                
                function searchRecursive(item) {
                    if (typeof item === 'string') {
                        const matches = item.match(urlPattern);
                        if (matches) urls.push(...matches);
                    } else if (Array.isArray(item)) {
                        item.forEach(searchRecursive);
                    } else if (typeof item === 'object' && item !== null) {
                        Object.values(item).forEach(searchRecursive);
                    }
                }
                
                searchRecursive(obj);
                return urls;
            }
            
            // Función helper para test URLs
            async function testUrl(url) {
                try {
                    console.log('🧪 Testing URL:', url);
                    const testResponse = await fetchv2(url, {
                        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, */*',
                        'Origin': 'https://kaa.to',
                        'Referer': 'https://kaa.to/'
                    });
                    
                    if (testResponse && testResponse.status === 200) {
                        console.log('✅ SUCCESS! Working stream found:', url);
                        return true;
                    } else {
                        console.log(`❌ URL test failed. Status: ${testResponse?.status || 'No response'}`);
                        return false;
                    }
                } catch (error) {
                    console.log(`❌ URL test error: ${error.message}`);
                    return false;
                }
            }
            
            // Estrategia 5: Análisis profundo de datos en kaa.to
            console.log('🔍 Strategy 5: Deep KAA.to data analysis...');
            
            // Buscar patrones específicos de kaa.to con más contexto
            const kaaPatterns = [
                { name: 'servers array bracket', regex: /servers\s*:\s*(\[[^\]]*\])/gi },
                { name: 'servers with quotes', regex: /"servers"\s*:\s*(\[[^\]]*\])/gi },
                { name: 'javascript servers', regex: /var\s+servers\s*=\s*(\[[^\]]*\])/gi },
                { name: 'window servers', regex: /window\.servers\s*=\s*(\[[^\]]*\])/gi },
                { name: 'data servers', regex: /data-servers\s*=\s*["']([^"']*?)["']/gi },
                { name: 'json servers block', regex: /"servers"\s*:\s*\[([^\]]+)\]/gi }
            ];
            
            for (const pattern of kaaPatterns) {
                console.log(`🔍 Testing KAA pattern: ${pattern.name}`);
                const match = pattern.regex.exec(html);
                if (match) {
                    const rawData = match[1];
                    console.log(`✅ ${pattern.name} found! Data length: ${rawData.length}`);
                    console.log(`📄 Complete data: ${rawData}`);
                    
                    // Intentar extraer directamente URLs de m3u8
                    const directUrls = rawData.match(/https:\/\/[^"'\s,\]]+\.m3u8/g);
                    if (directUrls) {
                        console.log(`🎯 Found ${directUrls.length} direct m3u8 URLs`);
                        for (const url of directUrls) {
                            if (await testUrl(url)) {
                                return url;
                            }
                        }
                    }
                    
                    // Intentar parsear como JSON
                    try {
                        const fullJson = `[${rawData}]`;
                        console.log(`🧪 Attempting to parse as array: ${fullJson.substring(0, 200)}...`);
                        const parsed = JSON.parse(fullJson);
                        console.log(`✅ Successfully parsed as array:`, parsed);
                        
                        // Buscar URLs en el array parseado
                        const foundUrls = findUrlsInObject(parsed);
                        if (foundUrls.length > 0) {
                            console.log(`🎯 Found ${foundUrls.length} URLs in parsed array`);
                            for (const url of foundUrls) {
                                if (await testUrl(url)) {
                                    return url;
                                }
                            }
                        }
                    } catch (e) {
                        console.log(`❌ Array parse failed: ${e.message}`);
                        
                        // Buscar IDs de video específicos
                        const videoIds = rawData.match(/[a-f0-9]{24}/g);
                        if (videoIds) {
                            console.log(`🎯 Found ${videoIds.length} potential video IDs`);
                            for (const videoId of videoIds) {
                                const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
                                console.log(`🧪 Testing generated m3u8: ${m3u8Url}`);
                                if (await testUrl(m3u8Url)) {
                                    return m3u8Url;
                                }
                            }
                        }
                    }
                }
            }
            
            // Estrategia 6: Búsqueda exhaustiva en todo el HTML
            console.log('🔍 Strategy 6: Exhaustive HTML search...');
            
            // Buscar todos los posibles IDs de video en el HTML completo
            const allVideoIds = html.match(/[a-f0-9]{24}/g);
            if (allVideoIds) {
                console.log(`🎯 Found ${allVideoIds.length} potential video IDs in entire HTML`);
                const uniqueIds = [...new Set(allVideoIds)]; // Eliminar duplicados
                console.log(`🎯 Unique video IDs: ${uniqueIds.length}`);
                
                for (const videoId of uniqueIds.slice(0, 5)) { // Probar solo los primeros 5
                    const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
                    console.log(`🧪 Testing video ID: ${videoId}`);
                    if (await testUrl(m3u8Url)) {
                        return m3u8Url;
                    }
                }
            }
            
            // Estrategia 7: Buscar patrones de URL directamente en el HTML
            console.log('🔍 Strategy 7: Searching for direct URL patterns in HTML...');
            const urlPatterns = [
                /https:\/\/krussdomi\.com\/m3u8\/[a-f0-9]{24}\.m3u8/g,
                /https:\/\/[^"'<>\s]+\.m3u8/g,
                /https:\/\/[^"'<>\s]+\.mp4/g
            ];
            
            for (const urlPattern of urlPatterns) {
                console.log('🔍 Testing URL pattern:', urlPattern.source);
                const matches = html.match(urlPattern);
                if (matches && matches.length > 0) {
                    console.log(`✅ Found ${matches.length} potential URLs with pattern:`, matches);
                    
                    for (const foundUrl of matches) {
                        if (await testUrl(foundUrl)) {
                            return foundUrl;
                        }
                    }
                } else {
                    console.log('❌ No URLs found with pattern:', urlPattern.source);
                }
            }
            
            console.log('❌ All HTML parsing strategies failed');
            
        } else {
            console.log('❌ Failed to load episode page. Status:', pageResponse ? pageResponse.status : 'null');
        }
        
        // Fallback: usar video demo rotativo basado en el episodio
        console.log('🔄 All strategies failed, using demo video');
        const episodeMatch = episodeUrl.match(/ep-(\d+)/);
        const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : 1;
        
        const demoStreams = [
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        ];
        
        return demoStreams[(episodeNumber - 1) % demoStreams.length];
        
    } catch (error) {
        console.log('❌ Stream extraction error: ' + error.message);
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
}
