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

const STORAGE_KEYS = {
  adminLogged: 'sf_admin_logged',
  storeFormadorMap: 'sf_store_formador_map',
  storePromotorMap: 'sf_store_promotor_map',
  storeRenameMap: 'sf_store_rename_map',
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
    chunksCount: item.chunksCount || 0,
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

async function excluirChunksSnapshotNoFirebase(snapshotId) {
  if (!firebaseDisponivel || !firebaseApi || !db) return;

  const chunksRef = firebaseApi.collection(db, 'painel_snapshots', snapshotId, 'chunks');
  const chunksSnap = await firebaseApi.getDocs(chunksRef);
  const docs = chunksSnap.docs || [];

  for (let i = 0; i < docs.length; i += 200) {
    const batch = firebaseApi.writeBatch(db);
    docs.slice(i, i + 200).forEach((docItem) => batch.delete(docItem.ref));
    await batch.commit();
  }
}

async function salvarSnapshotNoFirebase(snapshot) {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    const { data, ...meta } = snapshot;
    const lotes = dividirEmLotes(Array.isArray(data) ? data : [], 200);

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

    await firebaseApi.setDoc(firebaseApi.doc(db, 'painel_snapshots', snapshot.id), {
      ...meta,
      chunksCount: lotes.length,
      schemaVersion: 2,
      updatedAt: new Date().toISOString(),
      data: firebaseApi.deleteField()
    }, { merge: true });
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
    await firebaseApi.deleteDoc(firebaseApi.doc(db, 'painel_snapshots', snapshotId));
    return true;
  } catch (error) {
    console.error('Erro ao excluir snapshot no Firebase:', error);
    return false;
  }
}

async function limparSnapshotsNoFirebase() {
  if (!firebaseDisponivel || !firebaseApi || !db) return false;
  try {
    const ids = [...new Set(snapshotsImportados.map((snapshot) => snapshot.id).filter(Boolean))];
    for (const snapshotId of ids) {
      await excluirSnapshotNoFirebase(snapshotId);
    }
    return true;
  } catch (error) {
    console.error('Erro ao limpar snapshots no Firebase:', error);
    return false;
  }
}

