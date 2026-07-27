const FIREBASE_URLS = {
  app: 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  firestore: 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
};

const firebaseConfig = {
  apiKey: "AIzaSyBNeZm3DunGcQnFnzeNe2fnSZHBM6mtVcU",
  authDomain: "painel-rotinas-so-folhas.firebaseapp.com",
  projectId: "painel-rotinas-so-folhas",
  storageBucket: "painel-rotinas-so-folhas.firebasestorage.app",
  messagingSenderId: "405800876325",
  appId: "1:405800876325:web:7b03cacffb8f0f439fc2cc",
  measurementId: "G-7E15N4CBNV"
};

let firebaseApi = null;
let firebaseApp = null;
let db = null;
let painelConfigRef = null;
let snapshotsCollectionRef = null;
let firebaseDisponivel = false;
let firebaseListenersIniciados = false;
let firebaseInicializado = false;
let firebaseConfigRecebida = false;
let firebaseSnapshotsRecebidos = false;
let resumoPeriodoAtual = 'diario';

const APRESENTACAO_CONFIG = {
  intervaloMs: 10000
};

const apresentacaoState = {
  aberta: false,
  slideAtual: 0,
  autoplay: true,
  timer: null
};

const STORAGE_KEYS = {
  adminLogged: 'sf_admin_logged',
  storeFormadorMap: 'sf_store_formador_map',
  storePromotorMap: 'sf_store_promotor_map',
  storeRenameMap: 'sf_store_rename_map',
  routineConfig: 'sf_routine_config',
  knownStores: 'sf_known_stores',
  importedSnapshots: 'sf_imported_snapshots',
  activeSnapshotId: 'sf_active_snapshot_id',
  appVersion: 'sf_app_version'
};

const ADMIN_CREDENTIALS = {
  user: 'richard.martins',
  pass: 'sofolhas2026'
};

const FORMADORES_ATIVOS = ['Luciano', 'Karina', 'Luana'];
const FORMADORES_ATIVOS_SLUG = new Set(FORMADORES_ATIVOS.map((item) => slug(item)));
const APP_STORAGE_VERSION = '2026-03-23-zero-base-v3';

const PRAZO_DADOS_BRUTOS_DIAS = 5;
const INTERVALO_LIMPEZA_DADOS_BRUTOS_MS = 60 * 60 * 1000;

const ROTINAS_PADRAO = [
  { id: 'rotina-01', nome: '01º Promotor - Fotos abertura do dia Até 6h30', nomeMoki: '01º Promotor - Fotos abertura do dia Até 6h30', horarioInicio: '', horarioFim: '06:30', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-02', nome: '02º Promotor - Rotina manhã Até 8h00', nomeMoki: '02º Promotor - Rotina manhã Até 8h00', horarioInicio: '', horarioFim: '08:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-03', nome: '03º Promotor -Inventário de entrada até 8h', nomeMoki: '03º Promotor -Inventário de entrada até 8h', horarioInicio: '', horarioFim: '08:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-04', nome: '04º Promotor - Montagem de Exposições Até 10h', nomeMoki: '04º Promotor - Montagem de Exposições Até 10h', horarioInicio: '', horarioFim: '10:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-05', nome: '05º Promotor - Pedidos e quebras Até 9h00', nomeMoki: '05º Promotor - Pedidos e quebras Até 9h00', horarioInicio: '', horarioFim: '09:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-06', nome: '06º Promotor - Reabastecimento 9:30hrs', nomeMoki: '06º Promotor - Reabastecimento 9:30hrs', horarioInicio: '', horarioFim: '09:30', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-07', nome: '07º Promotor - Reabastecimento 10:30hrs', nomeMoki: '07º Promotor - Reabastecimento 10:30hrs', horarioInicio: '', horarioFim: '10:30', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-08', nome: '08º Promotor- Triagem de Produtos', nomeMoki: '08º Promotor- Triagem de Produtos', horarioInicio: '', horarioFim: '', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-09', nome: '09ºPromotor - Relatório Fotográfico Até 11:30hrs', nomeMoki: '09ºPromotor - Relatório Fotográfico Até 11:30hrs', horarioInicio: '', horarioFim: '11:30', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-10', nome: '10° Inventário de saída  até 11:30', nomeMoki: '10° Inventário de saída  até 11:30', horarioInicio: '', horarioFim: '11:30', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-11', nome: '11º Promotor - Banca de Saída 11:45hrs', nomeMoki: '11º Promotor - Banca de Saída 11:45hrs', horarioInicio: '', horarioFim: '11:45', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-12', nome: '12º Promotor- Notas fiscais E Quebras', nomeMoki: '12º Promotor- Notas fiscais E Quebras', horarioInicio: '', horarioFim: '', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: 'todas', ativa: true },
  { id: 'rotina-segunda-limpeza', nome: 'Promotor - Limpeza das Bancas [2ª. FEIRA]', nomeMoki: 'Promotor - Limpeza das Bancas [2ª. FEIRA]', horarioInicio: '', horarioFim: '', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [1], escopo: 'todas', ativa: true },
  { id: 'rotina-segunda-quinta-precos', nome: 'Promotor - Troca de Preços [2ª & 5ª FEIRA]', nomeMoki: 'Promotor - Troca de Preços [2ª & 5ª FEIRA]', horarioInicio: '', horarioFim: '', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [1,4], escopo: 'todas', ativa: true },
  { id: 'rotina-12x36-inventario-saida', nome: 'Inventário de saída 12x36', nomeMoki: 'Inventário de saída 12x36', horarioInicio: '', horarioFim: '', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: '12x36', ativa: true },
  { id: 'rotina-12x36-reab-14', nome: 'Reabastecimento 14:00h', nomeMoki: 'Reabastecimento 14:00h', horarioInicio: '', horarioFim: '14:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: '12x36', ativa: true },
  { id: 'rotina-12x36-reab-16', nome: 'Reabastecimento 16:00h', nomeMoki: 'Reabastecimento 16:00h', horarioInicio: '', horarioFim: '16:00', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: '12x36', ativa: true },
  { id: 'rotina-12x36-saida-1745', nome: 'Reabastecimento Saída Até 17:45', nomeMoki: 'Reabastecimento Saída Até 17:45', horarioInicio: '', horarioFim: '17:45', toleranciaInicioMin: 0, toleranciaFimMin: 0, dias: [0,1,2,3,4,5,6], escopo: '12x36', ativa: true }
];

const LOJAS_FIXAS_12X36 = [
  'DD ÁGUAS CLARAS',
  'DD JD BOTÂNICO',
  'DD SIA',
  'COSTA T-63',
  'COSTA JARDIM GOIÁS',
  'COSTA SENADOR CANEDO',
  'COSTA GOIÂNIA (ANEL VIÁRIO)'
];

const registrosSimulados = [];

const CADASTRO_LOJAS_FORMADORES = [
  ['COMPER ASA SUL', 'Luciano'],
  ['COMPER SOBRADINHO', 'Luciano'],
  ['COMPER ÁGUAS CLARAS', 'Luciano'],
  ['COSTA ADE', 'Luciano'],
  ['COSTA TAQUARI', 'Luciano'],
  ['COSTA UNIEURO', 'Luciano'],
  ['DD CEILÂNDIA CENTRO', 'Luciano'],
  ['DD CEILÂNDIA SUL', 'Luciano'],
  ['DD EPTG', 'Luciano'],
  ['DD FORMOSA', 'Luciano'],
  ['DD GUARÁ', 'Luciano'],
  ['DD JD BOTÂNICO', 'Luciano'],
  ['DD MESTRE DARMAS', 'Luciano'],
  ['DD PLANALTINA-DF', 'Luciano'],
  ['DD PLANALTINA-GO', 'Luciano'],
  ['DD SIA', 'Luciano'],
  ['DD SOBRADINHO', 'Luciano'],
  ['DD TAGUATINGA SUL', 'Luciano'],
  ['DD ÁGUAS LINDAS', 'Luciano'],
  ['FORT CEILÂNDIA', 'Luciano'],
  ['FORT PLANALTINA', 'Luciano'],
  ['FORT SOL NASCENTE', 'Luciano'],
  ['FORT TAGUATINGA', 'Luciano'],
  ['TT - ÁGUAS LINDAS NOVA', 'Luciano'],
  ['TT - ÁGUAS LINDAS VELHA', 'Luciano'],
  ['TT - CEILÂNDIA PSUL', 'Luciano'],
  ['TT - EPTG', 'Luciano'],

  ['BRETAS ARMAZÉM', 'Karina'],
  ['COSTA GOIÂNIA', 'Karina'],
  ['COSTA LARANJEIRAS', 'Karina'],
  ['DANIEL PEREIRA GOMES', 'Karina'],
  ['DD APARECIDA GOIÂNIA', 'Karina'],
  ['DD CESAR LATES', 'Karina'],
  ['DD GOIANÉSIA', 'Karina'],
  ['DD GURUPI', 'Karina'],
  ['DD HORACIO COSTA', 'Karina'],
  ['DD ITUMBIARA', 'Karina'],
  ['DD LEM', 'Karina'],
  ['DD RIO VERDE', 'Karina'],

  ['COMPER GAMA', 'Luana'],
  ['COSTA LUZIÂNIA', 'Luana'],
  ['COSTA SANTA MARIA', 'Luana'],
  ['COSTA TAGUATINGA', 'Luana'],
  ['COSTA VALPARAÍSO', 'Luana'],
  ['DD BR 070', 'Luana'],
  ['DD FURNAS', 'Luana'],
  ['DD GAMA', 'Luana'],
  ['DD LUZIÂNIA', 'Luana'],
  ['DD NOVO GAMA', 'Luana'],
  ['DD PARK JK', 'Luana'],
  ['DD RECANTO', 'Luana'],
  ['DD RIACHO', 'Luana'],
  ['DD SAMAMBAIA', 'Luana'],
  ['DD SANTO ANTÔNIO', 'Luana'],
  ['DD VICENTE PIRES', 'Luana'],
  ['DD VICENTE PIRES 2', 'Luana'],
  ['DD ÁGUAS CLARAS', 'Luana'],
  ['FORT RECANTO DAS EMAS', 'Luana'],
  ['FORT VALPARAÍSO', 'Luana'],
  ['TT - LUZIÂNIA', 'Luana'],
  ['TT - RECANTO DAS EMAS', 'Luana'],
  ['TT - SAMAMBAIA NORTE', 'Luana'],
  ['TT - SAMAMBAIA SUL', 'Luana'],
  ['TT - SANTA MARIA', 'Luana'],
  ['TT - VICENTE PIRES', 'Luana'],
];

const ALIASES_LOJAS = {
  'COMPER ASA SUL': ['G.P - 55 ASA SUL', 'GP 55 ASA SUL', 'G P 55 ASA SUL'],
  'COMPER SOBRADINHO': ['G.P - 30 COMPER SOBRAD', 'GP 30 COMPER SOBRAD', 'COMPER SOBRAD', 'COMPER SOBRADINHO 30'],
  'COMPER ÁGUAS CLARAS': ['G.P - 58 AGUAS CLARAS', 'GP 58 AGUAS CLARAS', 'COMPER AGUAS CLARAS'],
  'COSTA VALPARAÍSO': ['COSTA VALPARAISO'],
  'DD CEILÂNDIA CENTRO': ['DD CEILANDIA CENTRO'],
  'DD CEILÂNDIA SUL': ['DD CEILANDIA SUL'],
  'DD EPTG': ['DD EPTG'],
  'DD GOIANÉSIA': ['DD GOIANESIA'],
  'DD JD BOTÂNICO': ['DD JD BOTANICO', 'DD JD. BOTANICO', 'DD JD BOTÃNICO'],
  'DD LUZIÂNIA': ['DD LUZIANIA'],
  'DD SANTO ANTÔNIO': ['DD SANTO ANTONIO', 'DD SANTO ÂNTONIO'],
  'DD ÁGUAS CLARAS': ['DD AGUAS CLARAS'],
  'DD ÁGUAS LINDAS': ['DD AGUAS LINDAS'],
  'FORT CEILÂNDIA': ['G.P - 39 CEILÂNDIA', 'GP 39 CEILANDIA', 'FORT CEILANDIA'],
  'FORT PLANALTINA': ['G.P - 82 PLANALTINA', 'GP 82 PLANALTINA'],
  'FORT RECANTO DAS EMAS': ['G.P - 64 RECANTO DAS EMAS', 'GP 64 RECANTO DAS EMAS'],
  'FORT SOL NASCENTE': ['G.P - 22 SOL NASCENTE', 'GP 22 SOL NASCENTE'],
  'FORT TAGUATINGA': ['G.P - 74 TAGUATINGA', 'GP 74 TAGUATINGA'],
  'FORT VALPARAÍSO': ['G.P - 77 VALPARAISO', 'GP 77 VALPARAISO', 'FORT VALPARAISO'],
  'TT - ÁGUAS LINDAS NOVA': ['TT - AGUAS LINDAS NOVA'],
  'TT - ÁGUAS LINDAS VELHA': ['TT - AGUAS LINDAS VELHA'],
  'TT - CEILÂNDIA PSUL': ['TT - CEILANDIA PSUL'],
  'TT - LUZIÂNIA': ['TT - LUZIANIA'],
  'COMPER GAMA': ['G.P - 17 COMPER GAMA', 'GP 17 COMPER GAMA'],
  'DD ÁGUAS CLARAS': ['DD AGUAS CLARAS', 'DIA A DIA AGUAS CLARAS', 'DIA A DIA ÁGUAS CLARAS'],
  'DD JD BOTÂNICO': ['DD JD BOTANICO', 'DD JD. BOTANICO', 'DD JD BOTÃNICO', 'DIA A DIA JARDIM BOTANICO', 'DIA A DIA JARDIM BOTÂNICO'],
  'DD SIA': ['DIA A DIA SIA'],
  'COSTA T-63': ['COSTA T63', 'COSTA T 63'],
  'COSTA JARDIM GOIÁS': ['COSTA JARDIM GOIAS', 'COSTA JD GOIAS', 'COSTA JD GOIÁS'],
  'COSTA SENADOR CANEDO': ['COSTA SENADOR CANÊDO'],
  'COSTA GOIÂNIA (ANEL VIÁRIO)': ['COSTA GOIANIA (ANEL VIARIO)', 'COSTA GOIANIA ANEL VIARIO', 'COSTA GOIÂNIA ANEL VIÁRIO', 'COSTA ANEL VIARIO', 'COSTA ANEL VIÁRIO'],
};

const lojaFormadorInicial = [...CADASTRO_LOJAS_FORMADORES];

function construirMapaPorSlug(pares) {
  return pares.reduce((acc, [loja, valor]) => {
    acc[slug(loja)] = valor;
    return acc;
  }, {});
}

function construirMapaAliases() {
  return Object.entries(ALIASES_LOJAS).reduce((acc, [oficial, aliases]) => {
    acc[slug(oficial)] = oficial;
    aliases.forEach((alias) => {
      acc[slug(alias)] = oficial;
    });
    return acc;
  }, {});
}

const lojaAliasMap = construirMapaAliases();
const defaultLojaRenameMap = { ...lojaAliasMap };
const defaultLojaFormadorMap = (() => {
  const mapa = construirMapaPorSlug(CADASTRO_LOJAS_FORMADORES);
  Object.entries(lojaAliasMap).forEach(([aliasSlug, oficial]) => {
    const formador = mapa[slug(oficial)];
    if (formador) mapa[aliasSlug] = formador;
  });
  return mapa;
})();

const filtros = {
  rede: document.getElementById('filterRede'),
  loja: document.getElementById('filterLoja'),
  formador: document.getElementById('filterFormador'),
  status: document.getElementById('filterStatus'),
  dataInicial: document.getElementById('filterDataInicial'),
  dataFinal: document.getElementById('filterDataFinal'),
  rotina: document.getElementById('filterRotina')
};

const datasetStatus = document.getElementById('datasetStatus');
const importBadge = document.getElementById('importBadge');
const importSummary = document.getElementById('importSummary');
const fileInput = document.getElementById('fileInput');

function setImportStatus(summaryText, badgeText = '') {
  if (importSummary) importSummary.textContent = summaryText;
  if (importBadge) importBadge.textContent = badgeText;
}

const formatarNumero = new Intl.NumberFormat('pt-BR');

function normalizarMapaChaves(mapa = {}) {
  return Object.entries(mapa || {}).reduce((acc, [chave, valor]) => {
    acc[slug(chave)] = valor;
    return acc;
  }, {});
}

function ehFormadorAtivo(valor) {
  return FORMADORES_ATIVOS_SLUG.has(slug(valor));
}

function normalizarNomeFormador(valor) {
  const encontrado = FORMADORES_ATIVOS.find((item) => slug(item) === slug(valor));
  return encontrado || '';
}

function sanitizarMapaFormadores(mapa = {}) {
  return Object.entries(mapa || {}).reduce((acc, [chave, valor]) => {
    const formador = normalizarNomeFormador(valor);
    if (formador) acc[slug(chave)] = formador;
    return acc;
  }, {});
}

migrarArmazenamentoSeNecessario();

let lojaFormadorMap = sanitizarMapaFormadores({ ...defaultLojaFormadorMap, ...normalizarMapaChaves(carregarStore(STORAGE_KEYS.storeFormadorMap, {})) });
let lojaPromotorMap = normalizarMapaChaves(carregarStore(STORAGE_KEYS.storePromotorMap, {}));
let lojaRenameMap = normalizarMapaChaves({ ...defaultLojaRenameMap, ...carregarStore(STORAGE_KEYS.storeRenameMap, {}) });
let configRotinas = normalizarConfiguracoesRotinas(carregarStore(STORAGE_KEYS.routineConfig, ROTINAS_PADRAO));
let lojasConhecidas = new Set([
  ...CADASTRO_LOJAS_FORMADORES.map(([loja]) => loja),
  ...LOJAS_FIXAS_12X36,
  ...carregarStore(STORAGE_KEYS.knownStores, [])
].map((loja) => String(loja || '').trim()).filter(Boolean));
let snapshotsImportados = carregarStore(STORAGE_KEYS.importedSnapshots, []);
let registrosBase = normalizarBaseCompleta(registrosSimulados, 'simulada');
let registros = [...registrosBase];
let dadosFiltrados = [...registrosBase];
let ultimaDataDisponivel = obterUltimaData(registrosBase);

lojaFormadorMap = sanitizarMapaFormadores(lojaFormadorMap);
salvarStore(STORAGE_KEYS.storeFormadorMap, lojaFormadorMap);
lojaRenameMap = normalizarMapaChaves({ ...defaultLojaRenameMap, ...lojaRenameMap });
salvarStore(STORAGE_KEYS.storeRenameMap, lojaRenameMap);

function migrarArmazenamentoSeNecessario() {
  const versaoAtual = localStorage.getItem(STORAGE_KEYS.appVersion);
  if (versaoAtual === APP_STORAGE_VERSION) return;

  localStorage.removeItem(STORAGE_KEYS.importedSnapshots);
  localStorage.removeItem(STORAGE_KEYS.activeSnapshotId);
  localStorage.removeItem(STORAGE_KEYS.storePromotorMap);
  localStorage.setItem(STORAGE_KEYS.storeRenameMap, JSON.stringify(defaultLojaRenameMap));
  localStorage.setItem(STORAGE_KEYS.storeFormadorMap, JSON.stringify(defaultLojaFormadorMap));
  localStorage.setItem(STORAGE_KEYS.appVersion, APP_STORAGE_VERSION);
}

function carregarStore(chave, fallback) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}


function salvarStore(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (error) {
    console.error(`Erro ao salvar no localStorage (${chave}):`, error);
  }
}

function persistirSnapshotsLocais() {
  if (!firebaseDisponivel) {
    salvarStore(STORAGE_KEYS.importedSnapshots, snapshotsImportados);
    return;
  }

  const resumo = snapshotsImportados.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    importedAt: item.importedAt,
    total: item.total,
    latestDate: item.latestDate,
    responsesCount: item.responsesCount || 0,
    summary: item.summary || {},
    rawExpiresAt: item.rawExpiresAt || '',
    rawAvailable: item.rawAvailable !== false,
    rawRowsCount: item.rawRowsCount || 0,
    rawDeletedAt: item.rawDeletedAt || '',
    chunksCount: item.chunksCount || 0,
    rawChunksCount: item.rawChunksCount || 0,
    schemaVersion: item.schemaVersion || (Array.isArray(item.data) && item.data.length ? 1 : 2)
  }));

  salvarStore(STORAGE_KEYS.importedSnapshots, resumo);
}

