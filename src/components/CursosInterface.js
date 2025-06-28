import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, RefreshCw, Filter, Download, Upload, BookOpen, User } from 'lucide-react';

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
    API_URL: 'https://script.google.com/macros/s/AKfycbwYaLOq52pvR529-aql7b-Hdd5Zm60wrCrk3tr8qTequ0CIA3G52dpQQojg83CN8zI9/exec',
  };

  // Dados de exemplo para demonstração (caso não consiga conectar ao Google Sheets)
  const dadosExemplo = [
    {
      id: 1,
      localidade: "São Paulo - SP",
      curso: "Desenvolvimento Web",
      nomenclatura: "Curso Completo de Teoria e Solfejo",
      matriculados: 25,
      inicio: "15/01/2025",
      termino: "15/06/2025",
      dia: "SÁB",
      hora: "19:00 às 22:00",
      pendente: ["22/01", "29/01"],
      irregular: ["15/01"],
      status: "ativo"
    }
  ];

  // Função para processar dados do Google Sheets
  const processarDadosSheets = (dadosRaw) => {
    try {
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
          pendente: item.pendente ? item.pendente.split(';').map(d => d.trim()).filter(d => d) : [],
          irregular: item.irregular ? item.irregular.split(';').map(d => d.trim()).filter(d => d) : [],
          status: item.status || 'ativo'
        }));
      }
      
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
            pendente: obj.pendente ? obj.pendente.split(';').map(d => d.trim()).filter(d => d) : [],
            irregular: obj.irregular ? obj.irregular.split(';').map(d => d.trim()).filter(d => d) : [],
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

  // Função para buscar dados do Google Sheets com fallback
  const fetchCursos = async () => {
    try {
      setLoading(true);
      setError(null);

      const scriptTag = document.createElement('script');
      const callbackName = `jsonp_callback_${Date.now()}`;
      let timeoutId;

      // Callback para receber os dados do JSONP
      window[callbackName] = (data) => {
        clearTimeout(timeoutId);
        document.head.removeChild(scriptTag);
        delete window[callbackName];
        
        try {
          const dadosProcessados = processarDadosSheets(data);
          if (dadosProcessados.length > 0) {
            setCursos(dadosProcessados);
            setFilteredCursos(dadosProcessados);
            setIsConnected(true);
            setError(null);
          } else {
            throw new Error('Dados vazios ou inválidos');
          }
        } catch (error) {
          console.error('Erro ao processar dados:', error);
          setError('Erro ao processar dados do Google Sheets - usando dados de exemplo');
          setIsConnected(false);
          setCursos(dadosExemplo);
          setFilteredCursos(dadosExemplo);
        }
        
        setLastUpdate(new Date());
        setLoading(false);
      };

      // Timeout para fallback
      timeoutId = setTimeout(() => {
        if (document.head.contains(scriptTag)) {
          document.head.removeChild(scriptTag);
        }
        delete window[callbackName];
        
        setError('Timeout ao conectar com Google Sheets - usando dados de exemplo');
        setIsConnected(false);
        setCursos(dadosExemplo);
        setFilteredCursos(dadosExemplo);
        setLastUpdate(new Date());
        setLoading(false);
      }, 10000); // 10 segundos

      // Adicionar script para JSONP
      scriptTag.src = `${SHEETS_CONFIG.API_URL}?callback=${callbackName}`;
      scriptTag.onerror = () => {
        clearTimeout(timeoutId);
        if (document.head.contains(scriptTag)) {
          document.head.removeChild(scriptTag);
        }
        delete window[callbackName];
        
        setError('Erro de rede ao conectar com Google Sheets - usando dados de exemplo');
        setIsConnected(false);
        setCursos(dadosExemplo);
        setFilteredCursos(dadosExemplo);
        setLastUpdate(new Date());
        setLoading(false);
      };
      
      document.head.appendChild(scriptTag);
      
    } catch (error) {
      console.error('Erro geral:', error);
      setError('Erro ao conectar com Google Sheets - usando dados de exemplo');
      setIsConnected(false);
      setCursos(dadosExemplo);
      setFilteredCursos(dadosExemplo);
      setLastUpdate(new Date());
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
    try {
      const [dia, mes, ano] = data.split('/');
      if (!dia || !mes || !ano) return data;
      return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  };

  const getStatusColor = (pendente, irregular) => {
    if (irregular.length > 2) return 'critical';
    if (pendente.length > 1) return 'warning';
    return 'normal';
  };

  const getStatusText = (pendente, irregular) => {
    if (irregular.length > 2) return 'Crítico';
    if (pendente.length > 1) return 'Atenção';
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

  const handleRefresh = () => {
    fetchCursos();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocalidade('all');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    // Novo estilo para o header customizado
    headerContainer: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    mainTitle: {
      fontSize: '2.2em',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    infoSection: {
      background: 'rgba(255,255,255,0.1)',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px',
      backdropFilter: 'blur(10px)'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '12px',
      fontSize: '1em'
    },
    bullet: {
      color: '#ffd700',
      fontWeight: 'bold',
      marginRight: '10px',
      fontSize: '1.2em'
    },
    updateInfo: {
      background: 'rgba(255,255,255,0.15)',
      padding: '15px',
      borderRadius: '6px',
      marginTop: '15px',
      textAlign: 'center',
      fontWeight: '500',
      borderLeft: '4px solid #ffd700'
    },
    icon: {
      display: 'inline-block',
      marginRight: '8px',
      fontSize: '1.1em'
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      fontSize: '0.9rem',
      color: '#64748b'
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#991b1b',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem',
      textAlign: 'center'
    },
    warningMessage: {
      backgroundColor: '#fffbeb',
      border: '1px solid #fed7aa',
      color: '#92400e',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem',
      textAlign: 'center'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    },
    statCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#64748b',
      marginTop: '5px'
    },
    filterBar: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginBottom: '30px'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto',
      gap: '15px',
      alignItems: 'center'
    },
    searchInput: {
      width: '100%',
      padding: '12px 15px 12px 40px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    select: {
      padding: '12px 15px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      minWidth: '200px',
      outline: 'none'
    },
    button: {
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    courseCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginBottom: '25px',
      overflow: 'hidden'
    },
    courseHeader: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      color: 'white',
      padding: '25px'
    },
    courseHeaderGrid: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    courseTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    courseSubtitle: {
      fontSize: '1rem',
      opacity: '0.9'
    },
    courseBody: {
      padding: '25px'
    },
    courseDescription: {
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '25px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '25px'
    },
    infoCard: {
      textAlign: 'center',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    statusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    statusCard: {
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    statusHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statusTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    studentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    studentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column'
    },
    spinner: {
      border: '4px solid #e2e8f0',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{color: '#64748b', fontWeight: '500', marginBottom: '8px'}}>
            Conectando...
          </p>
          <p style={{color: '#64748b', fontSize: '0.9rem'}}>
            Carregando dados dos cursos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        button:hover {
          opacity: 0.9;
        }
        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      
      <div style={styles.main}>  
        {/* Header Customizado */}
        <div style={styles.headerContainer}>
          <h1 style={styles.mainTitle}>
            <span style={styles.icon}>📊</span>
            Monitoria aos Lançamentos - SAM/Hortolândia-SP
          </h1>
          
          <div style={styles.infoSection}>
            <div style={styles.infoItem}>
              <span style={styles.bullet}>•</span>
              <span><strong>Pendências:</strong> aulas que não foram lançadas</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.bullet}>•</span>
              <span><strong>Irregularidades:</strong> aulas lançadas que não possuem registros</span>
            </div>
            
            <div style={styles.updateInfo}>
              <span style={styles.icon}>🔄</span>
              <strong>Atualização:</strong> diariamente às 10h00
            </div>
          </div>
              
          <div style={styles.statusBar}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Clock size={16} />
              <span>Atualizado: {lastUpdate.toLocaleString('pt-BR')}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#f59e0b'
              }}></div>
              <span style={{color: isConnected ? '#10b981' : '#f59e0b', fontWeight: '500'}}>
                {isConnected ? 'Conectado' : 'Modo Demonstração'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem de Status */}
        {error && !isConnected && (
          <div style={styles.warningMessage}>
            <AlertTriangle size={16} style={{display: 'inline', marginRight: '8px'}} />
            {error}
          </div>
        )}

        {/* Estatísticas */}
        <div style={styles.statsGrid} className="stats-grid">
          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div>
                <div style={styles.statNumber}>{filteredCursos.length}</div>
                <div style={styles.statLabel}>Total de Cursos</div>
              </div>
              <BookOpen size={32} color="#3b82f6" />
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div>
                <div style={styles.statNumber}>
                  {filteredCursos.reduce((acc, curso) => acc + curso.matriculados, 0)}
                </div>
                <div style={styles.statLabel}>Total de Alunos</div>
              </div>
              <Users size={32} color="#10b981" />
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div>
                <div style={styles.statNumber}>
                  {filteredCursos.reduce((acc, curso) => acc + curso.pendente.length, 0)}
                </div>
                <div style={styles.statLabel}>Pendências</div>
              </div>
              <AlertTriangle size={32} color="#f59e0b" />
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div>
                <div style={styles.statNumber}>
                  {filteredCursos.reduce((acc, curso) => acc + curso.irregular.length, 0)}
                </div>
                <div style={styles.statLabel}>Irregularidades</div>
              </div>
              <AlertTriangle size={32} color="#ef4444" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filterBar}>
          <div style={styles.filterGrid} className="filter-grid">
            <div style={{position: 'relative'}}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Buscar cursos, localidades ou instrutores..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              style={styles.select}
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
            
            <button
              style={{...styles.button, ...styles.buttonSuccess}}
              onClick={exportarDados}
            >
              <Download size={16} />
              Exportar
            </button>
            
            <button
              style={{...styles.button, ...styles.buttonPrimary}}
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards dos Cursos */}
        <div>
          {filteredCursos.map((curso) => (
            <div key={curso.id} style={styles.courseCard}>
              {/* Header do Card */}
              <div style={styles.courseHeader}>
                <div style={styles.courseHeaderGrid}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 style={styles.courseTitle}>{curso.localidade}</h3>
                      <p style={styles.courseSubtitle}>{curso.curso}</p>
                    </div>
                  </div>
                  
                  <div style={{textAlign: 'right'}}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '8px 15px',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <Users size={16} />
                      <span>{curso.matriculados} alunos</span>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(curso.pendente, curso.irregular) === 'critical' ? '#fef2f2' : 
                                      getStatusColor(curso.pendente, curso.irregular) === 'warning' ? '#fffbeb' : '#f0fdf4',
                      color: getStatusColor(curso.pendente, curso.irregular) === 'critical' ? '#dc2626' : 
                             getStatusColor(curso.pendente, curso.irregular) === 'warning' ? '#d97706' : '#16a34a',
                      border: `1px solid ${getStatusColor(curso.pendente, curso.irregular) === 'critical' ? '#fecaca' : 
                                             getStatusColor(curso.pendente, curso.irregular) === 'warning' ? '#fed7aa' : '#bbf7d0'}`
                    }}>
                      {getStatusText(curso.pendente, curso.irregular)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.courseBody}>
                {/* Descrição */}
                <div style={styles.courseDescription}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Descrição do Curso
                  </h4>
                  <p style={{color: '#374151', lineHeight: '1.6'}}>
                    {curso.nomenclatura}
                  </p>
                </div>

                {/* Informações do Cronograma */}
                <div style={styles.infoGrid}>
                  <div style={{...styles.infoCard, backgroundColor: '#eff6ff'}}>
                    <Calendar size={24} color="#3b82f6" style={{margin: '0 auto 10px'}} />
                    <p style={{fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600', marginBottom: '5px'}}>INÍCIO</p>
                    <p style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#1f2937'}}>
                      {formatarData(curso.inicio)}
                    </p>
                  </div>
                  
                  <div style={{...styles.infoCard, backgroundColor: '#f0fdf4'}}>
                    <Calendar size={24} color="#16a34a" style={{margin: '0 auto 10px'}} />
                    <p style={{fontSize: '0.8rem', color: '#16a34a', fontWeight: '600', marginBottom: '5px'}}>TÉRMINO</p>
                    <p style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#1f2937'}}>
                      {formatarData(curso.termino)}
                    </p>
                  </div>
                  
                  <div style={{...styles.infoCard, backgroundColor: '#faf5ff'}}>
                    <Calendar size={24} color="#9333ea" style={{margin: '0 auto 10px'}} />
                    <p style={{fontSize: '0.8rem', color: '#9333ea', fontWeight: '600', marginBottom: '5px'}}>DIA</p>
                    <p style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#1f2937'}}>
                      {curso.dia}
                    </p>
                  </div>
                  
                  <div style={{...styles.infoCard, backgroundColor: '#fff7ed'}}>
                    <Clock size={24} color="#ea580c" style={{margin: '0 auto 10px'}} />
                    <p style={{fontSize: '0.8rem', color: '#ea580c', fontWeight: '600', marginBottom: '5px'}}>HORÁRIO</p>
                    <p style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#1f2937'}}>
                      {curso.hora}
                    </p>
                  </div>
                </div>

                {/* Status dos Alunos */}
                <div style={styles.statusGrid}>
                  {/* Pendências */}
                  <div style={{
                    ...styles.statusCard,
                    backgroundColor: curso.pendente.length > 1 ? '#fffbeb' : '#f8fafc',
                    borderColor: curso.pendente.length > 1 ? '#fed7aa' : '#e2e8f0'
                  }}>
                    <div style={styles.statusHeader}>
                      <div style={styles.statusTitle}>
                        <AlertTriangle 
                          size={20} 
                          color={curso.pendente.length > 1 ? '#d97706' : '#6b7280'} 
                        />
                        <span style={{color: curso.pendente.length > 3 ? '#d97706' : '#374151'}}>
                          Pendências
                        </span>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: curso.pendente.length > 1 ? '#fed7aa' : '#e5e7eb',
                        color: curso.pendente.length > 1 ? '#92400e' : '#6b7280'
                      }}>
                        {curso.pendente.length}
                      </span>
                    </div>
                    
                    <div style={styles.studentList}>
                      {curso.pendente.length === 0 ? (
                        <div style={{
                          ...styles.studentItem,
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          <CheckCircle size={16} color="#10b981" />
                          Nenhuma pendência
                        </div>
                      ) : (
                        curso.pendente.map((nome, index) => (
                          <div key={index} style={styles.studentItem}>
                            <User size={14} color="#d97706" />
                            <span style={{color: '#374151'}}>{nome}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Irregularidades */}
                  <div style={{
                    ...styles.statusCard,
                    backgroundColor: curso.irregular.length > 2 ? '#fef2f2' : 
                                    curso.irregular.length > 0 ? '#fffbeb' : '#f8fafc',
                    borderColor: curso.irregular.length > 2 ? '#fecaca' : 
                                curso.irregular.length > 0 ? '#fed7aa' : '#e2e8f0'
                  }}>
                    <div style={styles.statusHeader}>
                      <div style={styles.statusTitle}>
                        <AlertTriangle 
                          size={20} 
                          color={curso.irregular.length > 2 ? '#dc2626' : 
                                 curso.irregular.length > 0 ? '#d97706' : '#6b7280'} 
                        />
                        <span style={{
                          color: curso.irregular.length > 2 ? '#dc2626' : 
                                 curso.irregular.length > 0 ? '#d97706' : '#374151'
                        }}>
                          Irregularidades
                        </span>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: curso.irregular.length > 2 ? '#fecaca' : 
                                        curso.irregular.length > 0 ? '#fed7aa' : '#e5e7eb',
                        color: curso.irregular.length > 2 ? '#991b1b' : 
                               curso.irregular.length > 0 ? '#92400e' : '#6b7280'
                      }}>
                        {curso.irregular.length}
                      </span>
                    </div>
                    
                    <div style={styles.studentList}>
                      {curso.irregular.length === 0 ? (
                        <div style={{
                          ...styles.studentItem,
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          <CheckCircle size={16} color="#10b981" />
                          Nenhuma irregularidade
                        </div>
                      ) : (
                        curso.irregular.map((nome, index) => (
                          <div key={index} style={styles.studentItem}>
                            <User size={14} color="#dc2626" />
                            <span style={{color: '#374151'}}>{nome}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há cursos */}
        {filteredCursos.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <BookOpen size={48} color="#9ca3af" style={{margin: '0 auto 20px'}} />
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '10px'
            }}>
              Nenhum curso encontrado
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Tente ajustar os filtros ou limpar a busca para ver mais resultados.
            </p>
            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                margin: '0 auto'
              }}
              onClick={clearFilters}
            >
              <Filter size={16} />
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

{/* Footer */}
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280',
      borderTop: '1px solid #e5e7eb',
      marginTop: '40px'
    }}>
      <p style={{fontSize: '0.85rem'}}>
        Monitoria aos Lançamentos - SAM/Hortolândia-SP
      </p>
      <p style={{fontSize: '0.8rem', marginTop: '5px'}}>
        Desenvolvido pelos Multiplicadores do SAM • Última atualização: {(() => {
          const today = new Date();
          today.setHours(10, 0, 0, 0); // Define para 10:00:00
          return today.toLocaleString('pt-BR');
        })()}
      </p>
    </div>
  </div>
  );
};

export default CursosInterface;
