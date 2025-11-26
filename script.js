// Função para obter o ID único do usuário
function obterUserId() {
    let userId = localStorage.getItem('relatorioUserId');
    if (!userId) {
        // Gera um ID único para o usuário
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('relatorioUserId', userId);
    }
    return userId;
}

// Função para salvar automaticamente
function salvarAutomaticamente() {
    const userId = obterUserId();
    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const email = document.getElementById('email').value;
    const mesReferencia = document.getElementById('mesReferencia').value;
    const anoReferencia = document.getElementById('anoReferencia').value;
    
    const relatorio = {
        identificacao: {
            nome: nome,
            cargo: cargo,
            email: email,
            mesReferencia: mesReferencia,
            anoReferencia: anoReferencia
        },
        atividades: Array.from(document.querySelectorAll('#activitiesTable tbody tr')).map(row => {
            const cells = row.cells;
            return {
                data: cells[0].textContent,
                area: cells[1].textContent,
                atividade: cells[2].textContent,
                horas: cells[3].textContent,
                situacao: cells[4].textContent
            };
        }),
        totais: {
            totalAtividades: document.getElementById('totalAtividades').value,
            totalHoras: document.getElementById('totalHoras').value
        },
        sintese: {
            principaisResultados: document.getElementById('principaisResultados').value
        },
        sugestoes: {
            descricaoSituacao: document.getElementById('descricaoSituacao').value,
            processoSugerido: document.getElementById('processoSugerido').value,
            resultadoEsperado: document.getElementById('resultadoEsperado').value
        },
        dataAutosalvamento: new Date().toISOString()
    };
    
    // Salva com a chave específica do usuário
    localStorage.setItem(`relatorioMensal_${userId}`, JSON.stringify(relatorio));
}

// Carregar dados salvos ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    const userId = obterUserId();
    
    // Configurar ano e mês atuais como padrão (sempre)
    const currentYear = new Date().getFullYear();
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonth = months[new Date().getMonth()];
    
    document.getElementById('anoReferencia').value = currentYear;
    document.getElementById('mesReferencia').value = currentMonth;
    
    // Carregar dados salvos do usuário atual (se existirem)
    const dadosSalvos = localStorage.getItem(`relatorioMensal_${userId}`);
    
    if (dadosSalvos) {
        const relatorio = JSON.parse(dadosSalvos);
        
        // Preencher campos de identificação apenas se já existirem dados
        if (relatorio.identificacao.nome) {
            document.getElementById('nome').value = relatorio.identificacao.nome || '';
            document.getElementById('cargo').value = relatorio.identificacao.cargo || '';
            document.getElementById('email').value = relatorio.identificacao.email || '';
            
            // Mantém mês/ano salvos se existirem, senão usa o atual
            document.getElementById('mesReferencia').value = relatorio.identificacao.mesReferencia || currentMonth;
            document.getElementById('anoReferencia').value = relatorio.identificacao.anoReferencia || currentYear;
        }
        
        // Preencher totais
        document.getElementById('totalAtividades').value = relatorio.totais?.totalAtividades || '0';
        document.getElementById('totalHoras').value = relatorio.totais?.totalHoras || '0';
        
        // Preencher síntese
        document.getElementById('principaisResultados').value = relatorio.sintese?.principaisResultados || '';
        
        // Preencher sugestões
        document.getElementById('descricaoSituacao').value = relatorio.sugestoes?.descricaoSituacao || '';
        document.getElementById('processoSugerido').value = relatorio.sugestoes?.processoSugerido || '';
        document.getElementById('resultadoEsperado').value = relatorio.sugestoes?.resultadoEsperado || '';
        
        // Adicionar atividades à tabela (apenas se houver dados salvos)
        if (relatorio.atividades && relatorio.atividades.length > 0) {
            const tableBody = document.querySelector('#activitiesTable tbody');
            
            relatorio.atividades.forEach(atividade => {
                const newRow = document.createElement('tr');
                
                let statusClass = '';
                if (atividade.situacao.includes('Em andamento')) statusClass = 'status-em-andamento';
                else if (atividade.situacao.includes('Concluído')) statusClass = 'status-concluido';
                else if (atividade.situacao.includes('Pendente')) statusClass = 'status-pendente';
                
                newRow.innerHTML = `
                    <td>${atividade.data}</td>
                    <td>${atividade.area}</td>
                    <td>${atividade.atividade}</td>
                    <td>${atividade.horas}</td>
                    <td><span class="${statusClass}">${atividade.situacao.replace(/<[^>]*>/g, '')}</span></td>
                    <td class="actions-column">
                        <button class="btn btn-delete" onclick="deleteActivity(this)">🗑️</button>
                    </td>
                `;
                
                tableBody.appendChild(newRow);
            });
        }
        
        console.log('Dados do usuário carregados:', userId);
    } else {
        console.log('Primeiro acesso do usuário:', userId);
        // Primeiro acesso - formulário começa vazio
    }
    
    // Calcular totais iniciais
    setTimeout(() => {
        calcularTotais();
    }, 500);
    
    // Adicionar event listeners para salvar automaticamente
    const inputs = document.querySelectorAll('#identificacao input, #identificacao select, #principaisResultados, #descricaoSituacao, #processoSugerido, #resultadoEsperado');
    inputs.forEach(input => {
        input.addEventListener('input', salvarAutomaticamente);
    });
});

