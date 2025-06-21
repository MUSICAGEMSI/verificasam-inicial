@echo off
echo ==========================================
echo  GOOGLE SHEETS INTERFACE - INICIANDO
echo ==========================================
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Dependencias nao encontradas. Executando instalacao...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor de desenvolvimento...
echo.
echo O navegador abrira automaticamente em:
echo http://localhost:3000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

call npm start