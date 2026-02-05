/**
 * search-utils.js
 * Módulo de búsqueda avanzada: indexación y búsqueda por texto completo
 */

class SearchManager {
    constructor() {
        this.clientes = [];
        this.cobranza = [];
        this.gastos = [];
        this.clientesIndex = {};
        this.cobranzaIndex = {};
        this.gastosIndex = {};
    }

    /**
     * Carga datos desde Firebase para búsqueda
     */
    async loadData() {
        try {
            // Cargar clientes
            const clientesSnapshot = await db.collection('clientes').get();
            this.clientes = clientesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                tipo: 'cliente'
            }));
            this.indexClientes();

            // Cargar cobranza
            const cobranzaSnapshot = await db.collection('cobranza').get();
            this.cobranza = cobranzaSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(),
                tipo: 'cobranza'
            }));
            this.indexCobranza();

            // Cargar gastos
            const gastosSnapshot = await db.collection('gastos').get();
            this.gastos = gastosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(),
                tipo: 'gasto'
            }));
            this.indexGastos();

            return true;
        } catch (error) {
            console.error('Error cargando datos para búsqueda:', error);
            return false;
        }
    }

    /**
     * Indexa clientes para búsqueda rápida
     */
    indexClientes() {
        this.clientesIndex = {};
        this.clientes.forEach(cliente => {
            const terms = this.extractTerms(cliente.nombre, cliente.dni, cliente.telefono, cliente.email);
            terms.forEach(term => {
                if (!this.clientesIndex[term]) {
                    this.clientesIndex[term] = [];
                }
                if (!this.clientesIndex[term].includes(cliente.id)) {
                    this.clientesIndex[term].push(cliente.id);
                }
            });
        });
    }

    /**
     * Indexa cobranza para búsqueda rápida
     */
    indexCobranza() {
        this.cobranzaIndex = {};
        this.cobranza.forEach(item => {
            const terms = this.extractTerms(item.cliente, item.empleado, item.servicio);
            terms.forEach(term => {
                if (!this.cobranzaIndex[term]) {
                    this.cobranzaIndex[term] = [];
                }
                if (!this.cobranzaIndex[term].includes(item.id)) {
                    this.cobranzaIndex[term].push(item.id);
                }
            });
        });
    }

    /**
     * Indexa gastos para búsqueda rápida
     */
    indexGastos() {
        this.gastosIndex = {};
        this.gastos.forEach(item => {
            const terms = this.extractTerms(item.descripcion, item.categoria, item.proveedor);
            terms.forEach(term => {
                if (!this.gastosIndex[term]) {
                    this.gastosIndex[term] = [];
                }
                if (!this.gastosIndex[term].includes(item.id)) {
                    this.gastosIndex[term].push(item.id);
                }
            });
        });
    }

    /**
     * Extrae términos de búsqueda de un texto
     */
    extractTerms(...values) {
        const terms = new Set();
        values.forEach(value => {
            if (value && typeof value === 'string') {
                const words = value.toLowerCase().trim().split(/\s+/);
                words.forEach(word => {
                    // Agregar palabra completa y fragmentos
                    if (word.length > 2) {
                        terms.add(word);
                        for (let i = 3; i <= word.length; i++) {
                            terms.add(word.substring(0, i));
                        }
                    }
                });
            }
        });
        return Array.from(terms);
    }

    /**
     * Búsqueda en clientes
     */
    searchClientes(query, filtros = {}) {
        if (!query || query.trim().length === 0) {
            return this.filterClientes(this.clientes, filtros);
        }

        const queryTerms = this.extractTerms(query);
        let resultados = new Set();

        // Primera pasada: búsqueda exacta o cercana
        queryTerms.forEach(term => {
            if (this.clientesIndex[term]) {
                this.clientesIndex[term].forEach(id => resultados.add(id));
            }
        });

        // Si no hay resultados, hacer búsqueda por coincidencia parcial
        if (resultados.size === 0) {
            this.clientes.forEach(cliente => {
                if (this.matchesQuery(query, cliente.nombre, cliente.dni, cliente.telefono, cliente.email)) {
                    resultados.add(cliente.id);
                }
            });
        }

        // Convertir a array y obtener objetos completos
        let clientes = Array.from(resultados).map(id => 
            this.clientes.find(c => c.id === id)
        ).filter(Boolean);

        // Aplicar filtros
        clientes = this.filterClientes(clientes, filtros);

        // Puntaje de relevancia
        clientes = clientes.map(cliente => ({
            ...cliente,
            relevancia: this.calculateRelevance(query, cliente.nombre, cliente.dni)
        })).sort((a, b) => b.relevancia - a.relevancia);

        return clientes;
    }

    /**
     * Búsqueda en cobranza
     */
    searchCobranza(query, filtros = {}) {
        if (!query || query.trim().length === 0) {
            return this.filterCobranza(this.cobranza, filtros);
        }

        const queryTerms = this.extractTerms(query);
        let resultados = new Set();

        queryTerms.forEach(term => {
            if (this.cobranzaIndex[term]) {
                this.cobranzaIndex[term].forEach(id => resultados.add(id));
            }
        });

        if (resultados.size === 0) {
            this.cobranza.forEach(item => {
                if (this.matchesQuery(query, item.cliente, item.empleado, item.servicio)) {
                    resultados.add(item.id);
                }
            });
        }

        let cobranza = Array.from(resultados).map(id => 
            this.cobranza.find(c => c.id === id)
        ).filter(Boolean);

        cobranza = this.filterCobranza(cobranza, filtros);

        return cobranza.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Búsqueda en gastos
     */
    searchGastos(query, filtros = {}) {
        if (!query || query.trim().length === 0) {
            return this.filterGastos(this.gastos, filtros);
        }

        const queryTerms = this.extractTerms(query);
        let resultados = new Set();

        queryTerms.forEach(term => {
            if (this.gastosIndex[term]) {
                this.gastosIndex[term].forEach(id => resultados.add(id));
            }
        });

        if (resultados.size === 0) {
            this.gastos.forEach(item => {
                if (this.matchesQuery(query, item.descripcion, item.categoria, item.proveedor)) {
                    resultados.add(item.id);
                }
            });
        }

        let gastos = Array.from(resultados).map(id => 
            this.gastos.find(g => g.id === id)
        ).filter(Boolean);

        gastos = this.filterGastos(gastos, filtros);

        return gastos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Búsqueda global en todos los tipos
     */
    searchAll(query, tiposIncluir = ['cliente', 'cobranza', 'gasto']) {
        const resultados = {
            clientes: [],
            cobranza: [],
            gastos: [],
            total: 0
        };

        if (tiposIncluir.includes('cliente')) {
            resultados.clientes = this.searchClientes(query);
        }
        if (tiposIncluir.includes('cobranza')) {
            resultados.cobranza = this.searchCobranza(query);
        }
        if (tiposIncluir.includes('gasto')) {
            resultados.gastos = this.searchGastos(query);
        }

        resultados.total = resultados.clientes.length + resultados.cobranza.length + resultados.gastos.length;

        return resultados;
    }

    /**
     * Verifica si un query coincide con los valores
     */
    matchesQuery(query, ...values) {
        const queryLower = query.toLowerCase();
        return values.some(value => 
            value && typeof value === 'string' && value.toLowerCase().includes(queryLower)
        );
    }

    /**
     * Calcula puntuación de relevancia
     */
    calculateRelevance(query, ...values) {
        let score = 0;
        const queryLower = query.toLowerCase();

        values.forEach(value => {
            if (!value || typeof value !== 'string') return;
            const valueLower = value.toLowerCase();

            // Coincidencia exacta: máxima relevancia
            if (valueLower === queryLower) score += 100;
            // Comienza con query
            else if (valueLower.startsWith(queryLower)) score += 50;
            // Contiene palabra que comienza con query
            else if (valueLower.split(/\s+/).some(word => word.startsWith(queryLower))) score += 25;
            // Contiene query
            else if (valueLower.includes(queryLower)) score += 10;
        });

        return score;
    }

    /**
     * Filtra clientes por criterios
     */
    filterClientes(clientes, filtros) {
        let resultado = clientes;

        if (filtros.dni) {
            resultado = resultado.filter(c => c.dni && c.dni.includes(filtros.dni));
        }

        if (filtros.telefono) {
            resultado = resultado.filter(c => c.telefono && c.telefono.includes(filtros.telefono));
        }

        if (filtros.email) {
            resultado = resultado.filter(c => c.email && c.email.includes(filtros.email));
        }

        return resultado;
    }

    /**
     * Filtra cobranza por criterios
     */
    filterCobranza(cobranza, filtros) {
        let resultado = cobranza;

        if (filtros.empleado) {
            resultado = resultado.filter(c => c.empleado === filtros.empleado);
        }

        if (filtros.servicio) {
            resultado = resultado.filter(c => c.servicio === filtros.servicio);
        }

        if (filtros.montoMin) {
            resultado = resultado.filter(c => (c.monto || 0) >= parseFloat(filtros.montoMin));
        }

        if (filtros.montoMax) {
            resultado = resultado.filter(c => (c.monto || 0) <= parseFloat(filtros.montoMax));
        }

        if (filtros.startDate) {
            const start = new Date(filtros.startDate).setHours(0, 0, 0, 0);
            resultado = resultado.filter(c => new Date(c.timestamp).getTime() >= start);
        }

        if (filtros.endDate) {
            const end = new Date(filtros.endDate).setHours(23, 59, 59, 999);
            resultado = resultado.filter(c => new Date(c.timestamp).getTime() <= end);
        }

        return resultado;
    }

    /**
     * Filtra gastos por criterios
     */
    filterGastos(gastos, filtros) {
        let resultado = gastos;

        if (filtros.categoria) {
            resultado = resultado.filter(g => g.categoria === filtros.categoria);
        }

        if (filtros.proveedor) {
            resultado = resultado.filter(g => g.proveedor && g.proveedor.includes(filtros.proveedor));
        }

        if (filtros.montoMin) {
            resultado = resultado.filter(g => (g.monto || 0) >= parseFloat(filtros.montoMin));
        }

        if (filtros.montoMax) {
            resultado = resultado.filter(g => (g.monto || 0) <= parseFloat(filtros.montoMax));
        }

        if (filtros.startDate) {
            const start = new Date(filtros.startDate).setHours(0, 0, 0, 0);
            resultado = resultado.filter(g => new Date(g.timestamp).getTime() >= start);
        }

        if (filtros.endDate) {
            const end = new Date(filtros.endDate).setHours(23, 59, 59, 999);
            resultado = resultado.filter(g => new Date(g.timestamp).getTime() <= end);
        }

        return resultado;
    }

    /**
     * Obtiene opciones únicas para filtros
     */
    getFilterOptions() {
        return {
            empleados: [...new Set(this.cobranza.map(c => c.empleado).filter(Boolean))],
            servicios: [...new Set(this.cobranza.map(c => c.servicio).filter(Boolean))],
            categorias: [...new Set(this.gastos.map(g => g.categoria).filter(Boolean))],
            proveedores: [...new Set(this.gastos.map(g => g.proveedor).filter(Boolean))]
        };
    }

    /**
     * Historial de búsquedas recientes
     */
    getRecentSearches(limit = 10) {
        const stored = localStorage.getItem('recentSearches');
        return stored ? JSON.parse(stored).slice(0, limit) : [];
    }

    /**
     * Guarda una búsqueda reciente
     */
    saveRecentSearch(query) {
        if (!query || query.trim().length === 0) return;
        
        const stored = localStorage.getItem('recentSearches');
        let searches = stored ? JSON.parse(stored) : [];
        
        // Remover duplicados
        searches = searches.filter(s => s !== query);
        
        // Agregar al inicio
        searches.unshift(query);
        
        // Guardar máximo 20
        searches = searches.slice(0, 20);
        
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    }

    /**
     * Limpia historial de búsquedas
     */
    clearSearchHistory() {
        localStorage.removeItem('recentSearches');
    }

    /**
     * Exporta resultados de búsqueda
     */
    exportResults(resultados, tipo, formato = 'csv') {
        if (formato === 'csv') {
            return this.exportToCSV(resultados, tipo);
        } else if (formato === 'json') {
            return this.exportToJSON(resultados, tipo);
        }
    }

    /**
     * Exporta a CSV
     */
    exportToCSV(resultados, tipo) {
        let csv = '';
        let datos = [];

        if (tipo === 'cliente') datos = resultados;
        else if (tipo === 'cobranza') datos = resultados;
        else if (tipo === 'gasto') datos = resultados;

        if (datos.length === 0) {
            showWarning('No hay resultados para exportar');
            return;
        }

        // Headers
        const headers = Object.keys(datos[0]).filter(k => k !== 'id' && k !== 'tipo');
        csv += headers.join(',') + '\n';

        // Data
        datos.forEach(row => {
            csv += headers.map(h => {
                let val = row[h];
                if (typeof val === 'object') val = JSON.stringify(val);
                if (typeof val === 'string' && val.includes(',')) {
                    val = `"${val}"`;
                }
                return val;
            }).join(',') + '\n';
        });

        // Descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `resultados_${tipo}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess(`Resultados exportados como CSV`);
    }

    /**
     * Exporta a JSON
     */
    exportToJSON(resultados, tipo) {
        const blob = new Blob([JSON.stringify(resultados, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `resultados_${tipo}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess(`Resultados exportados como JSON`);
    }

    /**
     * Busca con límite de resultados
     */
    searchWithPagination(query, tipo, page = 1, pageSize = 20, filtros = {}) {
        let resultados;

        if (tipo === 'cliente') {
            resultados = this.searchClientes(query, filtros);
        } else if (tipo === 'cobranza') {
            resultados = this.searchCobranza(query, filtros);
        } else if (tipo === 'gasto') {
            resultados = this.searchGastos(query, filtros);
        } else {
            return null;
        }

        const total = resultados.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return {
            datos: resultados.slice(start, end),
            total,
            page,
            pageSize,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }
}

// Instancia global
const searchManager = new SearchManager();
