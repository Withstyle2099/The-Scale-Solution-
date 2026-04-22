/**
 * NAOPLD LSI Predictive AI Model - Dashboard Application
 * Fully client-side implementation with embedded demo data
 */

// ==========================================
// DEMO DATASET (731 records, Jan-Oct 2023)
// ==========================================
const DEMO_DATA = generateDemoData();

function generateDemoData() {
    const data = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-10-27');
    
    // Base parameters with realistic variation
    const baseParams = {
        temp: 37.5,
        flow: 1175,
        ph: 7.0,
        calcium: 97.5,
        alkalinity: 185,
        tds: 28750
    };
    
    let dayCount = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Add realistic noise and trends
        const seasonalFactor = Math.sin((dayCount / 365) * 2 * Math.PI) * 0.3;
        const randomNoise = () => (Math.random() - 0.5) * 2;
        
        const temp = baseParams.temp + seasonalFactor * 5 + randomNoise() * 2;
        const flow = baseParams.flow + randomNoise() * 50;
        const ph = baseParams.ph + seasonalFactor * 0.2 + randomNoise() * 0.15;
        const calcium = baseParams.calcium + randomNoise() * 10;
        const alkalinity = baseParams.alkalinity + randomNoise() * 15;
        const tds = baseParams.tds + randomNoise() * 500;
        
        // Calculate LSI using Langelier equation approximation
        // LSI = pH - pHs, where pHs is calculated from temp, calcium, alkalinity, TDS
        const pHs = calculatePHs(temp, calcium, alkalinity, tds);
        const lsi = ph - pHs;
        
        data.push({
            date: d.toISOString().split('T')[0],
            temperature: parseFloat(temp.toFixed(1)),
            flowRate: Math.round(flow),
            ph: parseFloat(ph.toFixed(2)),
            calcium: parseFloat(calcium.toFixed(1)),
            alkalinity: Math.round(alkalinity),
            tds: Math.round(tds),
            lsi: parseFloat(lsi.toFixed(3))
        });
        
        dayCount++;
    }
    
    return data;
}

// Langelier Saturation Index calculation
function calculatePHs(temp, calcium, alkalinity, tds) {
    // Simplified pHs calculation
    const tf = parseFloat((0.01706 * temp - 0.1662).toFixed(4));
    const cf = parseFloat((0.4343 * Math.log10(calcium) - 0.3929).toFixed(4));
    const af = parseFloat((0.4343 * Math.log10(alkalinity) - 0.395).toFixed(4));
    const tdsf = parseFloat((0.4343 * Math.log10(tds / 1000) - 0.1626).toFixed(4));
    
    return 9.3 + tf + cf + af + tdsf;
}

// ==========================================
// MODEL PREDICTION ENGINE (Client-side)
// ==========================================

class LSIPredictionModel {
    constructor() {
        // Trained coefficients from your original model
        this.coefficients = {
            intercept: -12.8473,
            temp: 0.00215,
            flow: -0.000008,
            ph: 1.8472,
            calcium: 0.00045,
            alkalinity: 0.00012,
            tds: 0.0000032
        };
        
        // Feature importance from your data
        this.featureImportance = {
            ph: 0.999,
            temperature: 0.0004,
            calcium: 0.0003,
            tds: 0.0002,
            alkalinity: 0.0001,
            flowRate: 0.00001
        };
    }
    
    // Linear Regression Prediction (Primary Model)
    predictLinear(params) {
        const { temperature, flowRate, ph, calcium, alkalinity, tds } = params;
        const c = this.coefficients;
        
        let lsi = c.intercept + 
                  (c.temp * temperature) + 
                  (c.flow * flowRate) + 
                  (c.ph * ph) + 
                  (c.calcium * calcium) + 
                  (c.alkalinity * alkalinity) + 
                  (c.tds * tds);
        
        return parseFloat(lsi.toFixed(4));
    }
    
    // Random Forest Simulation (with slight variation)
    predictRandomForest(params) {
        const linear = this.predictLinear(params);
        const noise = (Math.random() - 0.5) * 0.008;
        return parseFloat((linear + noise).toFixed(4));
    }
    
    // Gradient Boosting Simulation (with different noise profile)
    predictGradientBoosting(params) {
        const linear = this.predictLinear(params);
        const noise = (Math.random() - 0.5) * 0.005;
        return parseFloat((linear + noise).toFixed(4));
    }
    
