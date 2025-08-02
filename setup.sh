#!/bin/bash

# Script de configuração do projeto Flashcards de Combinatória
# Uso: ./setup.sh

echo "🎯 Configurando Flashcards de Combinatória..."
echo

# Verificar se está no diretório correto
if [ ! -f "index.html" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Criar diretório de backup se não existir
if [ ! -d "backup" ]; then
    mkdir backup
    echo "✅ Diretório de backup criado"
fi

# Verificar se Node.js está instalado (para scripts de processamento)
if command -v node &> /dev/null; then
    echo "✅ Node.js encontrado: $(node --version)"
else
    echo "⚠️  Node.js não encontrado - scripts de processamento não funcionarão"
fi

# Verificar se o arquivo de cards existe
if [ -f "cards.json" ]; then
    CARD_COUNT=$(grep -o '"id":' cards.json | wc -l)
    echo "✅ Base de dados encontrada: $CARD_COUNT flashcards"
else
    echo "❌ Erro: Arquivo cards.json não encontrado"
    exit 1
fi

# Verificar estrutura de arquivos essenciais
FILES=("index.html" "script.js" "style.css" "cards.json")
MISSING_FILES=()

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ Todos os arquivos essenciais encontrados"
else
    echo "❌ Arquivos em falta: ${MISSING_FILES[*]}"
    exit 1
fi

# Testar se o servidor local pode ser iniciado
echo
echo "🚀 Iniciando servidor local de teste..."

# Tentar Python 3 primeiro, depois Python 2
if command -v python3 &> /dev/null; then
    echo "📍 Servidor rodando em: http://localhost:8000"
    echo "   Pressione Ctrl+C para parar"
    echo
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "📍 Servidor rodando em: http://localhost:8000"
    echo "   Pressione Ctrl+C para parar"
    echo
    python -m SimpleHTTPServer 8000
else
    echo "⚠️  Python não encontrado"
    echo "📍 Abra o arquivo index.html diretamente no navegador"
    echo "   Ou use qualquer servidor HTTP local"
fi