function normalizarSnapshotFirebase(snapshot) {
  return {
    ...snapshot,
    importedAt: typeof snapshot.importedAt === 'string'
      ? snapshot.importedAt
      : (snapshot.importedAt?.toDate ? snapshot.importedAt.toDate().toISOString() : new Date().toISOString()),
    data: Array.isArray(snapshot.data) ? snapshot.data : [],
    chunksCount: Number(snapshot.chunksCount || 0),
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

function aplicarEstadoRemoto() {
  atualizarBasePorSnapshots();
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

    salvarStore(STORAGE_KEYS.storeFormadorMap, lojaFormadorMap);
    salvarStore(STORAGE_KEYS.storePromotorMap, lojaPromotorMap);
    salvarStore(STORAGE_KEYS.storeRenameMap, lojaRenameMap);

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
  return {
    id: base.id || `reg-${index + 1}`,
    data: formatarData(base.data),
    rede: base.rede || lojaInfo.rede,
    loja: lojaInfo.loja,
    unidade: base.unidade || lojaInfo.unidade,
    formador: resolverFormador(lojaInfo.loja, base.formador, mapaFormadores),
    promotor: resolverPromotor(lojaInfo.loja, base.promotor, mapaPromotores),
    rotina: String(base.rotina || '').trim(),
    status: normalizarStatus(base.status)
  };
}

function normalizarBaseCompleta(base, origem = 'simulada', mapaFormadores = new Map(), mapaPromotores = new Map()) {
  return base
    .map((item, index) => enriquecerRegistro(item, index, mapaFormadores, mapaPromotores))
    .filter((item) => item.data && item.rotina && item.loja && item.status)
    .map((item) => ({ ...item, origem }));
}

function obterLojasConhecidas() {
  const lojasRegistros = registrosBase.map((item) => item.loja);
  const lojasVinculadas = lojaFormadorInicial.map(([loja]) => loja);
  return [...new Set([...lojasVinculadas, ...lojasRegistros])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
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
  return normalizarBaseCompleta(
    snapshotsImportados.flatMap((item) => Array.isArray(item.data) ? item.data : []),
    'importada'
  );
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

function normalizarRegistrosImportados(sheets) {
  const linhasRotinas = sheets['Rotinas'] || Object.values(sheets)[0] || [];
  if (!linhasRotinas.length) throw new Error('A planilha está vazia.');

  const cabecalho = linhasRotinas[0].map((item) => String(item || '').trim().toLowerCase());
  const redesMap = inferirRedesPorAba(sheets['Redes Disponíveis']);
  const formadoresMap = inferirFormadoresPorAba(sheets.Formadores);
  const promotoresMap = inferirPromotoresPorAba(sheets);

  const idxData = cabecalho.findIndex((item) => item.includes('data'));
  const idxRotina = cabecalho.findIndex((item) => item.includes('checklist') || item.includes('rotina'));
  const idxLoja = cabecalho.findIndex((item) => item.includes('unidade') || item.includes('loja'));
  const idxStatus = cabecalho.findIndex((item) => item.includes('situa') || item.includes('status'));
  const idxResponsavel = cabecalho.findIndex((item) => item.includes('departamento') || item.includes('formador') || item.includes('respons'));
  const idxPromotor = cabecalho.findIndex((item) => item.includes('promotor'));

  if ([idxData, idxRotina, idxLoja, idxStatus].some((idx) => idx < 0)) {
    throw new Error('Não foi possível localizar as colunas obrigatórias de data, rotina, loja e status.');
  }

  const registrosImportados = linhasRotinas.slice(1).map((linha, index) => {
    const data = formatarData(linha[idxData]);
    const rotina = String(linha[idxRotina] || '').trim();
    const lojaOriginal = String(linha[idxLoja] || '').trim();
    const status = normalizarStatus(linha[idxStatus]);
    const formadorLinha = idxResponsavel >= 0 ? String(linha[idxResponsavel] || '').trim() : '';
    const promotorLinha = idxPromotor >= 0 ? String(linha[idxPromotor] || '').trim() : '';
    if (!data || !rotina || !lojaOriginal || !status) return null;
    return enriquecerRegistro({ id: `imp-${index + 1}`, data, loja: lojaOriginal, rotina, status, formador: formadorLinha, promotor: promotorLinha, redesMap }, index, formadoresMap, promotoresMap);
  }).filter(Boolean);

  if (!registrosImportados.length) throw new Error('Nenhum registro válido foi encontrado na aba de rotinas.');
  return registrosImportados;
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

function gerarLinhasPreview(linhas = [], limite = 6) {
  const limpas = (linhas || []).filter((linha) => Array.isArray(linha) && linha.some((coluna) => String(coluna || '').trim()));
  if (!limpas.length) return { cabecalho: [], linhas: [] };
  const cabecalho = limpas[0].slice(0, 6).map((item) => String(item || '').trim());
  const preview = limpas.slice(1, limite + 1).map((linha) => linha.slice(0, 6).map((item) => String(item ?? '').trim()));
  return { cabecalho, linhas: preview };
}

function renderizarPreviewImportacao() {
  const container = document.getElementById('importPreviewList');
  const resumo = document.getElementById('selectedFilesSummary');
  if (!container || !resumo) return;

  if (!previewsImportacao.length) {
    resumo.textContent = 'Nenhuma planilha selecionada.';
    container.innerHTML = '<div class="empty-state">Selecione uma ou mais planilhas para visualizar a prévia antes de importar.</div>';
    return;
  }

  const arquivosValidos = previewsImportacao.filter((item) => !item.error);
  resumo.textContent = `${previewsImportacao.length} arquivo(s) selecionado(s) • ${arquivosValidos.length} pronto(s) para importação.`;

  container.innerHTML = previewsImportacao.map((item) => {
    if (item.error) {
      return `<div class="preview-card preview-card-error"><div class="preview-card-head"><strong>${escaparHtml(item.fileName)}</strong><span class="status-tag">Falha na leitura</span></div><div class="admin-feedback">${escaparHtml(item.error)}</div></div>`;
    }

    const head = item.preview.cabecalho.length
      ? `<thead><tr>${item.preview.cabecalho.map((coluna) => `<th>${escaparHtml(coluna || 'Coluna')}</th>`).join('')}</tr></thead>`
      : '';
    const body = item.preview.linhas.length
      ? `<tbody>${item.preview.linhas.map((linha) => `<tr>${linha.map((coluna) => `<td>${escaparHtml(coluna)}</td>`).join('')}</tr>`).join('')}</tbody>`
      : '<tbody><tr><td colspan="6">Sem linhas para pré-visualizar.</td></tr></tbody>';

    return `<div class="preview-card">
      <div class="preview-card-head">
        <div>
          <strong>${escaparHtml(item.fileName)}</strong>
          <div class="preview-meta">${item.total} registro(s) reconhecido(s) • aba ${escaparHtml(item.sheetName || 'principal')} • última data ${escaparHtml(item.latestDate || '--')}</div>
        </div>
        <span class="status-tag">Pronta</span>
      </div>
      <div class="table-shell preview-table-shell">
        <table>${head}${body}</table>
      </div>
    </div>`;
  }).join('');
}

async function montarPreviewArquivos() {
  const arquivos = Array.from(fileInput?.files || []);
  previewsImportacao = [];
  renderizarPreviewImportacao();

  if (!arquivos.length) {
    setImportStatus('Selecione uma ou mais planilhas para visualizar a prévia e depois importar.', 'Sem arquivo');
    return;
  }

  setImportStatus(
    arquivos.length === 1 ? `Lendo ${arquivos[0].name} para pré-visualização...` : `Lendo ${arquivos.length} planilhas para pré-visualização...`,
    'Preparando prévia'
  );

  for (const arquivo of arquivos) {
    try {
      const sheets = /\.csv$/i.test(arquivo.name) ? parseCsv(await arquivo.text()) : await parseXlsx(arquivo);
      const baseImportada = normalizarRegistrosImportados(sheets);
      const sheetName = obterNomeAbaRotinas(sheets);
      const preview = gerarLinhasPreview(sheets[sheetName] || Object.values(sheets)[0] || []);
      previewsImportacao.push({
        fileName: arquivo.name,
        sheets,
        baseImportada,
        total: baseImportada.length,
        latestDate: obterUltimaData(baseImportada),
        sheetName,
        preview
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
        ? 'Pré-visualização pronta. Revise os dados e clique em “Importar agora”.'
        : `Pré-visualização pronta para ${validos} planilha(s). Revise os dados e clique em “Importar agora”.`,
      'Prévia pronta'
    );
  } else {
    setImportStatus('Nenhuma das planilhas selecionadas pôde ser lida. Revise o arquivo e tente novamente.', 'Falha na prévia');
  }
}


async function importarArquivo() {
  const arquivos = Array.from(fileInput?.files || []);
  if (!arquivos.length) {
    setImportStatus('Selecione pelo menos um arquivo .xlsx, .xlsm ou .csv para importar.');
    return;
  }

  if (!previewsImportacao.length) {
    await montarPreviewArquivos();
  }

  const previewsValidas = previewsImportacao.filter((item) => !item.error && Array.isArray(item.baseImportada));
  if (!previewsValidas.length) {
    setImportStatus('Nenhuma planilha válida ficou pronta para importação. Corrija os arquivos e tente novamente.', 'Falha na importação');
    return;
  }

  let totalRegistros = 0;
  let arquivosImportados = 0;
  let sincronizados = 0;
  const erros = previewsImportacao.filter((item) => item.error).map((item) => `${item.fileName}: ${item.error}`);

  setImportStatus(
    previewsValidas.length === 1
      ? `Importando ${previewsValidas[0].fileName}...`
      : `Importando ${previewsValidas.length} planilha(s)...`,
    'Importando...'
  );

  for (let index = 0; index < previewsValidas.length; index += 1) {
    const item = previewsValidas[index];
    const snapshot = {
      id: `snap-${Date.now()}-${index}-${item.fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      fileName: item.fileName,
      importedAt: new Date().toISOString(),
      total: item.baseImportada.length,
      latestDate: obterUltimaData(item.baseImportada),
      data: item.baseImportada,
      chunksCount: 0,
      schemaVersion: firebaseDisponivel ? 2 : 1
    };

    const synced = firebaseDisponivel ? await salvarSnapshotNoFirebase(snapshot) : true;
    if (synced) {
      snapshotsImportados.push(snapshot);
      totalRegistros += item.baseImportada.length;
      arquivosImportados += 1;
      if (firebaseDisponivel) sincronizados += 1;
    } else {
      erros.push(`${item.fileName}: falha ao sincronizar no Firebase`);
    }
  }

  persistirSnapshotsLocais();
  atualizarBasePorSnapshots(
    arquivosImportados === 1
      ? `${totalRegistros} registros importados com sucesso. A planilha já está alimentando o painel.`
      : `${totalRegistros} registros importados com sucesso em ${arquivosImportados} planilha(s). Todas já estão alimentando o painel.`
  );

  if (fileInput) fileInput.value = '';
  previewsImportacao = [];
  renderizarPreviewImportacao();

  if (sincronizados === arquivosImportados && !erros.length) {
    setImportStatus(
      arquivosImportados === 1
        ? `${totalRegistros} registros importados com sucesso. A planilha foi anexada e sincronizada.`
        : `${totalRegistros} registros importados com sucesso em ${arquivosImportados} planilha(s). Todas foram anexadas e sincronizadas.`,
      'Importado'
    );
    return;
  }

  if (sincronizados < arquivosImportados) {
    setImportStatus(
      `${totalRegistros} registros importados com sucesso no painel. ${sincronizados} de ${arquivosImportados} planilha(s) sincronizadas online.${erros.length ? ` Falhas de leitura: ${erros.join(' | ')}` : ''}`,
      sincronizados ? 'Importado parcialmente' : 'Importado localmente'
    );
    return;
  }

  if (erros.length) {
    setImportStatus(
      `${arquivosImportados} planilha(s) importada(s) com sucesso e ${erros.length} com falha. ${erros.join(' | ')}`,
      'Importação parcial'
    );
  }
}

async function resetarParaSimulada() {
  const totalAnterior = snapshotsImportados.length;
  snapshotsImportados = [];
  persistirSnapshotsLocais();
  if (fileInput) fileInput.value = '';
  previewsImportacao = [];
  renderizarPreviewImportacao();
  atualizarBasePorSnapshots('Painel limpo com sucesso.');

  const remotoLimpo = await limparSnapshotsNoFirebase();
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

function popularControlesAdmin() {
  const lojas = obterLojasConhecidas();
  const formadores = [...new Set([...Object.values(lojaFormadorMap), ...registrosBase.map((item) => item.formador)].filter(ehFormadorAtivo))].sort();
  preencherSelect(document.getElementById('adminLojaSelect'), lojas, 'Selecione a loja');
  preencherSelect(document.getElementById('renameLojaSelect'), lojas, 'Selecione a loja');
  preencherSelect(document.getElementById('adminFormadorSelect'), formadores, 'Selecione o formador');
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
    container.innerHTML = '<div class="empty-state">Nenhuma planilha importada foi salva ainda.</div>';
    return;
  }

  container.innerHTML = snapshotsImportados.map((snapshot) => {
    const dataImportacao = new Date(snapshot.importedAt).toLocaleString('pt-BR');
    return `
      <div class="history-card">
        <div>
          <div class="history-title">${escaparHtml(snapshot.fileName)}</div>
          <div class="history-meta">Importada em ${dataImportacao} • ${snapshot.total} registros • última data ${escaparHtml(snapshot.latestDate || 'não identificada')}</div>
        </div>
        <div class="status-tag">Incluída no painel</div>
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
  const atualizado = { ...snapshot, data: normalizarBaseCompleta(snapshot.data, 'importada') };
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
  aplicarFiltrosRapido() {
    try { renderizarPainel(); } catch (error) { console.error(error); }
    document.body.classList.remove('sidebar-open');
  },
  limparFiltrosRapido() {
    try { limparFiltros(); } catch (error) { console.error(error); }
    document.body.classList.remove('sidebar-open');
  }
});

function inicializarAplicacao() {
  if (window.__sfPainelInicializado) return;
  window.__sfPainelInicializado = true;
  configurarSidebar();
  configurarEventos();
  configurarAdmin();
  configurarAbasResumo();
  inicializarBaseAtiva();
  inicializarFirebaseOpcional();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarAplicacao);
} else {
  inicializarAplicacao();
}
