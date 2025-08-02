const fs = require("fs");

// Ler o arquivo JSON atual
const cardsData = fs.readFileSync("cards.json", "utf8");
const cards = JSON.parse(cardsData);

// Função para categorizar automaticamente baseado no conteúdo
function categorizeCard(card) {
    const content = (
        card.q +
        " " +
        card.a +
        " " +
        (card.explanation || "")
    ).toLowerCase();

    // Definir categorias baseado em palavras-chave
    if (
        content.includes("permutação") ||
        content.includes("anagrama") ||
        content.includes("ordenar") ||
        content.includes("p(")
    ) {
        return "permutacao";
    } else if (
        content.includes("arranjo") ||
        content.includes("a(") ||
        content.includes("presidente") ||
        content.includes("vice")
    ) {
        return "arranjo";
    } else if (
        content.includes("combinação") ||
        content.includes("c(") ||
        content.includes("subconjunto") ||
        content.includes("escolher")
    ) {
        return "combinacao";
    } else if (
        content.includes("princípio") ||
        content.includes("produto cartesiano") ||
        content.includes("pares ordenados")
    ) {
        return "principios";
    } else {
        return "geral";
    }
}

// Função para determinar dificuldade
function getDifficulty(card) {
    const content = (
        card.q +
        " " +
        card.a +
        " " +
        (card.explanation || "")
    ).toLowerCase();

    // Básico: conceitos fundamentais, fórmulas simples
    if (
        card.type === "formula" ||
        content.includes("fórmula") ||
        content.includes("definição")
    ) {
        return "basico";
    }

    // Intermediário: cálculos mais complexos, exemplos detalhados
    if (
        content.includes("banana") ||
        content.includes("circular") ||
        content.includes("repetição") ||
        content.includes("combinação com repetição") ||
        content.match(/\d{2,}/)
    ) {
        return "intermediario";
    }

    // Avançado: conceitos mais abstratos, múltiplas variáveis
    if (card.type === "dica" && content.includes("diferença")) {
        return "avancado";
    }

    return "basico"; // padrão
}

// Função para gerar tags
function generateTags(card) {
    const content = (card.q + " " + card.a).toLowerCase();
    const tags = [];

    // Tags baseadas no tipo
    if (card.type === "formula") tags.push("formula-fundamental");
    if (card.type === "exemplo") tags.push("exemplo-pratico");
    if (card.type === "dica") tags.push("metodologia");

    // Tags específicas
    if (content.includes("repetição")) tags.push("com-repeticao");
    if (content.includes("sem repetição")) tags.push("sem-repeticao");
    if (content.includes("anagrama")) tags.push("anagrama");
    if (content.includes("senha")) tags.push("senhas");
    if (content.includes("circular")) tags.push("circular");
    if (content.includes("subconjunto")) tags.push("subconjuntos");
    if (content.includes("fatorial")) tags.push("fatorial");
    if (content.includes("!")) tags.push("fatorial");
    if (content.includes("diferença")) tags.push("conceitos");
    if (content.includes("princípio")) tags.push("principio-multiplicativo");

    return tags.length > 0 ? tags : ["geral"];
}

// Processar todos os cards
const processedCards = cards.map((card, index) => {
    return {
        id: index + 1,
        type: card.type,
        category: categorizeCard(card),
        difficulty: getDifficulty(card),
        tags: generateTags(card),
        q: card.q,
        a: card.a,
        explanation: card.explanation,
    };
});

// Salvar o arquivo atualizado
fs.writeFileSync(
    "cards_with_metadata.json",
    JSON.stringify(processedCards, null, 4),
    "utf8"
);

console.log(`✅ Processados ${processedCards.length} cards com metadados`);
console.log("📊 Categorias encontradas:", [
    ...new Set(processedCards.map((c) => c.category)),
]);
console.log("📈 Dificuldades:", [
    ...new Set(processedCards.map((c) => c.difficulty)),
]);
