import React, { useState, useEffect, useMemo } from 'react';
import { Users, HardHat, MapPin, Search, Briefcase, Plus, Hammer, Zap, PenTool, X, ShieldAlert, Calendar, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, writeBatch, query, orderBy 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// ==================================================================================
// CONFIGURAÇÃO DO FIREBASE
// ==================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBkJIOfHTyhz1oiaLPEER9G9xDUVJImles",
  authDomain: "alocacao-de-obras.firebaseapp.com",
  projectId: "alocacao-de-obras",
  storageBucket: "alocacao-de-obras.firebasestorage.app",
  messagingSenderId: "942526225092",
  appId: "1:942526225092:web:8ec0d6aa03edca8bb04791"
};

// Inicialização com tratamento de erro básico
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Erro na inicialização do Firebase. Verifique as chaves.", error);
}

// Coleções no Firestore
const WORKERS_COLLECTION = 'workers';
const SITES_COLLECTION = 'sites';

const INITIAL_WORKERS_SEED = [
  { name: "Adauto Florencio de Araujo", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { name: "Ailton dos Reis de Jesus", role: "Soldador Senior", color: "bg-orange-100 text-orange-800", siteId: null },
  { name: "Airton Soares Lima", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { name: "Cicero Lopes da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Cleoney Alves Coutinho", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { name: "Deilson Floriano Monteiro", role: "Montador Senior", color: "bg-indigo-100 text-indigo-800", siteId: null },
  { name: "Edinaldo Domingos da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Edvaldo Valentim Moura", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Elton Soares Lima", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { name: "Erivelton Ferreira da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Francisco Rezende Filho", role: "Supervisor de Obras", color: "bg-purple-100 text-purple-800", siteId: null },
  { name: "Gabriel Henrique Candido da Silva", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { name: "Gilmario Cerqueira de Oliveira", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "João Batista da Silva Pereira", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "José Carlos da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "José Roberto Simão da Silva", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Josemario Jesus de Oliveira", role: "Montador Pleno", color: "bg-blue-100 text-blue-800", siteId: null },
  { name: "Leonardo G Soares", role: "Técnico de Segurança", color: "bg-yellow-100 text-yellow-800", siteId: null },
  { name: "Lucas Silva Messias", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "Michel Vitorino Almeida Souza", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { name: "Robson Lopes Santos", role: "Ajudante Montador", color: "bg-gray-100 text-gray-800", siteId: null },
  { name: "Valdir Gonçalves de Queiroz", role: "Soldador Senior", color: "bg-orange-100 text-orange-800", siteId: null },
  { name: "Valney Santana dos Santos", role: "Montador Junior", color: "bg-cyan-100 text-cyan-800", siteId: null },
  { name: "William Alves de Novaes", role: "Técnico de Segurança", color: "bg-yellow-100 text-yellow-800", siteId: null },
];

const ROLES = [
  "Todos", "Montador Junior", "Montador Pleno", "Montador Senior", 
  "Soldador Senior", "Ajudante Montador", "Supervisor de Obras", "Técnico de Segurança"
];

const STATUS_OPTIONS = ["Em planejamento", "Em andamento", "Paralisada"];

// Definindo a prioridade de ordenação (Menor número = aparece primeiro)
const STATUS_PRIORITY = {
  "Em planejamento": 0,
  "Paralisada": 1,
  "Em andamento": 2
};

export default function App() {
  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [filterRole, setFilterRole] = useState("Todos");
  const [draggedWorkerId, setDraggedWorkerId] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [siteToComplete, setSiteToComplete] = useState(null);
  
  const [newSiteData, setNewSiteData] = useState({ 
    name: '', address: '', status: 'Em andamento', startDate: '', endDate: '' 
  });

  // 1. Autenticação
  useEffect(() => {
    if (!auth) {
      setErrorMsg("Falha crítica: Biblioteca Firebase não carregou. Verifique o package.json.");
      setLoading(false);
      return;
    }

    signInAnonymously(auth)
      .then(() => console.log("Autenticado como anônimo"))
      .catch((err) => {
        console.error("Erro Auth:", err);
        setErrorMsg(`Erro de Autenticação: ${err.message}. Verifique se ativou 'Anonymous' no console do Firebase.`);
        setLoading(false);
      });

    return onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
  }, []);

  // 2. Sincronização
  useEffect(() => {
    if (!user || !db) return;

    const workersRef = collection(db, WORKERS_COLLECTION);
    const sitesRef = collection(db, SITES_COLLECTION);

    // Carregar Trabalhadores
    const unsubWorkers = onSnapshot(query(workersRef, orderBy('name')), 
      (snapshot) => {
        const loadedWorkers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (loadedWorkers.length === 0 && !snapshot.metadata.fromCache) {
          const batch = writeBatch(db);
          INITIAL_WORKERS_SEED.forEach(w => batch.set(doc(workersRef), w));
          batch.commit().catch(e => console.error("Erro seeding:", e));
        } else {
          setWorkers(loadedWorkers);
        }
        setLoading(false);
      }, 
      (err) => {
        console.error("Erro Workers:", err);
        if (err.code === 'permission-denied') {
          setErrorMsg("Permissão Negada: Verifique se as 'Regras' do Firestore estão em modo de teste (allow read, write: if true;).");
        } else {
          setErrorMsg(`Erro de Conexão: ${err.message}`);
        }
        setLoading(false);
      }
    );

    // Carregar Obras com Ordenação Personalizada
    const unsubSites = onSnapshot(query(sitesRef, orderBy('name')), 
      (snapshot) => {
        const sitesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ordenação personalizada no cliente
        sitesList.sort((a, b) => {
          const priorityA = STATUS_PRIORITY[a.status] ?? 99; // 99 joga pro fim se o status não existir
          const priorityB = STATUS_PRIORITY[b.status] ?? 99;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB; // Ordena por status
          }
          return a.name.localeCompare(b.name); // Desempate alfabético
        });

        setSites(sitesList);
      },
      (err) => console.error("Erro Sites:", err)
    );

    return () => { unsubWorkers(); unsubSites(); };
  }, [user]);

  // --- Funções de UI ---

  const handleDragStart = (e, workerId) => {
    setDraggedWorkerId(workerId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, zoneId) => { e.preventDefault(); setIsDraggingOver(zoneId); };

  const handleDrop = async (e, targetSiteId) => {
    e.preventDefault();
    setIsDraggingOver(null);
    if (draggedWorkerId && user) {
      try {
        await updateDoc(doc(db, WORKERS_COLLECTION, draggedWorkerId), { siteId: targetSiteId });
      } catch(e) { console.error(e); }
      setDraggedWorkerId(null);
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSiteData.name || !user) return;
    try {
      await addDoc(collection(db, SITES_COLLECTION), {
        ...newSiteData,
        createdAt: new Date().toISOString()
      });
      setNewSiteData({ name: '', address: '', status: 'Em andamento', startDate: '', endDate: '' });
      setShowModal(false);
    } catch(e) { console.error(e); }
  };

  const handleStatusClick = async (site) => {
    if (!user) return;
    const nextStatus = STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(site.status) + 1) % STATUS_OPTIONS.length];
    try { await updateDoc(doc(db, SITES_COLLECTION, site.id), { status: nextStatus }); } catch(e) { console.error(e); }
  };

  const handleCompleteSite = async () => {
    if (!siteToComplete || !user) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, SITES_COLLECTION, siteToComplete.id));
    workers.filter(w => w.siteId === siteToComplete.id).forEach(w => {
      batch.update(doc(db, WORKERS_COLLECTION, w.id), { siteId: null });
    });
    try { await batch.commit(); setSiteToComplete(null); } catch(e) { console.error(e); }
  };

  const getStatusColor = (s) => s === 'Paralisada' ? 'bg-red-50 text-red-600 border-red-100' : s === 'Em planejamento' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-green-50 text-green-600 border-green-100';
  const getStatusBarColor = (s) => s === 'Paralisada' ? 'bg-red-500' : s === 'Em planejamento' ? 'bg-purple-500' : 'bg-green-500';
  const formatDate = (d) => d ? new Date(new Date(d).valueOf() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('pt-BR') : '--/--';

  const filteredWorkers = useMemo(() => workers.filter(w => filterRole === "Todos" || w.role === filterRole), [workers, filterRole]);
  const unassignedWorkers = filteredWorkers.filter(w => w.siteId === null);

  const WorkerCard = ({ worker }) => {
    const isDragging = draggedWorkerId === worker.id;
    return (
      <div draggable onDragStart={(e) => handleDragStart(e, worker.id)} className={`flex items-center gap-3 p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${worker.color || 'bg-gray-100 text-gray-800'}`}>{worker.name.charAt(0)}</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{worker.name}</p><div className="flex items-center gap-1 text-xs text-gray-500"><span className="truncate">{worker.role}</span></div></div>
      </div>
    );
  };

  if (loading || errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          {errorMsg ? (
            <>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Erro de Conexão</h3>
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-left">
                {errorMsg}
              </div>
              <p className="text-xs text-gray-400 mt-4">Verifique o console do navegador (F12) para mais detalhes.</p>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Conectando ao banco de dados...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-10 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><HardHat className="text-white" size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Alocação de Equipes</h1>
            <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> Online
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm w-full md:w-auto"><Plus size={16} /><span>Nova Obra</span></button>
          <div className="relative w-full md:w-auto">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full md:w-64 pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-200 transition-colors">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <div className="flex flex-col md:flex-row gap-6 min-w-max md:min-w-0 h-full">
          <div className="flex flex-col w-full md:w-64 flex-shrink-0 max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-bold text-gray-700 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Equipe Disponível</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{unassignedWorkers.length}</span>
            </div>
            <div onDragOver={(e) => handleDragOver(e, 'unassigned')} onDrop={(e) => handleDrop(e, null)} className={`flex-1 bg-gray-100 rounded-xl p-3 border-2 border-dashed transition-colors overflow-y-auto ${isDraggingOver === 'unassigned' ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
              {unassignedWorkers.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center"><Briefcase size={32} className="mb-2 opacity-50" /><p className="text-sm">Ninguém disponível.</p></div> : unassignedWorkers.map(w => <WorkerCard key={w.id} worker={w} />)}
            </div>
          </div>

          <div className="flex-1">
            {sites.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-8">
                 <div className="bg-white p-4 rounded-full shadow-sm mb-4"><HardHat size={48} className="text-blue-200" /></div>
                 <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma obra ativa</h3>
                 <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"><Plus size={18} /> Cadastrar Obra</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
                {sites.map(site => {
                  const siteWorkers = filteredWorkers.filter(w => w.siteId === site.id);
                  const isOver = isDraggingOver === site.id;
                  return (
                    <div key={site.id} className="flex flex-col h-full max-h-[calc(100vh-140px)]">
                      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getStatusBarColor(site.status)}`}></div>
                        <div className="flex justify-between items-start mb-1 pl-2">
                            <h3 className="font-bold text-gray-800 text-lg truncate">{site.name}</h3>
                            <button onClick={() => handleStatusClick(site)} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity select-none ${getStatusColor(site.status)}`}>{site.status}</button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs pl-2"><MapPin size={12} />{site.address}</div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs pl-2 mt-1"><Calendar size={12} /><span className="font-medium text-gray-600">{formatDate(site.startDate)} - {formatDate(site.endDate)}</span></div>
                      </div>
                      <div onDragOver={(e) => handleDragOver(e, site.id)} onDrop={(e) => handleDrop(e, site.id)} className={`flex-1 bg-white border border-gray-200 border-b-0 p-3 shadow-sm transition-all overflow-y-auto ${isOver ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-opacity-50' : ''}`}>
                        <div className="flex justify-between items-center mb-3 text-xs font-medium text-gray-400 uppercase tracking-wider"><span>Equipe Alocada</span><span>{siteWorkers.length} pessoas</span></div>
                        {siteWorkers.length === 0 ? <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-300"><Plus size={24} className="mb-1" /><span className="text-xs">Arraste para alocar</span></div> : siteWorkers.map(w => <WorkerCard key={w.id} worker={w} />)}
                      </div>
                      <div className="bg-white p-3 rounded-b-xl border border-gray-200 border-t-0 shadow-sm flex justify-end">
                        <button onClick={() => setSiteToComplete(site)} className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"><CheckCircle size={14} /> Concluída</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800">Nova Obra</h3><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleAddSite} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" required value={newSiteData.name} onChange={e => setNewSiteData({...newSiteData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input type="text" required value={newSiteData.address} onChange={e => setNewSiteData({...newSiteData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Início</label><input type="date" required value={newSiteData.startDate} onChange={e => setNewSiteData({...newSiteData, startDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Término</label><input type="date" required value={newSiteData.endDate} onChange={e => setNewSiteData({...newSiteData, endDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button><button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Criar</button></div>
            </form>
          </div>
        </div>
      )}

      {siteToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} className="text-green-600" /></div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Concluir Obra?</h3>
            <p className="text-sm text-gray-600 mb-6">Confirmar conclusão de <strong>{siteToComplete.name}</strong>? <br/><span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">Equipe será liberada.</span></p>
            <div className="flex gap-3 justify-center"><button onClick={() => setSiteToComplete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button><button onClick={handleCompleteSite} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm">Sim, concluir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}