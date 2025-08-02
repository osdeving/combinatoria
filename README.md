# 🎯 Flashcards de Combinatória

Um sistema moderno e interativo de flashcards para estudar **Análise Combinatória**, com funcionalidades avançadas de filtragem, busca e acompanhamento de progresso.

## ✨ Características Principais

### 📚 **Conteúdo Educacional**

-   **37 flashcards** cuidadosamente elaborados
-   **3 categorias principais**: Permutação, Arranjo, Combinação
-   **2 níveis de dificuldade**: Básico, Intermediário
-   **Explicações detalhadas** com natureza do problema e fórmulas utilizadas
-   **Suporte completo a LaTeX/KaTeX** para fórmulas matemáticas

### 🎛️ **Sistema de Navegação Avançado**

-   **Filtros por categoria** com contadores dinâmicos
-   **Filtros por dificuldade**
-   **Busca em tempo real** (pergunta, resposta, explicação)
-   **Sistema de tags** com as 10 tags mais populares
-   **Filtros combinados** para estudos personalizados

### 📊 **Modo de Estudo e Estatísticas**

-   **Modo de estudo focado** com tracking automático
-   **Painel de estatísticas** em tempo real
-   **Métricas detalhadas**: cards visualizados, tempo de estudo, sequência atual
-   **Breakdown por categoria** com estatísticas visuais
-   **Timer integrado** para sessões de estudo

### 🎨 **Interface Moderna**

-   **Design responsivo** para desktop e mobile
-   **Animações suaves** e transições fluidas
-   **Tema escuro/claro** automático baseado na preferência do sistema
-   **Acessibilidade completa** com suporte a teclado e screen readers
-   **Barra de progresso visual** com porcentagem

## 🚀 Como Usar

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd combinatoria

# Abra o arquivo index.html em qualquer navegador moderno
# Ou use um servidor local:
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Navegação Básica

-   **Clique no card** ou pressione **Espaço/Enter** para virar
-   **Setas ←/→** para navegar entre cards
-   **Botões de categoria** para filtrar conteúdo
-   **Barra de busca** para encontrar cards específicos

### Modo de Estudo

1. Clique em **"Modo Estudo"** para iniciar tracking
2. Navegue pelos cards normalmente
3. Acompanhe suas estatísticas em tempo real
4. Use **"Reset Estatísticas"** para começar nova sessão

## 📁 Estrutura do Projeto

```
combinatoria/
├── index.html          # Interface principal
├── script.js           # Lógica da aplicação
├── style.css           # Estilos e responsividade
├── cards.json          # Base de dados estruturada
├── README.md           # Documentação
└── scripts/
    ├── add_metadata.js # Script para adicionar metadados
    └── restructure.js  # Script de reestruturação
```

## 🎯 Categorias de Conteúdo

### 🔄 **Permutação**

-   Anagramas e reorganizações
-   Permutação simples e com repetição
-   Permutação circular
-   **12 flashcards**

### 📊 **Arranjo**

-   Arranjos simples e com repetição
-   Problemas de ordenação
-   Casos com restrições
-   **13 flashcards**

### 🎯 **Combinação**

-   Combinações simples e com repetição
-   Subconjuntos e seleções
-   Problemas sem ordem
-   **12 flashcards**

## 🔧 Funcionalidades Técnicas

### Sistema de Filtros

-   **Categoria**: Permutação, Arranjo, Combinação
-   **Dificuldade**: Básico, Intermediário
-   **Tags**: exemplo-pratico, formula-fundamental, fatorial, etc.
-   **Busca textual**: Busca em pergunta, resposta e explicação

### Metadados dos Cards

```json
{
    "id": 1,
    "type": "exemplo",
    "category": "permutacao",
    "difficulty": "basico",
    "tags": ["anagrama", "permutacao-simples"],
    "q": "Pergunta...",
    "a": "Resposta...",
    "explanation": "Explicação detalhada..."
}
```

## 📱 Compatibilidade

-   ✅ **Chrome, Firefox, Safari, Edge** (versões modernas)
-   ✅ **Mobile**: iOS Safari, Chrome Mobile
-   ✅ **Tablets**: Responsivo completo
-   ✅ **Acessibilidade**: WCAG 2.1 AA

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas

-   **HTML5** semântico
-   **CSS3** com custom properties e grid/flexbox
-   **JavaScript ES6+** vanilla
-   **KaTeX** para renderização de fórmulas
-   **Git** para controle de versão

### Estrutura de Commits

-   **Fase 1**: Estruturação dos dados com metadados
-   **Fase 2**: Interface de navegação e filtros
-   **Fase 3**: Funcionalidades avançadas (busca, estatísticas)
-   **Fase 4**: Melhorias finais e documentação

### Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📈 Estatísticas do Projeto

-   **37 flashcards** com explicações detalhadas
-   **3 categorias** principais de combinatória
-   **10+ tags** para filtragem específica
-   **100% responsivo** para todos os dispositivos
-   **Suporte completo a LaTeX** para fórmulas matemáticas

## 🎓 Metodologia Educacional

### Explicações Estruturadas

Cada flashcard segue o padrão:

1. **Natureza do problema**: Classificação (arranjo/combinação/permutação)
2. **Justificativa**: Por que usar determinada fórmula
3. **Fórmula aplicada**: Qual fórmula matemática utilizar
4. **Exemplo prático**: Cálculo step-by-step
5. **Comparação**: "Se fosse o caso contrário..."

### Níveis de Dificuldade

-   **Básico**: Conceitos fundamentais e fórmulas
-   **Intermediário**: Aplicações práticas e cálculos complexos
-   **Avançado**: Problemas desafiadores (futuro)

## 📞 Suporte

Para dúvidas, sugestões ou relatórios de bugs, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para estudantes de Matemática e Combinatória**
