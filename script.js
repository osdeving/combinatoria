let cardsData = {};
let cards = [];
let current = 0;
let reverse = false;
let flipped = false;
let explanationVisible = false;
let currentFilter = {
    category: 'all',
    difficulty: 'all',
    tags: []
};

async function loadCards() {
    try {
        const res = await fetch("cards.json");
        cardsData = await res.json();
        cards = cardsData.cards || [];
        current = 0;
        applyFilters();
        showCard();
    } catch (error) {
        console.error("Erro ao carregar cards:", error);
        // Fallback para um card de exemplo se houver erro
        cardsData = {
            metadata: { totalCards: 1 },
            cards: [
                {
                    id: 1,
                    type: "exemplo",
                    category: "geral",
                    difficulty: "basico",
                    tags: ["erro"],
                    q: "Erro ao carregar flashcards",
                    a: "Verifique se o arquivo cards.json existe",
                    explanation: "Certifique-se de que o arquivo JSON está na mesma pasta que o HTML.",
                },
            ]
        };
        cards = cardsData.cards;
        current = 0;
        showCard();
    }
}

function applyFilters() {
    let filteredCards = cardsData.cards || [];
    
    // Filtrar por categoria
    if (currentFilter.category !== 'all') {
        filteredCards = filteredCards.filter(card => card.category === currentFilter.category);
    }
    
    // Filtrar por dificuldade
    if (currentFilter.difficulty !== 'all') {
        filteredCards = filteredCards.filter(card => card.difficulty === currentFilter.difficulty);
    }
    
    // Filtrar por tags
    if (currentFilter.tags.length > 0) {
        filteredCards = filteredCards.filter(card => 
            currentFilter.tags.some(tag => card.tags && card.tags.includes(tag))
        );
    }
    
    cards = filteredCards;
    current = Math.min(current, cards.length - 1);
    if (current < 0) current = 0;
}

function renderMathInCard() {
    renderMathInElement(document.getElementById("flashcard"), {
        delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
        ],
    });

    // Também render math na explicação se estiver visível
    if (explanationVisible) {
        renderMathInElement(document.getElementById("explanationText"), {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
            ],
        });
    }
}

function showCard() {
    if (!cards.length) {
        document.getElementById("question").innerHTML = "Nenhum card encontrado para os filtros selecionados";
        document.getElementById("answer").innerHTML = "Tente alterar os filtros";
        document.getElementById("progress").textContent = "0 de 0";
        return;
    }
    
    const card = cards[current];
    const front = reverse ? card.a || "Sem resposta" : card.q;
    const back = reverse ? card.q : card.a || "Sem resposta";

    document.getElementById("question").innerHTML = front || "Carregando...";
    document.getElementById("answer").innerHTML = back || "Sem resposta";
    
    // Mostrar informações da categoria atual
    const categoryInfo = currentFilter.category !== 'all' 
        ? ` (${currentFilter.category.charAt(0).toUpperCase() + currentFilter.category.slice(1)})` 
        : '';
    
    const difficultyInfo = currentFilter.difficulty !== 'all' 
        ? ` - ${currentFilter.difficulty.charAt(0).toUpperCase() + currentFilter.difficulty.slice(1)}` 
        : '';
        
    document.getElementById("progress").textContent = `Card ${current + 1} de ${cards.length}${categoryInfo}${difficultyInfo}`;

    // Atualizar explicação
    updateExplanation();
    updateCategoryCounts();

    flipped = false;
    document.getElementById("flashcard").classList.remove("flipped");

    // Delay para garantir que o DOM foi atualizado antes de renderizar o KaTeX
    setTimeout(() => renderMathInCard(), 50);
}

function updateExplanation() {
    const card = cards[current];
    const explanationText = document.getElementById("explanationText");
    const explanationBtn = document.getElementById("explanationBtn");

    if (card && card.explanation) {
        explanationText.innerHTML = card.explanation;
        explanationBtn.style.display = "block";
        explanationBtn.disabled = false;
    } else {
        explanationText.innerHTML =
            "Nenhuma explicação disponível para este card.";
        explanationBtn.style.display = "block";
        explanationBtn.disabled = false;
    }
}

function toggleExplanation() {
    const explanationContent = document.getElementById("explanationContent");
    const explanationBtn = document.getElementById("explanationBtn");

    explanationVisible = !explanationVisible;

    if (explanationVisible) {
        explanationContent.classList.add("show");
        explanationBtn.innerHTML =
            '<span class="btn-icon">❌</span> Ocultar Explicação';
        setTimeout(() => renderMathInCard(), 100); // Re-render math para incluir a explicação
    } else {
        explanationContent.classList.remove("show");
        explanationBtn.innerHTML =
            '<span class="btn-icon">💡</span> Ver Explicação';
    }
}

function flipCard() {
    flipped = !flipped;
    document.getElementById("flashcard").classList.toggle("flipped", flipped);
    // Funções de filtro
function setCategory(category) {
    currentFilter.category = category;
    updateCategoryButtons();
    applyFilters();
    current = 0;
    showCard();
}

function setDifficulty(difficulty) {
    currentFilter.difficulty = difficulty;
    updateDifficultyButtons();
    applyFilters();
    current = 0;
    showCard();
}

function updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === currentFilter.category) {
            btn.classList.add('active');
        }
    });
}

function updateDifficultyButtons() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === currentFilter.difficulty) {
            btn.classList.add('active');
        }
    });
}

function updateCategoryCounts() {
    if (!cardsData.metadata) return;
    
    // Atualizar contador total
    const totalCount = currentFilter.difficulty === 'all' 
        ? cardsData.metadata.totalCards 
        : cardsData.cards.filter(card => card.difficulty === currentFilter.difficulty).length;
    
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = totalCount;
    
    // Atualizar contadores por categoria
    Object.keys(cardsData.metadata.categories || {}).forEach(category => {
        let count = cardsData.cards.filter(card => card.category === category);
        if (currentFilter.difficulty !== 'all') {
            count = count.filter(card => card.difficulty === currentFilter.difficulty);
        }
        
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = count.length;
        }
    });
}

renderMathInCard();
}

function nextCard() {
    current = (current + 1) % cards.length;
    showCard();
}

function prevCard() {
    current = (current - 1 + cards.length) % cards.length;
    showCard();
}

function toggleReverse() {
    reverse = !reverse;
    showCard();
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    current = 0;
    showCard();
}

// Acessibilidade: teclas
window.addEventListener("keydown", (e) => {
    if (
        document.activeElement !== document.body &&
        document.activeElement !== document.getElementById("flashcard")
    )
        return;
    if (e.key === "ArrowRight") nextCard();
    else if (e.key === "ArrowLeft") prevCard();
    else if (e.key === " " || e.key === "Enter") flipCard();
});

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    const flashcard = document.getElementById("flashcard");
    const flipBtn = document.getElementById("flipBtn");

    if (flashcard) flashcard.onclick = flipCard;
    if (flipBtn) flipBtn.onclick = flipCard;

    loadCards();
});

window.onload = function() {
    loadCards();
    // Inicializar interface após carregamento
    setTimeout(() => {
        updateCategoryButtons();
        updateDifficultyButtons();
        updateCategoryCounts();
    }, 100);
};
