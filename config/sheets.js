// config/sheets.js
// Configurações para integração com Google Sheets

export const SHEETS_CONFIG = {
  // ===== GOOGLE APPS SCRIPT (RECOMENDADO) =====
  // Substitua pela URL do seu Google Apps Script após deployment
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbziKkwzlkYIvhSjKq55VxYZERDEn82I2oBwCaRXuV1hUvsa5fqTHVnzZYyu5H__NFRk/exec',
  
  // ===== API DIRETA DO GOOGLE SHEETS =====
  // Para usar a API direta, você precisa:
  // 1. ID da planilha (extraído da URL do Google Sheets)
  SPREADSHEET_ID: '13qDhEmCBYRvBNVRiik626tefVzd9W2zIFUQQaqAXB5E',
  
  // 2. Nome da aba (Sheet) - geralmente "Sheet1"
  SHEET_NAME: 'VERIFICASAM',
  
  // 3. Chave da API do Google Cloud Console
  API_KEY: 'SUA_API_KEY_AQUI',
  
  // 4. Range de células (A:Z pega todas as colunas)
  RANGE: 'A:Z',
  
  // ===== CONFIGURAÇÕES AVANÇADAS =====
  // Intervalo de atualização automática (em milissegundos)
  AUTO_UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutos
  
  // Timeout para requisições (em milissegundos)
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Retry automático em caso de falha
  MAX_RETRIES: 3,
  
  // Headers customizados para requisições
  CUSTOM_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Mapeamento de colunas da planilha
export const COLUMN_MAPPING = {
  // Chave: nome do campo no componente
  // Valor: nome da coluna na planilha (case-insensitive)
  localidade: 'localidade',
  curso: 'curso', 
  nomenclatura: 'nomenclatura',
  matriculados: 'matriculados',
  inicio: 'inicio',
  termino: 'termino',
  dia: 'dia',
  hora: 'hora',
  pendente: 'pendente',
  irregular: 'irregular',
  status: 'status'
};

// Validação de dados
export const DATA_VALIDATION = {
  // Campos obrigatórios
  required_fields: ['localidade', 'curso', 'nomenclatura'],
  
  // Tipos de dados esperados
  field_types: {
    matriculados: 'number',
    inicio: 'date',
    termino: 'date',
    pendente: 'array',
    irregular: 'array'
  },
  
  // Separador para campos de array (pendente, irregular)
  array_separator: ',',
  
  // Formato de data esperado
  date_format: 'DD/MM/YYYY'
};

// Função para construir URL da API do Google Sheets
export const buildSheetsApiUrl = () => {
  const { SPREADSHEET_ID, SHEET_NAME, RANGE, API_KEY } = SHEETS_CONFIG;
  return `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;
};

// Função para validar configuração
export const validateConfig = () => {
  const errors = [];
  
  if (!SHEETS_CONFIG.APPS_SCRIPT_URL.includes('script.google.com') && 
      SHEETS_CONFIG.APPS_SCRIPT_URL.includes('SEU_SCRIPT_ID_AQUI')) {
    errors.push('APPS_SCRIPT_URL não configurada corretamente');
  }
  
  if (SHEETS_CONFIG.SPREADSHEET_ID === 'SEU_SPREADSHEET_ID_AQUI') {
    errors.push('SPREADSHEET_ID não configurado');
  }
  
  if (SHEETS_CONFIG.API_KEY === 'SUA_API_KEY_AQUI') {
    errors.push('API_KEY não configurada');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Dados de exemplo para demonstração
export const SAMPLE_DATA = [
  {
    id: 1,
    localidade: "Jardim Aline",
    curso: "TEORIA MUSICAL",
    nomenclatura: "TURMA 02 - TEORIA E SOLFEJO MSA - INSTRUTOR RESPONSÁVEL: ELIEZER VIEIRA",
    matriculados: 4,
    inicio: "11/08/2023",
    termino: "11/08/2026",
    dia: "SEX",
    hora: "20:00 ÀS 21:00",
    pendente: ["28-mar", "25-abr", "23-mai", "30-mai", "06-jun"],
    irregular: ["28-mar", "25-abr", "23-mai", "30-mai", "06-jun"],
    status: "ativo"
  },
  {
    id: 2,
    localidade: "Jardim Amanda I",
    curso: "TUBA",
    nomenclatura: "TURMA 03 - TEORIA E SOLFEJO MSA - INSTRUTOR RESPONSÁVEL: AYRTON ALBERTO & JOSE CARLOS ALEIXO",
    matriculados: 1,
    inicio: "01/07/2024",
    termino: "31/12/2025",
    dia: "QUA",
    hora: "19:30 ÀS 21:00",
    pendente: ["05-fev", "12-fev", "19-fev", "26-fev", "05-mar", "12-mar", "19-mar", "26-mar", "02-abr", "09-abr", "16-abr", "23-abr", "30-abr", "14-mai", "21-mai", "28-mai", "04-jun", "11-jun"],
    irregular: ["05-fev", "12-fev", "19-fev", "26-fev", "05-mar", "12-mar", "19-mar", "26-mar", "02-abr", "09-abr", "16-abr", "23-abr", "30-abr", "14-mai", "21-mai", "28-mai", "04-jun", "11-jun"],
    status: "ativo"
  },
  {
    id: 3,
    localidade: "Centro",
    curso: "VIOLÃO",
    nomenclatura: "TURMA 01 - VIOLÃO BÁSICO - INSTRUTOR RESPONSÁVEL: MARIA SILVA",
    matriculados: 8,
    inicio: "15/03/2024",
    termino: "15/12/2024",
    dia: "TER",
    hora: "14:00 ÀS 15:30",
    pendente: ["12-mar", "19-mar"],
    irregular: ["05-mar"],
    status: "ativo"
  },
  {
    id: 4,
    localidade: "Vila Nova",
    curso: "PIANO",
    nomenclatura: "TURMA 04 - PIANO INTERMEDIÁRIO - INSTRUTOR RESPONSÁVEL: JOÃO SANTOS",
    matriculados: 6,
    inicio: "20/02/2024",
    termino: "20/11/2024",
    dia: "SEG",
    hora: "16:00 ÀS 17:30",
    pendente: [],
    irregular: ["15-fev"],
    status: "ativo"
  },
  {
    id: 5,
    localidade: "Jardim das Flores",
    curso: "VIOLINO",
    nomenclatura: "TURMA 01 - VIOLINO INICIANTE - INSTRUTOR RESPONSÁVEL: ANA PAULA",
    matriculados: 12,
    inicio: "10/01/2024",
    termino: "10/12/2024",
    dia: "QUI",
    hora: "15:00 ÀS 16:30",
    pendente: ["14-mar", "21-mar", "28-mar"],
    irregular: ["07-mar"],
    status: "ativo"
  }
];

export default SHEETS_CONFIG;