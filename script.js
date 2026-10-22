/* =====================================================
   PARTE 1: LISTA DAS CATEGORIAS DO SITE
   ===================================================== */
const categorias = [
    { nome: "Moda",        arquivo: "moda.html" },
    { nome: "Alimentação", arquivo: "alimentacao.html" },
    { nome: "Decoração",   arquivo: "decoracao.html" },
    { nome: "Beleza",      arquivo: "beleza.html" },
    { nome: "Festa",       arquivo: "festa.html" },
    { nome: "Pets",        arquivo: "pets.html" }
];

/* =====================================================
   PARTE 2: BUSCA, LOCALIZAÇÃO E FILTRO INTERNO
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const formBusca = document.getElementById("form-busca");
    const campoLocalizacao = document.getElementById("campo-localizacao");

    // 1. Evita recarregar a tela ao dar Enter
    if (formBusca) {
        formBusca.addEventListener("submit", (e) => { e.preventDefault(); filtrarEstabelecimentos(); irParaCategorias(); });
    }

    // 2. Guarda no localStorage tudo o que o usuário digitar no input
    if (campoLocalizacao) {
        campoLocalizacao.value = localStorage.getItem("bairro_selecionado") || "";
        campoLocalizacao.addEventListener("input", function () {
            localStorage.setItem("bairro_selecionado", this.value.trim());
            filtrarEstabelecimentos();
            // Quando o CEP fica completo (8 números), desce sozinho até as categorias
            if (this.value.replace(/\D/g, "").length === 8) irParaCategorias();
        });
    }

    // Inicializa o menu de tipo de negócio e o filtro dos estabelecimentos
    inicializarMenuNegocio();
    filtrarEstabelecimentos();
});

/* =====================================================
   PARTE 3: BOTÃO "ALTERAR TIPO DE NEGÓCIO" (Corrigido)
   ===================================================== */
function inicializarMenuNegocio() {
    const botaoTipo = document.getElementById("btnTipo");
    const listaTipos = document.getElementById("listaTipos");
    if (!botaoTipo || !listaTipos) return;

    // Limpa a lista e preenche só com as categorias que NÃO são a página atual
    const caminhoUrl = window.location.pathname.toLowerCase();
    listaTipos.innerHTML = "";
    categorias.filter(c => !caminhoUrl.endsWith(c.arquivo.toLowerCase())).forEach(({ nome, arquivo }) => {
        listaTipos.innerHTML += `<li><a href="${arquivo}">${nome}</a></li>`;
    });

    // Garante o funcionamento do clique para alternar visibilidade
    botaoTipo.onclick = function (e) {
        e.preventDefault();
        const abrir = listaTipos.hasAttribute("hidden");
        listaTipos.toggleAttribute("hidden", !abrir);
        listaTipos.style.display = abrir ? "block" : "none";
        botaoTipo.setAttribute("aria-expanded", abrir);
    };
}

/* =====================================================
   PARTE 4: FILTRO DOS ESTABELECIMENTOS POR BAIRRO OU CEP
   Os dados de cada negócio ficam no HTML de cada categoria (cards com data-bairro).
   Aqui o JS só mostra os cards do bairro digitado e esconde os outros.
   ===================================================== */
async function obterBairroReal(entrada) {
    const limpo = entrada.replace(/\D/g, ""); // Remove letras e traços
    // Se a entrada for um CEP de 8 dígitos, consulta o ViaCEP
    if (limpo.length === 8) {
        try {
            const dados = await (await fetch(`https://viacep.com.br/ws/${limpo}/json/`)).json();
            if (!dados.erro && dados.bairro) return dados.bairro; // Ex: "Ponto Certo"
        } catch (e) { console.error("Erro na busca por CEP:", e); }
    }
    return entrada; // Já é o nome do bairro
}

// Deixa o texto sem acento, minúsculo e com hífen: "Gleba É" vira "gleba-e" (igual ao data-bairro do HTML)
function padronizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, "-");
}

