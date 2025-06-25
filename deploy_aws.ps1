# Script de despliegue para AWS EC2 desde Windows
# Ejecutar desde PowerShell como administrador

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KEY_PATH
)

Write-Host "🚀 Desplegando PWA Flask a EC2..." -ForegroundColor Green

# Verificar que el archivo de clave existe
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "❌ No se encontró el archivo de clave en: $KEY_PATH" -ForegroundColor Red
    exit 1
}

# Subir archivos a EC2
Write-Host "📤 Subiendo archivos..." -ForegroundColor Yellow
scp -i $KEY_PATH -r * ec2-user@${EC2_IP}:~/Practica8/

# Conectar y ejecutar el script de despliegue
Write-Host "🔧 Ejecutando script de despliegue..." -ForegroundColor Yellow
ssh -i $KEY_PATH ec2-user@$EC2_IP "chmod +x ~/Practica8/deploy_aws.sh && ~/Practica8/deploy_aws.sh"

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación está disponible en: http://${EC2_IP}:5003" -ForegroundColor Cyan

# Ejemplo de uso:
# .\deploy_aws.ps1 -EC2_IP "tu-ip-publica" -KEY_PATH "ruta\a\tu\clave.pem"
