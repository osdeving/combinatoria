const fs = require('fs');

// Ler os cards atuais
const cardsData = fs.readFileSync('cards.json', 'utf8');
const cards = JSON.parse(cardsData);

// Ler a estrutura base
const structureData = fs.readFileSync('cards_structure.json', 'utf8');
const structure = JSON.parse(structureData);

// Mover os cards para a nova estrutura
structure.cards = cards;

// Atualizar metadados
structure.metadata.totalCards = cards.length;

// Contar cards por categoria
const categoryStats = {};
const difficultyStats = {};

cards.forEach(card => {
    categoryStats[card.category] = (categoryStats[card.category] || 0) + 1;
    difficultyStats[card.difficulty] = (difficultyStats[card.difficulty] || 0) + 1;
});

// Adicionar estatísticas aos metadados
Object.keys(structure.metadata.categories).forEach(cat => {
    structure.metadata.categories[cat].count = categoryStats[cat] || 0;
});

Object.keys(structure.metadata.difficulties).forEach(diff => {
    structure.metadata.difficulties[diff].count = difficultyStats[diff] || 0;
});

// Salvar nova estrutura
fs.writeFileSync('cards_structured.json', JSON.stringify(structure, null, 4), 'utf8');

console.log('✅ Estrutura hierárquica criada');
console.log('📊 Estatísticas por categoria:', categoryStats);
console.log('📈 Estatísticas por dificuldade:', difficultyStats);
