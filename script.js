let cardsData = {};
let cards = [];
let current = 0;
let reverse = false;
let flipped = false;
let explanationVisible = false;
let currentFilter = {
    category: 'all',
    difficulty: 'all',
    tags: [],
    search: ''
};

// Sistema de estatísticas
let studyStats = {
    cardsViewed: 0,
    startTime: null,
    currentStreak: 0,
    categoryViews: {},
    isStudyMode: false
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
    
    // Filtrar por busca de texto
    if (currentFilter.search.trim() !== '') {
        const searchTerm = currentFilter.search.toLowerCase().trim();
        filteredCards = filteredCards.filter(card => {
            const searchableText = (
                (card.q || '') + ' ' + 
                (card.a || '') + ' ' + 
                (card.explanation || '')
            ).toLowerCase();
            return searchableText.includes(searchTerm);
        });
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
        updateProgressDisplay(0, 0);
        return;
    }
    
    const card = cards[current];
    const front = reverse ? card.a || "Sem resposta" : card.q;
    const back = reverse ? card.q : card.a || "Sem resposta";

    document.getElementById("question").innerHTML = front || "Carregando...";
    document.getElementById("answer").innerHTML = back || "Sem resposta";
    
    // Atualizar progresso
    updateProgressDisplay(current + 1, cards.length);

    // Registrar visualização para estatísticas
    if (studyStats.isStudyMode) {
        recordCardView(card);
    }

    // Atualizar explicação
    updateExplanation();
    updateCategoryCounts();

    flipped = false;
    document.getElementById("flashcard").classList.remove("flipped");

    // Delay para garantir que o DOM foi atualizado antes de renderizar o KaTeX
    setTimeout(() => renderMathInCard(), 50);
}

function updateProgressDisplay(current, total) {
    // Atualizar texto do progresso
    const progressElement = document.getElementById("progress");
    if (progressElement) {
        progressElement.textContent = `Card ${current} de ${total}`;
    }
    
    // Atualizar barra de progresso
    const progressFill = document.getElementById("progressFill");
    const progressPercentage = document.getElementById("progressPercentage");
    
    if (total > 0) {
        const percentage = Math.round((current / total) * 100);
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    } else {
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercentage) progressPercentage.textContent = '0%';
    }
    
    // Atualizar estatísticas
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const currentCategoryElement = document.getElementById("currentCategory");
    const currentDifficultyElement = document.getElementById("currentDifficulty");
    
    if (currentCategoryElement) {
        const categoryName = currentFilter.category === 'all' ? 'Todas' : 
            currentFilter.category.charAt(0).toUpperCase() + currentFilter.category.slice(1);
        currentCategoryElement.textContent = categoryName;
    }
    
    if (currentDifficultyElement) {
        const difficultyName = currentFilter.difficulty === 'all' ? 'Todas' : 
            currentFilter.difficulty.charAt(0).toUpperCase() + currentFilter.difficulty.slice(1);
        currentDifficultyElement.textContent = difficultyName;
    }
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
    updateStatsDisplay();
}

function setDifficulty(difficulty) {
    currentFilter.difficulty = difficulty;
    updateDifficultyButtons();
    applyFilters();
    current = 0;
    showCard();
    updateStatsDisplay();
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

// Funções de busca
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    
    currentFilter.search = searchInput.value;
    
    // Mostrar/esconder botão de limpar
    if (currentFilter.search.trim()) {
        searchClear.style.display = 'block';
    } else {
        searchClear.style.display = 'none';
    }
    
    applyFilters();
    current = 0;
    showCard();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    
    searchInput.value = '';
    currentFilter.search = '';
    searchClear.style.display = 'none';
    
    applyFilters();
    current = 0; 
    showCard();
}

// Funções de tags
function toggleTag(tag) {
    const tagIndex = currentFilter.tags.indexOf(tag);
    
    if (tagIndex === -1) {
        currentFilter.tags.push(tag);
    } else {
        currentFilter.tags.splice(tagIndex, 1);
    }
    
    updateTagButtons();
    applyFilters();
    current = 0;
    showCard();
}

function updateTagButtons() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
        if (currentFilter.tags.includes(btn.dataset.tag)) {
            btn.classList.add('active');
        }
    });
}