// Função para calcular totais
function calcularTotais() {
    const rows = document.querySelectorAll('#activitiesTable tbody tr');
    let totalAtividades = 0;
    let totalHoras = 0;
    
    rows.forEach(row => {
        totalAtividades++;
        const horasCell = row.cells[3];
        const horas = parseFloat(horasCell.textContent) || 0;
        totalHoras += horas;
    });
    
    // Atualizar campos totais
    document.getElementById('totalAtividades').value = totalAtividades;
    document.getElementById('totalHoras').value = totalHoras.toFixed(1);
    
    if (totalAtividades > 0) {
        showAlert(`Totais calculados: ${totalAtividades} atividades e ${totalHoras.toFixed(1)} horas`, 'success');
    }
    
    // Salvar automaticamente após cálculo
    salvarAutomaticamente();
}

// Função para gerar PDF
function gerarPDF() {
    // Validar campos obrigatórios da identificação
    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const email = document.getElementById('email').value;
    const mesReferencia = document.getElementById('mesReferencia').value;
    const anoReferencia = document.getElementById('anoReferencia').value;
    
    if (!nome || !cargo || !email || !mesReferencia || !anoReferencia) {
        showAlert('Por favor, preencha todos os campos da seção Identificação.', 'error');
        document.getElementById('identificacao').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Calcular totais antes de gerar PDF
    calcularTotais();
    
    // Salvar dados antes de gerar PDF
    salvarAutomaticamente();
    
    // Usar a função de impressão do navegador
    window.print();
    
    showAlert('PDF gerado com sucesso! Use Ctrl+P para salvar como PDF.', 'success');
}

// Restante das funções permanecem iguais...
function mostrarFormulario() {
    const formulario = document.getElementById('formAdicionarAtividade');
    
    // Limpar formulário antes de mostrar
    document.getElementById('activityForm').reset();
    document.getElementById('date').value = '';
    
    formulario.style.display = 'block';
    formulario.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarFormulario() {
    const formulario = document.getElementById('formAdicionarAtividade');
    formulario.style.display = 'none';
    document.getElementById('activityForm').reset();
}

function deleteActivity(button) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
        const row = button.closest('tr');
        row.style.opacity = '0.5';
        setTimeout(() => {
            row.remove();
            showAlert('Atividade excluída com sucesso!', 'success');
            salvarAutomaticamente();
            calcularTotais();
        }, 300);
    }
}

function showAlert(message, type) {
    const alert = document.getElementById(type === 'success' ? 'successAlert' : 'errorAlert');
    alert.textContent = message;
    alert.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Processar o formulário de atividades
document.getElementById('activityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const area = document.getElementById('area').value;
    const activity = document.getElementById('activity').value;
    const hours = document.getElementById('hours').value;
    const status = document.getElementById('status').value;
    
    if (!date || !area || !activity || !hours || !status) {
        showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    const tableBody = document.querySelector('#activitiesTable tbody');
    const newRow = document.createElement('tr');
    
    let statusClass = '';
    if (status === 'Em andamento') statusClass = 'status-em-andamento';
    else if (status === 'Concluído') statusClass = 'status-concluido';
    else if (status === 'Pendente') statusClass = 'status-pendente';
    
    newRow.innerHTML = `
        <td>${formattedDate}</td>
        <td>${area}</td>
        <td>${activity}</td>
        <td>${hours}</td>
        <td><span class="${statusClass}">${status}</span></td>
        <td class="actions-column">
            <button class="btn btn-delete" onclick="deleteActivity(this)">🗑️</button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
    document.getElementById('activityForm').reset();
    ocultarFormulario();
    showAlert('Atividade adicionada com sucesso!', 'success');
    salvarAutomaticamente();
    calcularTotais();
});