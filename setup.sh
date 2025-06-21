#!/bin/bash

echo "=========================================="
echo " GOOGLE SHEETS INTERFACE - SETUP"
echo "=========================================="
echo

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não foi encontrado!"
    echo "Por favor, instale o Node.js em: https://nodejs.org/"
    exit 1
fi

echo "Node.js encontrado!"
node --version

echo
echo "Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências!"
    exit 1
fi

echo
echo "=========================================="
echo " INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=========================================="
echo
echo "Para iniciar o projeto, execute:"
echo "  npm start"
echo
echo "Ou execute: ./start.sh"
echo

# Tornar o script start.sh executável
chmod +x start.sh