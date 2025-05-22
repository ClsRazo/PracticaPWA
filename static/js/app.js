if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/service-worker.js')
    .then(() => {
        console.log("Service Worker registrado");
    }).catch((error) => {
        console.log("Error al registrar el Service Worker:", error);
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    //Botón personalizado para instalar la app
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Instalar App';
    document.body.appendChild(installBtn);

    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Instalación aceptada');
            } else {
                //Borramos el botón si el usuario cancela la instalación
                installBtn.remove();
                console.log('Instalación cancelada');
            }
            deferredPrompt = null;
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, obteniendo artículos...");
    const statusElement = document.getElementById('status');
    statusElement.textContent = "Cargando artículos...";
    
    fetch('/api/articulos')
        .then(res => {
            if (!res.ok) {
                throw new Error('Error en la respuesta del servidor: ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log("Artículos recibidos:", data);
            const lista = document.getElementById('lista-articulos');
            lista.innerHTML = ''; // Limpiar lista existente
            
            if (data.length === 0) {
                statusElement.textContent = "No hay artículos disponibles";
                return;
            }
            
            data.forEach(art => {
                const li = document.createElement('li');
                li.textContent = art.titulo;
                lista.appendChild(li);
            });
            
            statusElement.textContent = `${data.length} artículos cargados`;
        })
        .catch(err => {
            console.error('Error al cargar artículos:', err);
            statusElement.textContent = "Error al cargar artículos. ¿Quizá offline?";
        });
});

//Para agregar un artículo cuando haya conexión
document.getElementById('form-articulo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tituloInput = document.getElementById('titulo');
    const titulo = tituloInput.value.trim();

    if (!titulo) {
        alert('Por favor ingrese un título');
        return;
    }

    const articulo = { titulo };
    const statusElement = document.getElementById('status');
    statusElement.textContent = "Enviando artículo...";

    try {
        console.log("Intentando enviar artículo:", articulo);
        const response = await fetch('/api/AgregarArticulos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articulo)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            //Agregamos el artículo a la lista
            const lista = document.getElementById('lista-articulos');
            const li = document.createElement('li');
            li.textContent = articulo.titulo;
            lista.appendChild(li);
            
            //Limpiamos el campo de entrada
            tituloInput.value = '';
            
            statusElement.textContent = `Artículo "${titulo}" agregado con éxito (ID: ${result.id})`;
            alert('Artículo enviado correctamente');
        }else{
            throw new Error('Respuesta no exitosa del servidor: ' + response.status);
        }
    } catch (err) {
        console.error('Error al enviar artículo:', err);
        statusElement.textContent = "Sin conexión. Guardando para sincronización...";

        try {
            await saveForSync(articulo);
            
            // Aun sin conexión, agregamos el artículo a la lista
            const lista = document.getElementById('lista-articulos');
            const li = document.createElement('li');
            li.textContent = articulo.titulo + ' (pendiente de sincronización)';
            lista.appendChild(li);
            
            tituloInput.value = '';
            
            registerSync();
            statusElement.textContent = `Artículo "${titulo}" guardado para sincronización posterior`;
            alert('Guardado para envío posterior');
        } catch (storageErr) {
            console.error('Error al guardar para sincronización:', storageErr);
            statusElement.textContent = "Error al guardar el artículo";
            alert('Error al guardar el artículo');
        }
    }
});

async function saveForSync(articulo) {
    console.log("Guardando para sincronización:", articulo);
    try {
        const store = new idbKeyval.Store('articulos-db', 'articulos-store');
        const prev = await idbKeyval.get('pendientes', store) || [];
        prev.push(articulo);
        await idbKeyval.set('pendientes', prev, store);
        console.log("Guardado exitoso para sincronización");
    } catch (err) {
        console.error("Error en saveForSync:", err);
        throw err;
    }
}

function registerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(sw => {
            return sw.sync.register('sync-articulos')
                .then(() => {
                    console.log('Sincronización registrada correctamente');
                })
                .catch(err => {
                    console.error('Error al registrar sincronización:', err);
                });
        });
    } else {
        console.warn('Background Sync no está soportado en este navegador');
    }
}