function atualizarBasePorSnapshots(detalhe = '') {
  registrosBase = snapshotsImportados.length
    ? consolidarSnapshotsImportados()
    : normalizarBaseCompleta(registrosSimulados, 'simulada');

  aplicarBase(
    registrosBase,
    snapshotsImportados.length ? 'importada' : 'simulada',
    detalhe || (
      snapshotsImportados.length
        ? `${registrosBase.length} registros consolidados de ${snapshotsImportados.length} planilha(s) importada(s).`
        : 'Painel sem dados. Importe uma ou mais planilhas para carregar as rotinas.'
    )
  );

  renderHistoricoPlanilhas();
  atualizarResumoAdmin();
  if (document.getElementById('adminModal') && !document.getElementById('adminPanelView')?.classList.contains('hidden')) {
    popularControlesAdmin();
  }
}

async function inicializarFirebaseOpcional() {
  try {
    const [{ initializeApp }, firestoreApi] = await Promise.all([
      import(FIREBASE_URLS.app),
      import(FIREBASE_URLS.firestore)
    ]);

    firebaseApi = firestoreApi;
    firebaseApp = initializeApp(firebaseConfig);
    db = firestoreApi.getFirestore(firebaseApp);
    painelConfigRef = firestoreApi.doc(db, 'painel_meta', 'app_state');
    snapshotsCollectionRef = firestoreApi.collection(db, 'painel_snapshots');
    firebaseDisponivel = true;
    firebaseInicializado = true;
    iniciarFirebaseSync();
  } catch (error) {
    firebaseDisponivel = false;
    firebaseInicializado = true;
    console.warn('Firebase indisponível. O painel seguirá funcionando com armazenamento local.', error);
  }
}