async function filtrarEstabelecimentos() {
    const container = document.getElementById("lista-estabelecimentos");
    if (!container) return;

    const digitado = await obterBairroReal(localStorage.getItem("bairro_selecionado") || "");
    const busca = padronizar(digitado);
    let encontrados = 0;

    container.querySelectorAll(".estabelecimento-card").forEach((card) => {
        const bairro = card.dataset.bairro || "";
        const mostrar = !busca || bairro.includes(busca) || busca.includes(bairro);
        card.style.display = mostrar ? "" : "none";
        // Esconde também o tracinho que vem logo depois do card
        const tracinho = card.nextElementSibling;
        if (tracinho?.matches("hr.tracinho")) tracinho.style.display = card.style.display;
        if (mostrar) encontrados++;
    });

    // Aviso quando nenhum negócio é do bairro digitado
    let aviso = document.getElementById("aviso-vazio");
    if (!aviso) {
        aviso = document.createElement("p");
        aviso.id = "aviso-vazio";
        aviso.style.cssText = "text-align:center; color:#5f2c0a; margin:20px 0;";
        container.prepend(aviso);
    }
    aviso.textContent = encontrados ? "" : `Nenhum estabelecimento encontrado no bairro ${digitado}.`;
}

// Desce suavemente até a escolha das categorias (só na Home e só se algo foi digitado)
function irParaCategorias() {
    const secao = document.getElementById("comercios");
    if (!secao || !localStorage.getItem("bairro_selecionado")) return;
    secao.style.scrollMarginTop = "100px"; // deixa espaço para o menu fixo no topo
    secao.scrollIntoView({ behavior: "smooth" });
}

/* =====================================================
   PARTE 5: BOTÕES DOS CARDS (ROTAS, WHATSAPP E INSTAGRAM)
   Cada card guarda os dados em data-endereco, data-whatsapp e data-instagram.
   Se o dado estiver vazio, o botão avisa que o negócio ainda não cadastrou.
   ===================================================== */
document.addEventListener("click", function (e) {
    const botao = e.target.closest("a[data-acao]");
    if (!botao) return;
    e.preventDefault();

    const card = botao.closest(".estabelecimento-card");
    const { endereco, whatsapp, instagram } = card.dataset;
    const nome = card.querySelector("h1").textContent;
    // Para cada botão: [link de destino, aviso caso o dado esteja vazio]
    const acoes = {
        rotas: [endereco && `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, ${endereco}, Camaçari - BA`)}`, "O endereço deste negócio ainda não foi cadastrado."],
        whatsapp: [whatsapp && `https://wa.me/55${whatsapp.replace(/\D/g, "")}`, "Este negócio ainda não cadastrou um WhatsApp."],
        instagram: [instagram && `https://www.instagram.com/${instagram.replace("@", "")}`, "Este negócio ainda não cadastrou um Instagram."]
    };
    const [destino, aviso] = acoes[botao.dataset.acao];

    if (destino) window.open(destino, "_blank", "noopener");
    else alert(aviso);
});

