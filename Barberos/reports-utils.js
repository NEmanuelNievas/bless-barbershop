/**
 * reports-utils.js
 * Módulo de reportes avanzados: filtrado, estadísticas, gráficos y exportación
 */

class ReportsManager {
    constructor() {
        this.cobranzaData = [];
        this.gastosData = [];
        this.clientesData = [];
        this.precios = {};
        this.empleados = [];
    }

    /**
     * Carga datos desde Firebase para generar reportes
     */
    async loadData() {
        try {
            // Cargar cobranza
            const cobranzaSnapshot = await db.collection('cobranza').get();
            this.cobranzaData = cobranzaSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
            }));

            // Cargar gastos
            const gastosSnapshot = await db.collection('gastos').get();
            this.gastosData = gastosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
            }));

            // Cargar clientes
            const clientesSnapshot = await db.collection('clientes').get();
            this.clientesData = clientesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Cargar precios
            const preciosSnapshot = await db.collection('config').doc('precios').get();
            this.precios = preciosSnapshot.exists ? preciosSnapshot.data() : {};

            // Cargar empleados únicos de cobranza
            this.empleados = [...new Set(this.cobranzaData.map(item => item.empleado).filter(Boolean))];

            return true;
        } catch (error) {
            console.error('Error cargando datos para reportes:', error);
            return false;
        }
    }

    /**
     * Filtra datos por rango de fechas
     */
    filterByDateRange(data, startDate, endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        
        return data.filter(item => {
            const itemDate = new Date(item.timestamp).getTime();
            return itemDate >= start && itemDate <= end;
        });
    }

    /**
     * Filtra datos por empleado
     */
    filterByEmpleado(data, empleado) {
        if (!empleado) return data;
        return data.filter(item => item.empleado === empleado);
    }

    /**
     * Filtra datos por cliente
     */
    filterByCliente(data, cliente) {
        if (!cliente) return data;
        return data.filter(item => item.cliente === cliente);
    }

    /**
     * Filtra datos por tipo de servicio
     */
    filterByServicio(data, servicio) {
        if (!servicio) return data;
        return data.filter(item => item.servicio === servicio);
    }

    /**
     * Genera reporte de ingresos
     */
    generateIngresoReport(startDate, endDate, empleado = null, cliente = null, servicio = null) {
        let filtered = this.filterByDateRange(this.cobranzaData, startDate, endDate);
        
        if (empleado) filtered = this.filterByEmpleado(filtered, empleado);
        if (cliente) filtered = this.filterByCliente(filtered, cliente);
        if (servicio) filtered = this.filterByServicio(filtered, servicio);

        const totalIngresos = filtered.reduce((sum, item) => sum + (item.monto || 0), 0);
        const cantidadCortes = filtered.length;
        const promedioCorte = cantidadCortes > 0 ? (totalIngresos / cantidadCortes).toFixed(2) : 0;

        // Agrupar por empleado
        const porEmpleado = {};
        filtered.forEach(item => {
            if (!porEmpleado[item.empleado]) {
                porEmpleado[item.empleado] = { cantidad: 0, monto: 0 };
            }
            porEmpleado[item.empleado].cantidad++;
            porEmpleado[item.empleado].monto += item.monto || 0;
        });

        // Convertir a array y ordenar por monto descendente
        const empleadoArray = Object.entries(porEmpleado).map(([nombre, datos]) => ({
            empleado: nombre,
            cantidadCortes: datos.cantidad,
            totalGenerado: datos.monto.toFixed(2),
            promedio: (datos.monto / datos.cantidad).toFixed(2)
        })).sort((a, b) => b.totalGenerado - a.totalGenerado);

        return {
            periodo: `${startDate} a ${endDate}`,
            totalIngresos: totalIngresos.toFixed(2),
            cantidadCortes,
            promedioCorte,
            detalles: filtered,
            porEmpleado: empleadoArray,
            filtros: { empleado, cliente, servicio }
        };
    }

    /**
     * Genera reporte de gastos
     */
    generateGastosReport(startDate, endDate, categoria = null) {
        let filtered = this.filterByDateRange(this.gastosData, startDate, endDate);

        if (categoria) {
            filtered = filtered.filter(item => item.categoria === categoria);
        }

        const totalGastos = filtered.reduce((sum, item) => sum + (item.monto || 0), 0);
        const cantidadGastos = filtered.length;
        const promedioGasto = cantidadGastos > 0 ? (totalGastos / cantidadGastos).toFixed(2) : 0;

        // Agrupar por categoría
        const porCategoria = {};
        filtered.forEach(item => {
            if (!porCategoria[item.categoria]) {
                porCategoria[item.categoria] = { cantidad: 0, monto: 0 };
            }
            porCategoria[item.categoria].cantidad++;
            porCategoria[item.categoria].monto += item.monto || 0;
        });

        // Convertir a array y ordenar
        const categoriaArray = Object.entries(porCategoria).map(([nombre, datos]) => ({
            categoria: nombre,
            cantidad: datos.cantidad,
            total: datos.monto.toFixed(2),
            porcentaje: ((datos.monto / totalGastos) * 100).toFixed(2)
        })).sort((a, b) => b.total - a.total);

        return {
            periodo: `${startDate} a ${endDate}`,
            totalGastos: totalGastos.toFixed(2),
            cantidadGastos,
            promedioGasto,
            detalles: filtered,
            porCategoria: categoriaArray
        };
    }

    /**
     * Genera reporte de rendimiento por empleado
     */
    generateRendimientoReport(startDate, endDate) {
        const cobranzaFiltrada = this.filterByDateRange(this.cobranzaData, startDate, endDate);
        const gastosFiltrados = this.filterByDateRange(this.gastosData, startDate, endDate);

        const rendimiento = {};

        // Procesar cobranza
        cobranzaFiltrada.forEach(item => {
            if (!rendimiento[item.empleado]) {
                rendimiento[item.empleado] = {
                    empleado: item.empleado,
                    totalIngresos: 0,
                    cantidadCortes: 0,
                    gastosAsignados: 0
                };
            }
            rendimiento[item.empleado].totalIngresos += item.monto || 0;
            rendimiento[item.empleado].cantidadCortes++;
        });

        // Procesar gastos (si están asociados a empleados)
        gastosFiltrados.forEach(item => {
            if (item.empleado && rendimiento[item.empleado]) {
                rendimiento[item.empleado].gastosAsignados += item.monto || 0;
            }
        });

        // Calcular utilidad neta y porcentajes
        const reporteArray = Object.values(rendimiento).map(item => ({
            empleado: item.empleado,
            totalIngresos: item.totalIngresos.toFixed(2),
            cantidadCortes: item.cantidadCortes,
            promedioCorte: (item.totalIngresos / item.cantidadCortes).toFixed(2),
            gastosAsignados: item.gastosAsignados.toFixed(2),
            utilidadNeta: (item.totalIngresos - item.gastosAsignados).toFixed(2),
            margenNeto: (((item.totalIngresos - item.gastosAsignados) / item.totalIngresos) * 100).toFixed(2)
        })).sort((a, b) => b.utilidadNeta - a.utilidadNeta);

        const totalIngresos = reporteArray.reduce((sum, item) => sum + parseFloat(item.totalIngresos), 0);
        const totalGastos = reporteArray.reduce((sum, item) => sum + parseFloat(item.gastosAsignados), 0);
        const utilidadTotal = totalIngresos - totalGastos;

        return {
            periodo: `${startDate} a ${endDate}`,
            empleados: reporteArray,
            resumenGeneral: {
                totalIngresos: totalIngresos.toFixed(2),
                totalGastos: totalGastos.toFixed(2),
                utilidadNeta: utilidadTotal.toFixed(2),
                margenNeto: (((utilidadTotal) / totalIngresos) * 100).toFixed(2)
            }
        };
    }

    /**
     * Genera reporte de clientes
     */
    generateClientesReport(startDate, endDate, ordenarPor = 'frecuencia') {
        const cobranzaFiltrada = this.filterByDateRange(this.cobranzaData, startDate, endDate);

        const clientesInfo = {};
        cobranzaFiltrada.forEach(item => {
            if (!clientesInfo[item.cliente]) {
                clientesInfo[item.cliente] = {
                    cliente: item.cliente,
                    frecuencia: 0,
                    totalGastado: 0,
                    servicios: [],
                    ultimaVisita: item.timestamp
                };
            }
            clientesInfo[item.cliente].frecuencia++;
            clientesInfo[item.cliente].totalGastado += item.monto || 0;
            if (item.servicio) {
                clientesInfo[item.cliente].servicios.push(item.servicio);
            }
            if (new Date(item.timestamp) > new Date(clientesInfo[item.cliente].ultimaVisita)) {
                clientesInfo[item.cliente].ultimaVisita = item.timestamp;
            }
        });

        let reporteArray = Object.values(clientesInfo).map(item => ({
            cliente: item.cliente,
            frecuencia: item.frecuencia,
            totalGastado: item.totalGastado.toFixed(2),
            gasto_promedio: (item.totalGastado / item.frecuencia).toFixed(2),
            ultimaVisita: new Date(item.ultimaVisita).toLocaleDateString('es-AR'),
            serviciosMasUsados: [...new Set(item.servicios)].join(', ')
        }));

        // Ordenar
        if (ordenarPor === 'frecuencia') {
            reporteArray.sort((a, b) => b.frecuencia - a.frecuencia);
        } else if (ordenarPor === 'gasto') {
            reporteArray.sort((a, b) => b.totalGastado - a.totalGastado);
        }

        return {
            periodo: `${startDate} a ${endDate}`,
            cantidadClientes: reporteArray.length,
            clientes: reporteArray,
            gastoTotalClientes: reporteArray.reduce((sum, c) => sum + parseFloat(c.totalGastado), 0).toFixed(2)
        };
    }

    /**
     * Genera estadísticas comparativas entre períodos
     */
    generateComparativeReport(startDate1, endDate1, startDate2, endDate2) {
        const periodo1 = this.generateIngresoReport(startDate1, endDate1);
        const periodo2 = this.generateIngresoReport(startDate2, endDate2);

        const variacionIngresos = ((periodo2.totalIngresos - periodo1.totalIngresos) / periodo1.totalIngresos * 100).toFixed(2);
        const variacionCortes = ((periodo2.cantidadCortes - periodo1.cantidadCortes) / periodo1.cantidadCortes * 100).toFixed(2);

        return {
            periodo1: `${startDate1} a ${endDate1}`,
            periodo2: `${startDate2} a ${endDate2}`,
            comparativa: {
                ingresos: {
                    periodo1: periodo1.totalIngresos,
                    periodo2: periodo2.totalIngresos,
                    variacion: variacionIngresos,
                    variacionEstado: variacionIngresos > 0 ? 'Aumento' : 'Disminución'
                },
                cortes: {
                    periodo1: periodo1.cantidadCortes,
                    periodo2: periodo2.cantidadCortes,
                    variacion: variacionCortes,
                    variacionEstado: variacionCortes > 0 ? 'Aumento' : 'Disminución'
                }
            }
        };
    }

    /**
     * Obtiene lista de empleados únicos
     */
    getEmpleados() {
        return this.empleados;
    }

    /**
     * Obtiene lista de servicios únicos
     */
    getServicios() {
        return [...new Set(this.cobranzaData.map(item => item.servicio).filter(Boolean))];
    }

    /**
     * Obtiene lista de categorías de gastos
     */
    getCategorias() {
        return [...new Set(this.gastosData.map(item => item.categoria).filter(Boolean))];
    }

    /**
     * Obtiene lista de clientes únicos
     */
    getClientes() {
        return this.clientesData.map(c => c.nombre);
    }

    /**
     * Prepara datos para gráficos (Chart.js)
     */
    prepareChartData(reporteData, tipo = 'ingresos') {
        if (tipo === 'empleados' && reporteData.porEmpleado) {
            return {
                labels: reporteData.porEmpleado.map(e => e.empleado),
                datasets: [{
                    label: 'Total Generado',
                    data: reporteData.porEmpleado.map(e => e.totalGenerado),
                    backgroundColor: this.generateColors(reporteData.porEmpleado.length),
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            };
        }

        if (tipo === 'gastos' && reporteData.porCategoria) {
            return {
                labels: reporteData.porCategoria.map(c => c.categoria),
                datasets: [{
                    label: 'Monto de Gastos',
                    data: reporteData.porCategoria.map(c => c.total),
                    backgroundColor: this.generateColors(reporteData.porCategoria.length),
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            };
        }

        return null;
    }

    /**
     * Genera colores para gráficos
     */
    generateColors(count) {
        const colors = [
            '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1'
        ];
        return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
    }

    /**
     * Exporta reporte a CSV
     */
    exportToCSV(reporte, nombreArchivo = 'reporte.csv') {
        let csv = '';
        let datos = reporte.detalles || reporte.clientes || reporte.empleados || [];

        if (datos.length === 0) {
            console.warn('No hay datos para exportar');
            return;
        }

        // Headers
        const headers = Object.keys(datos[0]);
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
        link.setAttribute('download', nombreArchivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess(`Reporte exportado como ${nombreArchivo}`);
    }

    /**
     * Exporta reporte a PDF (requiere jsPDF)
     */
    async exportToPDF(reporte, nombreArchivo = 'reporte.pdf') {
        try {
            // Verificar que jsPDF esté disponible
            if (typeof jsPDF === 'undefined') {
                showError('jsPDF no está cargado. Por favor, carga la librería.');
                return;
            }

            const doc = new jsPDF();
            let yPos = 10;

            // Título
            doc.setFontSize(16);
            doc.text('REPORTE: ' + nombreArchivo.replace('.pdf', '').toUpperCase(), 10, yPos);
            yPos += 10;

            // Periodo
            doc.setFontSize(10);
            doc.text(`Período: ${reporte.periodo}`, 10, yPos);
            yPos += 7;

            // Resumen general
            doc.setFontSize(12);
            doc.text('RESUMEN GENERAL', 10, yPos);
            yPos += 7;

            if (reporte.totalIngresos) {
                doc.text(`Total Ingresos: $${reporte.totalIngresos}`, 10, yPos);
                yPos += 5;
            }
            if (reporte.totalGastos) {
                doc.text(`Total Gastos: $${reporte.totalGastos}`, 10, yPos);
                yPos += 5;
            }
            if (reporte.cantidadCortes) {
                doc.text(`Cantidad de Cortes: ${reporte.cantidadCortes}`, 10, yPos);
                yPos += 5;
            }

            yPos += 5;

            // Tabla de detalles
            if (reporte.porEmpleado) {
                doc.setFontSize(10);
                doc.text('DETALLE POR EMPLEADO', 10, yPos);
                yPos += 5;

                const tableData = reporte.porEmpleado.map(e => [
                    e.empleado,
                    e.cantidadCortes.toString(),
                    `$${e.totalGenerado}`,
                    `$${e.promedio}`
                ]);

                doc.autoTable({
                    startY: yPos,
                    head: [['Empleado', 'Cortes', 'Total', 'Promedio']],
                    body: tableData,
                    margin: { top: 10 }
                });
            }

            doc.save(nombreArchivo);
            showSuccess(`Reporte exportado como ${nombreArchivo}`);
        } catch (error) {
            console.error('Error exportando PDF:', error);
            showError('Error al exportar PDF');
        }
    }
}

// Instancia global
const reportsManager = new ReportsManager();
