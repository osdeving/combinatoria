// Dados e estado da aplicação
let currentData = [];
let allCards = [];
let filteredCards = [];
let currentCardIndex = 0;
let studyMode = false;
let isFlipped = false;

// Estatísticas da sessão
let sessionStats = {
    correct: 0,
    incorrect: 0,
    skipped: 0,
    startTime: Date.now(),
    studyTime: 0,
};

// Estado da aplicação
let appState = {
    activeCategory: "todas",
    activeDifficulty: "todas",
    activeSearch: "",
    activeTags: new Set(),
    showExplanation: false,
    sidebarOpen: false,
    isMobile: window.innerWidth <= 768,
};

// Inicialização simplificada
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado, iniciando aplicação...");
    
    // Inicializar imediatamente
    setTimeout(() => {
        console.log("Carregando flashcards...");
        loadFlashcards();
        setupEventListeners();
        setupResponsive();
    }, 100);
});// Carregamento dos dados
async function loadFlashcards() {
    try {
        const response = await fetch("cards.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allCards = data.cards || [];
        filteredCards = [...allCards];
        currentData = [...allCards];

        console.log(`Carregadas ${allCards.length} cartas`);

        updateCounters();
        updateProgressBar();
        showCard(0);
        renderSidebarContent();
    } catch (error) {
        console.error("Erro ao carregar flashcards:", error);
        document.querySelector(".flashcard").innerHTML = `
            <div class="card-face card-front">
                <div class="question">❌ Erro ao carregar dados: ${error.message}</div>
            </div>
        `;
    }
}

// Configuração de event listeners
function setupEventListeners() {
    // Toggle da sidebar
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const overlay = document.querySelector(".sidebar-overlay");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleSidebar);
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileSidebar);
    }

    if (overlay) {
        overlay.addEventListener("click", closeMobileSidebar);
    }

    // Botões de navegação da sidebar
    setupSidebarNavigation();

    // Busca na sidebar
    const searchInput = document.querySelector(".sidebar-search");
    const searchClear = document.querySelector(".search-clear");

    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e);
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener("click", clearSearch);
    }

    // Controles principais
    const flashcard = document.querySelector(".flashcard");
    if (flashcard) {
        flashcard.addEventListener("click", flipCard);
    }

    // Botões de controle
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const randomBtn = document.getElementById("randomBtn");
    const studyBtn = document.getElementById("studyBtn");
    const explanationBtn = document.getElementById("explanationBtn");
    const statsBtn = document.getElementById("statsBtn");

    if (nextBtn) nextBtn.addEventListener("click", nextCard);
    if (prevBtn) prevBtn.addEventListener("click", previousCard);
    if (randomBtn) randomBtn.addEventListener("click", showRandomCard);
    if (studyBtn) studyBtn.addEventListener("click", toggleStudyMode);
    if (explanationBtn)
        explanationBtn.addEventListener("click", toggleExplanation);
    if (statsBtn) statsBtn.addEventListener("click", toggleStatsPanel);

    // Botões do modo estudo
    const correctBtn = document.getElementById("correctBtn");
    const incorrectBtn = document.getElementById("incorrectBtn");
    const skipBtn = document.getElementById("skipBtn");

    if (correctBtn)
        correctBtn.addEventListener("click", () => answerCard("correct"));
    if (incorrectBtn)
        incorrectBtn.addEventListener("click", () => answerCard("incorrect"));
    if (skipBtn) skipBtn.addEventListener("click", () => answerCard("skipped"));

    // Fechar painel de estatísticas
    const statsClose = document.querySelector(".stats-close");
    if (statsClose) {
        statsClose.addEventListener("click", toggleStatsPanel);
    }

    // Teclado
    document.addEventListener("keydown", handleKeyboard);

    // Resize
    window.addEventListener("resize", handleResize);
}

// Configuração da navegação da sidebar
function setupSidebarNavigation() {
    // Categorias
    const categoryBtns = document.querySelectorAll("[data-category]");
    categoryBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const category = btn.getAttribute("data-category");
            setActiveCategory(category);
        });
    });

    // Dificuldades
    const difficultyBtns = document.querySelectorAll("[data-difficulty]");
    difficultyBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const difficulty = btn.getAttribute("data-difficulty");
            setActiveDifficulty(difficulty);
        });
    });

    // Tags
    const tagBtns = document.querySelectorAll("[data-tag]");
    tagBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const tag = btn.getAttribute("data-tag");
            toggleTag(tag);
        });
    });

    // Botões de ação
    const actionBtns = document.querySelectorAll("[data-action]");
    actionBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const action = btn.getAttribute("data-action");
            handleAction(action);
        });
    });
}

