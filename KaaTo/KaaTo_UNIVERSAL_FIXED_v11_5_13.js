// KaaTo Extension v11.5.13 - UNIVERSAL FIXED
// Formato real de URLs: /{slug}/ep-{numero}-{identificador}
// Ejemplo: https://kaa.to/dandadan-da3b/ep-1-b324b5

(function() {
    'use strict';
    
    const KAATO_BASE_URL = 'https://kaa.to';
    const API_BASE_URL = 'https://kaa.to/api';
    
    console.log('🔥 KaaTo v11.5.13 Iniciado - Estructura real de URLs');
    
    // Función para extraer ID del episodio de la URL real
    function extractEpisodeId(episodeUrl) {
        // Formato: https://kaa.to/dandadan-da3b/ep-1-b324b5
        // Extraer: b324b5
        const match = episodeUrl.match(/ep-\d+-([a-z0-9]+)$/);
        return match ? match[1] : null;
    }
    
    // Función para construir URL real del episodio
    function buildRealEpisodeUrl(animeSlug, episodeNumber, episodeId) {
        return `${KAATO_BASE_URL}/${animeSlug}/ep-${episodeNumber}-${episodeId}`;
    }
    
    function searchAnime(query) {
        const searchUrl = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
        
        return fetch(searchUrl, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('🔍 Resultados de búsqueda:', data);
            
            if (!data || !Array.isArray(data.data)) {
                return [];
            }
            
            return data.data.map(anime => ({
                title: anime.title,
                url: `${KAATO_BASE_URL}/${anime.slug}`,
                poster: anime.poster || null,
                year: anime.year || 'N/A',
                description: anime.description || 'Sin descripción',
                slug: anime.slug
            }));
        })
        .catch(error => {
            console.error('❌ Error en búsqueda:', error);
            return [];
        });
    }
    
    function extractDetails(animeUrl) {
        const slug = animeUrl.replace(KAATO_BASE_URL + '/', '');
        
        return fetch(`${API_BASE_URL}/anime/${slug}`, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Details failed: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📋 Detalles del anime:', data);
            
            const anime = data.data || data;
            
            // Retorna array como v11.4
            return [{
                description: anime.description || 'Sin descripción disponible',
                aliases: anime.aliases || [],
                airdate: anime.aired || anime.year || 'N/A'
            }];
        })
        .catch(error => {
            console.error('❌ Error obteniendo detalles:', error);
            return [{
                description: 'Error al cargar descripción',
                aliases: [],
                airdate: 'N/A'
            }];
        });
    }
    
    function extractEpisodes(animeUrl) {
        const slug = animeUrl.replace(KAATO_BASE_URL + '/', '');
        
        // Usar parámetros correctos de la API
        return fetch(`${API_BASE_URL}/episodes/${slug}?ep=1&lang=`, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Episodes failed: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📺 Datos de episodios:', data);
            
            if (!data.data || !Array.isArray(data.data)) {
                console.warn('⚠️ Formato de episodios incorrecto:', data);
                return [];
            }
            
            return data.data.map(episode => {
                // Usar formato real de URL
                const episodeUrl = buildRealEpisodeUrl(slug, episode.number, episode.id || 'unknown');
                
                console.log(`📺 Episodio ${episode.number}: ${episodeUrl}`);
                
                return {
                    title: `Episode ${episode.number}${episode.title ? ': ' + episode.title : ''}`,
                    url: episodeUrl,
                    number: episode.number,
                    id: episode.id,
                    slug: slug
                };
            });
        })
        .catch(error => {
            console.error('❌ Error obteniendo episodios:', error);
            return [];
        });
    }
    
    function extractStreamUrl(episodeUrl) {
        console.log('🎬 Extrayendo stream de URL real:', episodeUrl);
        
        const episodeId = extractEpisodeId(episodeUrl);
        if (!episodeId) {
            console.error('❌ No se pudo extraer ID del episodio');
            return Promise.reject('Invalid episode URL format');
        }
        
        // Paso 1: Cargar la página del episodio
        return fetch(episodeUrl, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        .then(response => response.text())
        .then(html => {
            console.log('📄 HTML de episodio cargado');
            
            // Buscar patrones de servidores de video
            const serverPatterns = [
                /vidstream[^"']*["']([^"']+)/gi,
                /birdstream[^"']*["']([^"']+)/gi,
                /filemoon[^"']*["']([^"']+)/gi,
                /doodstream[^"']*["']([^"']+)/gi,
                /"source"\s*:\s*"([^"]+)"/gi,
                /"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/gi,
                /data-src\s*=\s*["']([^"']*\.m3u8[^"']*)["']/gi
            ];
            
            for (const pattern of serverPatterns) {
                const matches = html.match(pattern);
                if (matches && matches.length > 0) {
                    console.log('🎯 Encontrado patrón:', pattern, matches);
                    
                    for (const match of matches) {
                        const urlMatch = match.match(/["']([^"']+)["']/);
                        if (urlMatch) {
                            let streamUrl = urlMatch[1];
                            
                            // Validar y normalizar URL
                            if (streamUrl.includes('.m3u8') || streamUrl.includes('vidstream') || streamUrl.includes('birdstream')) {
                                if (!streamUrl.startsWith('http')) {
                                    streamUrl = 'https:' + streamUrl;
                                }
                                
                                console.log('✅ Stream URL encontrada:', streamUrl);
                                return Promise.resolve(streamUrl);
                            }
                        }
                    }
                }
            }
            
            // Si no encuentra streams, buscar APIs en el JavaScript
            const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
            if (scriptMatches) {
                for (const script of scriptMatches) {
                    const apiMatches = script.match(/(?:fetch|axios|XMLHttpRequest)[^"']*["']([^"']*api[^"']*)["']/gi);
                    if (apiMatches) {
                        console.log('🔍 APIs encontradas en JS:', apiMatches);
                    }
                }
            }
            
            console.warn('⚠️ No se encontró stream URL en HTML');
            
            // Intentar con API de streaming directa
            return tryDirectStreamApi(episodeId);
        })
        .catch(error => {
            console.error('❌ Error extrayendo stream:', error);
            return tryDirectStreamApi(episodeId);
        });
    }
    
    function tryDirectStreamApi(episodeId) {
        console.log('🔄 Intentando API directa para episodio:', episodeId);
        
        const apiUrls = [
            `${API_BASE_URL}/stream/${episodeId}`,
            `${API_BASE_URL}/episode/${episodeId}/streams`,
            `${API_BASE_URL}/watch/${episodeId}`,
            `${KAATO_BASE_URL}/ajax/episode/${episodeId}/sources`
        ];
        
        function tryNextApi(index = 0) {
            if (index >= apiUrls.length) {
                return Promise.reject('No stream sources found');
            }
            
            const apiUrl = apiUrls[index];
            console.log(`🔗 Probando API ${index + 1}/${apiUrls.length}:`, apiUrl);
            
            return fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': KAATO_BASE_URL
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API ${index + 1} failed: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`📊 Respuesta API ${index + 1}:`, data);
                
                // Buscar URLs de stream en diferentes formatos
                const streamUrl = findStreamUrl(data);
                if (streamUrl) {
                    console.log('✅ Stream encontrado en API:', streamUrl);
                    return streamUrl;
                }
                
                throw new Error('No stream URL in response');
            })
            .catch(error => {
                console.warn(`⚠️ API ${index + 1} falló:`, error.message);
                return tryNextApi(index + 1);
            });
        }
        
        return tryNextApi();
    }
    
    function findStreamUrl(data) {
        // Buscar URLs de stream en diferentes estructuras de datos
        const possiblePaths = [
            data?.stream?.url,
            data?.source?.file,
            data?.sources?.[0]?.file,
            data?.sources?.[0]?.url,
            data?.data?.stream,
            data?.data?.url,
            data?.url,
            data?.file,
            data?.link
        ];
        
        for (const path of possiblePaths) {
            if (path && typeof path === 'string' && (path.includes('.m3u8') || path.includes('stream'))) {
                return path.startsWith('http') ? path : 'https:' + path;
            }
        }
        
        // Buscar en arrays
        if (Array.isArray(data?.sources)) {
            for (const source of data.sources) {
                const url = source.file || source.url || source.src;
                if (url && (url.includes('.m3u8') || url.includes('stream'))) {
                    return url.startsWith('http') ? url : 'https:' + url;
                }
            }
        }
        
        return null;
    }
    
    // Exportar funciones globales
    window.searchAnime = searchAnime;
    window.extractDetails = extractDetails;
    window.extractEpisodes = extractEpisodes;
    window.extractStreamUrl = extractStreamUrl;
    
    console.log('✅ KaaTo v11.5.13 cargado - URLs reales implementadas');
    
})();
