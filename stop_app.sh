#!/bin/bash

echo "🛑 Deteniendo PWA Flask..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si el servicio está corriendo
if systemctl is-active --quiet pwa-flask.service; then
    echo "🔍 Servicio detectado como activo. Procediendo a detener..."
    
    # Detener el servicio
    sudo systemctl stop pwa-flask.service
    
    # Verificar que se detuvo
    sleep 2
    if systemctl is-active --quiet pwa-flask.service; then
        echo "❌ Error: El servicio aún está activo"
        exit 1
    else
        echo "✅ Servicio detenido exitosamente"
    fi
else
    echo "ℹ️  El servicio ya estaba detenido"
fi

# Verificar que el puerto esté libre
if netstat -tuln | grep -q ":5003 "; then
    echo "⚠️  Puerto 5003 aún en uso. Intentando liberar..."
    sudo fuser -k 5003/tcp 2>/dev/null || true
    sleep 1
    
    if netstat -tuln | grep -q ":5003 "; then
        echo "❌ Puerto 5003 aún ocupado"
    else
        echo "✅ Puerto 5003 liberado"
    fi
else
    echo "✅ Puerto 5003 está libre"
fi

echo ""
echo "📊 Estado final del servicio:"
sudo systemctl status pwa-flask.service --no-pager | head -n 10

echo ""
echo "📋 Para volver a iniciar:"
echo "   sudo systemctl start pwa-flask.service"
echo ""
echo "📋 Para deshabilitar permanentemente:"
echo "   sudo systemctl disable pwa-flask.service"