// Gerenciamento da sidebar
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("collapsed");

    const icon = document.querySelector(".sidebar-toggle");
    if (sidebar.classList.contains("collapsed")) {
        icon.textContent = "→";
    } else {
        icon.textContent = "←";
    }
}

function toggleMobileSidebar() {
    appState.sidebarOpen = !appState.sidebarOpen;
    updateSidebarState();
}

function closeMobileSidebar() {
    appState.sidebarOpen = false;
    updateSidebarState();
}

function updateSidebarState() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (appState.isMobile) {
        if (appState.sidebarOpen) {
            sidebar.classList.add("open");
            overlay.classList.add("show");
        } else {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
        }
    }
}

// Filtros e busca
function setActiveCategory(category) {
    appState.activeCategory = category;
    applyFilters();
    updateSidebarActiveStates();
    if (appState.isMobile) {
        closeMobileSidebar();
    }
}

function setActiveDifficulty(difficulty) {
    appState.activeDifficulty = difficulty;
    applyFilters();
    updateSidebarActiveStates();
    if (appState.isMobile) {
        closeMobileSidebar();
    }
}

function toggleTag(tag) {
    if (appState.activeTags.has(tag)) {
        appState.activeTags.delete(tag);
    } else {
        appState.activeTags.add(tag);
    }
    applyFilters();
    updateSidebarActiveStates();
}

function handleSearch(e) {
    appState.activeSearch = e.target.value.toLowerCase().trim();
    applyFilters();

    const clearBtn = document.querySelector(".search-clear");
    if (clearBtn) {
        clearBtn.style.display = appState.activeSearch ? "block" : "none";
    }
}

function clearSearch() {
    const input = document.querySelector(".sidebar-search");
    if (input) {
        input.value = "";
        appState.activeSearch = "";
        applyFilters();

        const clearBtn = document.querySelector(".search-clear");
        if (clearBtn) {
            clearBtn.style.display = "none";
        }
    }
}

function applyFilters() {
    let filtered = [...allCards];

    // Filtro por categoria
    if (appState.activeCategory !== "todas") {
        filtered = filtered.filter(
            (card) => card.category === appState.activeCategory
        );
    }

    // Filtro por dificuldade
    if (appState.activeDifficulty !== "todas") {
        filtered = filtered.filter(
            (card) => card.difficulty === appState.activeDifficulty
        );
    }

    // Filtro por tags
    if (appState.activeTags.size > 0) {
        filtered = filtered.filter((card) => {
            if (!card.tags || !Array.isArray(card.tags)) return false;
            return Array.from(appState.activeTags).every((tag) =>
                card.tags.includes(tag)
            );
        });
    }

    // Filtro por busca
    if (appState.activeSearch) {
        filtered = filtered.filter((card) => {
            const searchIn = [
                card.q || card.question || "",
                card.a || card.answer || "",
                card.explanation || "",
                ...(card.tags || []),
            ]
                .join(" ")
                .toLowerCase();

            return searchIn.includes(appState.activeSearch);
        });
    }

    filteredCards = filtered;
    currentData = filtered;
    currentCardIndex = 0;

    updateCounters();
    updateProgressBar();

    if (filteredCards.length > 0) {
        showCard(currentCardIndex);
    } else {
        showNoCardsMessage();
    }
}

// Atualização dos estados ativos na sidebar
function updateSidebarActiveStates() {
    // Categorias
    document.querySelectorAll("[data-category]").forEach((btn) => {
        const category = btn.getAttribute("data-category");
        btn.classList.toggle("active", category === appState.activeCategory);
    });

    // Dificuldades
    document.querySelectorAll("[data-difficulty]").forEach((btn) => {
        const difficulty = btn.getAttribute("data-difficulty");
        btn.classList.toggle(
            "active",
            difficulty === appState.activeDifficulty
        );
    });

    // Tags
    document.querySelectorAll("[data-tag]").forEach((btn) => {
        const tag = btn.getAttribute("data-tag");
        btn.classList.toggle("active", appState.activeTags.has(tag));
    });
}

