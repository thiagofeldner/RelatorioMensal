// Função para obter o ID único do usuário
function obterUserId() {
  let userId = localStorage.getItem("relatorioUserId");
  if (!userId) {
    userId =
      "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("relatorioUserId", userId);
  }
  return userId;
}

// Função para obter a data atual no formato YYYY-MM-DD
function obterDataAtual() {
  return new Date().toISOString().split("T")[0];
}

// Função para formatar data para o formato brasileiro
function formatarDataBR(data) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

// Função para converter data BR para ISO (para edição)
function converterDataISO(dataBR) {
  const [dia, mes, ano] = dataBR.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

// Variável global para controlar a edição
let editandoIndex = -1;

// Função para mostrar o formulário
function mostrarFormulario() {
  const formulario = document.getElementById("formAdicionarAtividade");

  // Limpar formulário antes de mostrar
  document.getElementById("activityForm").reset();
  document.getElementById("editIndex").value = "-1";
  document.getElementById("formTitulo").textContent =
    "Adicionar Nova Atividade";
  document.getElementById("submitButton").textContent = "Adicionar Atividade";

  // Definir data atual como padrão para início e fim
  const dataAtual = obterDataAtual();
  document.getElementById("dataInicio").value = dataAtual;
  document.getElementById("dataFim").value = dataAtual;

  editandoIndex = -1;

  formulario.style.display = "block";
  formulario.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Função para editar uma atividade
function editarAtividade(button) {
  const row = button.closest("tr");
  const rows = Array.from(
    document.querySelectorAll("#activitiesTable tbody tr")
  );
  const index = rows.indexOf(row);

  if (index !== -1) {
    const cells = row.cells;

    // Preencher formulário com dados da linha
    document.getElementById("dataInicio").value = converterDataISO(
      cells[0].textContent
    );
    document.getElementById("dataFim").value = converterDataISO(
      cells[1].textContent
    );
    document.getElementById("area").value = cells[2].textContent;
    document.getElementById("hours").value = cells[3].textContent;
    document.getElementById("status").value = cells[5].textContent.trim();
    document.getElementById("activity").value = cells[4].textContent;
    document.getElementById("editIndex").value = index;

    // Atualizar interface para modo edição
    document.getElementById("formTitulo").textContent = "Editar Atividade";
    document.getElementById("submitButton").textContent = "Atualizar Atividade";

    editandoIndex = index;

    // Mostrar formulário
    const formulario = document.getElementById("formAdicionarAtividade");
    formulario.style.display = "block";
    formulario.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Função para ocultar o formulário
function ocultarFormulario() {
  const formulario = document.getElementById("formAdicionarAtividade");
  formulario.style.display = "none";
  document.getElementById("activityForm").reset();
  editandoIndex = -1;
}

// Função para excluir uma atividade
function deleteActivity(button) {
  if (confirm("Tem certeza que deseja excluir esta atividade?")) {
    const row = button.closest("tr");
    row.style.opacity = "0.5";
    setTimeout(() => {
      row.remove();
      showAlert("Atividade excluída com sucesso!", "success");
      salvarAutomaticamente();
      calcularTotais();
    }, 300);
  }
}

// Função para mostrar alertas
function showAlert(message, type) {
  const alert = document.getElementById(
    type === "success" ? "successAlert" : "errorAlert"
  );
  alert.textContent = message;
  alert.className =
    "alert " + (type === "success" ? "alert-success" : "alert-error");
  alert.style.display = "block";

  setTimeout(() => {
    alert.style.display = "none";
  }, 3000);
}

// Processar o formulário de atividades
document
  .getElementById("activityForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Obter valores do formulário
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const area = document.getElementById("area").value;
    const activity = document.getElementById("activity").value;
    const hours = document.getElementById("hours").value;
    const status = document.getElementById("status").value;
    const editIndex = parseInt(document.getElementById("editIndex").value);

    // Validar campos obrigatórios
    if (!dataInicio || !dataFim || !area || !activity || !hours || !status) {
      showAlert("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    // Validar se data fim é maior ou igual à data início
    if (new Date(dataFim) < new Date(dataInicio)) {
      showAlert("A data fim não pode ser anterior à data início.", "error");
      return;
    }

    const tableBody = document.querySelector("#activitiesTable tbody");

    if (editIndex >= 0) {
      // Modo edição - atualizar linha existente
      const rows = tableBody.querySelectorAll("tr");
      if (rows[editIndex]) {
        const row = rows[editIndex];

        // Determinar a classe de status
        let statusClass = "";
        if (status === "Em andamento") statusClass = "status-em-andamento";
        else if (status === "Concluído") statusClass = "status-concluido";
        else if (status === "Pendente") statusClass = "status-pendente";
        else if (status === "Cancelada") statusClass = "status-cancelada";

        row.innerHTML = `
                <td>${formatarDataBR(dataInicio)}</td>
                <td>${formatarDataBR(dataFim)}</td>
                <td>${area}</td>
                <td>${hours}</td>
                <td>${activity}</td>
                <td><span class="${statusClass}">${status}</span></td>
                <td class="actions-column">
                    <button class="btn btn-edit" onclick="editarAtividade(this)">✏️</button>
                    <button class="btn btn-delete" onclick="deleteActivity(this)">🗑️</button>
                </td>
            `;

        showAlert("Atividade atualizada com sucesso!", "success");
      }
    } else {
      // Modo adição - criar nova linha
      const newRow = document.createElement("tr");

      // Determinar a classe de status
      let statusClass = "";
      if (status === "Em andamento") statusClass = "status-em-andamento";
      else if (status === "Concluído") statusClass = "status-concluido";
      else if (status === "Pendente") statusClass = "status-pendente";
      else if (status === "Cancelada") statusClass = "status-cancelada";

      newRow.innerHTML = `
            <td>${formatarDataBR(dataInicio)}</td>
            <td>${formatarDataBR(dataFim)}</td>
            <td>${area}</td>
            <td>${hours}</td>
            <td>${activity}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td class="actions-column">
                <button class="btn btn-edit" onclick="editarAtividade(this)">✏️</button>
                <button class="btn btn-delete" onclick="deleteActivity(this)">🗑️</button>
            </td>
        `;

      tableBody.appendChild(newRow);
      showAlert("Atividade adicionada com sucesso!", "success");
    }

    // Limpar e ocultar formulário
    document.getElementById("activityForm").reset();
    ocultarFormulario();

    // Salvar automaticamente e calcular totais
    salvarAutomaticamente();
    calcularTotais();
  });

// ... (mantenha as funções salvarDiario, calcularTotais, gerarPDF, salvarAutomaticamente)

// Função para salvar backup diário
function salvarDiario() {
  const userId = obterUserId();
  const dataAtual = obterDataAtual();

  const relatorio = {
    identificacao: {
      nome: document.getElementById("nome").value,
      cargo: document.getElementById("cargo").value,
      email: document.getElementById("email").value,
      mesReferencia: document.getElementById("mesReferencia").value,
      anoReferencia: document.getElementById("anoReferencia").value,
    },
    atividades: Array.from(
      document.querySelectorAll("#activitiesTable tbody tr")
    ).map((row) => {
      const cells = row.cells;
      return {
        dataInicio: cells[0].textContent,
        dataFim: cells[1].textContent,
        area: cells[2].textContent,
        horas: cells[3].textContent,
        atividade: cells[4].textContent,
        situacao: cells[5].textContent,
      };
    }),
    totais: {
      totalAtividades: document.getElementById("totalAtividades").value,
      totalHoras: document.getElementById("totalHoras").value,
    },
    sintese: {
      principaisResultados: document.getElementById("principaisResultados")
        .value,
    },
    sugestoes: {
      descricaoSituacao: document.getElementById("descricaoSituacao").value,
      processoSugerido: document.getElementById("processoSugerido").value,
      resultadoEsperado: document.getElementById("resultadoEsperado").value,
    },
    dataBackup: new Date().toISOString(),
  };

  const backupKey = `backup_${userId}_${dataAtual}_${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(relatorio));
  salvarAutomaticamente();

  showAlert("Backup diário salvo com sucesso! ✅", "success");
}

// ... (mantenha o restante do código do carregamento e outras funções)

// Carregar dados salvos ao iniciar
document.addEventListener("DOMContentLoaded", function () {
  const userId = obterUserId();

  // Configurar ano e mês atuais como padrão
  const currentYear = new Date().getFullYear();
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentMonth = months[new Date().getMonth()];

  document.getElementById("anoReferencia").value = currentYear;
  document.getElementById("mesReferencia").value = currentMonth;

  // Carregar dados salvos do usuário atual
  const dadosSalvos = localStorage.getItem(`relatorioMensal_${userId}`);

  if (dadosSalvos) {
    const relatorio = JSON.parse(dadosSalvos);

    if (relatorio.identificacao.nome) {
      document.getElementById("nome").value =
        relatorio.identificacao.nome || "";
      document.getElementById("cargo").value =
        relatorio.identificacao.cargo || "";
      document.getElementById("email").value =
        relatorio.identificacao.email || "";
      document.getElementById("mesReferencia").value =
        relatorio.identificacao.mesReferencia || currentMonth;
      document.getElementById("anoReferencia").value =
        relatorio.identificacao.anoReferencia || currentYear;
    }

    document.getElementById("totalAtividades").value =
      relatorio.totais?.totalAtividades || "0";
    document.getElementById("totalHoras").value =
      relatorio.totais?.totalHoras || "0";
    document.getElementById("principaisResultados").value =
      relatorio.sintese?.principaisResultados || "";
    document.getElementById("descricaoSituacao").value =
      relatorio.sugestoes?.descricaoSituacao || "";
    document.getElementById("processoSugerido").value =
      relatorio.sugestoes?.processoSugerido || "";
    document.getElementById("resultadoEsperado").value =
      relatorio.sugestoes?.resultadoEsperado || "";

    if (relatorio.atividades && relatorio.atividades.length > 0) {
      const tableBody = document.querySelector("#activitiesTable tbody");

      relatorio.atividades.forEach((atividade) => {
        const newRow = document.createElement("tr");

        let statusClass = "";
        if (atividade.situacao.includes("Em andamento"))
          statusClass = "status-em-andamento";
        else if (atividade.situacao.includes("Concluído"))
          statusClass = "status-concluido";
        else if (atividade.situacao.includes("Pendente"))
          statusClass = "status-pendente";
        else if (atividade.situacao.includes("Cancelada"))
          statusClass = "status-cancelada";

        newRow.innerHTML = `
                    <td>${atividade.dataInicio}</td>
                    <td>${atividade.dataFim}</td>
                    <td>${atividade.area}</td>
                    <td>${atividade.horas}</td>
                    <td>${atividade.atividade}</td>
                    <td><span class="${statusClass}">${atividade.situacao.replace(
          /<[^>]*>/g,
          ""
        )}</span></td>
                    <td class="actions-column">
                        <button class="btn btn-edit" onclick="editarAtividade(this)">✏️</button>
                        <button class="btn btn-delete" onclick="deleteActivity(this)">🗑️</button>
                    </td>
                `;

        tableBody.appendChild(newRow);
      });
    }
  }

  setTimeout(() => {
    calcularTotais();
  }, 500);

  const inputs = document.querySelectorAll(
    "#identificacao input, #identificacao select, #principaisResultados, #descricaoSituacao, #processoSugerido, #resultadoEsperado"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", salvarAutomaticamente);
  });

  window.addEventListener("beforeunload", function () {
    salvarDiario();
  });
});

// Função para calcular totais
function calcularTotais() {
  const rows = document.querySelectorAll("#activitiesTable tbody tr");
  let totalAtividades = 0;
  let totalHoras = 0;

  rows.forEach((row) => {
    totalAtividades++;
    const horasCell = row.cells[3];
    const horas = parseFloat(horasCell.textContent) || 0;
    totalHoras += horas;
  });

  document.getElementById("totalAtividades").value = totalAtividades;
  document.getElementById("totalHoras").value = totalHoras.toFixed(1);

  if (totalAtividades > 0) {
    showAlert(
      `Totais calculados: ${totalAtividades} atividades e ${totalHoras.toFixed(
        1
      )} horas`,
      "success"
    );
  }

  salvarAutomaticamente();
}

// Função para gerar PDF
function gerarPDF() {
  const nome = document.getElementById("nome").value;
  const cargo = document.getElementById("cargo").value;
  const email = document.getElementById("email").value;
  const mesReferencia = document.getElementById("mesReferencia").value;
  const anoReferencia = document.getElementById("anoReferencia").value;

  if (!nome || !cargo || !email || !mesReferencia || !anoReferencia) {
    showAlert(
      "Por favor, preencha todos os campos da seção Identificação.",
      "error"
    );
    document
      .getElementById("identificacao")
      .scrollIntoView({ behavior: "smooth" });
    return;
  }

  calcularTotais();
  salvarAutomaticamente();
  window.print();
  showAlert(
    "PDF gerado com sucesso! Use Ctrl+P para salvar como PDF.",
    "success"
  );
}

// Função para salvar automaticamente
function salvarAutomaticamente() {
  const userId = obterUserId();
  const nome = document.getElementById("nome").value;
  const cargo = document.getElementById("cargo").value;
  const email = document.getElementById("email").value;
  const mesReferencia = document.getElementById("mesReferencia").value;
  const anoReferencia = document.getElementById("anoReferencia").value;

  const relatorio = {
    identificacao: {
      nome: nome,
      cargo: cargo,
      email: email,
      mesReferencia: mesReferencia,
      anoReferencia: anoReferencia,
    },
    atividades: Array.from(
      document.querySelectorAll("#activitiesTable tbody tr")
    ).map((row) => {
      const cells = row.cells;
      return {
        dataInicio: cells[0].textContent,
        dataFim: cells[1].textContent,
        area: cells[2].textContent,
        horas: cells[3].textContent,
        atividade: cells[4].textContent,
        situacao: cells[5].textContent,
      };
    }),
    totais: {
      totalAtividades: document.getElementById("totalAtividades").value,
      totalHoras: document.getElementById("totalHoras").value,
    },
    sintese: {
      principaisResultados: document.getElementById("principaisResultados")
        .value,
    },
    sugestoes: {
      descricaoSituacao: document.getElementById("descricaoSituacao").value,
      processoSugerido: document.getElementById("processoSugerido").value,
      resultadoEsperado: document.getElementById("resultadoEsperado").value,
    },
    dataAutosalvamento: new Date().toISOString(),
  };

  localStorage.setItem(`relatorioMensal_${userId}`, JSON.stringify(relatorio));
}
