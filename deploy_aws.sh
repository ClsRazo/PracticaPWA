#!/bin/bash

# Script de despliegue para EC2
echo "Iniciando despliegue en EC2..."

# Actualizar el sistema
sudo yum update -y

# Instalar Python 3 y pip si no están instalados
sudo yum install -y python3 python3-pip

# Navegar al directorio de la aplicación
cd /home/ec2-user/Practica8

# Instalar dependencias
pip3 install -r requirements.txt --user

# Matar procesos previos en el puerto 5003
sudo pkill -f "python3.*app.py"
sudo fuser -k 5003/tcp 2>/dev/null || true

# Configurar el firewall para el puerto 5003
sudo iptables -A INPUT -p tcp --dport 5003 -j ACCEPT

# Crear directorio de logs si no existe
mkdir -p logs

echo "Instalando la aplicación como servicio..."

# Crear archivo de servicio systemd
sudo tee /etc/systemd/system/pwa-flask.service > /dev/null <<EOF
[Unit]
Description=PWA Flask Application
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/Practica8
ExecStart=/home/ec2-user/.local/bin/python3 app.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=PYTHONPATH=/home/ec2-user/.local/lib/python3.9/site-packages
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd y habilitar el servicio
sudo systemctl daemon-reload
sudo systemctl enable pwa-flask.service
sudo systemctl start pwa-flask.service

echo "Aplicación desplegada exitosamente!"
echo "La aplicación está corriendo en: http://18.224.56.4:5003"
echo "Para ver los logs: sudo journalctl -u pwa-flask.service -f"
echo "Para reiniciar: sudo systemctl restart pwa-flask.service"
echo "Para detener: sudo systemctl stop pwa-flask.service"
echo ""
echo "Verificando que el servicio esté activo..."
sudo systemctl status pwa-flask.service --no-pager
echo ""
echo "Probando conectividad..."
curl -s http://localhost:5003 > /dev/null && echo "Aplicación respondiendo correctamente" || echo "Error: La aplicación no responde"