// Gerenciamento de ações
function handleAction(action) {
    switch (action) {
        case "clear-filters":
            appState.activeCategory = "todas";
            appState.activeDifficulty = "todas";
            appState.activeTags.clear();
            appState.activeSearch = "";

            const searchInput = document.querySelector(".sidebar-search");
            if (searchInput) searchInput.value = "";

            applyFilters();
            updateSidebarActiveStates();
            break;

        case "random-card":
            showRandomCard();
            if (appState.isMobile) closeMobileSidebar();
            break;

        case "study-mode":
            toggleStudyMode();
            if (appState.isMobile) closeMobileSidebar();
            break;
    }
}

// Navegação de cartas (otimizada)
function showCard(index) {
    if (!currentData || currentData.length === 0) {
        showNoCardsMessage();
        return;
    }

    if (index < 0) index = currentData.length - 1;
    if (index >= currentData.length) index = 0;

    currentCardIndex = index;
    const card = currentData[currentCardIndex];

    if (!card) {
        console.error("Carta não encontrada no índice:", index);
        return;
    }

    const flashcard = document.querySelector(".flashcard");
    const questionEl = document.querySelector(".question");
    const answerEl = document.querySelector(".answer");

    if (!flashcard || !questionEl || !answerEl) {
        console.error("Elementos do flashcard não encontrados");
        return;
    }

    // Reset flip state
    isFlipped = false;
    flashcard.classList.remove("flipped");

    // Update content - usar as propriedades corretas do JSON
    const question = card.q || card.question || "Pergunta não disponível";
    const answer = card.a || card.answer || "Resposta não disponível";

    questionEl.innerHTML = question;
    answerEl.innerHTML = answer;

    // Render math apenas se KaTeX estiver disponível
    if (window.katex && window.renderMathInElement) {
        renderMathContent(questionEl);
        renderMathContent(answerEl);
    }

    // Update card styling
    const cardFront = document.querySelector(".card-front");
    if (cardFront && card.category) {
        cardFront.style.borderColor = getCategoryColor(card.category);
    }

    updateCardInfo(card);
    updateExplanation(card);
    updateProgressBar();
}