async function salvarConfigNoFirebase() {
  if (!firebaseDisponivel || !firebaseApi || !painelConfigRef) return false;
  try {
    await firebaseApi.setDoc(painelConfigRef, {
      appVersion: APP_STORAGE_VERSION,
      storeFormadorMap: sanitizarMapaFormadores(lojaFormadorMap),
      storePromotorMap: lojaPromotorMap,
      storeRenameMap: lojaRenameMap,
      routineConfig: configRotinas,
      knownStores: [...lojasConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração no Firebase:', error);
    return false;
  }
}

function dividirEmLotes(lista, tamanho = 200) {
  const lotes = [];
  for (let i = 0; i < lista.length; i += tamanho) {
    lotes.push(lista.slice(i, i + tamanho));
  }
  return lotes;
}

async function excluirSubcolecaoSnapshotNoFirebase(snapshotId, nomeSubcolecao) {
  if (!firebaseDisponivel || !firebaseApi || !db) return;

  const chunksRef = firebaseApi.collection(db, 'painel_snapshots', snapshotId, nomeSubcolecao);
  const chunksSnap = await firebaseApi.getDocs(chunksRef);
  const docs = chunksSnap.docs || [];

  for (let i = 0; i < docs.length; i += 200) {
    const batch = firebaseApi.writeBatch(db);
    docs.slice(i, i + 200).forEach((docItem) => batch.delete(docItem.ref));
    await batch.commit();
  }
}

async function excluirChunksSnapshotNoFirebase(snapshotId) {
  return excluirSubcolecaoSnapshotNoFirebase(snapshotId, 'chunks');
}

async function excluirDadosBrutosSnapshotNoFirebase(snapshotId, atualizarMeta = true) {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    await excluirSubcolecaoSnapshotNoFirebase(snapshotId, 'raw_chunks');
    if (atualizarMeta) {
      await firebaseApi.setDoc(firebaseApi.doc(db, 'painel_snapshots', snapshotId), {
        rawAvailable: false,
        rawChunksCount: 0,
        rawDeletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error(`Erro ao excluir dados brutos do snapshot ${snapshotId}:`, error);
    return false;
  }
}

async function salvarSnapshotNoFirebase(snapshot) {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    const { data, rawData, ...meta } = snapshot;
    const lotes = dividirEmLotes(Array.isArray(data) ? data : [], 200);
    const temRawData = Array.isArray(rawData);
    const lotesRaw = temRawData ? dividirEmLotes(rawData, 200) : [];

    await excluirChunksSnapshotNoFirebase(snapshot.id);

    for (let i = 0; i < lotes.length; i += 20) {
      const batch = firebaseApi.writeBatch(db);
      lotes.slice(i, i + 20).forEach((lote, indiceInterno) => {
        const indice = i + indiceInterno;
        const chunkRef = firebaseApi.doc(db, 'painel_snapshots', snapshot.id, 'chunks', `chunk-${String(indice).padStart(4, '0')}`);
        batch.set(chunkRef, {
          index: indice,
          rows: lote,
          fileName: snapshot.fileName,
          importedAt: snapshot.importedAt
        });
      });
      await batch.commit();
    }

    if (temRawData) {
      await excluirSubcolecaoSnapshotNoFirebase(snapshot.id, 'raw_chunks');
      const expiraEm = snapshot.rawExpiresAt ? new Date(snapshot.rawExpiresAt) : new Date(Date.now() + PRAZO_DADOS_BRUTOS_DIAS * 86400000);

      for (let i = 0; i < lotesRaw.length; i += 20) {
        const batch = firebaseApi.writeBatch(db);
        lotesRaw.slice(i, i + 20).forEach((lote, indiceInterno) => {
          const indice = i + indiceInterno;
          const chunkRef = firebaseApi.doc(db, 'painel_snapshots', snapshot.id, 'raw_chunks', `raw-${String(indice).padStart(4, '0')}`);
          batch.set(chunkRef, {
            index: indice,
            rows: lote,
            fileName: snapshot.fileName,
            importedAt: snapshot.importedAt,
            expiresAt: firebaseApi.Timestamp.fromDate(expiraEm)
          });
        });
        await batch.commit();
      }
    }

    const metaFinal = {
      ...meta,
      chunksCount: lotes.length,
      schemaVersion: 3,
      updatedAt: new Date().toISOString(),
      data: firebaseApi.deleteField()
    };

    if (temRawData) {
      metaFinal.rawChunksCount = lotesRaw.length;
      metaFinal.rawRowsCount = rawData.length;
      metaFinal.rawAvailable = true;
      metaFinal.rawDeletedAt = '';
    }

    await firebaseApi.setDoc(firebaseApi.doc(db, 'painel_snapshots', snapshot.id), metaFinal, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar snapshot no Firebase:', error);
    return false;
  }
}

async function excluirSnapshotNoFirebase(snapshotId) {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    await excluirChunksSnapshotNoFirebase(snapshotId);
    await excluirSubcolecaoSnapshotNoFirebase(snapshotId, 'raw_chunks');
    await firebaseApi.deleteDoc(firebaseApi.doc(db, 'painel_snapshots', snapshotId));
    return true;
  } catch (error) {
    console.error('Erro ao excluir snapshot no Firebase:', error);
    return false;
  }
}

async function limparSnapshotsNoFirebase(idsInformados = null) {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    const ids = Array.isArray(idsInformados)
      ? [...new Set(idsInformados.filter(Boolean))]
      : [...new Set(snapshotsImportados.map((snapshot) => snapshot.id).filter(Boolean))];
    for (const snapshotId of ids) {
      await excluirSnapshotNoFirebase(snapshotId);
    }
    return true;
  } catch (error) {
    console.error('Erro ao limpar snapshots no Firebase:', error);
    return false;
  }
}

function valorDataParaIso(valor, fallback = '') {
  if (typeof valor === 'string') return valor;
  if (valor?.toDate) return valor.toDate().toISOString();
  return fallback;
}

function normalizarSnapshotFirebase(snapshot) {
  return {
    ...snapshot,
    importedAt: valorDataParaIso(snapshot.importedAt, new Date().toISOString()),
    rawExpiresAt: valorDataParaIso(snapshot.rawExpiresAt, ''),
    rawDeletedAt: valorDataParaIso(snapshot.rawDeletedAt, ''),
    data: Array.isArray(snapshot.data) ? snapshot.data : [],
    chunksCount: Number(snapshot.chunksCount || 0),
    rawChunksCount: Number(snapshot.rawChunksCount || 0),
    rawRowsCount: Number(snapshot.rawRowsCount || 0),
    responsesCount: Number(snapshot.responsesCount || 0),
    rawAvailable: snapshot.rawAvailable !== false,
    schemaVersion: Number(snapshot.schemaVersion || (Array.isArray(snapshot.data) && snapshot.data.length ? 1 : 2))
  };
}

async function carregarDadosSnapshotNoFirebase(snapshot) {
  if (Array.isArray(snapshot?.data) && snapshot.data.length) {
    return snapshot.data;
  }

  if (!firebaseDisponivel || !firebaseApi || !db || !snapshot?.id) return [];
  if (!snapshot.chunksCount) return [];

  try {
    const chunksRef = firebaseApi.collection(db, 'painel_snapshots', snapshot.id, 'chunks');
    const chunksQuery = firebaseApi.query(chunksRef, firebaseApi.orderBy('index', 'asc'));
    const chunksSnap = await firebaseApi.getDocs(chunksQuery);
    const linhas = [];

    chunksSnap.forEach((docItem) => {
      const dados = docItem.data();
      if (Array.isArray(dados.rows)) linhas.push(...dados.rows);
    });

    return linhas;
  } catch (error) {
    console.error(`Erro ao carregar dados do snapshot ${snapshot.id}:`, error);
    return [];
  }
}

function dadosBrutosExpirados(snapshot, agora = Date.now()) {
  if (!snapshot?.rawExpiresAt || snapshot.rawAvailable === false) return false;
  const expira = new Date(snapshot.rawExpiresAt).getTime();
  return Number.isFinite(expira) && expira <= agora;
}

async function limparDadosBrutosExpirados() {
  const agora = Date.now();
  const expirados = snapshotsImportados.filter((snapshot) => dadosBrutosExpirados(snapshot, agora));
  if (!expirados.length) return 0;

  let removidos = 0;
  for (const snapshot of expirados) {
    let removido = true;
    if (firebaseDisponivel) {
      removido = await excluirDadosBrutosSnapshotNoFirebase(snapshot.id, true);
    }
    if (!removido) continue;

    snapshotsImportados = snapshotsImportados.map((item) => item.id === snapshot.id ? {
      ...item,
      rawData: undefined,
      rawAvailable: false,
      rawChunksCount: 0,
      rawDeletedAt: new Date().toISOString()
    } : item);
    removidos += 1;
  }

  persistirSnapshotsLocais();
  if (removidos) renderHistoricoPlanilhas();
  return removidos;
}

function agendarLimpezaDadosBrutos() {
  limparDadosBrutosExpirados();
  window.setInterval(() => {
    limparDadosBrutosExpirados();
  }, INTERVALO_LIMPEZA_DADOS_BRUTOS_MS);
}

function aplicarEstadoRemoto() {
  atualizarBasePorSnapshots();
  limparDadosBrutosExpirados();
}

function iniciarFirebaseSync() {
  if (firebaseListenersIniciados) return;
  firebaseListenersIniciados = true;

  firebaseApi.onSnapshot(painelConfigRef, (snapshot) => {
    const remoto = snapshot.data() || {};
    lojaFormadorMap = sanitizarMapaFormadores({
      ...defaultLojaFormadorMap,
      ...normalizarMapaChaves(remoto.storeFormadorMap || lojaFormadorMap)
    });
    lojaPromotorMap = normalizarMapaChaves(remoto.storePromotorMap || lojaPromotorMap);
    lojaRenameMap = normalizarMapaChaves({
      ...defaultLojaRenameMap,
      ...normalizarMapaChaves(remoto.storeRenameMap || lojaRenameMap)
    });
    configRotinas = normalizarConfiguracoesRotinas(remoto.routineConfig || configRotinas);
    (Array.isArray(remoto.knownStores) ? remoto.knownStores : []).forEach((loja) => lojasConhecidas.add(String(loja || '').trim()));

    salvarStore(STORAGE_KEYS.storeFormadorMap, lojaFormadorMap);
    salvarStore(STORAGE_KEYS.storePromotorMap, lojaPromotorMap);
    salvarStore(STORAGE_KEYS.storeRenameMap, lojaRenameMap);
    salvarStore(STORAGE_KEYS.routineConfig, configRotinas);
    salvarStore(STORAGE_KEYS.knownStores, [...lojasConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')));

    firebaseConfigRecebida = true;
    if (firebaseInicializado) aplicarEstadoRemoto();
  }, (error) => {
    console.error('Erro ao sincronizar configurações do Firebase:', error);
  });

  firebaseApi.onSnapshot(firebaseApi.query(snapshotsCollectionRef, firebaseApi.orderBy('importedAt', 'desc')), async (snapshot) => {
    const metas = snapshot.docs.map((item) => normalizarSnapshotFirebase({ id: item.id, ...item.data() }));
    const completos = await Promise.all(metas.map(async (item) => ({
      ...item,
      data: await carregarDadosSnapshotNoFirebase(item)
    })));

    snapshotsImportados = completos;
    persistirSnapshotsLocais();
    firebaseSnapshotsRecebidos = true;
    if (firebaseInicializado) aplicarEstadoRemoto();
  }, (error) => {
    console.error('Erro ao sincronizar planilhas do Firebase:', error);
  });
}

function percentual(realizadas, total) {
  return total ? Math.round((realizadas / total) * 100) : 0;
}

function classeExecucao(execucao) {
  if (execucao > 90) return 'execucao-alta';
  if (execucao >= 80) return 'execucao-media';
  return 'execucao-baixa';
}

function escaparHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function slug(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function tituloCaso(texto) {
  return String(texto || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

function normalizarConfiguracoesRotinas(configuracoes = []) {
  const recebidas = new Map((Array.isArray(configuracoes) ? configuracoes : []).map((item) => [item.id, item]));
  return ROTINAS_PADRAO.map((padrao) => {
    const salvo = recebidas.get(padrao.id) || {};
    return {
      ...padrao,
      ...salvo,
      id: padrao.id,
      nome: padrao.nome,
      nomeMoki: String(salvo.nomeMoki || padrao.nomeMoki || padrao.nome).trim(),
      horarioInicio: validarHorario(salvo.horarioInicio ?? padrao.horarioInicio),
      horarioFim: validarHorario(salvo.horarioFim ?? padrao.horarioFim),
      toleranciaInicioMin: limitarInteiro(salvo.toleranciaInicioMin ?? padrao.toleranciaInicioMin, 0, 1440),
      toleranciaFimMin: limitarInteiro(salvo.toleranciaFimMin ?? padrao.toleranciaFimMin, 0, 1440),
      dias: Array.isArray(padrao.dias) ? [...padrao.dias] : [0,1,2,3,4,5,6],
      escopo: padrao.escopo,
      ativa: salvo.ativa !== false
    };
  });
}

function limitarInteiro(valor, minimo = 0, maximo = Number.MAX_SAFE_INTEGER) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) return minimo;
  return Math.max(minimo, Math.min(maximo, numero));
}

function validarHorario(valor) {
  const texto = String(valor || '').trim();
  const match = texto.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hora = Number(match[1]);
  const minuto = Number(match[2]);
  if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) return '';
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

function horarioParaMinutos(horario) {
  const valido = validarHorario(horario);
  if (!valido) return null;
  const [hora, minuto] = valido.split(':').map(Number);
  return hora * 60 + minuto;
}

function slugChecklist(texto) {
  return slug(String(texto || '')
    .replace(/[º°ª]/g, '')
    .replace(/\bhoras?\b/gi, 'h')
    .replace(/\bhrs?\b/gi, 'h')
    .replace(/(\d{1,2})h(\d{2})\b/gi, '$1-$2')
    .replace(/(\d{1,2}):(\d{2})/g, '$1-$2'));
}

function encontrarConfigRotinaPorNome(nome) {
  const chave = slugChecklist(nome);
  if (!chave) return null;
  return configRotinas.find((rotina) => {
    const candidatos = [rotina.nome, rotina.nomeMoki, ...(Array.isArray(rotina.aliases) ? rotina.aliases : [])];
    return candidatos.some((item) => slugChecklist(item) === chave);
  }) || null;
}

function obterConfigRotinaPorId(id) {
  return configRotinas.find((item) => item.id === id) || null;
}

function dataIsoParaDate(dataIso) {
  const match = String(dataIso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const data = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(data.getTime()) ? null : data;
}

function rotinaAplicaNaData(rotina, dataIso) {
  if (!rotina?.ativa) return false;
  const data = dataIsoParaDate(dataIso);
  if (!data) return false;
  return Array.isArray(rotina.dias) && rotina.dias.includes(data.getDay());
}

function lojaEh12x36(loja) {
  const normalizada = renomearLojaSeNecessario(loja);
  const chave = slug(normalizada);
  return LOJAS_FIXAS_12X36.some((item) => slug(item) === chave);
}

function rotinaAplicaNaLoja(rotina, loja) {
  return rotina?.escopo !== '12x36' || lojaEh12x36(loja);
}

function registrarLojasConhecidas(lojas = [], persistir = true) {
  let alterou = false;
  (Array.isArray(lojas) ? lojas : []).forEach((loja) => {
    const normalizada = renomearLojaSeNecessario(String(loja || '').trim());
    if (normalizada && !lojasConhecidas.has(normalizada)) {
      lojasConhecidas.add(normalizada);
      alterou = true;
    }
  });
  if (alterou && persistir) {
    salvarStore(STORAGE_KEYS.knownStores, [...lojasConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    salvarConfigNoFirebase();
  }
  return alterou;
}

function formatarDiasRotina(dias = []) {
  const todos = [0,1,2,3,4,5,6];
  if (todos.every((dia) => dias.includes(dia))) return 'Todos os dias';
  const nomes = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
  return dias.map((dia) => nomes[dia]).filter(Boolean).join(', ');
}

function formatarEscopoRotina(escopo) {
  return escopo === '12x36' ? 'Somente lojas 12x36' : 'Todas as lojas';
}

function parseDataHoraMoki(valor, dataReferencia = '') {
  if (!valor) return { data: formatarData(dataReferencia), hora: '', dataHoraIso: '' };

  if (typeof valor === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const data = new Date(excelEpoch.getTime() + valor * 86400000);
    const dataIso = data.toISOString().slice(0, 10);
    const hora = `${String(data.getUTCHours()).padStart(2, '0')}:${String(data.getUTCMinutes()).padStart(2, '0')}`;
    return { data: dataIso, hora, dataHoraIso: `${dataIso}T${hora}:00` };
  }

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    const dataIso = `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`;
    const hora = `${String(valor.getHours()).padStart(2, '0')}:${String(valor.getMinutes()).padStart(2, '0')}`;
    return { data: dataIso, hora, dataHoraIso: `${dataIso}T${hora}:00` };
  }

  const texto = String(valor).trim();
  const br = texto.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (br) {
    const ano = br[3].length === 2 ? `20${br[3]}` : br[3];
    const data = `${ano.padStart(4, '0')}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
    const hora = br[4] !== undefined ? `${String(br[4]).padStart(2, '0')}:${String(br[5]).padStart(2, '0')}` : '';
    return { data, hora, dataHoraIso: hora ? `${data}T${hora}:${String(br[6] || '00').padStart(2, '0')}` : '' };
  }

  const data = formatarData(dataReferencia || texto);
  const horaMatch = texto.match(/(?:T|\s)(\d{1,2}):(\d{2})/);
  const hora = horaMatch ? `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}` : '';
  return { data, hora, dataHoraIso: data && hora ? `${data}T${hora}:00` : '' };
}

function classificarPontualidade(rotina, horaRealizada, status = 'realizada') {
  if (normalizarStatus(status) !== 'realizada') {
    return {
      statusDetalhado: 'pendente',
      pontualidade: 'pendente',
      pontualidadeLabel: 'Pendente',
      minutosAtraso: 0,
      minutosAntes: 0
    };
  }

  const realizado = horarioParaMinutos(horaRealizada);
  const inicio = horarioParaMinutos(rotina?.horarioInicio);
  const fim = horarioParaMinutos(rotina?.horarioFim);
  const toleranciaInicio = limitarInteiro(rotina?.toleranciaInicioMin, 0, 1440);
  const toleranciaFim = limitarInteiro(rotina?.toleranciaFimMin, 0, 1440);

  if (realizado === null || (inicio === null && fim === null)) {
    return {
      statusDetalhado: 'realizada_sem_horario',
      pontualidade: 'sem_regra',
      pontualidadeLabel: 'Realizada • horário não configurado',
      minutosAtraso: 0,
      minutosAntes: 0
    };
  }

  if (inicio !== null && realizado < inicio - toleranciaInicio) {
    return {
      statusDetalhado: 'realizada_antes_do_horario',
      pontualidade: 'antes_horario',
      pontualidadeLabel: 'Realizada antes do horário',
      minutosAtraso: 0,
      minutosAntes: inicio - realizado
    };
  }

  if (inicio !== null && realizado < inicio) {
    return {
      statusDetalhado: 'realizada_tolerancia_inicio',
      pontualidade: 'tolerancia_inicio',
      pontualidadeLabel: 'Realizada na tolerância inicial',
      minutosAtraso: 0,
      minutosAntes: inicio - realizado
    };
  }

  if (fim !== null && realizado > fim + toleranciaFim) {
    return {
      statusDetalhado: 'realizada_em_atraso',
      pontualidade: 'atrasada',
      pontualidadeLabel: 'Realizada em atraso',
      minutosAtraso: realizado - fim,
      minutosAntes: 0
    };
  }

  if (fim !== null && realizado > fim) {
    return {
      statusDetalhado: 'realizada_tolerancia_fim',
      pontualidade: 'tolerancia_fim',
      pontualidadeLabel: 'Realizada na tolerância final',
      minutosAtraso: realizado - fim,
      minutosAntes: 0
    };
  }

  return {
    statusDetalhado: 'realizada_no_prazo',
    pontualidade: 'no_prazo',
    pontualidadeLabel: 'Realizada no prazo',
    minutosAtraso: 0,
    minutosAntes: 0
  };
}

function normalizarStatus(status) {
  const valor = String(status || '').trim().toLowerCase();
  return valor.includes('real') ? 'realizada' : 'pendente';
}

function formatarData(valor) {
  if (!valor) return '';
  if (typeof valor === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const data = new Date(excelEpoch.getTime() + valor * 86400000);
    return data.toISOString().slice(0, 10);
  }

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }

  const texto = String(valor).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

  const br = texto.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (br) {
    const ano = br[3].length === 2 ? `20${br[3]}` : br[3];
    return `${ano.padStart(4, '0')}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  }

  const data = new Date(texto);
  if (!Number.isNaN(data.getTime())) return data.toISOString().slice(0, 10);
  return '';
}

function obterUltimaData(base) {
  const datas = base.map((item) => item.data).filter(Boolean).sort();
  return datas[datas.length - 1] || '';
}

function parseLoja(lojaCompleta, redesMap = {}) {
  const valorOriginal = String(lojaCompleta || '').trim().replace(/\s+/g, ' ');
  const valor = valorOriginal.toUpperCase();

  const prefixos = [
    ['DIA A DIA', 'Dia a Dia'],
    ['DD', 'Dia a Dia'],
    ['TT', 'Tatico'],
    ['TATICO', 'Tatico'],
    ['COSTA', 'Costa'],
    ['FORT', 'Fort'],
    ['COMPER', 'Comper'],
    ['BRETAS', 'Bretas']
  ];

  const chavesMap = Object.entries(redesMap)
    .map(([sigla, nome]) => [String(sigla).toUpperCase(), tituloCaso(String(nome).replace(/^Rede\s+/i, ''))]);

  const mapaCompleto = [...chavesMap, ...prefixos];
  let rede = 'Rede não identificada';
  let unidade = valorOriginal;

  for (const [sigla, nomeRede] of mapaCompleto) {
    const padrao = new RegExp(`^${sigla}(?:\\s*-\\s*|\\s+)`, 'i');
    if (padrao.test(valorOriginal)) {
      rede = nomeRede;
      unidade = valorOriginal.replace(padrao, '').trim();
      break;
    }

    if (valor === sigla) {
      rede = nomeRede;
      unidade = valorOriginal;
      break;
    }
  }

  if (rede === 'Rede não identificada') {
    const primeiraPalavra = valorOriginal.split(' ')[0];
    rede = tituloCaso(primeiraPalavra);
    unidade = valorOriginal.replace(new RegExp(`^${primeiraPalavra}(?:\\s*-\\s*|\\s+)`, 'i'), '').trim() || valorOriginal;
  }

  return {
    rede,
    loja: valorOriginal,
    unidade: unidade || valorOriginal
  };
}

function renomearLojaSeNecessario(loja) {
  const chave = slug(loja);
  return lojaRenameMap[chave] || defaultLojaRenameMap[chave] || String(loja || '').trim();
}

function resolverFormador(loja, formadorPlanilha = '', mapaPlanilha = new Map()) {
  const lojaNormalizada = renomearLojaSeNecessario(loja);
  const chave = slug(lojaNormalizada);
  const candidato = lojaFormadorMap[chave] || mapaPlanilha.get(chave) || String(formadorPlanilha || '').trim();
  return normalizarNomeFormador(candidato) || 'Não informado';
}

function resolverPromotor(loja, promotorPlanilha = '', mapaPromotores = new Map()) {
  const lojaNormalizada = renomearLojaSeNecessario(loja);
  const chave = slug(lojaNormalizada);
  const valor = lojaPromotorMap[chave] || mapaPromotores.get(chave) || String(promotorPlanilha || '').trim();
  if (valor) return valor;
  return parseLoja(lojaNormalizada).unidade;
}

function enriquecerRegistro(base, index, mapaFormadores = new Map(), mapaPromotores = new Map()) {
  const lojaTratada = renomearLojaSeNecessario(base.loja);
  const lojaInfo = parseLoja(lojaTratada, base.redesMap || {});
  const rotinaNome = String(base.rotina || '').trim();
  const status = normalizarStatus(base.status);
  const rotinaConfig = obterConfigRotinaPorId(base.rotinaId) || encontrarConfigRotinaPorNome(rotinaNome);
  const pontualidade = classificarPontualidade(rotinaConfig, base.horaRealizada, status);

  return {
    ...base,
    id: base.id || `reg-${index + 1}`,
    data: formatarData(base.data),
    rede: base.rede || lojaInfo.rede,
    loja: lojaInfo.loja,
    unidade: base.unidade || lojaInfo.unidade,
    formador: resolverFormador(lojaInfo.loja, base.formador, mapaFormadores),
    promotor: resolverPromotor(lojaInfo.loja, base.promotor, mapaPromotores),
    rotina: rotinaConfig?.nome || rotinaNome,
    rotinaId: rotinaConfig?.id || base.rotinaId || '',
    status,
    horaRealizada: validarHorario(base.horaRealizada),
    horarioInicioPrevisto: rotinaConfig?.horarioInicio || '',
    horarioFimPrevisto: rotinaConfig?.horarioFim || '',
    toleranciaInicioMin: rotinaConfig?.toleranciaInicioMin ?? 0,
    toleranciaFimMin: rotinaConfig?.toleranciaFimMin ?? 0,
    ...pontualidade
  };
}

function normalizarBaseCompleta(base, origem = 'simulada', mapaFormadores = new Map(), mapaPromotores = new Map()) {
  return base
    .map((item, index) => enriquecerRegistro(item, index, mapaFormadores, mapaPromotores))
    .filter((item) => item.data && item.rotina && item.loja && item.status)
    .map((item) => ({ ...item, origem }));
}

function obterLojasConhecidas(lojasExtras = []) {
  const lojasRegistros = registrosBase.map((item) => item.loja);
  const lojasVinculadas = lojaFormadorInicial.map(([loja]) => loja);
  return [...new Set([
    ...lojasConhecidas,
    ...lojasVinculadas,
    ...LOJAS_FIXAS_12X36,
    ...lojasRegistros,
    ...(Array.isArray(lojasExtras) ? lojasExtras : [])
  ].map((loja) => renomearLojaSeNecessario(loja)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function preencherSelect(select, valores, placeholder) {
  const atual = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  valores.forEach((valor) => {
    const option = document.createElement('option');
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === atual)) {
    select.value = atual;
  }
}

function popularFiltros() {
  preencherSelect(filtros.rede, [...new Set(registros.map((item) => item.rede))].sort(), 'Todas');
  preencherSelect(filtros.loja, [...new Set(registros.map((item) => item.loja))].sort(), 'Todas');
  preencherSelect(filtros.formador, [...new Set(registros.map((item) => item.formador).filter(ehFormadorAtivo))].sort(), 'Todos');
  preencherSelect(filtros.rotina, [...new Set(registros.map((item) => item.rotina))].sort((a, b) => a.localeCompare(b, 'pt-BR')), 'Todas');
}

function sincronizarFiltrosDependentes() {
  const redeSelecionada = filtros.rede.value;
  const formadorSelecionado = filtros.formador.value;

  const baseLojas = registros.filter((item) => {
    const matchRede = redeSelecionada ? item.rede === redeSelecionada : true;
    const matchFormador = formadorSelecionado ? item.formador === formadorSelecionado : true;
    return matchRede && matchFormador;
  });

  preencherSelect(filtros.loja, [...new Set(baseLojas.map((item) => item.loja))].sort(), 'Todas');
}

function normalizarPeriodo(dataInicial, dataFinal) {
  if (dataInicial && dataFinal && dataInicial > dataFinal) {
    return { dataInicial: dataFinal, dataFinal: dataInicial };
  }
  return { dataInicial, dataFinal };
}

function dataDentroDoPeriodo(dataRegistro, dataInicial, dataFinal) {
  if (!dataRegistro) return false;
  const periodo = normalizarPeriodo(dataInicial, dataFinal);
  if (periodo.dataInicial && dataRegistro < periodo.dataInicial) return false;
  if (periodo.dataFinal && dataRegistro > periodo.dataFinal) return false;
  return true;
}

function obterDadosFiltrados() {
  const periodo = normalizarPeriodo(filtros.dataInicial.value, filtros.dataFinal.value);
  const dataInicial = periodo.dataInicial;
  const dataFinal = periodo.dataFinal;
  return registros.filter((item) => {
    const matchRede = filtros.rede.value ? item.rede === filtros.rede.value : true;
    const matchLoja = filtros.loja.value ? item.loja === filtros.loja.value : true;
    const matchFormador = filtros.formador.value ? item.formador === filtros.formador.value : true;
    const matchStatus = filtros.status.value ? item.status === filtros.status.value : true;
    const matchData = dataDentroDoPeriodo(item.data, dataInicial, dataFinal);
    const matchRotina = filtros.rotina.value ? item.rotina === filtros.rotina.value : true;
    return matchRede && matchLoja && matchFormador && matchStatus && matchData && matchRotina;
  });
}

function atualizarKPIs(dados) {
  const previstas = dados.length;
  const realizadas = dados.filter((item) => item.status === 'realizada').length;
  const pendentes = dados.filter((item) => item.status === 'pendente').length;
  const execucao = percentual(realizadas, previstas);

  const kpiPrevistas = document.getElementById('kpiPrevistas');
  const kpiHoje = document.getElementById('kpiHoje');
  const kpiExecucao = document.getElementById('kpiExecucao');
  const kpiPendentes = document.getElementById('kpiPendentes');
  if (kpiPrevistas) kpiPrevistas.textContent = formatarNumero.format(previstas);
  if (kpiHoje) kpiHoje.textContent = formatarNumero.format(realizadas);
  if (kpiExecucao) kpiExecucao.textContent = `${execucao}%`;
  if (kpiPendentes) kpiPendentes.textContent = formatarNumero.format(pendentes);

  const executionRing = document.getElementById('executionRing');
  if (executionRing) executionRing.style.setProperty('--progress', String(Math.max(0, Math.min(execucao, 100))));

  const totalAnterior = registros.filter((item) => dataDentroDoPeriodo(item.data, ...obterPeriodoComparativo().split('|'))).length;
  const realizadasAnterior = registros.filter((item) => item.status === 'realizada' && dataDentroDoPeriodo(item.data, ...obterPeriodoComparativo().split('|'))).length;
  const execucaoAnterior = percentual(realizadasAnterior, totalAnterior);
  const delta = execucao - execucaoAnterior;
  const deltaEl = document.getElementById('execucaoDelta');
  if (deltaEl) {
    const sinal = delta > 0 ? '↑' : delta < 0 ? '↓' : '•';
    const valor = delta === 0 ? '0%' : `${Math.abs(delta)}%`;
    deltaEl.textContent = `${sinal}${valor}`;
  }

  const meta = 80;
  const metaLabel = document.getElementById('metaPeriodoLabel');
  const goalFill = document.getElementById('goalProgressFill');
  const goalStatus = document.getElementById('goalStatusText');
  const goalGap = document.getElementById('goalGapText');
  if (metaLabel) metaLabel.textContent = `${meta}%`;
  if (goalFill) goalFill.style.width = `${Math.max(0, Math.min(execucao, 100))}%`;
  if (goalStatus) goalStatus.textContent = execucao >= meta ? 'Acima da meta' : 'Abaixo da meta';
  if (goalGap) goalGap.textContent = execucao >= meta ? `+${execucao - meta}%` : `Faltam ${meta - execucao}%`;

  atualizarPendenciasHero(dados);
}

function criarBarra(percent) {
  return `<div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(percent, 100))}%"></div></div>`;
}

function medalhaPosicao(index, total) {
  if (index === 0) return { emoji: '🥇', label: 'Ouro', classe: 'gold' };
  if (index === 1) return { emoji: '🥈', label: 'Prata', classe: 'silver' };
  if (index === 2) return { emoji: '🥉', label: 'Bronze', classe: 'bronze' };
  if (index === total - 1) return { emoji: '🐢', label: 'Último lugar', classe: 'turtle' };
  return { emoji: '•', label: 'Ranking', classe: '' };
}

function agregarPorFormador(dados) {
  return Object.values(dados.reduce((acc, item) => {
    const chave = item.formador || 'Sem formador';
    if (!acc[chave]) acc[chave] = { nome: chave, realizadas: 0, total: 0, lojas: new Set() };
    acc[chave].total += 1;
    acc[chave].lojas.add(item.loja);
    if (item.status === 'realizada') acc[chave].realizadas += 1;
    return acc;
  }, {})).map((item) => ({ ...item, quantidadeLojas: item.lojas.size }))
    .sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas || a.nome.localeCompare(b.nome, 'pt-BR'));
}

function agregarLojasPorFormador(dados) {
  const mapa = dados.reduce((acc, item) => {
    const chave = `${item.formador || 'Sem formador'}||${item.loja}`;
    if (!acc[chave]) {
      acc[chave] = {
        formador: item.formador || 'Sem formador',
        loja: item.loja,
        rede: item.rede,
        realizadas: 0,
        total: 0
      };
    }
    acc[chave].total += 1;
    if (item.status === 'realizada') acc[chave].realizadas += 1;
    return acc;
  }, {});

  return Object.values(mapa).reduce((acc, item) => {
    if (!acc[item.formador]) acc[item.formador] = [];
    acc[item.formador].push(item);
    return acc;
  }, {});
}

function renderRankingFormadores(dados) {
  const tbody = document.getElementById('rankingFormadoresTabela');
  const agrupado = agregarPorFormador(dados);

  if (!agrupado.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Nenhum formador encontrado no recorte atual.</div></td></tr>';
    return;
  }

  tbody.innerHTML = agrupado.map((item, index, array) => {
    const execucao = percentual(item.realizadas, item.total);
    const medalha = medalhaPosicao(index, array.length);
    const posicao = `${index + 1}º`;
    const status = medalha.emoji === '•'
      ? '<span class="ranking-status-badge">Em análise</span>'
      : `<span class="ranking-status-badge ${medalha.classe}">${medalha.emoji} ${medalha.label}</span>`;

    return `<tr>
      <td>${posicao}</td>
      <td>${escaparHtml(item.nome)}</td>
      <td>${item.realizadas}</td>
      <td>${item.total}</td>
      <td>${execucao}%</td>
      <td>${status}</td>
    </tr>`;
  }).join('');
}

function calcularTendencia(registrosGrupo) {
  const ordenados = [...new Set(registrosGrupo.map((item) => item.data))].sort();
  const ultimos = ordenados.slice(-2);
  if (ultimos.length < 2) return 'estável';

  const taxas = ultimos.map((data) => {
    const dia = registrosGrupo.filter((item) => item.data === data);
    return percentual(dia.filter((item) => item.status === 'realizada').length, dia.length);
  });

  if (taxas[1] > taxas[0]) return 'alta';
  if (taxas[1] < taxas[0]) return 'queda';
  return 'estável';
}

function renderPromotorDestaque(dados) {
  const container = document.getElementById('melhoresLojasFormador');
  const agrupado = agregarLojasPorFormador(dados);
  const formadores = Object.keys(agrupado).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  if (!formadores.length) {
    container.innerHTML = '<div class="empty-state">Nenhum destaque disponível no recorte atual.</div>';
    return;
  }

  container.innerHTML = formadores.map((formador) => {
    const melhorLoja = [...agrupado[formador]].sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas || a.loja.localeCompare(b.loja, 'pt-BR'))[0];
    const execucao = percentual(melhorLoja.realizadas, melhorLoja.total);
    return `
      <div class="best-store-card">
        <div class="best-store-head">
          <span class="best-store-formador">${escaparHtml(formador)}</span>
          <div class="best-store-medal">🥇</div>
        </div>
        <div class="best-store-name">${escaparHtml(melhorLoja.loja)}</div>
        <div class="best-store-meta">Rede ${escaparHtml(melhorLoja.rede)} • ${melhorLoja.realizadas}/${melhorLoja.total} realizadas</div>
        ${criarBarra(execucao)}
        <div class="best-store-meta"><strong>${execucao}%</strong> de execução</div>
      </div>`;
  }).join('');
}

function renderRankingsPorFormador(dados) {
  const container = document.getElementById('rankingsPorFormador');
  const agrupado = agregarLojasPorFormador(dados);
  const formadores = Object.keys(agrupado).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  if (!formadores.length) {
    container.innerHTML = '<div class="empty-state">Sem lojas por formador no recorte atual.</div>';
    return;
  }

  container.innerHTML = formadores.map((formador) => {
    const lojas = agrupado[formador]
      .sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas || a.loja.localeCompare(b.loja, 'pt-BR'));

    const melhor = lojas[0];
    const melhorExecucao = percentual(melhor.realizadas, melhor.total);

    return `
      <div class="formador-column">
        <div class="formador-title-row">
          <div>
            <div class="formador-title">${escaparHtml(formador)}</div>
            <div class="formador-subtitle">Lojas da melhor para a pior execução</div>
          </div>
          <span class="mini-badge">${lojas.length} lojas</span>
        </div>
        <div class="best-store-meta">Melhor loja: <strong>${escaparHtml(melhor.loja)}</strong> • ${melhorExecucao}%</div>
        <div class="formador-ranking-list">
          ${lojas.map((item, index) => {
            const execucao = percentual(item.realizadas, item.total);
            return `
              <div class="formador-ranking-item ${index === 0 ? 'top-store' : ''}">
                <div class="item-head">
                  <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                    <span class="position-pill">${index + 1}</span>
                    <div>
                      <div class="item-title">${escaparHtml(item.loja)}</div>
                      <div class="meta-line">Rede ${escaparHtml(item.rede)}</div>
                    </div>
                  </div>
                  <strong>${execucao}%</strong>
                </div>
                ${criarBarra(execucao)}
                <div class="percent-line">${item.realizadas} realizadas de ${item.total} previstas</div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function renderRankingLojas(dados) {
  const container = document.getElementById('rankingLojas');
  const agrupado = Object.values(dados.reduce((acc, item) => {
    if (!acc[item.loja]) acc[item.loja] = { loja: item.loja, rede: item.rede, realizadas: 0, total: 0 };
    acc[item.loja].total += 1;
    if (item.status === 'realizada') acc[item.loja].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas);

  if (!agrupado.length) {
    container.innerHTML = '<div class="empty-state">Nenhuma loja encontrada.</div>';
    return;
  }

  container.innerHTML = agrupado.slice(0, 8).map((item) => {
    const execucao = percentual(item.realizadas, item.total);
    return `
      <div class="list-card">
        <div class="list-main">
          <strong>${escaparHtml(item.loja)}</strong>
          <div class="list-meta"><span>Rede: ${escaparHtml(item.rede)}</span><span>${item.realizadas}/${item.total} concluídas</span></div>
          ${criarBarra(execucao)}
        </div>
        <strong>${execucao}%</strong>
      </div>`;
  }).join('');
}

function renderRotinasMenosRealizadas(dados) {
  const container = document.getElementById('rotinasMenos');
  const agrupado = Object.values(dados.reduce((acc, item) => {
    if (!acc[item.rotina]) acc[item.rotina] = { rotina: item.rotina, realizadas: 0, total: 0 };
    acc[item.rotina].total += 1;
    if (item.status === 'realizada') acc[item.rotina].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => percentual(a.realizadas, a.total) - percentual(b.realizadas, b.total) || b.total - a.total).slice(0, 6);

  if (!agrupado.length) {
    container.innerHTML = '<div class="empty-state">Nenhuma rotina disponível.</div>';
    return;
  }

  container.innerHTML = agrupado.map((item) => {
    const execucao = percentual(item.realizadas, item.total);
    return `
      <div class="list-card">
        <div class="list-main">
          <strong>${escaparHtml(item.rotina)}</strong>
          <div class="list-meta"><span>Previsto: ${item.total}</span><span>Realizado: ${item.realizadas}</span></div>
          ${criarBarra(execucao)}
        </div>
        <strong>${execucao}%</strong>
      </div>`;
  }).join('');
}

function renderTabelaRotinas(dados) {
  const tbody = document.getElementById('tabelaRotinas');
  const agrupado = Object.values(dados.reduce((acc, item) => {
    if (!acc[item.rotina]) acc[item.rotina] = { rotina: item.rotina, total: 0, realizadas: 0 };
    acc[item.rotina].total += 1;
    if (item.status === 'realizada') acc[item.rotina].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => b.total - a.total || a.rotina.localeCompare(b.rotina));

  if (!agrupado.length) {
    tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state">Sem registros para exibir.</div></td></tr>';
    return;
  }

  tbody.innerHTML = agrupado.map((item) => `<tr><td>${escaparHtml(item.rotina)}</td><td>${item.total}</td><td>${percentual(item.realizadas, item.total)}%</td></tr>`).join('');
}


function renderResumoLojas(dados) {
  const tbody = document.getElementById('tabelaResumoLojas');
  const agrupado = Object.values(dados.reduce((acc, item) => {
    if (!acc[item.loja]) acc[item.loja] = { loja: item.loja, rede: item.rede, formador: item.formador, previstas: 0, realizadas: 0 };
    acc[item.loja].previstas += 1;
    if (item.status === 'realizada') acc[item.loja].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => percentual(b.realizadas, b.previstas) - percentual(a.realizadas, a.previstas) || b.realizadas - a.realizadas || a.loja.localeCompare(b.loja, 'pt-BR'));

  if (!agrupado.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Sem registros por loja no recorte atual.</div></td></tr>';
    return;
  }

  tbody.innerHTML = agrupado.map((item) => {
    const execucao = percentual(item.realizadas, item.previstas);
    const classe = classeExecucao(execucao);
    return `<tr class="${classe}"><td>${escaparHtml(item.loja)}</td><td>${escaparHtml(item.rede)}</td><td>${escaparHtml(item.formador)}</td><td>${item.previstas}</td><td>${item.realizadas}</td><td><span class="execucao-badge ${classe}">${execucao}%</span></td></tr>`;
  }).join('');
}

function renderResumoPromotores(dados) {
  const tbody = document.getElementById('tabelaResumoPromotores');
  if (!tbody) return;
  const agrupado = Object.values(dados.reduce((acc, item) => {
    const chave = item.promotor || item.loja;
    if (!acc[chave]) acc[chave] = { promotor: item.promotor || item.unidade || item.loja, formador: item.formador, lojas: new Set(), previstas: 0, realizadas: 0 };
    acc[chave].previstas += 1;
    acc[chave].lojas.add(item.loja);
    if (item.status === 'realizada') acc[chave].realizadas += 1;
    return acc;
  }, {})).map((item) => ({ ...item, totalLojas: item.lojas.size }))
    .sort((a, b) => percentual(b.realizadas, b.previstas) - percentual(a.realizadas, a.previstas) || b.realizadas - a.realizadas || a.promotor.localeCompare(b.promotor, 'pt-BR'));

  if (!agrupado.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Sem registros por promotor no recorte atual.</div></td></tr>';
    return;
  }

  tbody.innerHTML = agrupado.map((item) => `<tr><td>${escaparHtml(item.promotor)}</td><td>${escaparHtml(item.formador)}</td><td>${item.totalLojas}</td><td>${item.previstas}</td><td>${item.realizadas}</td><td>${percentual(item.realizadas, item.previstas)}%</td></tr>`).join('');
}

function renderCalendarioExecucao(dados) {
  const container = document.getElementById('calendarioExecucao');
  if (!container) return;

  if (!dados.length) {
    container.innerHTML = '<div class="empty-state">Sem dados para o calendário.</div>';
    return;
  }

  const periodoAjustado = normalizarPeriodo(filtros.dataInicial.value, filtros.dataFinal.value);
  let referencia = periodoAjustado.dataFinal || periodoAjustado.dataInicial;
  if (!referencia) {
    referencia = [...dados].sort((a, b) => a.data.localeCompare(b.data)).at(-1)?.data || '';
  }

  if (!referencia) {
    container.innerHTML = '<div class="empty-state">Sem mês de referência disponível.</div>';
    return;
  }

  const [ano, mes] = referencia.split('-').map(Number);
  const inicioMes = new Date(ano, mes - 1, 1);
  const totalDias = new Date(ano, mes, 0).getDate();
  const primeiroDiaSemana = (inicioMes.getDay() + 6) % 7;
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const semanaRotulos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const mapaDia = dados.reduce((acc, item) => {
    if (!item.data || !item.data.startsWith(`${ano}-${String(mes).padStart(2, '0')}`)) return acc;
    if (!acc[item.data]) acc[item.data] = { total: 0, realizadas: 0 };
    acc[item.data].total += 1;
    if (item.status === 'realizada') acc[item.data].realizadas += 1;
    return acc;
  }, {});

  const diasHtml = [];
  for (let i = 0; i < primeiroDiaSemana; i += 1) {
    diasHtml.push('<div class="calendar-day-empty"></div>');
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const dataIso = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const info = mapaDia[dataIso];
    const execucao = info ? percentual(info.realizadas, info.total) : null;
    const classe = execucao === null ? 'is-empty-data' : execucao >= 95 ? 'is-top' : execucao >= 80 ? 'is-high' : execucao >= 60 ? 'is-medium' : 'is-low';
    const percentualDia = execucao === null ? '—' : `${execucao}%`;
    const meta = info
      ? `${info.realizadas}/${info.total} rotinas realizadas`
      : 'Sem rotinas registradas';
    const largura = execucao === null ? 0 : execucao;

    diasHtml.push(`
      <div class="calendar-day ${classe}">
        <div class="calendar-day-top">
          <span class="calendar-day-number">${dia}</span>
          <span class="calendar-day-percent">${percentualDia}</span>
        </div>
        <div class="calendar-progress"><div class="calendar-progress-fill" style="width:${largura}%"></div></div>
        <div class="calendar-day-meta">${meta}</div>
      </div>`);
  }

  const diasComDados = Object.values(mapaDia).length;
  container.innerHTML = `
    <div class="calendar-header">
      <div>
        <div class="calendar-title">${nomesMeses[mes - 1]} de ${ano}</div>
        <div class="calendar-subtitle">Cada dia mostra o percentual de rotinas realizadas no mês de referência.</div>
      </div>
      <div class="calendar-subtitle">${diasComDados} dias com registros</div>
    </div>
    <div class="calendar-grid">
      ${semanaRotulos.map((item) => `<div class="calendar-weekday">${item}</div>`).join('')}
      ${diasHtml.join('')}
    </div>`;
}

function formatarPeriodoSelecionado(dataInicial, dataFinal) {
  const inicio = dataInicial ? dataInicial.split('-').reverse().join('/') : '';
  const fim = dataFinal ? dataFinal.split('-').reverse().join('/') : '';
  if (inicio && fim) return `${inicio} até ${fim}`;
  if (inicio) return `a partir de ${inicio}`;
  if (fim) return `até ${fim}`;
  return 'todo o período';
}

function montarResumoFiltrosAtivos() {
  const periodoAjustado = normalizarPeriodo(filtros.dataInicial.value, filtros.dataFinal.value);
  const resumo = [];
  resumo.push({ rotulo: 'Período', valor: formatarPeriodoSelecionado(periodoAjustado.dataInicial, periodoAjustado.dataFinal) });
  resumo.push({ rotulo: 'Rotina', valor: filtros.rotina.value || 'Todas' });
  resumo.push({ rotulo: 'Rede', valor: filtros.rede.value || 'Todas' });
  resumo.push({ rotulo: 'Loja', valor: filtros.loja.value || 'Todas' });
  resumo.push({ rotulo: 'Formador', valor: filtros.formador.value || 'Todos' });
  resumo.push({ rotulo: 'Status', valor: filtros.status.value ? tituloCaso(filtros.status.value) : 'Todos' });
  return resumo;
}

function renderResumoFiltrosAtivos() {
  const container = document.getElementById('activeFiltersSummary');
  if (!container) return;
  container.innerHTML = montarResumoFiltrosAtivos().map((item) => `
    <div class="filter-chip"><strong>${escaparHtml(item.rotulo)}</strong><span>${escaparHtml(item.valor)}</span></div>`).join('');
}

function renderConsultaRotina(dados) {
  const container = document.getElementById('consultaRotinaLojas');
  const rotina = filtros.rotina.value;
  const periodoAjustado = normalizarPeriodo(filtros.dataInicial.value, filtros.dataFinal.value);
  const dataInicial = periodoAjustado.dataInicial;
  const dataFinal = periodoAjustado.dataFinal;
  if (!rotina || (!dataInicial && !dataFinal)) {
    container.innerHTML = '<div class="routine-empty">Selecione a <strong>rotina</strong> e pelo menos uma <strong>data</strong> do período para ver quais lojas realizaram essa atividade.</div>';
    return;
  }

  const baseConsulta = dados.filter((item) => item.rotina === rotina && item.status === 'realizada' && dataDentroDoPeriodo(item.data, dataInicial, dataFinal));
  const periodo = formatarPeriodoSelecionado(dataInicial, dataFinal);
  if (!baseConsulta.length) {
    container.innerHTML = `<div class="routine-summary">Nenhuma loja realizou <strong>${escaparHtml(rotina)}</strong> em <strong>${escaparHtml(periodo)}</strong>.</div>`;
    return;
  }

  const lojas = [...new Map(baseConsulta.map((item) => [item.loja, item])).values()].sort((a, b) => a.loja.localeCompare(b.loja, 'pt-BR'));
  container.innerHTML = `
    <div class="routine-summary"><strong>${lojas.length} lojas</strong> realizaram <strong>${escaparHtml(rotina)}</strong> em <strong>${escaparHtml(periodo)}</strong>.</div>
    <div class="routine-store-grid">
      ${lojas.map((item) => `<div class="routine-store-card"><strong>${escaparHtml(item.loja)}</strong><div class="routine-store-meta">Rede ${escaparHtml(item.rede)} • Formador ${escaparHtml(item.formador || 'Sem formador')}</div></div>`).join('')}
    </div>`;
}

function renderizarPainel() {
  dadosFiltrados = obterDadosFiltrados();
  atualizarKPIs(dadosFiltrados);
  renderRankingFormadores(dadosFiltrados);
  renderPromotorDestaque(dadosFiltrados);
  renderRankingsPorFormador(dadosFiltrados);
  renderRankingLojas(dadosFiltrados);
  renderRotinasMenosRealizadas(dadosFiltrados);
  renderTabelaRotinas(dadosFiltrados);
  renderResumoLojas(dadosFiltrados);
  renderCalendarioExecucao(dadosFiltrados);
  renderizarApresentacaoSeAberta();
}


function limparFiltros() {
  filtros.rede.value = '';
  filtros.loja.value = '';
  filtros.formador.value = '';
  filtros.status.value = '';
  filtros.dataInicial.value = '';
  filtros.dataFinal.value = '';
  filtros.rotina.value = '';
  sincronizarFiltrosDependentes();
  renderizarPainel();
}

function consolidarSnapshotsImportados() {
  if (!snapshotsImportados.length) return [];
  const ordenados = [...snapshotsImportados].sort((a, b) => new Date(a.importedAt || 0) - new Date(b.importedAt || 0));
  const mapa = new Map();

  ordenados.forEach((snapshot) => {
    const dados = normalizarBaseCompleta(Array.isArray(snapshot.data) ? snapshot.data : [], 'importada');
    dados.forEach((item) => {
      const chave = `${item.data}||${slug(item.loja)}||${item.rotinaId || slugChecklist(item.rotina)}`;
      mapa.set(chave, item);
    });
  });

  return [...mapa.values()];
}

function aplicarBase(base, origem = 'simulada', detalhe = '') {
  registros = base.filter((item) => item.data && item.rotina && item.loja && item.status);
  ultimaDataDisponivel = obterUltimaData(registros);
  popularFiltros();
  sincronizarFiltrosDependentes();
  atualizarRotulosAbas();
  if (document.querySelector('.summary-tab.active')) {
    aplicarPeriodoResumo(resumoPeriodoAtual);
  } else {
    renderizarPainel();
  }
  atualizarResumoAdmin();
  popularControlesAdmin();

  if (origem === 'importada') {
    if (importBadge) importBadge.textContent = 'Planilhas ativas';
    if (datasetStatus) datasetStatus.textContent = '';
    importSummary.textContent = detalhe || `${registros.length} registros importados com sucesso.`;
  } else {
    if (importBadge) importBadge.textContent = 'Painel zerado';
    if (datasetStatus) datasetStatus.textContent = '';
    importSummary.textContent = detalhe || 'Painel sem dados. Importe uma ou mais planilhas para carregar as rotinas.';
  }
}

function inferirFormadoresPorAba(linhasFormadores) {
  const mapa = new Map();
  if (!linhasFormadores?.length) return mapa;
  const cabecalho = linhasFormadores[0].map((item) => String(item || '').trim().toLowerCase());
  const idxNome = cabecalho.findIndex((item) => item.includes('formador'));
  const idxLojas = cabecalho.findIndex((item) => item.includes('lojas') || item.includes('unidade') || item.includes('loja'));

  linhasFormadores.slice(1).forEach((linha) => {
    const nome = String(linha[idxNome] || '').trim();
    const lojasTexto = String(linha[idxLojas] || '').trim();
    if (!nome || !lojasTexto) return;
    lojasTexto.split(',').map((parte) => parte.trim()).filter(Boolean).forEach((loja) => {
      mapa.set(slug(renomearLojaSeNecessario(loja)), nome);
    });
  });

  return mapa;
}

function inferirPromotoresPorAba(sheets) {
  const nomeAba = Object.keys(sheets).find((nome) => nome.toLowerCase().includes('promotor'));
  const linhas = nomeAba ? sheets[nomeAba] : [];
  const mapa = new Map();
  if (!linhas?.length) return mapa;
  const cabecalho = linhas[0].map((item) => String(item || '').trim().toLowerCase());
  const idxPromotor = cabecalho.findIndex((item) => item.includes('promotor'));
  const idxLoja = cabecalho.findIndex((item) => item.includes('loja') || item.includes('unidade'));
  if (idxPromotor < 0 || idxLoja < 0) return mapa;

  linhas.slice(1).forEach((linha) => {
    const promotor = String(linha[idxPromotor] || '').trim();
    const loja = String(linha[idxLoja] || '').trim();
    if (!promotor || !loja) return;
    mapa.set(slug(renomearLojaSeNecessario(loja)), promotor);
  });

  return mapa;
}

function inferirRedesPorAba(linhasRedes) {
  const mapa = {};
  if (!linhasRedes?.length) return mapa;
  const cabecalho = linhasRedes[0].map((item) => String(item || '').trim().toLowerCase());
  const idxSigla = cabecalho.findIndex((item) => item.includes('sigla'));
  const idxNome = cabecalho.findIndex((item) => item.includes('nome da rede'));
  linhasRedes.slice(1).forEach((linha) => {
    const sigla = String(linha[idxSigla] || '').trim();
    const nome = String(linha[idxNome] || '').trim();
    if (sigla && nome) mapa[sigla] = nome;
  });
  return mapa;
}

function localizarCabecalhoMoki(linhas = []) {
  for (let index = 0; index < Math.min(linhas.length, 30); index += 1) {
    const cabecalho = (linhas[index] || []).map((item) => slug(item));
    const temChecklist = cabecalho.includes('checklist');
    const temLoja = cabecalho.includes('nome-da-unidade') || cabecalho.includes('unidade');
    const temData = cabecalho.includes('data-de-referencia') || cabecalho.includes('data-de-inicio');
    if (temChecklist && temLoja && temData) {
      return { index, cabecalho };
    }
  }
  return null;
}

function encontrarIndiceCabecalho(cabecalho, candidatos = []) {
  return cabecalho.findIndex((item) => candidatos.includes(item));
}

function extrairRespostasMoki(sheets) {
  const nomeAba = Object.keys(sheets).find((nome) => slug(nome).includes('checklists-respondidos'))
    || Object.keys(sheets).find((nome) => slug(nome).includes('checklist'))
    || Object.keys(sheets)[0];
  const linhas = sheets[nomeAba] || [];
  if (!linhas.length) throw new Error('A planilha está vazia.');

  const cabecalhoInfo = localizarCabecalhoMoki(linhas);
  if (!cabecalhoInfo) {
    throw new Error('Não foi possível localizar as colunas do relatório “Checklists Respondidos” do Moki.');
  }

  const { index: linhaCabecalho, cabecalho } = cabecalhoInfo;
  const idxId = encontrarIndiceCabecalho(cabecalho, ['id']);
  const idxChecklist = encontrarIndiceCabecalho(cabecalho, ['checklist']);
  const idxDataReferencia = encontrarIndiceCabecalho(cabecalho, ['data-de-referencia']);
  const idxDataInicio = encontrarIndiceCabecalho(cabecalho, ['data-de-inicio']);
  const idxNomeUnidade = encontrarIndiceCabecalho(cabecalho, ['nome-da-unidade']);
  const idxUnidade = encontrarIndiceCabecalho(cabecalho, ['unidade']);
  const idxCodigoUnidade = encontrarIndiceCabecalho(cabecalho, ['cod-da-unidade', 'codigo-da-unidade']);
  const idxAutor = encontrarIndiceCabecalho(cabecalho, ['autor']);

  if ([idxChecklist, idxDataInicio].some((idx) => idx < 0) || (idxNomeUnidade < 0 && idxUnidade < 0)) {
    throw new Error('A planilha precisa conter CHECKLIST, DATA DE INÍCIO e NOME DA UNIDADE.');
  }

  const respostas = [];
  const naoReconhecidos = [];
  const linhasInvalidas = [];
  const rawData = [];

  linhas.slice(linhaCabecalho + 1).forEach((linha, index) => {
    if (!Array.isArray(linha) || !linha.some((valor) => String(valor ?? '').trim())) return;

    const checklistOriginal = String(linha[idxChecklist] || '').trim();
    const lojaOriginal = String(
      (idxNomeUnidade >= 0 ? linha[idxNomeUnidade] : '')
      || (idxUnidade >= 0 ? linha[idxUnidade] : '')
      || ''
    ).trim();
    const dataReferenciaOriginal = idxDataReferencia >= 0 ? linha[idxDataReferencia] : '';
    const dataInicioOriginal = linha[idxDataInicio];
    const autor = idxAutor >= 0 ? String(linha[idxAutor] || '').trim() : '';
    const codigoUnidade = idxCodigoUnidade >= 0 ? String(linha[idxCodigoUnidade] || '').trim() : '';
    const idMoki = idxId >= 0 ? String(linha[idxId] || '').trim() : '';
    const dataHora = parseDataHoraMoki(dataInicioOriginal, dataReferenciaOriginal);
    const data = formatarData(dataReferenciaOriginal) || dataHora.data;
    const loja = renomearLojaSeNecessario(lojaOriginal);
    const rotinaConfig = encontrarConfigRotinaPorNome(checklistOriginal);

    const raw = {
      idMoki,
      data,
      checklist: checklistOriginal,
      loja,
      codigoUnidade,
      dataHoraRealizada: dataHora.dataHoraIso,
      horaRealizada: dataHora.hora,
      autor
    };

    if (!data || !checklistOriginal || !loja || !dataHora.hora) {
      linhasInvalidas.push({ linha: linhaCabecalho + index + 2, ...raw });
      return;
    }

    rawData.push(raw);

    if (!rotinaConfig) {
      naoReconhecidos.push(raw);
      return;
    }

    respostas.push({
      ...raw,
      rotina: rotinaConfig.nome,
      rotinaId: rotinaConfig.id,
      promotor: autor
    });
  });

  if (!rawData.length) {
    throw new Error('Nenhuma resposta válida foi encontrada no relatório do Moki.');
  }

  return {
    nomeAba,
    linhaCabecalho,
    respostas,
    naoReconhecidos,
    linhasInvalidas,
    rawData
  };
}

function chaveResposta(data, loja, rotinaId) {
  return `${data}||${slug(renomearLojaSeNecessario(loja))}||${rotinaId}`;
}

function escolherRespostaMaisAntiga(atual, candidata) {
  if (!atual) return candidata;
  const atualMin = horarioParaMinutos(atual.horaRealizada);
  const candidataMin = horarioParaMinutos(candidata.horaRealizada);
  if (atualMin === null) return candidata;
  if (candidataMin === null) return atual;
  return candidataMin < atualMin ? candidata : atual;
}

function mesclarRespostas(respostas = []) {
  const mapa = new Map();
  respostas.forEach((resposta) => {
    if (!resposta?.data || !resposta?.loja || !resposta?.rotinaId) return;
    const chave = chaveResposta(resposta.data, resposta.loja, resposta.rotinaId);
    mapa.set(chave, escolherRespostaMaisAntiga(mapa.get(chave), resposta));
  });
  return [...mapa.values()];
}

function obterRespostasAnteriores(data) {
  return consolidarSnapshotsImportados()
    .filter((item) => item.data === data && item.status === 'realizada' && item.rotinaId)
    .map((item) => ({
      data: item.data,
      checklist: item.checklistOriginal || item.rotina,
      loja: item.loja,
      rotina: item.rotina,
      rotinaId: item.rotinaId,
      dataHoraRealizada: item.dataHoraRealizada || (item.horaRealizada ? `${item.data}T${item.horaRealizada}:00` : ''),
      horaRealizada: item.horaRealizada,
      autor: item.autor || item.promotor || '',
      promotor: item.promotor || item.autor || ''
    }));
}

function gerarResultadosParaData(data, respostasNovas = [], lojasExtras = []) {
  const respostas = mesclarRespostas([...obterRespostasAnteriores(data), ...respostasNovas.filter((item) => item.data === data)]);
  const lojasDasRespostas = respostas.map((item) => item.loja);
  const lojas = obterLojasConhecidas([...lojasExtras, ...lojasDasRespostas]);
  const mapaRespostas = new Map(respostas.map((item) => [chaveResposta(item.data, item.loja, item.rotinaId), item]));
  const resultados = [];
  const foraDaProgramacao = [];

  respostas.forEach((resposta) => {
    const rotina = obterConfigRotinaPorId(resposta.rotinaId);
    if (!rotina || !rotinaAplicaNaData(rotina, data) || !rotinaAplicaNaLoja(rotina, resposta.loja)) {
      foraDaProgramacao.push(resposta);
    }
  });

  configRotinas.filter((rotina) => rotinaAplicaNaData(rotina, data)).forEach((rotina) => {
    lojas.filter((loja) => rotinaAplicaNaLoja(rotina, loja)).forEach((loja, index) => {
      const resposta = mapaRespostas.get(chaveResposta(data, loja, rotina.id));
      const status = resposta ? 'realizada' : 'pendente';
      const pontualidade = classificarPontualidade(rotina, resposta?.horaRealizada || '', status);
      const lojaNormalizada = renomearLojaSeNecessario(loja);
      const lojaInfo = parseLoja(lojaNormalizada);

      resultados.push({
        id: `resultado-${data}-${slug(lojaNormalizada)}-${rotina.id}`,
        data,
        rede: lojaInfo.rede,
        loja: lojaInfo.loja,
        unidade: lojaInfo.unidade,
        formador: resolverFormador(lojaInfo.loja),
        promotor: resposta?.promotor || resposta?.autor || resolverPromotor(lojaInfo.loja),
        autor: resposta?.autor || '',
        rotina: rotina.nome,
        rotinaId: rotina.id,
        checklistOriginal: resposta?.checklist || rotina.nomeMoki,
        status,
        dataHoraRealizada: resposta?.dataHoraRealizada || '',
        horaRealizada: resposta?.horaRealizada || '',
        horarioInicioPrevisto: rotina.horarioInicio,
        horarioFimPrevisto: rotina.horarioFim,
        toleranciaInicioMin: rotina.toleranciaInicioMin,
        toleranciaFimMin: rotina.toleranciaFimMin,
        escopoRotina: rotina.escopo,
        diasRotina: rotina.dias,
        ...pontualidade,
        origem: 'importada'
      });
    });
  });

  return { resultados, foraDaProgramacao };
}

function resumirResultadosImportacao(resultados = []) {
  return {
    previstas: resultados.length,
    realizadas: resultados.filter((item) => item.status === 'realizada').length,
    pendentes: resultados.filter((item) => item.status === 'pendente').length,
    noPrazo: resultados.filter((item) => item.pontualidade === 'no_prazo').length,
    toleranciaInicio: resultados.filter((item) => item.pontualidade === 'tolerancia_inicio').length,
    toleranciaFim: resultados.filter((item) => item.pontualidade === 'tolerancia_fim').length,
    atrasadas: resultados.filter((item) => item.pontualidade === 'atrasada').length,
    antesHorario: resultados.filter((item) => item.pontualidade === 'antes_horario').length,
    semHorario: resultados.filter((item) => item.pontualidade === 'sem_regra').length
  };
}

function processarPlanilhaMoki(sheets) {
  const extracao = extrairRespostasMoki(sheets);
  const datas = [...new Set(extracao.respostas.map((item) => item.data).filter(Boolean))].sort();
  if (!datas.length) {
    throw new Error('Nenhuma resposta corresponde às rotinas cadastradas no sistema.');
  }

  const lojasExtras = extracao.respostas.map((item) => item.loja);
  const resultados = [];
  const foraDaProgramacao = [];

  datas.forEach((data) => {
    const gerado = gerarResultadosParaData(data, extracao.respostas, lojasExtras);
    resultados.push(...gerado.resultados);
    foraDaProgramacao.push(...gerado.foraDaProgramacao);
  });

  return {
    ...extracao,
    datas,
    resultados,
    foraDaProgramacao,
    resumo: resumirResultadosImportacao(resultados)
  };
}

function normalizarRegistrosImportados(sheets) {
  return processarPlanilhaMoki(sheets).resultados;
}

function parseCsv(texto) {
  const linhas = [];
  let atual = '';
  let linha = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i += 1) {
    const char = texto[i];
    const next = texto[i + 1];
    if (char === '"') {
      if (aspas && next === '"') { atual += '"'; i += 1; } else { aspas = !aspas; }
      continue;
    }
    if (!aspas && (char === ';' || char === ',' || char === '\t')) { linha.push(atual.trim()); atual = ''; continue; }
    if (!aspas && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      if (atual.length || linha.length) { linha.push(atual.trim()); linhas.push(linha); linha = []; atual = ''; }
      continue;
    }
    atual += char;
  }
  if (atual.length || linha.length) { linha.push(atual.trim()); linhas.push(linha); }
  return { Rotinas: linhas };
}

function lerUint16LE(view, offset) { return view.getUint16(offset, true); }
function lerUint32LE(view, offset) { return view.getUint32(offset, true); }

async function extrairZipEntries(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder();
  const entries = {};
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) { eocdOffset = i; break; }
  }
  if (eocdOffset < 0) throw new Error('Arquivo XLSX inválido.');

  const centralDirOffset = lerUint32LE(view, eocdOffset + 16);
  const totalEntries = lerUint16LE(view, eocdOffset + 10);
  let pointer = centralDirOffset;

  for (let i = 0; i < totalEntries; i += 1) {
    if (lerUint32LE(view, pointer) !== 0x02014b50) throw new Error('Estrutura ZIP não reconhecida.');
    const compression = lerUint16LE(view, pointer + 10);
    const compressedSize = lerUint32LE(view, pointer + 20);
    const fileNameLength = lerUint16LE(view, pointer + 28);
    const extraLength = lerUint16LE(view, pointer + 30);
    const commentLength = lerUint16LE(view, pointer + 32);
    const localHeaderOffset = lerUint32LE(view, pointer + 42);
    const fileName = decoder.decode(bytes.slice(pointer + 46, pointer + 46 + fileNameLength));
    const localNameLength = lerUint16LE(view, localHeaderOffset + 26);
    const localExtraLength = lerUint16LE(view, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedData = bytes.slice(dataStart, dataStart + compressedSize);

    let contentBytes;
    if (compression === 0) {
      contentBytes = compressedData;
    } else if (compression === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('Seu navegador não suporta importação XLSX nativa. Use CSV ou um navegador mais recente.');
      const stream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const response = new Response(stream);
      contentBytes = new Uint8Array(await response.arrayBuffer());
    } else {
      throw new Error(`Método de compressão não suportado: ${compression}`);
    }

    entries[fileName] = decoder.decode(contentBytes);
    pointer += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function decodeXml(xml) {
  return String(xml || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si[\s\S]*?<\/si>/g)].map((item) => {
    const partes = [...item[0].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((parte) => decodeXml(parte[1]));
    return partes.join('');
  });
}

function columnToIndex(col) {
  return col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
}

function parseWorksheet(xml, sharedStrings) {
  const rows = [];
  const rowMatches = [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)];
  rowMatches.forEach((rowMatch) => {
    const row = [];
    const cells = [...rowMatch[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)];
    cells.forEach((cellMatch) => {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      const type = (attrs.match(/t="([^"]+)"/) || [])[1];
      const inline = body.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/);
      const valueMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      const index = ref ? columnToIndex(ref) : row.length;
      let value = '';
      if (inline) value = decodeXml(inline[1]);
      else if (valueMatch) {
        value = decodeXml(valueMatch[1]);
        if (type === 's') value = sharedStrings[Number(value)] || '';
        else if (type !== 'str' && type !== 'inlineStr' && /^-?\d+(?:\.\d+)?$/.test(value)) value = Number(value);
      }
      row[index] = value;
    });
    rows.push(row.map((item) => item ?? ''));
  });
  return rows;
}

async function parseXlsx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const entries = await extrairZipEntries(arrayBuffer);
  const workbookXml = entries['xl/workbook.xml'];
  const relsXml = entries['xl/_rels/workbook.xml.rels'];
  const sharedStrings = parseSharedStrings(entries['xl/sharedStrings.xml']);
  if (!workbookXml || !relsXml) throw new Error('Workbook XLSX inválido.');

  const rels = Object.fromEntries([...relsXml.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((match) => {
    const target = match[2].replace(/^\.\//, '').replace(/^\//, '');
    const normalizado = target.startsWith('xl/') ? target : `xl/${target.replace(/^\.\.\//, '')}`;
    return [match[1], normalizado];
  }));
  const sheets = {};
  [...workbookXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].forEach((match) => {
    const nome = decodeXml(match[1]);
    const path = rels[match[2]];
    if (path && entries[path]) sheets[nome] = parseWorksheet(entries[path], sharedStrings);
  });
  return sheets;
}

let previewsImportacao = [];

function obterNomeAbaRotinas(sheets = {}) {
  return Object.keys(sheets).find((nome) => slug(nome).includes('rotina')) || Object.keys(sheets)[0] || '';
}

function gerarLinhasPreviewMoki(processamento, limite = 8) {
  const mapaResultados = new Map(
    processamento.resultados
      .filter((item) => item.status === 'realizada')
      .map((item) => [chaveResposta(item.data, item.loja, item.rotinaId), item])
  );

  return processamento.respostas.slice(0, limite).map((resposta) => {
    const resultado = mapaResultados.get(chaveResposta(resposta.data, resposta.loja, resposta.rotinaId));
    return {
      data: resposta.data.split('-').reverse().join('/'),
      checklist: resposta.rotina,
      loja: resposta.loja,
      hora: resposta.horaRealizada,
      resultado: resultado?.pontualidadeLabel || 'Realizada'
    };
  });
}

function renderizarPreviewImportacao() {
  const container = document.getElementById('importPreviewList');
  const resumo = document.getElementById('selectedFilesSummary');
  if (!container || !resumo) return;

  if (!previewsImportacao.length) {
    resumo.textContent = 'Nenhuma planilha selecionada.';
    container.innerHTML = '<div class="empty-state">Selecione uma ou mais planilhas Moki para visualizar a prévia antes de importar.</div>';
    return;
  }

  const arquivosValidos = previewsImportacao.filter((item) => !item.error);
  resumo.textContent = `${previewsImportacao.length} arquivo(s) selecionado(s) • ${arquivosValidos.length} pronto(s) para importação.`;

  container.innerHTML = previewsImportacao.map((item) => {
    if (item.error) {
      return `<div class="preview-card preview-card-error"><div class="preview-card-head"><strong>${escaparHtml(item.fileName)}</strong><span class="status-tag">Falha na leitura</span></div><div class="admin-feedback">${escaparHtml(item.error)}</div></div>`;
    }

    const resumoItem = item.processamento.resumo;
    const linhasPreview = gerarLinhasPreviewMoki(item.processamento);
    const body = linhasPreview.length
      ? `<tbody>${linhasPreview.map((linha) => `<tr>
          <td>${escaparHtml(linha.data)}</td>
          <td>${escaparHtml(linha.checklist)}</td>
          <td>${escaparHtml(linha.loja)}</td>
          <td>${escaparHtml(linha.hora)}</td>
          <td>${escaparHtml(linha.resultado)}</td>
        </tr>`).join('')}</tbody>`
      : '<tbody><tr><td colspan="5">Sem respostas reconhecidas para pré-visualizar.</td></tr></tbody>';

    const avisos = [];
    if (item.processamento.naoReconhecidos.length) avisos.push(`${item.processamento.naoReconhecidos.length} checklist(s) não reconhecido(s)`);
    if (item.processamento.linhasInvalidas.length) avisos.push(`${item.processamento.linhasInvalidas.length} linha(s) inválida(s)`);
    if (item.processamento.foraDaProgramacao.length) avisos.push(`${item.processamento.foraDaProgramacao.length} resposta(s) fora da programação`);

    return `<div class="preview-card">
      <div class="preview-card-head">
        <div>
          <strong>${escaparHtml(item.fileName)}</strong>
          <div class="preview-meta">${item.processamento.respostas.length} resposta(s) reconhecida(s) • ${item.processamento.datas.length} data(s) • aba ${escaparHtml(item.sheetName || 'principal')}</div>
        </div>
        <span class="status-tag">Pronta</span>
      </div>
      <div class="import-result-summary">
        <span><strong>${resumoItem.previstas}</strong> previstas</span>
        <span><strong>${resumoItem.realizadas}</strong> realizadas</span>
        <span><strong>${resumoItem.atrasadas}</strong> em atraso</span>
        <span><strong>${resumoItem.pendentes}</strong> pendentes</span>
      </div>
      ${avisos.length ? `<div class="admin-feedback">${escaparHtml(avisos.join(' • '))}</div>` : ''}
      <div class="table-shell preview-table-shell">
        <table>
          <thead><tr><th>Data</th><th>Checklist</th><th>Loja</th><th>Hora</th><th>Resultado</th></tr></thead>
          ${body}
        </table>
      </div>
    </div>`;
  }).join('');
}

async function montarPreviewArquivos() {
  const arquivos = Array.from(fileInput?.files || []);
  previewsImportacao = [];
  renderizarPreviewImportacao();

  if (!arquivos.length) {
    setImportStatus('Selecione uma ou mais planilhas do relatório “Checklists Respondidos” do Moki.', 'Sem arquivo');
    return;
  }

  setImportStatus(
    arquivos.length === 1 ? `Lendo ${arquivos[0].name} para pré-visualização...` : `Lendo ${arquivos.length} planilhas para pré-visualização...`,
    'Preparando prévia'
  );

  for (const arquivo of arquivos) {
    try {
      const sheets = /\.csv$/i.test(arquivo.name) ? parseCsv(await arquivo.text()) : await parseXlsx(arquivo);
      const processamento = processarPlanilhaMoki(sheets);
      const sheetName = processamento.nomeAba || obterNomeAbaRotinas(sheets);
      previewsImportacao.push({
        fileName: arquivo.name,
        sheets,
        processamento,
        respostas: processamento.respostas,
        resultados: processamento.resultados,
        rawData: processamento.rawData,
        total: processamento.resultados.length,
        latestDate: processamento.datas.at(-1) || '',
        sheetName
      });
    } catch (error) {
      previewsImportacao.push({
        fileName: arquivo.name,
        error: error?.message || 'Não foi possível ler a planilha selecionada.'
      });
    }
  }

  renderizarPreviewImportacao();

  const validos = previewsImportacao.filter((item) => !item.error).length;
  if (validos) {
    setImportStatus(
      validos === 1
        ? 'Pré-visualização pronta. Revise os resultados e clique em “Importar agora”.'
        : `Pré-visualização pronta para ${validos} planilha(s). Revise os resultados e clique em “Importar agora”.`,
      'Prévia pronta'
    );
  } else {
    setImportStatus('Nenhuma das planilhas selecionadas pôde ser lida como relatório do Moki.', 'Falha na prévia');
  }
}


function dataExpiracaoDadosBrutos(importedAt = new Date()) {
  const data = importedAt instanceof Date ? new Date(importedAt) : new Date(importedAt);
  data.setDate(data.getDate() + PRAZO_DADOS_BRUTOS_DIAS);
  return data.toISOString();
}

function substituirSnapshotLocal(snapshot) {
  const indice = snapshotsImportados.findIndex((item) => item.id === snapshot.id);
  if (indice >= 0) {
    snapshotsImportados.splice(indice, 1, snapshot);
  } else {
    snapshotsImportados.push(snapshot);
  }
  snapshotsImportados.sort((a, b) => new Date(b.importedAt) - new Date(a.importedAt));
}

async function importarArquivo() {
  const arquivos = Array.from(fileInput?.files || []);
  if (!arquivos.length) {
    setImportStatus('Selecione pelo menos um arquivo .xlsx, .xlsm ou .csv do Moki.');
    return;
  }

  if (!previewsImportacao.length) {
    await montarPreviewArquivos();
  }

  const previewsValidas = previewsImportacao.filter((item) => !item.error && Array.isArray(item.respostas));
  if (!previewsValidas.length) {
    setImportStatus('Nenhuma planilha Moki válida ficou pronta para importação.', 'Falha na importação');
    return;
  }

  const respostasNovas = mesclarRespostas(previewsValidas.flatMap((item) => item.respostas || []));
  const rawData = previewsValidas.flatMap((item) => item.rawData || []);
  const datas = [...new Set(respostasNovas.map((item) => item.data).filter(Boolean))].sort();
  const lojasImportadas = respostasNovas.map((item) => item.loja);
  const nomesArquivos = [...new Set(previewsValidas.map((item) => item.fileName))];

  if (!datas.length) {
    setImportStatus('Nenhuma data válida foi identificada nas respostas do Moki.', 'Falha na importação');
    return;
  }

  registrarLojasConhecidas(lojasImportadas, false);
  salvarStore(STORAGE_KEYS.knownStores, [...lojasConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  salvarConfigNoFirebase();

  setImportStatus(
    datas.length === 1
      ? `Processando as rotinas de ${datas[0].split('-').reverse().join('/')}...`
      : `Processando rotinas de ${datas.length} datas...`,
    'Importando...'
  );

  let datasImportadas = 0;
  let sincronizadas = 0;
  let totalPrevistas = 0;
  let totalRealizadas = 0;
  let totalAtrasadas = 0;
  let totalPendentes = 0;
  const erros = [];

  for (const data of datas) {
    const respostasData = respostasNovas.filter((item) => item.data === data);
    const gerado = gerarResultadosParaData(data, respostasData, lojasImportadas);
    const resultados = normalizarBaseCompleta(gerado.resultados, 'importada');
    const summary = resumirResultadosImportacao(resultados);
    const agora = new Date();
    const snapshotId = `rotinas-${data}`;
    const snapshot = {
      id: snapshotId,
      fileName: nomesArquivos.join(' + '),
      importedAt: agora.toISOString(),
      total: resultados.length,
      responsesCount: respostasData.length,
      latestDate: data,
      data: resultados,
      rawData: rawData.filter((item) => item.data === data),
      rawRowsCount: rawData.filter((item) => item.data === data).length,
      rawExpiresAt: dataExpiracaoDadosBrutos(agora),
      rawAvailable: true,
      rawDeletedAt: '',
      summary,
      chunksCount: 0,
      rawChunksCount: 0,
      schemaVersion: 3
    };

    const sincronizado = firebaseDisponivel ? await salvarSnapshotNoFirebase(snapshot) : true;
    if (!sincronizado && firebaseDisponivel) {
      erros.push(`${data.split('-').reverse().join('/')}: falha ao sincronizar no Firebase`);
    }

    const snapshotMemoria = firebaseDisponivel ? { ...snapshot, rawData: undefined } : snapshot;
    substituirSnapshotLocal(snapshotMemoria);
    datasImportadas += 1;
    if (sincronizado && firebaseDisponivel) sincronizadas += 1;
    totalPrevistas += summary.previstas;
    totalRealizadas += summary.realizadas;
    totalAtrasadas += summary.atrasadas;
    totalPendentes += summary.pendentes;
  }

  persistirSnapshotsLocais();
  atualizarBasePorSnapshots(
    `${totalPrevistas} rotinas previstas • ${totalRealizadas} realizadas • ${totalAtrasadas} em atraso • ${totalPendentes} pendentes.`
  );

  if (fileInput) fileInput.value = '';
  previewsImportacao = [];
  renderizarPreviewImportacao();
  limparDadosBrutosExpirados();

  const prazoTexto = `Os dados brutos serão excluídos automaticamente após ${PRAZO_DADOS_BRUTOS_DIAS} dias; os resultados permanecerão no painel.`;
  if (!erros.length) {
    setImportStatus(
      `${datasImportadas} dia(s) processado(s): ${totalRealizadas} realizadas, ${totalAtrasadas} em atraso e ${totalPendentes} pendentes. ${prazoTexto}`,
      firebaseDisponivel ? 'Importado e sincronizado' : 'Importado localmente'
    );
    return;
  }

  setImportStatus(
    `${datasImportadas} dia(s) processado(s) no painel. ${sincronizadas} sincronizado(s) online. ${erros.join(' | ')} ${prazoTexto}`,
    sincronizadas ? 'Importação parcial' : 'Importado localmente'
  );
}

async function resetarParaSimulada() {
  const idsAnteriores = snapshotsImportados.map((snapshot) => snapshot.id).filter(Boolean);
  const totalAnterior = snapshotsImportados.length;
  snapshotsImportados = [];
  persistirSnapshotsLocais();
  if (fileInput) fileInput.value = '';
  previewsImportacao = [];
  renderizarPreviewImportacao();
  atualizarBasePorSnapshots('Painel limpo com sucesso.');

  const remotoLimpo = await limparSnapshotsNoFirebase(idsAnteriores);
  setImportStatus(
    remotoLimpo
      ? 'Painel limpo com sucesso. A atualização foi enviada para todos os usuários.'
      : totalAnterior
        ? 'Painel limpo com sucesso neste dispositivo. A sincronização online não pôde ser concluída agora.'
        : 'Painel já estava limpo.',
    'Painel zerado'
  );
}

function aplicarRegrasAdministrativasNaBaseAtual() {
  const temSnapshots = snapshotsImportados.length > 0;
  registrosBase = normalizarBaseCompleta(registrosBase, temSnapshots ? 'importada' : 'simulada');
  if (temSnapshots) {
    snapshotsImportados = snapshotsImportados.map((item) => ({ ...item, data: normalizarBaseCompleta(item.data, 'importada') }));
    persistirSnapshotsLocais();
  }
  aplicarBase(registrosBase, temSnapshots ? 'importada' : 'simulada', importSummary?.textContent || 'Base atualizada.');
}

function atualizarResumoAdmin() {
  const adminSummary = document.getElementById('adminSummary');
  const lojas = new Set(registros.map((item) => item.loja)).size;
  const formadores = new Set(registros.map((item) => item.formador)).size;
  const origem = snapshotsImportados.length ? `${snapshotsImportados.length} planilha(s) importada(s)` : 'painel zerado';
  if (adminSummary) adminSummary.textContent = `${formatarNumero.format(registros.length)} registros ativos • ${lojas} lojas • ${formadores} formadores • origem: ${origem}.`;
}

function popularRotinasConfigAdmin() {
  const select = document.getElementById('routineConfigSelect');
  if (!select) return;
  const atual = select.value || configRotinas[0]?.id || '';
  select.innerHTML = configRotinas.map((rotina) => `<option value="${escaparHtml(rotina.id)}">${escaparHtml(rotina.nome)}</option>`).join('');
  select.value = configRotinas.some((item) => item.id === atual) ? atual : (configRotinas[0]?.id || '');
  preencherRegraRotinaSelecionada();
}

function preencherRegraRotinaSelecionada() {
  const select = document.getElementById('routineConfigSelect');
  if (!select) return;
  const rotina = obterConfigRotinaPorId(select.value) || configRotinas[0];
  if (!rotina) return;

  const start = document.getElementById('routineStartTime');
  const end = document.getElementById('routineEndTime');
  const startTol = document.getElementById('routineStartTolerance');
  const endTol = document.getElementById('routineEndTolerance');
  const meta = document.getElementById('routineConfigMeta');

  if (start) start.value = rotina.horarioInicio || '';
  if (end) end.value = rotina.horarioFim || '';
  if (startTol) startTol.value = rotina.toleranciaInicioMin ?? 0;
  if (endTol) endTol.value = rotina.toleranciaFimMin ?? 0;
  if (meta) {
    meta.textContent = `${formatarDiasRotina(rotina.dias)} • ${formatarEscopoRotina(rotina.escopo)} • Checklist Moki: ${rotina.nomeMoki}`;
  }
}

async function salvarRegraRotina() {
  const select = document.getElementById('routineConfigSelect');
  const feedback = document.getElementById('routineConfigFeedback');
  const rotina = obterConfigRotinaPorId(select?.value);
  if (!rotina) {
    if (feedback) feedback.textContent = 'Selecione uma rotina válida.';
    return;
  }

  const horarioInicio = validarHorario(document.getElementById('routineStartTime')?.value);
  const horarioFim = validarHorario(document.getElementById('routineEndTime')?.value);
  const toleranciaInicioMin = limitarInteiro(document.getElementById('routineStartTolerance')?.value, 0, 1440);
  const toleranciaFimMin = limitarInteiro(document.getElementById('routineEndTolerance')?.value, 0, 1440);

  if (horarioInicio && horarioFim && horarioParaMinutos(horarioInicio) > horarioParaMinutos(horarioFim)) {
    if (feedback) feedback.textContent = 'O horário de início não pode ser depois do horário de fim.';
    return;
  }

  configRotinas = configRotinas.map((item) => item.id === rotina.id ? {
    ...item,
    horarioInicio,
    horarioFim,
    toleranciaInicioMin,
    toleranciaFimMin
  } : item);

  salvarStore(STORAGE_KEYS.routineConfig, configRotinas);
  const sincronizado = await salvarConfigNoFirebase();
  registrosBase = consolidarSnapshotsImportados();
  aplicarBase(
    registrosBase,
    snapshotsImportados.length ? 'importada' : 'simulada',
    importSummary?.textContent || 'Regras atualizadas.'
  );
  preencherRegraRotinaSelecionada();
  renderHistoricoPlanilhas();

  if (feedback) {
    feedback.textContent = sincronizado || !firebaseDisponivel
      ? `Regra salva para “${rotina.nome}”.`
      : `Regra salva neste dispositivo, mas a sincronização online não foi concluída.`;
  }
}

function popularControlesAdmin() {
  const lojas = obterLojasConhecidas();
  const formadores = [...new Set([...Object.values(lojaFormadorMap), ...registrosBase.map((item) => item.formador)].filter(ehFormadorAtivo))].sort();
  preencherSelect(document.getElementById('adminLojaSelect'), lojas, 'Selecione a loja');
  preencherSelect(document.getElementById('renameLojaSelect'), lojas, 'Selecione a loja');
  preencherSelect(document.getElementById('adminFormadorSelect'), formadores, 'Selecione o formador');
  popularRotinasConfigAdmin();
  renderVinculosLista();
  renderRenamesLista();
}

function renderVinculosLista() {
  const container = document.getElementById('vinculosLista');
  const lojas = obterLojasConhecidas();
  if (!lojas.length) {
    container.innerHTML = '<div class="empty-state">Nenhuma loja disponível.</div>';
    return;
  }
  container.innerHTML = lojas.map((loja) => {
    const formador = resolverFormador(loja);
    const info = parseLoja(loja);
    return `<div class="link-row"><div><strong>${escaparHtml(loja)}</strong><span>${escaparHtml(info.rede)} • ${escaparHtml(info.unidade)}</span></div><div class="status-tag">${escaparHtml(formador)}</div></div>`;
  }).join('');
}

function renderRenamesLista() {
  const container = document.getElementById('renamesLista');
  const entries = Object.entries(lojaRenameMap);
  if (!entries.length) {
    container.innerHTML = '<div class="empty-state">Nenhum nome personalizado cadastrado.</div>';
    return;
  }
  container.innerHTML = entries.map(([originalSlug, novoNome]) => `<div class="rename-row"><div><strong>${escaparHtml(originalSlug)}</strong><span>${escaparHtml(novoNome)}</span></div></div>`).join('');
}

function renderHistoricoPlanilhas() {
  const container = document.getElementById('historicoPlanilhas');
  if (!container) return;
  if (!snapshotsImportados.length) {
    container.innerHTML = '<div class="empty-state">Nenhuma importação foi processada ainda.</div>';
    return;
  }

  container.innerHTML = snapshotsImportados.map((snapshot) => {
    const dataImportacao = new Date(snapshot.importedAt).toLocaleString('pt-BR');
    const dataReferencia = snapshot.latestDate ? snapshot.latestDate.split('-').reverse().join('/') : 'não identificada';
    const dadosSnapshot = normalizarBaseCompleta(snapshot.data || [], 'importada');
    const resumo = dadosSnapshot.length ? resumirResultadosImportacao(dadosSnapshot) : (snapshot.summary || {});
    const rawDisponivel = snapshot.rawAvailable !== false && snapshot.rawExpiresAt && !dadosBrutosExpirados(snapshot);
    const expiraTexto = snapshot.rawExpiresAt ? new Date(snapshot.rawExpiresAt).toLocaleString('pt-BR') : '';
    const statusRaw = rawDisponivel
      ? `Dados brutos disponíveis até ${expiraTexto}`
      : 'Dados brutos excluídos • resultados preservados';

    return `
      <div class="history-card">
        <div>
          <div class="history-title">${escaparHtml(snapshot.fileName || `Rotinas ${dataReferencia}`)}</div>
          <div class="history-meta">Data de referência ${escaparHtml(dataReferencia)} • processada em ${escaparHtml(dataImportacao)}</div>
          <div class="history-meta">${resumo.previstas || snapshot.total || 0} previstas • ${resumo.realizadas || 0} realizadas • ${resumo.atrasadas || 0} em atraso • ${resumo.pendentes || 0} pendentes</div>
          <div class="history-meta">${escaparHtml(statusRaw)}</div>
        </div>
        <div class="status-tag">${rawDisponivel ? 'Dados temporários' : 'Resultado permanente'}</div>
        <div class="history-actions">
          <button class="btn btn-secondary" type="button" data-action="apply-snapshot" data-id="${snapshot.id}">Reprocessar</button>
          <button class="btn btn-danger" type="button" data-action="delete-snapshot" data-id="${snapshot.id}">Excluir</button>
        </div>
      </div>`;
  }).join('');
}

function salvarVinculoLoja() {
  const loja = document.getElementById('adminLojaSelect').value;
  const formador = document.getElementById('adminFormadorSelect').value;
  const feedback = document.getElementById('linkFeedback');
  if (!loja || !formador) {
    feedback.textContent = 'Selecione uma loja e um formador para salvar o vínculo.';
    return;
  }
  const formadorValido = normalizarNomeFormador(formador);
  if (!formadorValido) {
    feedback.textContent = 'Selecione um formador ativo.';
    return;
  }
  lojaFormadorMap[slug(loja)] = formadorValido;
  salvarStore(STORAGE_KEYS.storeFormadorMap, sanitizarMapaFormadores(lojaFormadorMap));
  salvarConfigNoFirebase();
  aplicarRegrasAdministrativasNaBaseAtual();
  feedback.textContent = `Vínculo salvo: ${loja} → ${formador}.`;
}

function salvarNovoNomeLoja() {
  const lojaAtual = document.getElementById('renameLojaSelect').value;
  const novoNome = document.getElementById('renameLojaInput').value.trim().replace(/\s+/g, ' ');
  const feedback = document.getElementById('renameFeedback');
  if (!lojaAtual || !novoNome) {
    feedback.textContent = 'Selecione a loja e informe o novo nome.';
    return;
  }
  lojaRenameMap[slug(lojaAtual)] = novoNome;
  salvarStore(STORAGE_KEYS.storeRenameMap, lojaRenameMap);

  if (lojaFormadorMap[slug(lojaAtual)]) {
    lojaFormadorMap[slug(novoNome)] = lojaFormadorMap[slug(lojaAtual)];
    delete lojaFormadorMap[slug(lojaAtual)];
    salvarStore(STORAGE_KEYS.storeFormadorMap, sanitizarMapaFormadores(lojaFormadorMap));
  }
  salvarConfigNoFirebase();

  registrosBase = registrosBase.map((item) => item.loja === lojaAtual ? { ...item, loja: novoNome } : item);
  aplicarRegrasAdministrativasNaBaseAtual();
  document.getElementById('renameLojaInput').value = '';
  feedback.textContent = `Nome alterado para ${novoNome}.`;
}

async function usarSnapshot(snapshotId) {
  const snapshot = snapshotsImportados.find((item) => item.id === snapshotId);
  if (!snapshot) return;
  const dadosAtualizados = normalizarBaseCompleta(snapshot.data, 'importada');
  const atualizado = { ...snapshot, data: dadosAtualizados, summary: resumirResultadosImportacao(dadosAtualizados) };
  snapshotsImportados = snapshotsImportados.map((item) => item.id === snapshotId ? atualizado : item);
  persistirSnapshotsLocais();
  atualizarBasePorSnapshots(`Planilha ${snapshot.fileName} reprocessada e aplicada no painel.`);
  const sincronizado = await salvarSnapshotNoFirebase(atualizado);
  setImportStatus(
    sincronizado
      ? `Planilha ${snapshot.fileName} reprocessada e sincronizada.`
      : `Planilha ${snapshot.fileName} reprocessada no painel, mas a sincronização online falhou.`,
    sincronizado ? 'Sincronizado' : 'Reprocessada localmente'
  );
}

async function excluirSnapshot(snapshotId) {
  const snapshot = snapshotsImportados.find((item) => item.id === snapshotId);
  if (!snapshot) return;
  snapshotsImportados = snapshotsImportados.filter((item) => item.id !== snapshotId);
  persistirSnapshotsLocais();
  atualizarBasePorSnapshots(
    snapshotsImportados.length
      ? `Planilha ${snapshot.fileName} removida. O painel foi recalculado com as demais importações.`
      : 'Planilha removida. O painel ficou sem dados importados.'
  );

  const sincronizado = await excluirSnapshotNoFirebase(snapshotId);
  setImportStatus(
    sincronizado
      ? 'Planilha removida com sucesso. Todos os usuários verão a atualização.'
      : 'Planilha removida neste dispositivo, mas a sincronização online falhou.',
    sincronizado ? 'Removida' : 'Removida localmente'
  );
}

function configurarAdmin() {
  const modal = document.getElementById('adminModal');
  const loginView = document.getElementById('adminLoginView');
  const panelView = document.getElementById('adminPanelView');
  const loginFeedback = document.getElementById('adminLoginFeedback');

  function refreshAdminView() {
    const isLogged = localStorage.getItem(STORAGE_KEYS.adminLogged) === '1';
    loginView.classList.toggle('hidden', isLogged);
    panelView.classList.toggle('hidden', !isLogged);
    if (isLogged) {
      atualizarResumoAdmin();
      popularControlesAdmin();
      renderHistoricoPlanilhas();
    }
  }

  const abrirModal = () => {
    window.PainelSF.abrirAdminModal();
    refreshAdminView();
  };

  const fecharModal = () => {
    window.PainelSF.fecharAdminModal();
  };

  document.getElementById('adminToggle').addEventListener('click', abrirModal);
  document.getElementById('closeAdmin').addEventListener('click', fecharModal);
  document.getElementById('adminOverlay').addEventListener('click', fecharModal);

  document.getElementById('adminLoginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
      localStorage.setItem(STORAGE_KEYS.adminLogged, '1');
      loginFeedback.textContent = '';
      refreshAdminView();
    } else {
      loginFeedback.textContent = 'Usuário ou senha incorretos.';
    }
  });

  document.getElementById('adminLogout').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.adminLogged);
    refreshAdminView();
  });

  document.querySelectorAll('.admin-tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('.admin-tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab));
    });
  });

  document.getElementById('saveLojaVinculo').addEventListener('click', salvarVinculoLoja);
  document.getElementById('saveLojaRename').addEventListener('click', salvarNovoNomeLoja);
  const routineConfigSelect = document.getElementById('routineConfigSelect');
  const saveRoutineConfig = document.getElementById('saveRoutineConfig');
  if (routineConfigSelect) routineConfigSelect.addEventListener('change', preencherRegraRotinaSelecionada);
  if (saveRoutineConfig) saveRoutineConfig.addEventListener('click', salvarRegraRotina);
  const historicoPlanilhas = document.getElementById('historicoPlanilhas');
  if (historicoPlanilhas) {
    historicoPlanilhas.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'apply-snapshot') usarSnapshot(button.dataset.id);
      if (button.dataset.action === 'delete-snapshot') excluirSnapshot(button.dataset.id);
    });
  }

  refreshAdminView();
}

function obterPeriodoComparativo() {
  const periodo = normalizarPeriodo(filtros.dataInicial.value, filtros.dataFinal.value);
  if (!periodo.dataInicial || !periodo.dataFinal) return '|';
  const inicio = new Date(`${periodo.dataInicial}T00:00:00`);
  const fim = new Date(`${periodo.dataFinal}T00:00:00`);
  const diffDias = Math.max(1, Math.round((fim - inicio) / 86400000) + 1);
  const novoFim = new Date(inicio);
  novoFim.setDate(novoFim.getDate() - 1);
  const novoInicio = new Date(novoFim);
  novoInicio.setDate(novoInicio.getDate() - (diffDias - 1));
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return `${fmt(novoInicio)}|${fmt(novoFim)}`;
}

function atualizarPendenciasHero(dados) {
  const container = document.getElementById('painelPendencias');
  if (!container) return;
  const pendentes = dados.filter((item) => item.status === 'pendente');
  const lojasBaixasMap = {};
  dados.forEach((item) => {
    if (!lojasBaixasMap[item.loja]) lojasBaixasMap[item.loja] = { total: 0, realizadas: 0 };
    lojasBaixasMap[item.loja].total += 1;
    if (item.status === 'realizada') lojasBaixasMap[item.loja].realizadas += 1;
  });
  const lojasBaixas = Object.values(lojasBaixasMap).filter((item) => percentual(item.realizadas, item.total) < 50).length;
  const promotoresSemRegistro = Object.values(dados.reduce((acc, item) => {
    const chave = item.formador || 'Sem formador';
    if (!acc[chave]) acc[chave] = { total: 0 };
    acc[chave].total += 1;
    return acc;
  }, {})).filter((item) => item.total === 0).length;
  const pendenciasAntigas = pendentes.length;
  const itens = [
    { texto: `${lojasBaixas} lojas com execução abaixo de 50%` },
    { texto: `${promotoresSemRegistro} promotores sem registro no período` },
    { texto: `${pendenciasAntigas} rotinas pendentes no recorte atual` }
  ];
  container.innerHTML = itens.map((item) => `<div class="hero-alert-item"><span class="hero-alert-bullet">⚠️</span><span><strong>${item.texto}</strong></span></div>`).join('');
}

function atualizarRotulosAbas() {
  const ref = ultimaDataDisponivel || new Date().toISOString().slice(0,10);
  const [y,m,d] = ref.split('-').map(Number);
  const dataRef = new Date(y, m-1, d);
  const fmtLonga = dataRef.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const diario = document.getElementById('tabLabelDiario');
  const semanal = document.getElementById('tabLabelSemanal');
  const mensal = document.getElementById('tabLabelMensal');
  if (diario) diario.textContent = `Hoje • ${fmtLonga}`;
  const fimSemana = new Date(dataRef); const inicioSemana = new Date(dataRef); inicioSemana.setDate(dataRef.getDate()-6);
  if (semanal) semanal.textContent = `${inicioSemana.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})} a ${fimSemana.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}`;
  if (mensal) mensal.textContent = dataRef.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
}

function aplicarPeriodoResumo(periodo) {
  resumoPeriodoAtual = periodo;
  const ref = ultimaDataDisponivel || new Date().toISOString().slice(0,10);
  const base = new Date(`${ref}T00:00:00`);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if (periodo === 'diario') {
    filtros.dataInicial.value = ref;
    filtros.dataFinal.value = ref;
  } else if (periodo === 'semanal') {
    const ini = new Date(base); ini.setDate(base.getDate()-6);
    filtros.dataInicial.value = fmt(ini);
    filtros.dataFinal.value = ref;
  } else {
    const ini = new Date(base.getFullYear(), base.getMonth(), 1);
    filtros.dataInicial.value = fmt(ini);
    filtros.dataFinal.value = ref;
  }
  document.querySelectorAll('.summary-tab').forEach((button) => button.classList.toggle('active', button.dataset.period === periodo));
  renderizarPainel();
}

function configurarAbasResumo() {
  atualizarRotulosAbas();
  document.querySelectorAll('.summary-tab').forEach((button) => {
    button.addEventListener('click', () => aplicarPeriodoResumo(button.dataset.period));
  });
}

function configurarSidebar() {
  const close = document.getElementById('closeSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (close) close.addEventListener('click', () => window.PainelSF.alternarSidebar(false));
  if (overlay) overlay.addEventListener('click', () => window.PainelSF.alternarSidebar(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.PainelSF.alternarSidebar(false);
  });
}

function ativarResumoMensalSemSobrescreverDatas() {
  resumoPeriodoAtual = 'mensal';
  document.querySelectorAll('.summary-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.period === 'mensal');
  });
}

function aplicarFiltroComResumoMensal({ preservarDatas = false, sincronizarDependentes = false } = {}) {
  if (sincronizarDependentes) sincronizarFiltrosDependentes();
  if (preservarDatas) {
    ativarResumoMensalSemSobrescreverDatas();
    renderizarPainel();
  } else {
    aplicarPeriodoResumo('mensal');
  }
}

function configurarEventos() {
  filtros.rede.addEventListener('change', () => aplicarFiltroComResumoMensal({ sincronizarDependentes: true }));
  filtros.formador.addEventListener('change', () => aplicarFiltroComResumoMensal({ sincronizarDependentes: true }));
  filtros.loja.addEventListener('change', () => aplicarFiltroComResumoMensal());
  filtros.status.addEventListener('change', () => aplicarFiltroComResumoMensal());
  filtros.rotina.addEventListener('change', () => aplicarFiltroComResumoMensal());
  filtros.dataInicial.addEventListener('change', () => aplicarFiltroComResumoMensal({ preservarDatas: true }));
  filtros.dataFinal.addEventListener('change', () => aplicarFiltroComResumoMensal({ preservarDatas: true }));
  document.getElementById('applyFilters').addEventListener('click', () => { aplicarFiltroComResumoMensal({ preservarDatas: Boolean(filtros.dataInicial.value || filtros.dataFinal.value), sincronizarDependentes: true }); document.body.classList.remove('sidebar-open'); });
  document.getElementById('clearFilters').addEventListener('click', () => { limparFiltros(); document.body.classList.remove('sidebar-open'); });
  const importButton = document.getElementById('importFile');
  const resetButton = document.getElementById('resetData');
  if (importButton) importButton.addEventListener('click', importarArquivo);
  if (resetButton) resetButton.addEventListener('click', resetarParaSimulada);
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      montarPreviewArquivos();
    });
  }
}

function inicializarBaseAtiva() {
  if (snapshotsImportados.length) {
    registrosBase = consolidarSnapshotsImportados();
    aplicarBase(registrosBase, 'importada', `${registrosBase.length} registros consolidados de ${snapshotsImportados.length} planilha(s) importada(s).`);
  } else {
    registrosBase = normalizarBaseCompleta(registrosSimulados, 'simulada');
    aplicarBase(registrosBase, 'simulada', 'Painel sem dados. Importe uma ou mais planilhas para carregar as rotinas.');
  }
  renderHistoricoPlanilhas();
}


window.PainelSF = Object.assign(window.PainelSF || {}, {
  alternarSidebar(forceOpen) {
    const body = document.body;
    const abrir = typeof forceOpen === 'boolean' ? forceOpen : !body.classList.contains('sidebar-open');
    body.classList.toggle('sidebar-open', abrir);
  },
  abrirAdminModal() {
    const modal = document.getElementById('adminModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  },
  fecharAdminModal() {
    const modal = document.getElementById('adminModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  },
  aplicarPeriodoResumo,
  abrirApresentacao,
  fecharApresentacao,
  proximoSlideApresentacao() { irParaSlideApresentacao(apresentacaoState.slideAtual + 1); },
  slideAnteriorApresentacao() { irParaSlideApresentacao(apresentacaoState.slideAtual - 1); },
  alternarAutoplayApresentacao,
  alternarFullscreenApresentacao,
  aplicarFiltrosRapido() {
    try { renderizarPainel(); } catch (error) { console.error(error); }
    document.body.classList.remove('sidebar-open');
  },
  limparFiltrosRapido() {
    try { limparFiltros(); } catch (error) { console.error(error); }
    document.body.classList.remove('sidebar-open');
  }
});


function obterPeriodoResumoLabel() {
  const labels = {
    diario: document.getElementById('tabLabelDiario')?.textContent?.trim() || 'Hoje',
    semanal: document.getElementById('tabLabelSemanal')?.textContent?.trim() || 'Últimos 7 dias',
    mensal: document.getElementById('tabLabelMensal')?.textContent?.trim() || 'Mês atual'
  };
  const prefixos = {
    diario: 'Resumo diário',
    semanal: 'Resumo semanal',
    mensal: 'Resumo mensal'
  };
  return `${prefixos[resumoPeriodoAtual] || 'Resumo'} • ${labels[resumoPeriodoAtual] || ''}`;
}

function resumirKPIs(dados) {
  const previstas = dados.length;
  const realizadas = dados.filter((item) => item.status === 'realizada').length;
  const pendentes = dados.filter((item) => item.status === 'pendente').length;
  const execucao = percentual(realizadas, previstas);
  return { previstas, realizadas, pendentes, execucao };
}

function obterTopLojas(dados, limite = 6) {
  return Object.values(dados.reduce((acc, item) => {
    if (!acc[item.loja]) acc[item.loja] = { loja: item.loja, rede: item.rede, formador: item.formador, realizadas: 0, total: 0 };
    acc[item.loja].total += 1;
    if (item.status === 'realizada') acc[item.loja].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas || a.loja.localeCompare(b.loja, 'pt-BR')).slice(0, limite);
}

function obterRotinasCriticas(dados, limite = 5) {
  return Object.values(dados.reduce((acc, item) => {
    if (!acc[item.rotina]) acc[item.rotina] = { rotina: item.rotina, realizadas: 0, total: 0 };
    acc[item.rotina].total += 1;
    if (item.status === 'realizada') acc[item.rotina].realizadas += 1;
    return acc;
  }, {})).sort((a, b) => percentual(a.realizadas, a.total) - percentual(b.realizadas, b.total) || b.total - a.total || a.rotina.localeCompare(b.rotina, 'pt-BR')).slice(0, limite);
}

function obterMelhoresLojasPorFormador(dados) {
  const porFormador = agregarLojasPorFormador(dados);
  return FORMADORES_ATIVOS
    .filter((formador) => Array.isArray(porFormador[formador]) && porFormador[formador].length)
    .map((formador) => {
      const melhorLoja = [...porFormador[formador]].sort((a, b) => percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total) || b.realizadas - a.realizadas || a.loja.localeCompare(b.loja, 'pt-BR'))[0];
      return { ...melhorLoja, formador, execucao: percentual(melhorLoja.realizadas, melhorLoja.total) };
    });
}

function obterRankingFormadoresApresentacao(dados, limite = 3) {
  const agrupado = agregarPorFormador(dados);
  const posicoes = new Map(FORMADORES_ATIVOS.map((nome, indice) => [slug(nome), indice]));
  return agrupado
    .filter((item) => ehFormadorAtivo(item.nome))
    .sort((a, b) => {
      const diferencaExecucao = percentual(b.realizadas, b.total) - percentual(a.realizadas, a.total);
      if (diferencaExecucao) return diferencaExecucao;
      const diferencaRealizadas = b.realizadas - a.realizadas;
      if (diferencaRealizadas) return diferencaRealizadas;
      return (posicoes.get(slug(a.nome)) ?? 999) - (posicoes.get(slug(b.nome)) ?? 999);
    })
    .slice(0, limite);
}

function aplicarAjusteFitApresentacao() {
  if (!apresentacaoState.aberta) return;
  const content = document.getElementById('presentationContent');
  const frame = content?.querySelector('.presentation-frame');
  const scaleBox = content?.querySelector('.presentation-scale-box');
  if (!content || !frame || !scaleBox) return;

  frame.classList.remove('is-conecta-compact', 'is-conecta-tight');

  const baseWidth = Number(frame.dataset.baseWidth || 1920);
  const baseHeight = Number(frame.dataset.baseHeight || 1080);
  const viewportWidth = Math.max(content.clientWidth - 20, 320);
  const viewportHeight = Math.max(content.clientHeight - 20, 240);
  const scale = Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight) * 0.985;

  scaleBox.style.width = `${baseWidth}px`;
  scaleBox.style.height = `${baseHeight}px`;
  scaleBox.style.transform = `scale(${scale})`;

  const relacao = viewportWidth / Math.max(viewportHeight, 1);
  const compact = viewportHeight < 1020 || viewportWidth < 1760 || relacao < 1.72;
  const tight = viewportHeight < 930 || viewportWidth < 1600 || relacao < 1.62;

  if (compact) frame.classList.add('is-conecta-compact');
  if (tight) frame.classList.add('is-conecta-tight');
}

function montarFiltrosApresentacao() {
  return montarResumoFiltrosAtivos().map((item) => `<div class="presentation-filter-chip"><strong>${escaparHtml(item.rotulo)}:</strong><span>${escaparHtml(item.valor)}</span></div>`).join('');
}

function criarListaApresentacao(itens, renderItem) {
  if (!itens.length) {
    return '<div class="presentation-empty">Sem dados no recorte atual.</div>';
  }
  return `<div class="presentation-list">${itens.map((item, index) => renderItem(item, index)).join('')}</div>`;
}

function obterMetaApresentacao() {
  return 80;
}

function formatarHoraApresentacao(data = new Date()) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataApresentacao(data = new Date()) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

function formatarDataTituloApresentacao(data = new Date()) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase();
}

function classeExecucaoApresentacao(execucao) {
  if (execucao >= 90) return 'is-high';
  if (execucao >= 80) return 'is-medium';
  return 'is-low';
}

function montarRodapeSlideApresentacao(indice, total) {
  return `
    <div class="presentation-slide-progress">
      <div class="presentation-slide-progress-track">
        <div class="presentation-slide-progress-fill" style="width:${((indice + 1) / Math.max(total, 1)) * 100}%"></div>
      </div>
      <div class="presentation-slide-progress-dots">
        ${Array.from({ length: total }, (_, dotIndex) => `<span class="presentation-slide-progress-dot ${dotIndex === indice ? 'active' : ''}"></span>`).join('')}
      </div>
    </div>`;
}

function mensagemMetaApresentacao(execucao, meta = obterMetaApresentacao()) {
  if (execucao >= meta + 5) return 'ACIMA DA META';
  if (execucao >= meta) return 'META ATINGIDA';
  return 'ABAIXO DA META';
}

function montarHeroSlideApresentacao(titulo, periodo) {
  const agora = new Date();
  return `
    <div class="presentation-hero-header">
      <div class="presentation-brand-block">
        <img src="logo-sofolhas.png" alt="Só Folhas Hortifruti" class="presentation-brand-logo" />
      </div>
      <div class="presentation-clock-block">
        <div class="presentation-clock-time">${escaparHtml(formatarHoraApresentacao(agora))}</div>
        <div class="presentation-clock-date">${escaparHtml(formatarDataApresentacao(agora))}</div>
      </div>
      <div class="presentation-title-block">
        <h3 class="presentation-screen-title">${escaparHtml(titulo)}</h3>
        <div class="presentation-title-meta-row">
          <span class="presentation-period-pill">PERÍODO</span>
          <span class="presentation-period-value">${escaparHtml(periodo)}</span>
        </div>
        <div class="presentation-stamp-row">
          <span class="presentation-stamp-dot"></span>
          <span>${escaparHtml(formatarDataTituloApresentacao(agora))} • ${escaparHtml(formatarHoraApresentacao(agora))}</span>
        </div>
      </div>
    </div>`;
}

function gerarSlidesApresentacao() {
  const dados = [...dadosFiltrados];
  const kpis = resumirKPIs(dados);
  const formadores = obterRankingFormadoresApresentacao(dados, 3);
  const destaques = obterMelhoresLojasPorFormador(dados).slice(0, 3);
  const periodo = obterPeriodoResumoLabel();
  const filtrosHtml = montarFiltrosApresentacao();
  const meta = obterMetaApresentacao();
  const diferencaMeta = kpis.execucao - meta;
  const statusMeta = mensagemMetaApresentacao(kpis.execucao, meta);
  const progressoExecucao = Math.max(0, Math.min(kpis.execucao, 100));
  const top3Formadores = formadores.slice(0, 3);
  const totalSlidesApresentacao = 4;

  if (!dados.length) {
    return [{
      titulo: 'Modo apresentação',
      subtitulo: 'O painel está sem dados no momento.',
      periodo,
      filtrosHtml,
      html: '<div class="presentation-empty"><div><h3>Nenhuma planilha ativa</h3><p>Entre na área ADM, importe a base e volte para este modo para exibir a apresentação automaticamente.</p></div></div>'
    }];
  }

  const slideExecutivo = {
    titulo: 'Slide 1',
    subtitulo: 'Abertura executiva do painel.',
    periodo,
    filtrosHtml,
    html: `
      <div class="presentation-slide presentation-slide-visual presentation-slide-intro presentation-conecta-slide">
        ${montarHeroSlideApresentacao('PAINEL DE ROTINAS OPERACIONAIS', periodo)}
        <div class="presentation-summary-grid">
          <article class="presentation-summary-card">
            <div class="presentation-summary-head">PREVISTAS</div>
            <div class="presentation-summary-icon">☑</div>
            <div class="presentation-summary-value">${formatarNumero.format(kpis.previstas)}</div>
            <div class="presentation-summary-label">Rotinas previstas</div>
          </article>
          <article class="presentation-summary-card">
            <div class="presentation-summary-head">REALIZADAS</div>
            <div class="presentation-summary-icon">✅</div>
            <div class="presentation-summary-value">${formatarNumero.format(kpis.realizadas)}</div>
            <div class="presentation-summary-label">Rotinas realizadas</div>
          </article>
          <article class="presentation-summary-card is-warning">
            <div class="presentation-summary-head">PENDÊNCIAS</div>
            <div class="presentation-summary-icon">⚠</div>
            <div class="presentation-summary-value">${formatarNumero.format(kpis.pendentes)}</div>
            <div class="presentation-summary-label">Rotinas não finalizadas</div>
          </article>
          <article class="presentation-summary-card presentation-summary-ring-card">
            <div class="presentation-summary-head">EXECUÇÃO GERAL</div>
            <div class="presentation-summary-ring" style="--progress:${progressoExecucao}">
              <div class="presentation-summary-ring-inner">
                <div class="presentation-summary-ring-value">${kpis.execucao}%</div>
                <div class="presentation-summary-ring-label">Eficiência média</div>
              </div>
            </div>
          </article>
        </div>
        <div class="presentation-slide-caption">Resumo geral do período selecionado</div>
        ${montarRodapeSlideApresentacao(0, totalSlidesApresentacao)}
      </div>`
  };

  const slideMeta = {
    titulo: 'Slide 2',
    subtitulo: 'Execução geral versus meta.',
    periodo,
    filtrosHtml,
    html: `
      <div class="presentation-slide presentation-slide-visual presentation-slide-target presentation-conecta-slide">
        ${montarHeroSlideApresentacao('EXECUÇÃO GERAL VS META', periodo)}
        <div class="presentation-vs-grid">
          <div class="presentation-vs-ring-shell">
            <div class="presentation-vs-ring" style="--progress:${progressoExecucao}">
              <div class="presentation-vs-ring-inner">
                <div class="presentation-vs-ring-value">${kpis.execucao}%</div>
                <div class="presentation-vs-ring-label">Execução no período</div>
              </div>
            </div>
          </div>
          <div class="presentation-vs-panel ${diferencaMeta >= 0 ? 'is-positive' : 'is-negative'}">
            <div class="presentation-vs-panel-grid">
              <div>
                <div class="presentation-vs-status">${escaparHtml(statusMeta)}</div>
                <div class="presentation-vs-copy">${kpis.execucao >= meta ? 'Eficiência geral dentro ou acima da meta estabelecida.' : 'Eficiência geral abaixo da meta estabelecida.'}</div>
              </div>
              <div class="presentation-vs-meta-box">
                <div class="presentation-vs-meta-title">META</div>
                <div class="presentation-vs-meta-value">${meta}%</div>
              </div>
            </div>
            <div class="presentation-vs-bar-track">
              <div class="presentation-vs-bar-fill" style="width:${progressoExecucao}%"></div>
              <div class="presentation-vs-bar-marker" style="left:${meta}%"></div>
            </div>
            <div class="presentation-vs-bottom-row">
              <span>Diferença para a meta</span>
              <strong>${diferencaMeta > 0 ? '+' : ''}${diferencaMeta.toFixed(1).replace('.', ',')}%</strong>
            </div>
          </div>
        </div>
        <div class="presentation-slide-caption">${kpis.execucao >= meta ? 'Meta de execução atingida neste período' : 'Meta de execução não atingida neste período'}</div>
        ${montarRodapeSlideApresentacao(1, totalSlidesApresentacao)}
      </div>`
  };

  const slideFormadores = {
    titulo: 'Slide 3',
    subtitulo: 'Ranking visual dos formadores.',
    periodo,
    filtrosHtml,
    html: `
      <div class="presentation-slide presentation-slide-visual presentation-slide-podium presentation-conecta-slide">
        ${montarHeroSlideApresentacao('RANKING DE FORMADORES', periodo)}
        <div class="presentation-podium-grid ${top3Formadores.length < 3 ? 'is-compact' : ''}">
          ${top3Formadores.map((item, index) => {
            const execucao = percentual(item.realizadas, item.total);
            const posicoes = ['gold', 'silver', 'bronze'];
            const coroas = ['♛', '♕', '♕'];
            const ordens = [1, 0, 2];
            const variante = posicoes[index] || 'bronze';
            const coroa = coroas[index] || '♕';
            const ordem = ordens[index] || index;
            return `
              <article class="presentation-podium-card ${variante}" style="order:${ordem}">
                <div class="presentation-podium-crown">${coroa}</div>
                <div class="presentation-podium-name">${escaparHtml(item.nome)}</div>
                <div class="presentation-podium-value">${execucao}%</div>
                <div class="presentation-podium-meta">${item.realizadas} de ${item.total}</div>
                <div class="presentation-podium-footer">
                  <span>${index + 1}º no período</span>
                  <strong>${classeExecucaoApresentacao(execucao) === 'is-high' ? 'Alto desempenho' : classeExecucaoApresentacao(execucao) === 'is-medium' ? 'Bom desempenho' : 'Atenção'}</strong>
                </div>
              </article>`;
          }).join('')}
        </div>
        <div class="presentation-slide-caption">${top3Formadores[0] ? `${escaparHtml(top3Formadores[0].nome)} lidera o ranking atual` : 'Ranking atualizado automaticamente'}</div>
        ${montarRodapeSlideApresentacao(2, totalSlidesApresentacao)}
      </div>`
  };

  const slideLojas = {
    titulo: 'Slide 4',
    subtitulo: 'Melhores lojas por formador.',
    periodo,
    filtrosHtml,
    html: `
      <div class="presentation-slide presentation-slide-visual presentation-slide-showcase presentation-conecta-slide">
        ${montarHeroSlideApresentacao('MELHOR LOJA POR FORMADOR', periodo)}
        <div class="presentation-showcase-grid">
          ${destaques.map((item) => `
            <article class="presentation-showcase-card ${classeExecucaoApresentacao(item.execucao)}">
              <div class="presentation-showcase-formador">${escaparHtml(item.formador)}</div>
              <div class="presentation-showcase-loja">${escaparHtml(item.loja)}</div>
              <div class="presentation-showcase-value">${item.execucao}%</div>
              <div class="presentation-showcase-meta">${item.realizadas} de ${item.total}</div>
              <div class="presentation-showcase-badge">✩ EM DESTAQUE</div>
            </article>`).join('')}
        </div>
        <div class="presentation-slide-caption">Melhores lojas por desempenho dos formadores ativos</div>
        ${montarRodapeSlideApresentacao(3, totalSlidesApresentacao)}
      </div>`
  };

  return [slideExecutivo, slideMeta, slideFormadores, slideLojas];
}

function limparTimerApresentacao() {
  if (apresentacaoState.timer) {
    clearInterval(apresentacaoState.timer);
    apresentacaoState.timer = null;
  }
}

function iniciarAutoplayApresentacao() {
  limparTimerApresentacao();
  if (!apresentacaoState.aberta || !apresentacaoState.autoplay) return;
  apresentacaoState.timer = setInterval(() => {
    const slides = gerarSlidesApresentacao();
    if (!slides.length) return;
    apresentacaoState.slideAtual = (apresentacaoState.slideAtual + 1) % slides.length;
    renderizarApresentacaoSeAberta();
  }, APRESENTACAO_CONFIG.intervaloMs);
}

function irParaSlideApresentacao(indice) {
  const slides = gerarSlidesApresentacao();
  if (!slides.length) return;
  const total = slides.length;
  apresentacaoState.slideAtual = ((indice % total) + total) % total;
  renderizarApresentacaoSeAberta();
  iniciarAutoplayApresentacao();
}

function renderizarApresentacaoSeAberta() {
  if (!apresentacaoState.aberta) return;
  const modal = document.getElementById('presentationModal');
  const title = document.getElementById('presentationTitle');
  const subtitle = document.getElementById('presentationSubtitle');
  const counter = document.getElementById('presentationCounter');
  const period = document.getElementById('presentationPeriod');
  const content = document.getElementById('presentationContent');
  const dots = document.getElementById('presentationDots');
  const filtersEl = document.getElementById('presentationFilters');
  const playPause = document.getElementById('presentationPlayPause');
  if (!modal || !content) return;

  const slides = gerarSlidesApresentacao();
  if (!slides.length) return;
  if (apresentacaoState.slideAtual >= slides.length) apresentacaoState.slideAtual = 0;
  const slide = slides[apresentacaoState.slideAtual];

  if (title) title.textContent = slide.titulo;
  if (subtitle) subtitle.textContent = slide.subtitulo;
  if (counter) counter.textContent = `Slide ${apresentacaoState.slideAtual + 1} de ${slides.length}`;
  if (period) period.textContent = slide.periodo;
  if (content) {
    content.innerHTML = `
      <div class="presentation-viewport">
        <div class="presentation-scale-box">
          <div class="presentation-frame" data-base-width="1920" data-base-height="1080">${slide.html}</div>
        </div>
      </div>`;
  }
  if (filtersEl) filtersEl.innerHTML = slide.filtrosHtml;
  if (playPause) playPause.textContent = apresentacaoState.autoplay ? 'Pausar' : 'Retomar';
  if (dots) {
    dots.innerHTML = slides.map((item, index) => `<button class="presentation-dot ${index === apresentacaoState.slideAtual ? 'active' : ''}" type="button" aria-label="Ir para slide ${index + 1}" data-slide-index="${index}"></button>`).join('');
  }
  requestAnimationFrame(aplicarAjusteFitApresentacao);
}

function abrirApresentacao({ auto = false } = {}) {
  const modal = document.getElementById('presentationModal');
  if (!modal) return;
  apresentacaoState.aberta = true;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('presentation-open');
  renderizarApresentacaoSeAberta();
  iniciarAutoplayApresentacao();
}

function fecharApresentacao() {
  const modal = document.getElementById('presentationModal');
  if (!modal) return;
  apresentacaoState.aberta = false;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('presentation-open');
  limparTimerApresentacao();
}

function alternarAutoplayApresentacao() {
  apresentacaoState.autoplay = !apresentacaoState.autoplay;
  renderizarApresentacaoSeAberta();
  iniciarAutoplayApresentacao();
}

function alternarFullscreenApresentacao() {
  const stage = document.querySelector('#presentationModal .presentation-stage');
  if (!stage) return;
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch?.(() => {});
    return;
  }
  stage.requestFullscreen?.().catch?.(() => {});
}

function configurarApresentacao() {
  const openBtn = document.getElementById('presentationToggle');
  const closeBtn = document.getElementById('presentationClose');
  const prevBtn = document.getElementById('presentationPrev');
  const nextBtn = document.getElementById('presentationNext');
  const playPauseBtn = document.getElementById('presentationPlayPause');
  const fullscreenBtn = document.getElementById('presentationFullscreen');
  const dots = document.getElementById('presentationDots');
  if (openBtn) openBtn.addEventListener('click', () => abrirApresentacao());
  if (closeBtn) closeBtn.addEventListener('click', fecharApresentacao);
  if (prevBtn) prevBtn.addEventListener('click', () => irParaSlideApresentacao(apresentacaoState.slideAtual - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => irParaSlideApresentacao(apresentacaoState.slideAtual + 1));
  if (playPauseBtn) playPauseBtn.addEventListener('click', alternarAutoplayApresentacao);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', alternarFullscreenApresentacao);
  if (dots) {
    dots.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-slide-index]');
      if (!button) return;
      irParaSlideApresentacao(Number(button.dataset.slideIndex));
    });
  }
  window.addEventListener('resize', () => {
    if (apresentacaoState.aberta) requestAnimationFrame(aplicarAjusteFitApresentacao);
  });
  document.addEventListener('fullscreenchange', () => {
    if (apresentacaoState.aberta) requestAnimationFrame(aplicarAjusteFitApresentacao);
  });
  document.addEventListener('keydown', (event) => {
    if (!apresentacaoState.aberta) return;
    if (event.key === 'Escape') fecharApresentacao();
    if (event.key === 'ArrowRight') irParaSlideApresentacao(apresentacaoState.slideAtual + 1);
    if (event.key === 'ArrowLeft') irParaSlideApresentacao(apresentacaoState.slideAtual - 1);
    if (event.key === ' ') {
      event.preventDefault();
      alternarAutoplayApresentacao();
    }
  });
}

function autoAbrirApresentacaoSeSolicitado() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('apresentacao') === '1' || params.get('tv') === '1' || params.get('conecta') === '1') {
    abrirApresentacao({ auto: true });
  }
}

function inicializarAplicacao() {
  if (window.__sfPainelInicializado) return;
  window.__sfPainelInicializado = true;
  configurarSidebar();
  configurarEventos();
  configurarAdmin();
  configurarAbasResumo();
  configurarApresentacao();
  salvarStore(STORAGE_KEYS.routineConfig, configRotinas);
  salvarStore(STORAGE_KEYS.knownStores, [...lojasConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  inicializarBaseAtiva();
  agendarLimpezaDadosBrutos();
  autoAbrirApresentacaoSeSolicitado();
  inicializarFirebaseOpcional();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarAplicacao);
} else {
  inicializarAplicacao();
}
