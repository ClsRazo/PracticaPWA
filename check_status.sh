#!/bin/bash

echo "🔍 Verificando estado de la PWA Flask..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si el servicio está activo
if systemctl is-active --quiet pwa-flask.service; then
    echo "✅ Servicio systemd: ACTIVO"
else
    echo "❌ Servicio systemd: INACTIVO"
fi

# Verificar si el puerto está abierto
if netstat -tuln | grep -q ":5003 "; then
    echo "✅ Puerto 5003: ABIERTO"
else
    echo "❌ Puerto 5003: CERRADO"
fi

# Verificar conectividad HTTP
if curl -s http://localhost:5003 > /dev/null; then
    echo "✅ Aplicación web: RESPONDIENDO"
else
    echo "❌ Aplicación web: NO RESPONDE"
fi

echo ""
echo "📊 Estado detallado del servicio:"
systemctl status pwa-flask.service --no-pager

echo ""
echo " URL pública: http://18.224.56.4:5003"
echo ""
echo " Comandos útiles:"
echo "   Ver logs: sudo journalctl -u pwa-flask.service -f"
echo "   Reiniciar: sudo systemctl restart pwa-flask.service"
echo "   Detener: sudo systemctl stop pwa-flask.service"
echo "   Iniciar: sudo systemctl start pwa-flask.service"
