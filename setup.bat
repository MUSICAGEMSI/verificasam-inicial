@echo off
echo ==========================================
echo  GOOGLE SHEETS INTERFACE - SETUP
echo ==========================================
echo.

echo Verificando se o Node.js esta instalado...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao foi encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado!
node --version

echo.
echo Instalando dependencias...
call npm install

if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ==========================================
echo.
echo Para iniciar o projeto, execute:
echo   npm start
echo.
echo Ou clique duas vezes em: start.bat
echo.
pause