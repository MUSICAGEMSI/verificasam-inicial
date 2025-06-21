import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, RefreshCw, Filter, Download, Upload } from 'lucide-react';

const CursosInterface = () => {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocalidade, setSelectedLocalidade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);

  // Configuração do Google Sheets
  const SHEETS_CONFIG = {
    // Sua URL do Google Apps Script
    API_URL: 'https://script.google.com/macros/s/AKfycbwYaLOq52pvR529-aql7b-Hdd5Zm60wrCrk3tr8qTequ0CIA3G52dpQQojg83CN8zI9/exec',
  };

  // Função para processar dados do Google Sheets
  const processarDadosSheets = (dadosRaw) => {
    try {
      // Se os dados vêm do Google Apps Script como JSON
      if (Array.isArray(dadosRaw)) {
        return dadosRaw.map((item, index) => ({
          id: index + 1,
          localidade: item.localidade || '',
          curso: item.curso || '',
          nomenclatura: item.nomenclatura || '',
          matriculados: parseInt(item.matriculados) || 0,
          inicio: item.inicio || '',
          termino: item.termino || '',
          dia: item.dia || '',
          hora: item.hora || '',
          pendente: item.pendente ? item.pendente.split(',').map(d => d.trim()) : [],
          irregular: item.irregular ? item.irregular.split(',').map(d => d.trim()) : [],
          status: item.status || 'ativo'
        }));
      }
      
      // Se os dados vêm da API do Google Sheets (formato de array)
      if (dadosRaw.values) {
        const [headers, ...rows] = dadosRaw.values;
        return rows.map((row, index) => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header.toLowerCase().replace(/\s+/g, '_')] = row[i] || '';
          });
          
          return {
            id: index + 1,
            localidade: obj.localidade || '',
            curso: obj.curso || '',
            nomenclatura: obj.nomenclatura || '',
            matriculados: parseInt(obj.matriculados) || 0,
            inicio: obj.inicio || '',
            termino: obj.termino || '',
            dia: obj.dia || '',
            hora: obj.hora || '',
            pendente: obj.pendente ? obj.pendente.split(',').map(d => d.trim()) : [],
            irregular: obj.irregular ? obj.irregular.split(',').map(d => d.trim()) : [],
            status: obj.status || 'ativo'
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao processar dados do Sheets:', error);
      return [];
    }
  };

  // Função principal para buscar dados - CORRIGIDA PARA CORS
  const fetchCursos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usando JSONP para contornar CORS
      const response = await fetch(`${SHEETS_CONFIG.API_URL}?callback=?`, {
        method: 'GET',
        mode: 'no-cors', // Importante para contornar CORS
      });

      // Como usamos no-cors, não podemos ler a resposta diretamente
      // Vamos usar uma abordagem diferente com script tag para JSONP
      const scriptTag = document.createElement('script');
      const callbackName = `jsonp_callback_${Date.now()}`;
      
      // Criar callback global
      window[callbackName] = (data) => {
        try {
          const dadosProcessados = processarDadosSheets(data);
          setCursos(dadosProcessados);
          setFilteredCursos(dadosProcessados);
          setLastUpdate(new Date());
          setIsConnected(true);
          setError(null);
        } catch (error) {
          console.error('Erro ao processar dados:', error);
          setError('Erro ao processar dados do Google Sheets');
          setIsConnected(false);
        } finally {
          // Limpar
          document.head.removeChild(scriptTag);
          delete window[callbackName];
        }
      };

      // Configurar script para JSONP
      scriptTag.src = `${SHEETS_CONFIG.API_URL}?callback=${callbackName}`;
      scriptTag.onerror = () => {
        setError('Erro ao conectar com Google Sheets. Verifique se o script está publicado corretamente.');
        setIsConnected(false);
        document.head.removeChild(scriptTag);
        delete window[callbackName];
      };

      document.head.appendChild(scriptTag);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao conectar com Google Sheets. Verifique a configuração.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(() => fetchCursos(), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar cursos
  useEffect(() => {
    let filtered = cursos;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(curso =>
        curso.localidade.toLowerCase().includes(search) ||
        curso.curso.toLowerCase().includes(search) ||
        curso.nomenclatura.toLowerCase().includes(search)
      );
    }
    
    if (selectedLocalidade !== 'all') {
      filtered = filtered.filter(curso => curso.localidade === selectedLocalidade);
    }
    
    setFilteredCursos(filtered);
  }, [searchTerm, selectedLocalidade, cursos]);

  // Obter localidades únicas
  const localidades = [...new Set(cursos.map(curso => curso.localidade))];

  const formatarData = (data) => {
    if (!data) return 'N/A';
    const [dia, mes, ano] = data.split('/');
    if (!dia || !mes || !ano) return data;
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (pendente, irregular) => {
    if (irregular.length > 5) return 'bg-red-100 text-red-800';
    if (pendente.length > 3) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (pendente, irregular) => {
    if (irregular.length > 5) return 'Crítico';
    if (pendente.length > 3) return 'Atenção';
    return 'Normal';
  };

  const exportarDados = () => {
    const dataStr = JSON.stringify(filteredCursos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cursos_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Conectando com Google Sheets...</p>
          <p className="text-gray-400 text-sm mt-1">Carregando dados dos cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header com gradiente */}
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-2">
              Dashboard de Cursos
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gerencie e visualize informações dos cursos em tempo real
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Google Sheets Conectado' : 'Desconectado do Google Sheets'}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Erro de Conexão:</span>
              </div>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs">
                📝 <strong>Instruções para corrigir:</strong><br/>
                1. Acesse seu Google Apps Script<br/>
                2. Vá em "Implantar" → "Nova implantação"<br/>
                3. Selecione "Aplicativo da web"<br/>
                4. Em "Executar como" escolha sua conta<br/>
                5. Em "Quem tem acesso" escolha "Qualquer pessoa"<br/>
                6. Clique em "Implantar" e copie a nova URL
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas em destaque */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-indigo-600">
                  {filteredCursos.length}
                </p>
                <p className="text-gray-600 text-sm font-medium">Total de Cursos</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {filteredCursos.reduce((acc, curso) => acc + curso.matriculados, 0)}
                </p>
                <p className="text-gray-600 text-sm font-medium">Total de Alunos</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {filteredCursos.reduce((acc, curso) => acc + curso.pendente.length, 0)}
                </p>
                <p className="text-gray-600 text-sm font-medium">Pendências</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">
                  {filteredCursos.reduce((acc, curso) => acc + curso.irregular.length, 0)}
                </p>
                <p className="text-gray-600 text-sm font-medium">Irregularidades</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros modernos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportarDados}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por localidade, curso ou instrutor..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="lg:w-64">
              <select
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                value={selectedLocalidade}
                onChange={(e) => setSelectedLocalidade(e.target.value)}
              >
                <option value="all">Todas as Localidades</option>
                {localidades.map(localidade => (
                  <option key={localidade} value={localidade}>
                    {localidade}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => fetchCursos()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Cards dos Cursos */}
        <div className="grid gap-6">
          {filteredCursos.map((curso) => (
            <div key={curso.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 overflow-hidden">
              {/* Header com status */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {curso.localidade}
                      </h3>
                      <p className="text-white/90 text-lg font-semibold">
                        {curso.curso}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">
                        {curso.matriculados} alunos
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(curso.pendente, curso.irregular)}`}>
                      {getStatusText(curso.pendente, curso.irregular)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Informações do Curso */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Nomenclatura do Curso
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {curso.nomenclatura}
                  </p>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-blue-600 font-semibold mb-1">INÍCIO</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formatarData(curso.inicio)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-green-600 font-semibold mb-1">TÉRMINO</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formatarData(curso.termino)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-purple-600 font-semibold mb-1">DIA</p>
                    <p className="text-sm font-bold text-gray-800">
                      {curso.dia}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs text-orange-600 font-semibold mb-1">HORÁRIO</p>
                    <p className="text-sm font-bold text-gray-800">
                      {curso.hora}
                    </p>
                  </div>
                </div>

                {/* Status Cards */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Pendentes */}
                  <div className="border-2 border-orange-200 rounded-xl p-5 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <h5 className="font-bold text-orange-800 text-lg">
                          Pendentes
                        </h5>
                      </div>
                      <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                        {curso.pendente.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {curso.pendente.slice(0, 8).map((data, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-200 text-orange-800 text-sm rounded-full font-medium"
                        >
                          {data}
                        </span>
                      ))}
                      {curso.pendente.length > 8 && (
                        <span className="px-3 py-1 bg-orange-300 text-orange-900 text-sm rounded-full font-bold">
                          +{curso.pendente.length - 8} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Irregulares */}
                  <div className="border-2 border-red-200 rounded-xl p-5 bg-gradient-to-br from-red-50 to-pink-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h5 className="font-bold text-red-800 text-lg">
                          Irregulares
                        </h5>
                      </div>
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        {curso.irregular.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {curso.irregular.slice(0, 8).map((data, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-200 text-red-800 text-sm rounded-full font-medium"
                        >
                          {data}
                        </span>
                      ))}
                      {curso.irregular.length > 8 && (
                        <span className="px-3 py-1 bg-red-300 text-red-900 text-sm rounded-full font-bold">
                          +{curso.irregular.length - 8} mais
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredCursos.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isConnected ? (
                <Search className="w-12 h-12 text-gray-400" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {isConnected ? 'Nenhum curso encontrado' : 'Falha na conexão com Google Sheets'}
            </h3>
            <p className="text-gray-500">
              {isConnected 
                ? 'Tente ajustar os filtros de busca ou limpar os campos.'
                : 'Verifique se o Google Apps Script está configurado corretamente.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CursosInterface;