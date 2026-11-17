
const btnAjuda = document.getElementById("btnAjuda");
const btnVoluntario = document.getElementById("btnVoluntario");

const formAjuda = document.getElementById("formAjuda");
const formVoluntario = document.getElementById("formVoluntario");

const solicitacaoAjuda = document.getElementById("solicitacaoAjuda");
const cadastroVoluntario = document.getElementById("cadastroVoluntario");

// Abrir formulário de ajuda
btnAjuda.addEventListener("click", function() {
    formAjuda.hidden = false;
    formVoluntario.hidden = true;
});

// Abrir formulário de voluntário
btnVoluntario.addEventListener("click", function() {
    formVoluntario.hidden = false;
    formAjuda.hidden = true;
});

// Recuperar cadastros armazenados
function obterCadastros(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch (erro) {
        return [];
    }
}

// Salvar cadastro no navegador
function salvarCadastro(chave, cadastro) {
    const cadastros = obterCadastros(chave);

    cadastro.dataCadastro = new Date().toLocaleString("pt-BR");

    cadastros.push(cadastro);

    localStorage.setItem(chave, JSON.stringify(cadastros));
}

// Enviar solicitação de ajuda

function configurarSelecaoDias(idContainer) {
    const container = document.getElementById(idContainer);

    if (!container) return;

    container.addEventListener("click", function(event) {
        const botao = event.target.closest(".dia-btn");

        if (!botao) return;

        botao.classList.toggle("selecionado");
    });
}

configurarSelecaoDias("diasAjuda");
configurarSelecaoDias("diasVoluntario");


solicitacaoAjuda.addEventListener("submit", function(event) {
    event.preventDefault();

    const cadastro = {
        nome: document.getElementById("nomeAjuda").value,

        tipoAjuda: Array.from(
            document.querySelectorAll(
                "#necessidadesAjuda input:checked"
            )
        ).map(item => item.value),

        dias: Array.from(
            document.querySelectorAll(
                "#diasAjuda .dia-btn.selecionado"
            )
        ).map(item => item.dataset.dia),

        horario: Array.from(
            document.querySelectorAll(
                "#periodosAjuda input:checked"
            )
        ).map(item => item.value),

        contato: document.getElementById("contatoAjuda").value
    };

    if (
        cadastro.tipoAjuda.length === 0 ||
        cadastro.dias.length === 0 ||
        cadastro.horario.length === 0
    ) {
        alert("Selecione pelo menos uma atividade, um dia e um período.");
        return;
    }

    salvarCadastro("solicitacoesAjuda", cadastro);

    alert("Solicitação salva com sucesso neste navegador!");

    solicitacaoAjuda.reset();

    document.querySelectorAll(
        "#diasAjuda .dia-btn"
    ).forEach(botao => {
        botao.classList.remove("selecionado");
    });
});



// Cadastrar voluntário

cadastroVoluntario.addEventListener("submit", function(event) {
    event.preventDefault();

    const cadastro = {
        nome: document.getElementById("nomeVoluntario").value,

        contato: document.getElementById("contatoVoluntario").value,

        habilidade: Array.from(
            document.querySelectorAll(
                "#habilidadesVoluntario input:checked"
            )
        ).map(item => item.value),

        dia: Array.from(
            document.querySelectorAll(
                "#diasVoluntario .dia-btn.selecionado"
            )
        ).map(item => item.dataset.dia),

        periodo: Array.from(
            document.querySelectorAll(
                "#periodosVoluntario input:checked"
            )
        ).map(item => item.value)
    };

    if (
        cadastro.habilidade.length === 0 ||
        cadastro.dia.length === 0 ||
        cadastro.periodo.length === 0
    ) {
        alert("Selecione pelo menos uma habilidade, um dia e um período.");
        return;
    }

    salvarCadastro("cadastrosVoluntarios", cadastro);

    alert("Cadastro de voluntário salvo com sucesso neste navegador!");

    cadastroVoluntario.reset();

    document.querySelectorAll(
        "#diasVoluntario .dia-btn"
    ).forEach(botao => {
        botao.classList.remove("selecionado");
    });
});



// ELEMENTOS DO PAINEL ADMINISTRATIVO

const btnPainel = document.getElementById("btnPainel");
const btnFecharPainel = document.getElementById("btnFecharPainel");
const painelAdmin = document.getElementById("painelAdmin");

// Abrir painel
btnPainel.addEventListener("click", function() {

    formAjuda.hidden = true;
    formVoluntario.hidden = true;
    painelAdmin.hidden = false;

    atualizarPainel();
});

// Fechar painel
btnFecharPainel.addEventListener("click", function() {
    painelAdmin.hidden = true;
});

// Criar listas de cadastros
function mostrarLista(elementoId, cadastros, campos) {

    const lista = document.getElementById(elementoId);

    lista.replaceChildren();

    if (cadastros.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum cadastro encontrado.";
        lista.appendChild(mensagem);
        return;
    }

    cadastros.forEach(function(cadastro) {

        const card = document.createElement("article");

        campos.forEach(function(campo) {

            const informacao = document.createElement("p");

            informacao.textContent =
                campo.titulo + ": " + (cadastro[campo.chave] || "-");

            card.appendChild(informacao);

        });

        lista.appendChild(card);

    });
}

