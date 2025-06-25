# PWA Flask - Despliegue en AWS EC2

Esta es una Progressive Web App (PWA) desarrollada con Flask que se puede desplegar en AWS EC2.

## 🚀 Despliegue Rápido

### Prerequisitos
- Instancia EC2 de Amazon Linux ejecutándose
- Security Group configurado para permitir tráfico en puerto 5003
- Clave SSH (.pem) para acceder a la instancia

### Opción 1: Usando Git (Recomendado)

1. **En tu instancia EC2:**
```bash
# Clonar o actualizar el repositorio
git clone <tu-repositorio-url> Practica8
# o si ya existe: cd Practica8 && git pull

# Ejecutar el script de despliegue
chmod +x deploy_aws.sh
./deploy_aws.sh
```

### Opción 2: Usando SCP desde Windows

```powershell
# Desde PowerShell en tu máquina local
.\deploy_aws.ps1 -EC2_IP "tu-ip-publica-ec2" -KEY_PATH "ruta\a\tu\clave.pem"
```

## 🔧 Configuración del Security Group

Asegúrate de que tu Security Group permita:
- **Puerto 22** (SSH) para administración
- **Puerto 5003** (HTTP) para la aplicación

## 📊 Monitoreo

```bash
# Ver logs en tiempo real
sudo journalctl -u pwa-flask.service -f

# Estado del servicio
sudo systemctl status pwa-flask.service

# Reiniciar el servicio
sudo systemctl restart pwa-flask.service
```

## 🌐 Acceso

Una vez desplegada, tu aplicación estará disponible en:
```
http://tu-ip-publica-ec2:5003
```

## 📱 Características PWA

- ✅ Service Worker para funcionamiento offline
- ✅ Manifest para instalación como app
- ✅ Cache de recursos estáticos
- ✅ Sincronización en background
- ✅ Interfaz responsive

## 🔄 Actualización

Para actualizar la aplicación:
```bash
cd /home/ec2-user/Practica8
git pull
sudo systemctl restart pwa-flask.service
```
