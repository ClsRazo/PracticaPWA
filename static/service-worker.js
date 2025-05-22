const CACHE_NAME = 'pwa-cache-v1';
const STATIC_FILES = [
    '/',
    '/static/js/app.js',
    '/static/manifest.json',
    '/static/icon.png'
];

//Cache estático en instalación
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES))
    );
    console.log('ServiceWorker Instalado');
});

//Para limpiar cachés viejos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }))
        )
    );
    console.log('ServiceWorker Activado');
});

//Cache dinámico en fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((networkResponse) => {
                if (
                    event.request.url.includes('/api/')
                ) {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }

                return networkResponse;
            }).catch(() => {
                //Devolvemos una respuesta por defecto si no hay conexión
                // if (event.request.mode === 'navigate') {
                //     return caches.match('/offline.html');
                // }
            });
        })
    );
});

//Para cargar articulos automaticamente cuando haya conexión
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-articulos') {
        event.waitUntil(syncArticulos());
    }
});

async function syncArticulos() {
    const stored = await getLocalArticulos();

    for (const articulo of stored) {
        try {
            await fetch('/api/AgregarArticulos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articulo)
            });
        } catch (e) {
            console.error('Error al enviar artículo en segundo plano:', e);
        }
    }

    await clearLocalArticulos();
}

//Almacenar en IndexedDB (simplificado con idb-keyval)
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/idb-keyval-iife.min.js');
const store = new idbKeyval.Store('articulos-db', 'articulos-store');

function getLocalArticulos() {
    return idbKeyval.get('pendientes', store).then(data => data || []);
}

function clearLocalArticulos() {
    return idbKeyval.del('pendientes', store);
}