function loadPopularTags() {
    if (!cardsData.cards) return;
    
    // Contar ocorrências de cada tag
    const tagCounts = {};
    cardsData.cards.forEach(card => {
        if (card.tags) {
            card.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    // Ordenar tags por popularidade e pegar as top 10
    const popularTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    // Renderizar tags
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = popularTags.map(([tag, count]) => `
            <button class="tag-btn" data-tag="${tag}" onclick="toggleTag('${tag}')">
                <span>${tag.replace(/-/g, ' ')}</span>
                <span class="tag-count">${count}</span>
            </button>
        `).join('');
    }
}

// Sistema de Estatísticas
function toggleStudyMode() {
    studyStats.isStudyMode = !studyStats.isStudyMode;
    const studyBtn = document.getElementById('studyModeBtn');
    
    if (studyStats.isStudyMode) {
        // Iniciar modo de estudo
        studyStats.startTime = Date.now();
        studyStats.cardsViewed = 0;
        studyStats.currentStreak = 0;
        studyStats.categoryViews = {};
        
        studyBtn.innerHTML = '<span class="btn-icon">⏸️</span> Parar Estudo';
        studyBtn.classList.add('active');
        
        // Mostrar painel de estatísticas
        toggleStatsPanel(true);
        
        // Iniciar timer
        startStudyTimer();
    } else {
        // Parar modo de estudo
        studyBtn.innerHTML = '<span class="btn-icon">🎯</span> Modo Estudo';
        studyBtn.classList.remove('active');
        
        stopStudyTimer();
    }
}

function toggleStatsPanel(forceOpen = false) {
    const statsPanel = document.getElementById('statsPanel');
    const isOpen = statsPanel.classList.contains('open');
    
    if (forceOpen || !isOpen) {
        statsPanel.classList.add('open');
        updateStatsDisplay();
        
        // Criar overlay para mobile
        if (window.innerWidth <= 768) {
            createStatsOverlay();
        }
    } else {
        statsPanel.classList.remove('open');
        removeStatsOverlay();
    }
}

function createStatsOverlay() {
    if (document.getElementById('statsOverlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'statsOverlay';
    overlay.className = 'stats-overlay show';
    overlay.onclick = () => toggleStatsPanel();
    document.body.appendChild(overlay);
}

function removeStatsOverlay() {
    const overlay = document.getElementById('statsOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function recordCardView(card) {
    studyStats.cardsViewed++;
    studyStats.currentStreak++;
    
    // Registrar por categoria
    const category = card.category || 'outros';
    studyStats.categoryViews[category] = (studyStats.categoryViews[category] || 0) + 1;
    
    updateStatsDisplay();
}

function updateStatsDisplay() {
    // Atualizar cards visualizados
    const totalCardsViewed = document.getElementById('totalCardsViewed');
    if (totalCardsViewed) {
        totalCardsViewed.textContent = studyStats.cardsViewed;
    }
    
    // Atualizar sequência atual
    const currentStreak = document.getElementById('currentStreak');
    if (currentStreak) {
        currentStreak.textContent = studyStats.currentStreak;
    }
    
    // Atualizar estatísticas por categoria
    updateCategoryStatsDisplay();
}

function updateCategoryStatsDisplay() {
    const categoryStatsContainer = document.getElementById('categoryStats');
    if (!categoryStatsContainer) return;
    
    const categoryMeta = cardsData.metadata?.categories || {};
    
    const statsHTML = Object.entries(studyStats.categoryViews)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => {
            const meta = categoryMeta[category];
            const icon = meta?.icon || '📚';
            const name = meta?.name || category;
            
            return `
                <div class="category-stat-item">
                    <div class="category-stat-name">
                        <span>${icon}</span>
                        <span>${name}</span>
                    </div>
                    <div class="category-stat-value">${count}</div>
                </div>
            `;
        }).join('');
    
    categoryStatsContainer.innerHTML = statsHTML || '<p style="text-align: center; color: var(--text-secondary);">Nenhum card visualizado ainda</p>';
}

let studyTimer;
function startStudyTimer() {
    studyTimer = setInterval(() => {
        if (studyStats.startTime) {
            const elapsed = Date.now() - studyStats.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const studyTimeElement = document.getElementById('studyTime');
            if (studyTimeElement) {
                studyTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);
}

function stopStudyTimer() {
    if (studyTimer) {
        clearInterval(studyTimer);
        studyTimer = null;
    }
}

function resetStats() {
    studyStats.cardsViewed = 0;
    studyStats.currentStreak = 0;
    studyStats.categoryViews = {};
    studyStats.startTime = studyStats.isStudyMode ? Date.now() : null;
    
    updateStatsDisplay();
}function nextCard() {
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
        loadPopularTags();
    }, 100);
};
