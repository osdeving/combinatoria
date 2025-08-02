let cards = [];
let current = 0;
let reverse = false;
let flipped = false;
let explanationVisible = false;

async function loadCards() {
    try {
        const res = await fetch("cards.json");
        cards = await res.json();
        current = 0;
        showCard();
    } catch (error) {
        console.error("Erro ao carregar cards:", error);
        // Fallback para um card de exemplo se houver erro
        cards = [
            {
                type: "exemplo",
                q: "Erro ao carregar flashcards",
                a: "Verifique se o arquivo cards.json existe",
                explanation:
                    "Certifique-se de que o arquivo JSON está na mesma pasta que o HTML.",
            },
        ];
        current = 0;
        showCard();
    }
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
    if (!cards.length) return;
    const card = cards[current];
    const front = reverse ? card.a || "Sem resposta" : card.q;
    const back = reverse ? card.q : card.a || "Sem resposta";

    document.getElementById("question").innerHTML = front || "Carregando...";
    document.getElementById("answer").innerHTML = back || "Sem resposta";
    document.getElementById("progress").textContent = `Card ${current + 1} de ${
        cards.length
    }`;

    // Atualizar explicação
    updateExplanation();

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

window.onload = loadCards;
