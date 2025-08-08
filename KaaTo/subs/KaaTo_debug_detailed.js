// Debug DETALLADO para entender la respuesta de fetchv2
async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        const results = [
            {
                title: "1. Response type: " + typeof response,
                image: "https://via.placeholder.com/300x400/blue/white?text=TYPE",
                href: "debug://type"
            },
            {
                title: "2. Is Array: " + Array.isArray(response),
                image: "https://via.placeholder.com/300x400/green/white?text=ARRAY",
                href: "debug://array"
            }
        ];
        
        if (response) {
            // Verificar propiedades del objeto
            const keys = Object.keys(response);
            results.push({
                title: "3. Keys: " + keys.slice(0, 3).join(', '),
                image: "https://via.placeholder.com/300x400/yellow/black?text=KEYS",
                href: "debug://keys"
            });
            
            // Verificar si tiene datos
            if (response.data) {
                results.push({
                    title: "4. Has data: YES, length: " + (Array.isArray(response.data) ? response.data.length : 'not array'),
                    image: "https://via.placeholder.com/300x400/purple/white?text=DATA",
                    href: "debug://data"
                });
                
                // Si data es array, mostrar primer elemento
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const firstItem = response.data[0];
                    results.push({
                        title: "5. First item: " + (firstItem.title || firstItem.name || 'no title'),
                        image: "https://via.placeholder.com/300x400/orange/white?text=FIRST",
                        href: "debug://first"
                    });
                }
            } else {
                results.push({
                    title: "4. NO data property found",
                    image: "https://via.placeholder.com/300x400/red/white?text=NO+DATA",
                    href: "debug://nodata"
                });
            }
            
            // Verificar si es directamente un array de resultados
            if (Array.isArray(response) && response.length > 0) {
                results.push({
                    title: "6. Direct array with " + response.length + " items",
                    image: "https://via.placeholder.com/300x400/teal/white?text=DIRECT",
                    href: "debug://direct"
                });
            }
        } else {
            results.push({
                title: "3. Response is null/undefined",
                image: "https://via.placeholder.com/300x400/red/white?text=NULL",
                href: "debug://null"
            });
        }
        
        return JSON.stringify(results);
        
    } catch (error) {
        return JSON.stringify([{
            title: "ERROR: " + error.message,
            image: "https://via.placeholder.com/300x400/red/white?text=ERROR",
            href: "debug://error"
        }]);
    }
}

async function extractDetails(url) {
    return JSON.stringify({
        title: "Debug Details",
        description: "URL: " + url,
        releaseDate: "2024",
        status: "Debug",
        genres: ["Debug"],
        image: "https://via.placeholder.com/300x400/gray/white?text=DETAILS"
    });
}

async function extractEpisodes(url) {
    return JSON.stringify([{
        title: "Debug Episode",
        href: url + "/episode/1",
        episode: 1
    }]);
}

async function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        type: "mp4",
        headers: {}
    });
}
