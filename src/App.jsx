import React, { useState, useMemo } from 'react';
import { Users, HardHat, MapPin, Search, Briefcase, Plus, Hammer, Zap, PenTool, X, ShieldAlert, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

// Dados importados da lista fornecida
const INITIAL_WORKERS = [
  { id: 1, name: "Adauto Florencio de Araujo", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { id: 2, name: "Ailton dos Reis de Jesus", role: "Soldador Senior", color: "bg-orange-100 text-orange-800", siteId: null },
  { id: 3, name: "Airton Soares Lima", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { id: 4, name: "Cicero Lopes da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 5, name: "Cleoney Alves Coutinho", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { id: 6, name: "Deilson Floriano Monteiro", role: "Montador Senior", color: "bg-indigo-100 text-indigo-800", siteId: null },
  { id: 7, name: "Edinaldo Domingos da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 8, name: "Edvaldo Valentim Moura", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 9, name: "Elton Soares Lima", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { id: 10, name: "Erivelton Ferreira da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 11, name: "Francisco Rezende Filho", role: "Supervisor de Obras", color: "bg-purple-100 text-purple-800", siteId: null },
  { id: 12, name: "Gabriel Henrique Candido da Silva", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { id: 13, name: "Gilmario Cerqueira de Oliveira", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 14, name: "João Batista da Silva Pereira", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 15, name: "José Carlos da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 16, name: "José Roberto Simão da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 17, name: "Josemario Jesus de Oliveira", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { id: 18, name: "Leonardo G Soares", role: "Técnico de Segurança", color: "bg-yellow-100 text-yellow-800", siteId: null },
  { id: 19, name: "Lucas Silva Messias", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 20, name: "Michel Vitorino Almeida Souza", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { id: 21, name: "Robson Lopes Santos", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { id: 22, name: "Valdir Gonçalves de Queiroz", role: "Soldador Senior", color: "bg-orange-100 text-orange-800", siteId: null },
  { id: 23, name: "Valney Santana dos Santos", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { id: 24, name: "William Alves de Novaes", role: "Técnico de Segurança", color: "bg-yellow-100 text-yellow-800", siteId: null },
];

// Lista de obras inicia vazia conforme solicitado
const INITIAL_SITES = [];

const ROLES = [
  "Todos", 
  "Montador Junior", 
  "Montador Pleno", 
  "Montador Senior", 
  "Soldador Senior", 
  "Ajudante Montador", 
  "Supervisor de Obras", 
  "Técnico de Segurança"
];

const STATUS_OPTIONS = ["Em planejamento", "Em andamento", "Paralisada"];

export default function App() {
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [sites, setSites] = useState(INITIAL_SITES);
  const [filterRole, setFilterRole] = useState("Todos");
  const [draggedWorkerId, setDraggedWorkerId] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(null); // armazena o ID da zona onde está passando
  const [showModal, setShowModal] = useState(false);
  const [siteToComplete, setSiteToComplete] = useState(null); // Estado para armazenar obra sendo concluída
  
  const [newSiteData, setNewSiteData] = useState({ 
    name: '', 
    address: '', 
    status: 'Em andamento',
    startDate: '',
    endDate: ''
  });

  // Lógica de Drag and Drop
  const handleDragStart = (e, workerId) => {
    setDraggedWorkerId(workerId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, zoneId) => {
    e.preventDefault(); // Necessário para permitir o drop
    setIsDraggingOver(zoneId);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  const handleDrop = (e, targetSiteId) => {
    e.preventDefault();
    setIsDraggingOver(null);
    
    if (draggedWorkerId !== null) {
      setWorkers((prev) => 
        prev.map((w) => 
          w.id === draggedWorkerId ? { ...w, siteId: targetSiteId } : w
        )
      );
      setDraggedWorkerId(null);
    }
  };

  // Adicionar nova obra
  const handleAddSite = (e) => {
    e.preventDefault();
    if (!newSiteData.name || !newSiteData.address) return;

    const newSite = {
      id: `site-${Date.now()}`,
      name: newSiteData.name,
      address: newSiteData.address,
      status: newSiteData.status,
      startDate: newSiteData.startDate,
      endDate: newSiteData.endDate
    };

    setSites([...sites, newSite]);
    setNewSiteData({ name: '', address: '', status: 'Em andamento', startDate: '', endDate: '' });
    setShowModal(false);
  };

  // Concluir Obra
  const handleCompleteSite = () => {
    if (siteToComplete) {
      // 1. Remover a obra da lista
      setSites(prev => prev.filter(s => s.id !== siteToComplete.id));
      
      // 2. Liberar os funcionários (siteId = null)
      setWorkers(prev => prev.map(w => 
        w.siteId === siteToComplete.id ? { ...w, siteId: null } : w
      ));

      // 3. Fechar modal
      setSiteToComplete(null);
    }
  };

  // Alterar Status da Obra ao clicar
  const handleStatusClick = (siteId) => {
    setSites(prevSites => prevSites.map(site => {
      if (site.id === siteId) {
        const currentIndex = STATUS_OPTIONS.indexOf(site.status);
        const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
        return { ...site, status: STATUS_OPTIONS[nextIndex] };
      }
      return site;
    }));
  };

  // Cores do Status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paralisada': return 'bg-red-50 text-red-600 border-red-100';
      case 'Em andamento': return 'bg-green-50 text-green-600 border-green-100';
      case 'Em planejamento': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // Cor da barra lateral do status
  const getStatusBarColor = (status) => {
    switch (status) {
      case 'Paralisada': return 'bg-red-500';
      case 'Em andamento': return 'bg-green-500';
      case 'Em planejamento': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    // Ajuste simples para fuso horário local
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
  };

  // Componente do Card de Trabalhador
  const WorkerCard = ({ worker }) => {
    const isDragging = draggedWorkerId === worker.id;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, worker.id)}
        className={`
          flex items-center gap-3 p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all
          ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}
        `}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${worker.color}`}>
          {worker.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{worker.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="truncate">{worker.role}</span>
          </div>
        </div>
      </div>
    );
  };

  // Filtragem
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => filterRole === "Todos" || w.role === filterRole);
  }, [workers, filterRole]);

  // Contadores
  const unassignedWorkers = filteredWorkers.filter(w => w.siteId === null);
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-10 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <HardHat className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Alocação de Equipes</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm w-full md:w-auto"
          >
            <Plus size={16} />
            <span>Nova Obra</span>
          </button>

          <div className="relative w-full md:w-auto">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <div className="flex flex-col md:flex-row gap-6 min-w-max md:min-w-0 h-full">
          
          {/* Coluna: Disponíveis (Unassigned) */}
          <div className="flex flex-col w-full md:w-64 flex-shrink-0 max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Equipe Disponível
              </h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {unassignedWorkers.length}
              </span>
            </div>

            <div 
              onDragOver={(e) => handleDragOver(e, 'unassigned')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
              className={`
                flex-1 bg-gray-100 rounded-xl p-3 border-2 border-dashed transition-colors overflow-y-auto
                ${isDraggingOver === 'unassigned' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              `}
            >
              {unassignedWorkers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <Briefcase size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Ninguém disponível nesta função.</p>
                </div>
              ) : (
                unassignedWorkers.map(worker => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))
              )}
            </div>
          </div>

          {/* Área das Obras (Grid) */}
          <div className="flex-1">
            {sites.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-8">
                 <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                   <HardHat size={48} className="text-blue-200" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma obra cadastrada</h3>
                 <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Comece clicando em "Nova Obra" para adicionar os locais de trabalho da sua equipe.</p>
                 <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                    Cadastrar Primeira Obra
                  </button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
                {sites.map(site => {
                  const siteWorkers = filteredWorkers.filter(w => w.siteId === site.id);
                  const isOver = isDraggingOver === site.id;

                  return (
                    <div key={site.id} className="flex flex-col h-full max-h-[calc(100vh-140px)]">
                      {/* Header da Obra */}
                      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getStatusBarColor(site.status)}`}></div>
                        <div className="flex justify-between items-start mb-1 pl-2">
                            <h3 className="font-bold text-gray-800 text-lg truncate">{site.name}</h3>
                            <button 
                              onClick={() => handleStatusClick(site.id)}
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity select-none ${getStatusColor(site.status)}`}
                              title="Clique para alterar o status"
                            >
                              {site.status}
                            </button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs pl-2">
                            <MapPin size={12} />
                            {site.address}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs pl-2 mt-1">
                            <Calendar size={12} />
                            <span className="font-medium text-gray-600">
                              {formatDate(site.startDate)} - {formatDate(site.endDate)}
                            </span>
                        </div>
                      </div>

                      {/* Drop Zone da Obra */}
                      <div 
                        onDragOver={(e) => handleDragOver(e, site.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, site.id)}
                        className={`
                          flex-1 bg-white border border-gray-200 border-b-0 p-3 shadow-sm transition-all overflow-y-auto
                          ${isOver ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-opacity-50' : ''}
                        `}
                      >
                        <div className="flex justify-between items-center mb-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <span>Equipe Alocada</span>
                          <span>{siteWorkers.length} pessoas</span>
                        </div>

                        {siteWorkers.length === 0 ? (
                          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-300">
                            <Plus size={24} className="mb-1" />
                            <span className="text-xs">Arraste para alocar</span>
                          </div>
                        ) : (
                          siteWorkers.map(worker => (
                            <WorkerCard key={worker.id} worker={worker} />
                          ))
                        )}
                      </div>

                      {/* Footer do Card - Botão Concluída */}
                      <div className="bg-white p-3 rounded-b-xl border border-gray-200 border-t-0 shadow-sm flex justify-end">
                        <button
                          onClick={() => setSiteToComplete(site)}
                          className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"
                          title="Finalizar obra e liberar equipe"
                        >
                          <CheckCircle size={14} />
                          Concluída
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nova Obra */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Nova Obra</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Obra</label>
                <input
                  type="text"
                  required
                  value={newSiteData.name}
                  onChange={e => setNewSiteData({...newSiteData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Edifício Solar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  required
                  value={newSiteData.address}
                  onChange={e => setNewSiteData({...newSiteData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Rua das Palmeiras, 123"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input
                    type="date"
                    required
                    value={newSiteData.startDate}
                    onChange={e => setNewSiteData({...newSiteData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                  <input
                    type="date"
                    required
                    value={newSiteData.endDate}
                    onChange={e => setNewSiteData({...newSiteData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newSiteData.status}
                  onChange={e => setNewSiteData({...newSiteData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Em planejamento">Em planejamento</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Paralisada">Paralisada</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Criar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Conclusão */}
      {siteToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Concluir Obra?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja marcar <strong>{siteToComplete.name}</strong> como concluída? 
              <br/><br/>
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">
                A equipe alocada ficará disponível.
              </span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSiteToComplete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteSite}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                Sim, concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}