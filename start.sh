#!/bin/bash

echo "=========================================="
echo " GOOGLE SHEETS INTERFACE - INICIANDO"
echo "=========================================="
echo

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Dependências não encontradas. Executando instalação..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao instalar dependências!"
        exit 1
    fi
fi

echo
echo "Iniciando servidor de desenvolvimento..."
echo
echo "O navegador abrirá automaticamente em:"
echo "http://localhost:3000"
echo
echo "Para parar o servidor, pressione Ctrl+C"
echo

npm start