/* =====================================================
   SISTEMA DE CADASTRO REAL DE NEGÓCIOS
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const btnAbrirModal = document.getElementById("btn-cadastrar-negocio");
    const btnFecharModal = document.getElementById("fechar-modal");
    const modal = document.getElementById("modal-cadastro");
    const formCadastrar = document.getElementById("form-cadastrar-real");

    if (btnAbrirModal && modal) {
        btnAbrirModal.onclick = () => modal.removeAttribute("hidden");
    }

    if (btnFecharModal && modal) {
        btnFecharModal.onclick = () => modal.setAttribute("hidden", "");
    }

    if (formCadastrar) {
        formCadastrar.onsubmit = function (e) {
            e.preventDefault();

            const novoNegocio = {
                nome: document.getElementById("cad-nome").value,
                categoria: document.getElementById("cad-categoria").value,
                bairro: document.getElementById("cad-bairro").value.toLowerCase().trim(),
                endereco: document.getElementById("cad-endereco").value,
                whatsapp: document.getElementById("cad-whatsapp").value,
                instagram: document.getElementById("cad-instagram").value
            };

            // Guarda no banco local de estabelecimentos cadastrados pelos usuários
            let cadastrados = JSON.parse(localStorage.getItem("negocios_cadastrados") || "[]");
            cadastrados.push(novoNegocio);
            localStorage.setItem("negocios_cadastrados", JSON.stringify(cadastrados));

            alert("Sucesso! Seu negócio foi cadastrado no Conectaê e já está disponível no seu bairro.");
            modal.setAttribute("hidden", "");
            formCadastrar.reset();
        };
    }
});

/* =====================================================
   GERENCIADOR DO MODAL E CADASTRO DINÂMICO
   ===================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const btnAbrirModal = document.getElementById("btn-cadastrar-negocio");
    const btnFecharModal = document.getElementById("fechar-modal");
    const modal = document.getElementById("modal-cadastro");
    const formCadastrar = document.getElementById("form-cadastrar-real");

    // 1. Controle de Abertura do Modal
    if (btnAbrirModal && modal) {
        btnAbrirModal.addEventListener("click", function (e) {
            e.preventDefault();
            modal.classList.add("ativo");
        });
    }

    // 2. Fechamento do Modal no botão de fechar (X)
    if (btnFecharModal && modal) {
        btnFecharModal.addEventListener("click", function () {
            modal.classList.remove("ativo");
        });
    }

    // 3. Fechamento ao clicar fora do conteúdo
    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.remove("ativo");
        }
    });

    // 4. Salva o negócio e atualiza/redireciona para exibir o novo cartão
    if (formCadastrar) {
        formCadastrar.addEventListener("submit", function (e) {
            e.preventDefault();

            const arquivoCategoria = document.getElementById("cad-categoria").value;
            const bairroOriginal = document.getElementById("cad-bairro").value.trim();

            const novoNegocio = {
                nome: document.getElementById("cad-nome").value.trim(),
                categoria: arquivoCategoria,
                bairro: bairroOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
                bairroExibicao: bairroOriginal,
                endereco: document.getElementById("cad-endereco").value.trim(),
                whatsapp: document.getElementById("cad-whatsapp").value.replace(/\D/g, ""),
                instagram: document.getElementById("cad-instagram").value.replace("@", "").trim()
            };

            // Salva na lista do localStorage
            let cadastrados = JSON.parse(localStorage.getItem("negocios_cadastrados") || "[]");
            cadastrados.unshift(novoNegocio); // Adiciona no início da lista
            localStorage.setItem("negocios_cadastrados", JSON.stringify(cadastrados));

            // Salva também o bairro para já abrir filtrado
            localStorage.setItem("bairro_selecionado", bairroOriginal);

            alert("Negócio cadastrado com sucesso! Redirecionando para a lista de cartões...");
            
            // Redireciona para a página da categoria correspondente para visualizar o novo cartão
            window.location.href = arquivoCategoria;
        });
    }

    // Executa a injeção dos negócios salvos pelo usuário caso esteja em uma página de categoria
    injetarNegociosCadastrados();
});

/* =====================================================
   FUNÇÃO PARA INJETAR NEGÓCIOS CADASTRADOS NOS CARTÕES
   ===================================================== */
function injetarNegociosCadastrados() {
    const container = document.getElementById("lista-estabelecimentos");
    if (!container) return;

    const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();
    const cadastrados = JSON.parse(localStorage.getItem("negocios_cadastrados") || "[]");

    // Filtra apenas os cadastros da categoria atual
    const negociosDaPagina = cadastrados.filter(item => item.categoria.toLowerCase() === paginaAtual);

    negociosDaPagina.forEach(item => {
        const artigo = document.createElement("article");
        artigo.className = "box estabelecimento-card";
        artigo.setAttribute("data-bairro", item.bairro);
        artigo.setAttribute("data-endereco", item.endereco);
        artigo.setAttribute("data-whatsapp", item.whatsapp);
        artigo.setAttribute("data-instagram", item.instagram);

        artigo.innerHTML = `
            <h1>${item.nome}</h1>
            <p style="font-size: 0.9rem; font-weight: bold; color: #813511; margin-bottom: 10px;">
                📍 ${item.endereco} - Bairro ${item.bairroExibicao || item.bairro}
            </p>
            <ul>
                <li><a href="#" data-acao="rotas">Ver rotas</a></li>
                <li><a href="#" data-acao="whatsapp">Entrar em contato no WhatsApp</a></li>
                <li><a href="#" data-acao="instagram">Encontrar no Instagram</a></li>
            </ul>
            <hr class="tracinho">
            <ul class="diferenciais">
                <li>Estabelecimento cadastrado recentemente na comunidade</li>
                <li>Atendimento local no bairro ${item.bairroExibicao || item.bairro} em Camaçari</li>
            </ul>
        `;

        // Insere o novo cartão no início da lista
        container.insertBefore(artigo, container.firstChild);
        
        // Insere a linha divisória <hr>
        const hr = document.createElement("hr");
        hr.className = "tracinho";
        container.insertBefore(hr, artigo.nextSibling);
    });

    // Reconfigura os links e eventos de clique para os novos botões criados
    if (typeof configurarBotoesCartoes === "function") {
        configurarBotoesCartoes();
    }
}