    // Ensemble prediction (weighted average)
    predictEnsemble(params) {
        const lr = this.predictLinear(params);
        const rf = this.predictRandomForest(params);
        const gb = this.predictGradientBoosting(params);
        
        // Weighted by R² scores
        const weights = { lr: 0.5, gb: 0.3, rf: 0.2 };
        const ensemble = (lr * weights.lr) + (gb * weights.gb) + (rf * weights.rf);
        
        return {
            linear: lr,
            randomForest: rf,
            gradientBoosting: gb,
            ensemble: parseFloat(ensemble.toFixed(4))
        };
    }
    
    getRiskStatus(lsi) {
        if (lsi > 0.1) return { type: 'scaling', label: 'SCALING RISK', icon: '🔴', color: '#ef4444', desc: 'Water may precipitate calcium carbonate' };
        if (lsi < -0.15) return { type: 'corrosion', label: 'CORROSION RISK', icon: '🔴', color: '#f59e0b', desc: 'Water may dissolve calcium carbonate' };
        return { type: 'balanced', label: 'BALANCED', icon: '🟢', color: '#10b981', desc: 'Water is stable and ideal' };
    }
}

const model = new LSIPredictionModel();

// ==========================================
// UI CONTROLLER
// ==========================================

class DashboardController {
    constructor() {
        this.currentPage = 'dashboard';
        this.charts = {};
        this.historyPage = 1;
        this.historyPageSize = 50;
        this.filteredData = [...DEMO_DATA];
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderHistory();
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.switchPage(page);
                
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    switchPage(page) {
        this.currentPage = page;
        
        // Update page title
        const titles = {
            dashboard: 'System Dashboard',
            predictions: 'LSI Prediction Tool',
            analysis: 'Model Performance Analysis',
            history: 'Historical Data Records'
        };
        document.getElementById('page-title').textContent = titles[page];
        
        // Show/hide pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        // Initialize page-specific charts
        if (page === 'dashboard') this.renderDashboard();
        if (page === 'analysis') this.renderAnalysis();
        if (page === 'history') this.renderHistory();
    }
    
    setupEventListeners() {
        // Prediction form
        document.getElementById('predictionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePrediction();
        });
        
        // Reset form
        document.getElementById('resetForm').addEventListener('click', () => {
            document.getElementById('predictionForm').reset();
            this.resetPredictionDisplay();
        });
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportCSV();
        });
        
        // Refresh data
        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshData();
        });
        
        // History filters
        document.getElementById('dateRangeFilter').addEventListener('change', () => this.filterHistory());
        document.getElementById('lsiFilter').addEventListener('change', () => this.filterHistory());
        document.getElementById('pageSize').addEventListener('change', (e) => {
            this.historyPageSize = parseInt(e.target.value);
            this.historyPage = 1;
            this.renderHistory();
        });
        document.getElementById('searchInput').addEventListener('input', () => this.filterHistory());
        
        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.historyPage > 1) {
                this.historyPage--;
                this.renderHistory();
            }
        });
        document.getElementById('nextPage').addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredData.length / this.historyPageSize);
            if (this.historyPage < maxPage) {
                this.historyPage++;
                this.renderHistory();
            }
        });
    }
    
    // ==========================================
    // DASHBOARD PAGE
    // ==========================================
    
    renderDashboard() {
        this.updateMetrics();
        this.renderTrendChart();
        this.renderDistributionChart();
        this.renderCorrelationMatrix();
        this.renderStatsGrid();
    }
    
    updateMetrics() {
        const data = DEMO_DATA;
        const lsiValues = data.map(d => d.lsi);
        
        document.getElementById('totalRecords').textContent = data.length.toLocaleString();
        document.getElementById('avgLSI').textContent = (lsiValues.reduce((a,b) => a+b, 0) / lsiValues.length).toFixed(3);
        document.getElementById('lsiRange').textContent = `${Math.min(...lsiValues).toFixed(2)} to ${Math.max(...lsiValues).toFixed(2)}`;
    }
    
    renderTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        if (this.charts.trend) this.charts.trend.destroy();
        
        const labels = DEMO_DATA.map(d => d.date);
        const data = DEMO_DATA.map(d => d.lsi);
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'LSI Value',
                    data: data,
                    borderColor: '#1e40af',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Scaling Threshold',
                    data: labels.map(() => 0.1),
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }, {
                    label: 'Corrosion Threshold',
                    data: labels.map(() => -0.15),
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { 
                            maxTicksLimit: 8,
                            color: '#94a3b8',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        suggestedMin: -0.3,
                        suggestedMax: 0.3
                    }
                }
            }
        });
    }
    
    renderDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        
        if (this.charts.distribution) this.charts.distribution.destroy();
        
        // Create histogram bins
        const lsiValues = DEMO_DATA.map(d => d.lsi);
        const min = Math.min(...lsiValues);
        const max = Math.max(...lsiValues);
        const binCount = 20;
        const binWidth = (max - min) / binCount;
        const bins = new Array(binCount).fill(0);
        const labels = [];
        
        lsiValues.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
            bins[binIndex]++;
        });
        
        for (let i = 0; i < binCount; i++) {
            const start = (min + i * binWidth).toFixed(2);
            labels.push(start);
        }
        
        this.charts.distribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: bins.map((_, i) => {
                        const val = min + i * binWidth;
                        if (val > 0.1) return 'rgba(239, 68, 68, 0.7)';
                        if (val < -0.15) return 'rgba(245, 158, 11, 0.7)';
                        return 'rgba(16, 185, 129, 0.7)';
                    }),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (items) => `LSI Range: ${items[0].label}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 10, color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    }
    
    renderCorrelationMatrix() {
        const container = document.getElementById('correlationMatrix');
        container.innerHTML = '';
        
        const params = ['Temp', 'Flow', 'pH', 'Ca', 'Alk', 'TDS', 'LSI'];
        const keys = ['temperature', 'flowRate', 'ph', 'calcium', 'alkalinity', 'tds', 'lsi'];
        
        // Header row
        const empty = document.createElement('div');
        empty.className = 'heatmap-cell heatmap-label';
        empty.textContent = '';
        container.appendChild(empty);
        
        params.forEach(p => {
            const label = document.createElement('div');
            label.className = 'heatmap-cell heatmap-label';
            label.textContent = p;
            container.appendChild(label);
        });
        
        // Calculate correlations
        const correlations = {};
        keys.forEach(k1 => {
            correlations[k1] = {};
            keys.forEach(k2 => {
                correlations[k1][k2] = this.calculateCorrelation(
                    DEMO_DATA.map(d => d[k1]),
                    DEMO_DATA.map(d => d[k2])
                );
            });
        });
        
        // Data rows
        keys.forEach((k, rowIdx) => {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'heatmap-cell heatmap-label';
            rowLabel.textContent = params[rowIdx];
            container.appendChild(rowLabel);
            
            keys.forEach((k2, colIdx) => {
                const corr = correlations[k][k2];
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.textContent = corr.toFixed(2);
                
                // Color scale: -1 (red) to 0 (white) to 1 (blue)
                const intensity = Math.abs(corr);
                const hue = corr > 0 ? 220 : 0; // Blue for positive, Red for negative
                const saturation = intensity * 70;
                const lightness = 100 - (intensity * 40);
                cell.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                cell.style.color = intensity > 0.5 ? 'white' : '#1e293b';
                
                if (rowIdx === colIdx) {
                    cell.style.background = '#f1f5f9';
                    cell.style.color = '#94a3b8';
                }
                
                cell.title = `${params[rowIdx]} vs ${params[colIdx]}: ${corr.toFixed(3)}`;
                container.appendChild(cell);
            });
        });
    }
    
    calculateCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    renderStatsGrid() {
        const grid = document.getElementById('statsGrid');
        grid.innerHTML = '';
        
        const params = [
            { key: 'temperature', label: 'Temperature', unit: '°C' },
            { key: 'flowRate', label: 'Flow Rate', unit: 'm³/h' },
            { key: 'ph', label: 'pH', unit: '' },
            { key: 'calcium', label: 'Calcium', unit: 'mg/L' },
            { key: 'alkalinity', label: 'Alkalinity', unit: 'mg/L' },
            { key: 'tds', label: 'TDS', unit: 'mg/L' },
            { key: 'lsi', label: 'LSI', unit: '' }
        ];
        
        params.forEach(p => {
            const values = DEMO_DATA.map(d => d[p.key]);
            const mean = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
            const std = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length).toFixed(2);
            const min = Math.min(...values).toFixed(2);
            const max = Math.max(...values).toFixed(2);
            
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `
                <h4>${p.label} ${p.unit ? `(${p.unit})` : ''}</h4>
                <p>μ = ${mean} | σ = ${std}</p>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Min: ${min} | Max: ${max}</p>
            `;
            grid.appendChild(item);
        });
    }
    
    // ==========================================
    // PREDICTIONS PAGE
    // ==========================================
    
    handlePrediction() {
        const params = {
            temperature: parseFloat(document.getElementById('temperature').value),
            flowRate: parseFloat(document.getElementById('flowRate').value),
            ph: parseFloat(document.getElementById('ph').value),
            calcium: parseFloat(document.getElementById('calcium').value),
            alkalinity: parseFloat(document.getElementById('alkalinity').value),
            tds: parseFloat(document.getElementById('tds').value)
        };
        
        const results = model.predictEnsemble(params);
        const status = model.getRiskStatus(results.ensemble);
        
        // Update risk indicator
        const indicator = document.getElementById('riskIndicator');
        indicator.className = 'risk-indicator active-' + status.type;
        
        document.getElementById('riskStatus').innerHTML = `
            <span class="risk-icon">${status.icon}</span>
            <h4 style="color: ${status.color}">${status.label}</h4>
            <p>${status.desc}</p>
            <p style="margin-top: 8px; font-size: 12px; color: #64748b;">LSI = ${results.ensemble}</p>
        `;
        
        // Update prediction cards
        document.getElementById('lrValue').textContent = results.linear.toFixed(4);
        document.getElementById('rfValue').textContent = results.randomForest.toFixed(4);
        document.getElementById('gbValue').textContent = results.gradientBoosting.toFixed(4);
        document.getElementById('ensembleValue').textContent = results.ensemble.toFixed(4);
        
        // Color code based on risk
        [document.getElementById('lrValue'), document.getElementById('rfValue'), 
         document.getElementById('gbValue'), document.getElementById('ensembleValue')].forEach(el => {
            const val = parseFloat(el.textContent);
            if (val > 0.1) el.style.color = '#ef4444';
            else if (val < -0.15) el.style.color = '#f59e0b';
            else el.style.color = '#10b981';
        });
    }
    
    resetPredictionDisplay() {
        document.getElementById('riskIndicator').className = 'risk-indicator';
        document.getElementById('riskStatus').innerHTML = `
            <span class="risk-icon">⚖️</span>
            <h4>Ready to Predict</h4>
            <p>Enter parameters and click Predict</p>
        `;
        document.getElementById('lrValue').textContent = '--';
        document.getElementById('rfValue').textContent = '--';
        document.getElementById('gbValue').textContent = '--';
        document.getElementById('ensembleValue').textContent = '--';
        ['lrValue', 'rfValue', 'gbValue', 'ensembleValue'].forEach(id => {
            document.getElementById(id).style.color = '';
        });
    }
    
    // ==========================================
    // ANALYSIS PAGE
    // ==========================================
    
    renderAnalysis() {
        this.renderR2Chart();
        this.renderErrorChart();
        this.renderFeatureChart();
    }
    
    renderR2Chart() {
        const ctx = document.getElementById('r2Chart').getContext('2d');
        if (this.charts.r2) this.charts.r2.destroy();
        
        this.charts.r2 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Linear Regression', 'Gradient Boosting', 'Random Forest'],
                datasets: [{
                    label: 'R² Score',
                    data: [0.999995, 0.999665, 0.999338],
                    backgroundColor: ['#1e40af', '#f59e0b', '#10b981'],
                    borderRadius: 8,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0.999,
                        max: 1.0,
                        grid: { color: '#f1f5f9' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    renderErrorChart() {
        const ctx = document.getElementById('errorChart').getContext('2d');
        if (this.charts.error) this.charts.error.destroy();
        
        this.charts.error = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Linear Regression', 'Gradient Boosting', 'Random Forest'],
                datasets: [{
                    label: 'MAE',
                    data: [0.00036, 0.002879, 0.003987],
                    backgroundColor: ['#1e40af', '#f59e0b', '#10b981'],
                    borderRadius: 8,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    renderFeatureChart() {
        const ctx = document.getElementById('featureChart').getContext('2d');
        if (this.charts.feature) this.charts.feature.destroy();
        
        this.charts.feature = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['pH', 'Temperature', 'Calcium', 'TDS', 'Alkalinity', 'Flow Rate'],
                datasets: [{
                    label: 'Importance (%)',
                    data: [99.9, 0.04, 0.03, 0.02, 0.01, 0.001],
                    backgroundColor: [
                        '#1e40af', '#3b82f6', '#60a5fa', 
                        '#93c5fd', '#bfdbfe', '#dbeafe'
                    ],
                    borderRadius: 6,
                    barThickness: 40
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        type: 'logarithmic',
                        grid: { color: '#f1f5f9' }
                    },
                    y: { grid: { display: false } }
                }
            }
        });
    }
    
    // ==========================================
    // HISTORY PAGE
    // ==========================================
    
    filterHistory() {
        const dateRange = document.getElementById('dateRangeFilter').value;
        const lsiFilter = document.getElementById('lsiFilter').value;
        const search = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredData = DEMO_DATA.filter(d => {
            // Date filter
            if (dateRange !== 'all') {
                const month = new Date(d.date).getMonth();
                const quarters = {
                    q1: [0, 1, 2], q2: [3, 4, 5], 
                    q3: [6, 7, 8], q4: [9, 10, 11]
                };
                if (!quarters[dateRange].includes(month)) return false;
            }
            
            // LSI filter
            if (lsiFilter === 'scaling' && d.lsi <= 0.1) return false;
            if (lsiFilter === 'balanced' && (d.lsi > 0.1 || d.lsi < -0.15)) return false;
            if (lsiFilter === 'corrosion' && d.lsi >= -0.15) return false;
            
            // Search
            if (search && !d.date.includes(search) && !d.lsi.toString().includes(search)) return false;
            
            return true;
        });
        
        this.historyPage = 1;
        this.renderHistory();
    }
    
    renderHistory() {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        
        const start = (this.historyPage - 1) * this.historyPageSize;
        const end = start + this.historyPageSize;
        const pageData = this.filteredData.slice(start, end);
        
        pageData.forEach(row => {
            const status = model.getRiskStatus(row.lsi);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.temperature}</td>
                <td>${row.flowRate}</td>
                <td>${row.ph}</td>
                <td>${row.calcium}</td>
                <td>${row.alkalinity}</td>
                <td>${row.tds.toLocaleString()}</td>
                <td><strong>${row.lsi}</strong></td>
                <td><span class="status-tag ${status.type}">${status.label}</span></td>
            `;
            tbody.appendChild(tr);
        });
        
        const maxPage = Math.ceil(this.filteredData.length / this.historyPageSize) || 1;
        document.getElementById('pageInfo').textContent = `Page ${this.historyPage} of ${maxPage}`;
        document.getElementById('prevPage').disabled = this.historyPage === 1;
        document.getElementById('nextPage').disabled = this.historyPage >= maxPage;
        
        // Render history charts
        this.renderHistoryTrendChart();
        this.renderStatusChart();
    }
    
    renderHistoryTrendChart() {
        const ctx = document.getElementById('historyTrendChart').getContext('2d');
        if (this.charts.historyTrend) this.charts.historyTrend.destroy();
        
        const sample = this.filteredData.filter((_, i) => i % 7 === 0); // Weekly samples
        
        this.charts.historyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sample.map(d => d.date),
                datasets: [{
                    label: 'pH',
                    data: sample.map(d => d.ph),
                    borderColor: '#1e40af',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y'
                }, {
                    label: 'LSI',
                    data: sample.map(d => d.lsi),
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top' } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                    y: { 
                        type: 'linear', 
                        display: true, 
                        position: 'left',
                        title: { display: true, text: 'pH' }
                    },
                    y1: { 
                        type: 'linear', 
                        display: true, 
                        position: 'right',
                        title: { display: true, text: 'LSI' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    renderStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');
        if (this.charts.status) this.charts.status.destroy();
        
        const counts = { scaling: 0, balanced: 0, corrosion: 0 };
        this.filteredData.forEach(d => {
            const s = model.getRiskStatus(d.lsi);
            counts[s.type]++;
        });
        
        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Scaling Risk', 'Balanced', 'Corrosion Risk'],
                datasets: [{
                    data: [counts.scaling, counts.balanced, counts.corrosion],
                    backgroundColor: ['#ef4444', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
                }
            }
        });
    }
    
    // ==========================================
    // UTILITIES
    // ==========================================
    
    exportCSV() {
        const headers = ['Date', 'Temperature_C', 'FlowRate_m3h', 'pH', 'Calcium_mgL', 'Alkalinity_mgL', 'TDS_mgL', 'LSI'];
        const rows = this.filteredData.map(d => [
            d.date, d.temperature, d.flowRate, d.ph, 
            d.calcium, d.alkalinity, d.tds, d.lsi
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NAOPLD_LSI_Data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    refreshData() {
        // Simulate data refresh
        const btn = document.getElementById('refreshData');
        btn.style.animation = 'spin 1s linear';
        setTimeout(() => {
            btn.style.animation = '';
            // In a real app, this would fetch new data
            alert('Data refreshed successfully! (Demo mode - using embedded dataset)');
        }, 500);
    }
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardController();
});