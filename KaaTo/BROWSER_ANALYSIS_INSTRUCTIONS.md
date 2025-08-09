# INSTRUCCIONES PARA REVERSE ENGINEERING - KaaTo v11.5.13

## 🔍 ANÁLISIS REQUERIDO EN NAVEGADOR

### Objetivo
Analizar cómo KaaTo carga realmente los videos para implementar la extracción correcta de streams.

### URLs Descubiertas
- **Formato real**: `https://kaa.to/{slug}/ep-{numero}-{identificador}`
- **Ejemplo**: `https://kaa.to/dandadan-da3b/ep-1-b324b5`
- **Patrón ID**: El identificador final (ej: `b324b5`) es clave para obtener streams

### 📋 PASOS A SEGUIR

#### 1. Abrir Herramientas de Desarrollador
1. Ir a: `https://kaa.to/dandadan-da3b/ep-1-b324b5`
2. Presionar **F12** para abrir DevTools
3. Ir a la pestaña **Network** (Red)
4. Filtrar por **XHR/Fetch** o **All**

#### 2. Análisis de Requests
1. **Recargar la página** para capturar todas las peticiones
2. **Reproducir el video** (hacer clic en play)
3. **Observar las peticiones que aparecen**

#### 3. Buscar Patrones Específicos
Buscar requests que contengan:
- `/api/` 
- `/ajax/`
- `/stream/`
- `/source/`
- `/episode/`
- `.m3u8`
- `vidstream`
- `birdstream`

#### 4. Analizar Respuestas
Para cada request importante:
1. **Copiar la URL completa**
2. **Ver la respuesta** (pestaña Response)
3. **Verificar headers** (especialmente Referer, Authorization)
4. **Anotar el formato de datos**

### 🎯 DATOS ESPECÍFICOS A BUSCAR

#### URLs de API:
```
¿Qué URL se llama para obtener el stream?
Ejemplo: https://kaa.to/api/episode/b324b5/sources
```

#### Headers requeridos:
```
¿Qué headers envía?
- User-Agent: ?
- Referer: ?
- Authorization: ?
- X-Requested-With: ?
```

#### Formato de respuesta:
```json
{
  "¿Cómo está estructurada la respuesta?": {
    "sources": [
      {
        "file": "URL_DEL_M3U8",
        "label": "720p",
        "type": "hls"
      }
    ]
  }
}
```

### 🔧 INFORMACIÓN TÉCNICA ENCONTRADA

#### Estructura de URLs:
- **Anime slug**: `dandadan-da3b`
- **Episode format**: `ep-1-b324b5`
- **Episode ID**: `b324b5` (último segmento)

#### Servidores mencionados:
- VIDSTREAMING
- BIRDSTREAM
- Posibles otros servidores

### 📝 RESULTADOS ESPERADOS

Después del análisis, necesitamos:

1. **URL exacta de la API de streaming**
   ```
   https://kaa.to/api/???/???
   ```

2. **Headers necesarios**
   ```javascript
   {
     'Referer': 'https://kaa.to/',
     'User-Agent': '...',
     // otros headers
   }
   ```

3. **Estructura de respuesta JSON**
   ```json
   {
     // formato exacto de la respuesta
   }
   ```

4. **Método de extracción del URL del video**
   - ¿Está directo en la respuesta?
   - ¿Requiere decodificación?
   - ¿Hay múltiples calidades?

### 🚀 IMPLEMENTACIÓN FINAL DESCUBIERTA

✅ **FLUJO REAL CONFIRMADO** (sin necesidad de descifrado):

```javascript
async function extractStreamUrl(episodeUrl) {
    // 1. Extraer slug del episodio: /dandadan-da3b/ep-1-b324b5
    const [, animeSlug, episodeNumber, episodeSlug] = 
        episodeUrl.match(/\/([^\/]+)\/ep-(\d+)-([^\/]+)$/);
    
    // 2. Obtener HTML de la página del episodio
    const pageHtml = await fetch(episodeUrl).then(r => r.text());
    
    // 3. Extraer video ID (MongoDB ObjectId de 24 chars)
    const videoIdMatch = pageHtml.match(/([a-f0-9]{24})/);
    const videoId = videoIdMatch[1]; // ej: 6713f500b97399e0e1ae2020
    
    // 4. Construir URL del stream (CONFIRMADO FUNCIONANDO)
    const streamUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
    
    return {
        url: streamUrl,
        type: 'hls',
        headers: {
            'Referer': 'https://krussdomi.com/',
            'Origin': 'https://krussdomi.com'
        }
    };
}
```

### ✅ **DATOS CONFIRMADOS**
- **API Episodios**: `https://kaa.to/api/show/{slug}/episodes?ep={num}&lang=ja-JP` ✅
- **Patrón Video ID**: MongoDB ObjectId de 24 caracteres hex ✅
- **URL Stream**: `https://hls.krussdomi.com/manifest/{videoId}/master.m3u8` ✅
- **Status**: 200 OK confirmado ✅

### ⚡ PRUEBA RÁPIDA

Ejecutar en consola del navegador (F12 > Console):
```javascript
// Ver qué requests se están haciendo
console.log('Monitoreando requests...');
```

---

**Resultado**: Con este análisis podremos crear la versión v11.5.14 con extracción real de streams funcionando.
