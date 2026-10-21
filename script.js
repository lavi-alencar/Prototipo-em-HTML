
/* =====================================================
   PARTE 1: LISTA DAS CATEGORIAS DO SITE
   Aqui estão todas as categorias. Cada uma tem o NOME que a pessoa
   vê no botão e o ARQUIVO da página dela.

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
   PARTE 2: BOTÃO "ALTERAR TIPO DE NEGÓCIO"
   (só funciona nas páginas de categoria, que têm esse botão)
   ===================================================== */

// Procura na página o botão e o espaço onde vão aparecer as categorias.
const botaoTipo = document.getElementById("btnTipo");
const listaTipos = document.getElementById("listaTipos");

// "if" significa "se". Só continua se a página TEM o botão e a lista.
// Assim, na página inicial (que não tem), nada acontece e não dá erro.
if (botaoTipo && listaTipos) {

    // Descobre o nome do arquivo da página em que a pessoa está agora.
    // Exemplo: se o endereço termina em /beleza.html, guarda "beleza.html".
    const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();

    // Monta a lista: para cada categoria, cria um botão com link.
    categorias.forEach(function (categoria) {

        // A categoria da página atual não aparece, porque a pessoa já está nela.
        if (categoria.arquivo === paginaAtual) {
            return;
        }

        const item = document.createElement("li");   // cria um item da lista
        const link = document.createElement("a");    // cria um link
        link.textContent = categoria.nome;           // escreve o nome (ex.: "Moda")
        link.href = categoria.arquivo;               // define para onde o link leva

        item.appendChild(link);       // coloca o link dentro do item
        listaTipos.appendChild(item); // coloca o item dentro da lista
    });

    // Quando a pessoa CLICAR no botão, mostra ou esconde as categorias.
    botaoTipo.addEventListener("click", function () {

        // A lista começa escondida. A cada clique ela troca:
        // se estava escondida, aparece; se estava aparecendo, esconde.
        listaTipos.hidden = !listaTipos.hidden;

        // Avisa aos leitores de tela (para pessoas com deficiência visual)
        // se a lista está aberta ou fechada. O CSS também usa isso para
        // deixar o botão preenchido enquanto a lista está aberta.
        botaoTipo.setAttribute("aria-expanded", String(!listaTipos.hidden));
    });
}


/* =====================================================
   PARTE 3: DESTAQUE DO MENU NA PÁGINA INICIAL
   Enquanto a pessoa rola a página, o link do menu da parte que
   está na tela fica destacado (com fundo bege).
   (só funciona na página inicial; nas outras os links do menu
   levam para outra página e este trecho não faz nada)
   ===================================================== */

// Pega só os links do menu que levam para uma parte DESTA mesma página
// (os que começam com #, como "#quem-somos").
const linksDoMenu = document.querySelectorAll('.list-nav a[href^="#"]');

// Só continua se existir algum link assim.
if (linksDoMenu.length > 0) {

    function destacarMenu() {

        // Distância do topo da tela a partir da qual consideramos que
        // uma parte "chegou". É um pouco maior que a altura do menu,
        // para o destaque trocar na hora certa.
        const linhaDeChegada = 140;

        let linkAtual = null;      // o link que vai ficar destacado
        let menorDistancia = -Infinity; // ajuda a achar a parte mais próxima do topo

        // Olha cada link do menu e vê onde está a parte que ele aponta.
        linksDoMenu.forEach(function (link) {
            const parte = document.querySelector(link.getAttribute("href"));
            if (!parte) {
                return; // se a parte não existe na página, pula
            }

            // Distância entre o topo da tela e o começo da parte.
            // Número negativo = a parte já passou do topo.
            const distancia = parte.getBoundingClientRect().top;

            // Escolhe a parte que já chegou e está mais perto do topo.
            if (distancia <= linhaDeChegada && distancia > menorDistancia) {
                menorDistancia = distancia;
                linkAtual = link;
            }
        });

        // Se a pessoa chegou ao FIM da página, destaca "Contatos",
        // porque o fim da página é a parte de contato.
        const chegouNoFim = window.innerHeight + window.scrollY >= document.body.offsetHeight - 4;
        if (chegouNoFim) {
            const linkContatos = document.querySelector('.list-nav a[href="#contatos"]');
            if (linkContatos) {
                linkAtual = linkContatos;
            }
        }

        // Tira o destaque de todos os links...
        linksDoMenu.forEach(function (link) {
            link.classList.remove("ativo");
        });

        // ...e coloca só no link escolhido.
        // ("ativo" é o nome que o style.css usa para pintar de bege.)
        if (linkAtual) {
            linkAtual.classList.add("ativo");
        }
    }

    // Roda uma vez quando a página abre...
    destacarMenu();

    // ...e de novo toda vez que a pessoa rola a página ou muda o tamanho da tela.
    window.addEventListener("scroll", destacarMenu);
    window.addEventListener("resize", destacarMenu);
}