// Atualizar informações do painel
function atualizarPainel() {

    const solicitacoes = obterCadastros("solicitacoesAjuda");
    const voluntarios = obterCadastros("cadastrosVoluntarios");

    document.getElementById("totalAjuda").textContent =
        solicitacoes.length;

    document.getElementById("totalVoluntarios").textContent =
        voluntarios.length;

    mostrarLista("listaAjuda", solicitacoes, [
        { titulo: "Nome", chave: "nome" },
        { titulo: "Ajuda necessária", chave: "tipoAjuda" },
        { titulo: "Horário", chave: "horario" },
        { titulo: "Contato", chave: "contato" },
        { titulo: "Data do cadastro", chave: "dataCadastro" }
    ]);

    mostrarLista("listaVoluntarios", voluntarios, [
        { titulo: "Nome", chave: "nome" },
        { titulo: "Contato", chave: "contato" },
        { titulo: "Habilidade", chave: "habilidade" },
        { titulo: "Dia disponível", chave: "dia" },
        { titulo: "Período", chave: "periodo" },
        { titulo: "Data do cadastro", chave: "dataCadastro" }
    ]);
    encontrarVoluntariosCompativeis();
}

// IDENTIFICAR VOLUNTÁRIOS COMPATÍVEIS


function encontrarVoluntariosCompativeis() {

    const solicitacoes = obterCadastros("solicitacoesAjuda");
    const voluntarios = obterCadastros("cadastrosVoluntarios");

    const correspondencias = {
        "Usar o celular": "Uso básico do celular",
        "Utilizar aplicativos": "Aplicativos e redes sociais",
        "Fazer uma videochamada": "Videochamadas",
        "Usar a internet": "Navegação na internet"
    };

    // Converte respostas antigas e novas em listas
    function transformarEmLista(valor) {
        if (Array.isArray(valor)) return valor;
        if (valor) return [valor];
        return [];
    }

    const resultados = document.getElementById(
        "resultadosCompatibilidade"
    );

    resultados.replaceChildren();

    solicitacoes.forEach(function(solicitacao) {

        const necessidades = transformarEmLista(
            solicitacao.tipoAjuda
        );

        const diasSolicitados = transformarEmLista(
            solicitacao.dias
        );

        const periodosSolicitados = transformarEmLista(
            solicitacao.horario
        );

        const habilidadesEsperadas = necessidades
            .map(item => correspondencias[item])
            .filter(Boolean);

        const titulo = document.createElement("h4");

        titulo.textContent =
            "Solicitação: " + solicitacao.nome +
            " - " + necessidades.join(", ");

        resultados.appendChild(titulo);

        if (
            necessidades.includes("Outra dificuldade") ||
            habilidadesEsperadas.length === 0
        ) {
            const aviso = document.createElement("p");

            aviso.textContent =
                "Essa solicitação precisa de avaliação manual.";

            resultados.appendChild(aviso);
        }

        const compativeis = voluntarios.filter(
            function(voluntario) {

                const habilidades = transformarEmLista(
                    voluntario.habilidade
                );

                const diasVoluntario = transformarEmLista(
                    voluntario.dia
                );

                const periodosVoluntario = transformarEmLista(
                    voluntario.periodo
                );

                const habilidadesEmComum =
                    habilidadesEsperadas.filter(
                        habilidade =>
                            habilidades.includes(habilidade)
                    );

                const diasEmComum = diasSolicitados.filter(
                    dia => diasVoluntario.includes(dia)
                );

                const periodosEmComum = periodosSolicitados.filter(
                    periodo =>
                        periodosVoluntario.includes(periodo)
                );

                return (
                    habilidadesEmComum.length > 0 &&
                    diasEmComum.length > 0 &&
                    periodosEmComum.length > 0
                );
            }
        );

        if (compativeis.length === 0) {

            const aviso = document.createElement("p");

            aviso.textContent =
                "Nenhum voluntário compatível encontrado " +
                "para as habilidades, dias e horários selecionados.";

            resultados.appendChild(aviso);

            return;
        }

        compativeis.forEach(function(voluntario) {

            const habilidades = transformarEmLista(
                voluntario.habilidade
            );

            const diasVoluntario = transformarEmLista(
                voluntario.dia
            );

            const periodosVoluntario = transformarEmLista(
                voluntario.periodo
            );

            const card = document.createElement("article");

            const nome = document.createElement("p");
            nome.textContent =
                "Voluntário: " + voluntario.nome;

            const contato = document.createElement("p");
            contato.textContent =
                "Contato: " + voluntario.contato;

            const habilidadesComuns = habilidadesEsperadas.filter(
                habilidade => habilidades.includes(habilidade)
            );

            const diasComuns = diasSolicitados.filter(
                dia => diasVoluntario.includes(dia)
            );

            const periodosComuns = periodosSolicitados.filter(
                periodo => periodosVoluntario.includes(periodo)
            );

            const atividades = document.createElement("p");
            atividades.textContent =
                "Pode ajudar com: " + habilidadesComuns.join(", ");

            const disponibilidade = document.createElement("p");
            disponibilidade.textContent =
                "Dias em comum: " + diasComuns.join(", ") +
                " | Períodos em comum: " +
                periodosComuns.join(", ");

            card.append(
                nome,
                contato,
                atividades,
                disponibilidade
            );

            resultados.appendChild(card);
        });
    });
}