function nextCard() {
    if (currentData.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % currentData.length;
    showCard(currentCardIndex);
}

function previousCard() {
    if (currentData.length === 0) return;
    currentCardIndex =
        currentCardIndex > 0 ? currentCardIndex - 1 : currentData.length - 1;
    showCard(currentCardIndex);
}

function showRandomCard() {
    if (currentData.length === 0) return;
    currentCardIndex = Math.floor(Math.random() * currentData.length);
    showCard(currentCardIndex);
}

function flipCard() {
    const flashcard = document.querySelector(".flashcard");
    isFlipped = !isFlipped;
    flashcard.classList.toggle("flipped", isFlipped);
}

// Modo estudo
function toggleStudyMode() {
    studyMode = !studyMode;
    updateStudyModeUI();

    if (studyMode) {
        sessionStats = {
            correct: 0,
            incorrect: 0,
            skipped: 0,
            startTime: Date.now(),
            studyTime: 0,
        };
    }
}

function updateStudyModeUI() {
    const studyControls = document.querySelector(".study-controls");
    const normalControls = document.querySelector(".normal-controls");
    const studyBtn = document.getElementById("studyBtn");

    if (studyControls) {
        studyControls.style.display = studyMode ? "flex" : "none";
    }

    if (normalControls) {
        normalControls.style.display = studyMode ? "none" : "flex";
    }

    if (studyBtn) {
        studyBtn.classList.toggle("active", studyMode);
        studyBtn.innerHTML = studyMode
            ? '<span class="btn-icon">⏹️</span> Parar Estudo'
            : '<span class="btn-icon">📚</span> Modo Estudo';
    }

    // Atualizar botão na sidebar
    const sidebarStudyBtn = document.querySelector(
        '[data-action="study-mode"]'
    );
    if (sidebarStudyBtn) {
        sidebarStudyBtn.classList.toggle("active", studyMode);
    }
}

function answerCard(result) {
    sessionStats[result]++;
    sessionStats.studyTime = Date.now() - sessionStats.startTime;

    // Feedback visual
    showAnswerFeedback(result);

    // Próxima carta
    setTimeout(() => {
        nextCard();
    }, 1000);
}

function showAnswerFeedback(result) {
    const flashcard = document.querySelector(".flashcard");
    const currentClass = flashcard.className;

    flashcard.classList.add(`feedback-${result}`);

    setTimeout(() => {
        flashcard.className = currentClass;
    }, 1000);
}

// Explicações
function toggleExplanation() {
    appState.showExplanation = !appState.showExplanation;
    const explanationContent = document.querySelector(".explanation-content");
    const explanationBtn = document.getElementById("explanationBtn");

    if (explanationContent) {
        explanationContent.classList.toggle("show", appState.showExplanation);
    }

    if (explanationBtn) {
        explanationBtn.classList.toggle("active", appState.showExplanation);
        const icon = explanationBtn.querySelector(".btn-icon");
        if (icon) {
            icon.textContent = appState.showExplanation ? "📖" : "💡";
        }
    }
}

function updateExplanation(card) {
    const explanationText = document.getElementById("explanationText");
    const explanationBtn = document.getElementById("explanationBtn");

    if (!explanationText || !explanationBtn) {
        console.log("Elementos de explicação não encontrados:", {
            explanationText: !!explanationText,
            explanationBtn: !!explanationBtn
        });
        return;
    }

    if (card.explanation && card.explanation.trim()) {
        console.log("Mostrando explicação:", card.explanation);
        explanationBtn.style.display = "inline-flex";
        explanationText.innerHTML = card.explanation;
        renderMathContent(explanationText);
    } else {
        console.log("Nenhuma explicação encontrada para esta carta");
        explanationBtn.style.display = "none";
        appState.showExplanation = false;
        const explanationContent = document.getElementById("explanationContent");
        if (explanationContent) {
            explanationContent.classList.remove("show");
        }
    }
}

// Estatísticas
function toggleStatsPanel() {
    const statsPanel = document.querySelector(".stats-panel");
    if (statsPanel) {
        statsPanel.classList.toggle("open");
        updateStatsPanel();
    }
}

function updateStatsPanel() {
    updateGeneralStats();
    updateCategoryStats();
    updateSessionStats();
}

function updateGeneralStats() {
    const totalCards = allCards.length;
    const filteredCount = filteredCards.length;
    const categoriesCount = new Set(allCards.map((card) => card.category)).size;
    const progress =
        filteredCount > 0
            ? Math.round(((currentCardIndex + 1) / filteredCount) * 100)
            : 0;

    const statElements = {
        "total-cards": totalCards,
        "filtered-cards": filteredCount,
        "categories-count": categoriesCount,
        "current-progress": `${progress}%`,
    };

    Object.entries(statElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateCategoryStats() {
    const categoryStats = {};
    allCards.forEach((card) => {
        const category = card.category || "Sem categoria";
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const container = document.querySelector(".category-stats");
    if (!container) return;

    container.innerHTML = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])
        .map(
            ([category, count]) => `
            <div class="category-stat-item">
                <div class="category-stat-name">
                    <span style="color: ${getCategoryColor(category)}">●</span>
                    ${category}
                </div>
                <div class="category-stat-value">${count}</div>
            </div>
        `
        )
        .join("");
}

function updateSessionStats() {
    if (!studyMode) return;

    const total =
        sessionStats.correct + sessionStats.incorrect + sessionStats.skipped;
    const accuracy =
        total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;
    const timeSpent = Math.round(
        (Date.now() - sessionStats.startTime) / 1000 / 60
    );

    const sessionElements = {
        "session-correct": sessionStats.correct,
        "session-incorrect": sessionStats.incorrect,
        "session-skipped": sessionStats.skipped,
        "session-accuracy": `${accuracy}%`,
        "session-time": `${timeSpent} min`,
    };

    Object.entries(sessionElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// Utilitários
function updateCounters() {
    // Atualizar contadores na sidebar
    const categoryCounters = {
        todas: allCards.length,
        permutacao: allCards.filter((c) => c.category === "permutacao").length,
        arranjo: allCards.filter((c) => c.category === "arranjo").length,
        combinacao: allCards.filter((c) => c.category === "combinacao").length,
        principios: allCards.filter((c) => c.category === "principios").length,
    };

    const difficultyCounters = {
        todas: allCards.length,
        basico: allCards.filter((c) => c.difficulty === "basico").length,
        intermediario: allCards.filter((c) => c.difficulty === "intermediario")
            .length,
    };

    // Atualizar elementos na sidebar
    Object.entries(categoryCounters).forEach(([category, count]) => {
        const counter = document.querySelector(
            `[data-category="${category}"] .nav-count`
        );
        if (counter) counter.textContent = count;
    });

    Object.entries(difficultyCounters).forEach(([difficulty, count]) => {
        const counter = document.querySelector(
            `[data-difficulty="${difficulty}"] .nav-count`
        );
        if (counter) counter.textContent = count;
    });

    // Atualizar contadores de tags
    const tagCounts = {};
    allCards.forEach((card) => {
        if (card.tags && Array.isArray(card.tags)) {
            card.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    Object.entries(tagCounts).forEach(([tag, count]) => {
        const counter = document.querySelector(
            `[data-tag="${tag}"] .tag-count`
        );
        if (counter) counter.textContent = count;
    });
}

function updateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");
    const progressPercentage = document.querySelector(".progress-percentage");

    if (filteredCards.length === 0) {
        if (progressFill) progressFill.style.width = "0%";
        if (progressText) progressText.textContent = "Nenhuma carta encontrada";
        if (progressPercentage) progressPercentage.textContent = "0%";
        return;
    }

    const progress = Math.round(
        ((currentCardIndex + 1) / filteredCards.length) * 100
    );

    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
        progressText.textContent = `Carta ${currentCardIndex + 1} de ${
            filteredCards.length
        }`;
    }

    if (progressPercentage) {
        progressPercentage.textContent = `${progress}%`;
    }
}

function updateCardInfo(card) {
    // Atualizar informações do card atual se necessário
    const cardElement = document.querySelector(".flashcard");
    if (cardElement) {
        cardElement.setAttribute("data-category", card.category);
        cardElement.setAttribute("data-difficulty", card.difficulty);
    }
}

function getCategoryColor(category) {
    const colors = {
        permutacao: "var(--permutacao-color)",
        arranjo: "var(--arranjo-color)",
        combinacao: "var(--combinacao-color)",
        principios: "var(--principios-color)",
    };
    return colors[category] || "var(--primary-color)";
}

function showNoCardsMessage() {
    const flashcard = document.querySelector(".flashcard");
    if (flashcard) {
        flashcard.innerHTML = `
            <div class="flashcard-inner">
                <div class="card-face card-front">
                    <div class="question">
                        <div style="text-align: center; color: var(--text-secondary);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Nenhuma carta encontrada</div>
                            <div style="font-size: 1rem;">Tente ajustar os filtros ou limpar a busca</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Renderização de conteúdo da sidebar
function renderSidebarContent() {
    renderTagsInSidebar();
}

function renderTagsInSidebar() {
    const tagsContainer = document.querySelector(".tags-grid");
    if (!tagsContainer) return;

    const allTags = new Set();
    const tagCounts = {};

    allCards.forEach((card) => {
        if (card.tags && Array.isArray(card.tags)) {
            card.tags.forEach((tag) => {
                allTags.add(tag);
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    const sortedTags = Array.from(allTags).sort();

    tagsContainer.innerHTML = sortedTags
        .map(
            (tag) => `
        <button class="tag-btn" data-tag="${tag}">
            <span>${tag}</span>
            <span class="tag-count">${tagCounts[tag] || 0}</span>
        </button>
    `
        )
        .join("");

    // Reconfigurar event listeners para as novas tags
    tagsContainer.querySelectorAll("[data-tag]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const tag = btn.getAttribute("data-tag");
            toggleTag(tag);
        });
    });
}

// Teclado
function handleKeyboard(e) {
    if (e.target.tagName === "INPUT") return;

    switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
            e.preventDefault();
            previousCard();
            break;
        case "ArrowRight":
        case "ArrowDown":
            e.preventDefault();
            nextCard();
            break;
        case " ":
            e.preventDefault();
            flipCard();
            break;
        case "r":
        case "R":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                showRandomCard();
            }
            break;
        case "s":
        case "S":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleStudyMode();
            }
            break;
        case "e":
        case "E":
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleExplanation();
            }
            break;
        case "Escape":
            if (appState.sidebarOpen && appState.isMobile) {
                closeMobileSidebar();
            }
            break;
    }

    // Teclas do modo estudo
    if (studyMode && isFlipped) {
        switch (e.key) {
            case "1":
                e.preventDefault();
                answerCard("correct");
                break;
            case "2":
                e.preventDefault();
                answerCard("incorrect");
                break;
            case "3":
                e.preventDefault();
                answerCard("skipped");
                break;
        }
    }
}

// Sistema responsivo
function setupResponsive() {
    handleResize();
}

function handleResize() {
    const wasMobile = appState.isMobile;
    appState.isMobile = window.innerWidth <= 768;

    if (wasMobile !== appState.isMobile) {
        if (!appState.isMobile) {
            // Desktop: fechar sidebar móvel se estava aberta
            appState.sidebarOpen = false;
        }
        updateSidebarState();
    }
}

// Atualização geral da UI (otimizada)
function updateUI() {
    updateSidebarActiveStates();
    updateStudyModeUI();
}

// Utilitário para renderização de matemática (renomeado para evitar conflito)
function renderMathContent(element) {
    if (!element || !window.katex || !window.renderMathInElement) return;

    try {
        window.renderMathInElement(element, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\[", right: "\\]", display: true },
                { left: "\\(", right: "\\)", display: false },
            ],
            throwOnError: false,
            errorColor: "#cc0000",
            strict: false,
        });
    } catch (error) {
        console.error("Erro ao renderizar matemática:", error);
    }
} // Função simplificada para debug (removida para otimização)
// window.testMath e window.forceRenderMath removidas

// Funções globais para o HTML
window.setCategory = function (category) {
    if (typeof setActiveCategory === "function") {
        setActiveCategory(category);
    }
};

window.setDifficulty = function (difficulty) {
    if (difficulty === "all") difficulty = "todas";
    if (typeof setActiveDifficulty === "function") {
        setActiveDifficulty(difficulty);
    }
};

window.shuffleCards = function () {
    if (typeof showRandomCard === "function") {
        showRandomCard();
    }
};

window.prevCard = function () {
    if (typeof previousCard === "function") {
        previousCard();
    }
};

window.nextCard = function () {
    if (currentData.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % currentData.length;
    if (typeof showCard === "function") {
        showCard(currentCardIndex);
    }
};

window.flipCard = function () {
    const flashcard = document.querySelector(".flashcard");
    if (flashcard) {
        isFlipped = !isFlipped;
        flashcard.classList.toggle("flipped", isFlipped);
    }
};

window.toggleReverse = function () {
    console.log("Função toggleReverse não implementada");
};

window.toggleExplanation = function () {
    console.log("Toggle explicação chamado");
    appState.showExplanation = !appState.showExplanation;
    const explanationContent = document.getElementById("explanationContent");
    const explanationBtn = document.getElementById("explanationBtn");

    console.log("Estado da explicação:", appState.showExplanation);
    console.log("Elementos encontrados:", {
        explanationContent: !!explanationContent,
        explanationBtn: !!explanationBtn
    });

    if (explanationContent) {
        explanationContent.classList.toggle("show", appState.showExplanation);
        // Também usar display como fallback
        explanationContent.style.display = appState.showExplanation ? "block" : "none";
    }

    if (explanationBtn) {
        explanationBtn.classList.toggle("active", appState.showExplanation);
        const icon = explanationBtn.querySelector(".btn-icon");
        if (icon) {
            icon.textContent = appState.showExplanation ? "📖" : "💡";
        }
    }
};

window.toggleStatsPanel = function () {
    const statsPanel = document.querySelector(".stats-panel");
    if (statsPanel) {
        statsPanel.classList.toggle("open");
    }
};

window.resetStats = function () {
    sessionStats = {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        startTime: Date.now(),
        studyTime: 0,
    };
};

window.toggleSidebar = function () {
    if (appState.isMobile) {
        if (typeof toggleMobileSidebar === "function") {
            toggleMobileSidebar();
        }
    } else {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.toggle("collapsed");
        }
    }
};

window.toggleStudyMode = function () {
    studyMode = !studyMode;
    const studyBtn = document.getElementById("studyModeBtn");
    if (studyBtn) {
        studyBtn.classList.toggle("active", studyMode);
    }
};

window.performSearch = function () {
    const input = document.querySelector(".sidebar-search");
    if (input && typeof handleSearch === "function") {
        handleSearch({ target: input });
    }
};

window.clearSearch = function () {
    const input = document.querySelector(".sidebar-search");
    const clearBtn = document.querySelector(".search-clear");
    if (input) {
        input.value = "";
        appState.activeSearch = "";
        if (typeof applyFilters === "function") {
            applyFilters();
        }
        if (clearBtn) clearBtn.style.display = "none";
    }
};
