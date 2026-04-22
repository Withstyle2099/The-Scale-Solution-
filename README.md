# LSI Predictive AI Model - Interactive Dashboard

## Overview

This is an interactive web-based interface for the LSI (Langelier Saturation Index) Predictive AI Model. The dashboard allows you to monitor water quality, make real-time predictions, and analyze model performance.

## Features

### 📊 Dashboard Page
- **System Overview**: Key metrics including total records, average LSI, and LSI range
- **LSI Trend Chart**: Historical LSI values over time with neutral line indicator
- **Distribution Analysis**: LSI frequency distribution with mean line
- **Detailed Statistics**: Complete statistical summary of all parameters

### 🔮 Predictions Page
- **Real-time Prediction**: Input water quality parameters and get instant LSI predictions
- **Multiple Models**: Compare predictions from 3 different algorithms:
  - Linear Regression (highest accuracy)
  - Random Forest
  - Gradient Boosting
- **Risk Assessment**: Visual indicators showing scaling risk, corrosion risk, or balanced status
- **Parameter Input**:
  - Temperature (°C): 30-45°C
  - Flow Rate (m³/h): 1100-1250
  - pH: 6.5-7.5
  - Calcium (mg/L): 80-115
  - Alkalinity (mg/L): 170-200
  - TDS (mg/L): 27,500-30,000

### 📈 Model Analysis Page
- **Performance Comparison**: R² Score, MAE, RMSE, and MSE metrics for all models
- **Visual Comparisons**: Bar charts comparing model performance
- **Feature Importance**: Shows which water quality parameters most influence LSI predictions
  - pH is the dominant factor (99.9% importance)

### 📋 Historical Data Page
- **Data Browse**: View and filter historical data by index range
- **Download**: Export data as CSV for external analysis
- **Correlation Matrix**: Heatmap showing relationships between all parameters

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Pip package manager

### Installation Steps

1. **Install Required Packages** (already done):
   ```
   pip install streamlit pandas numpy matplotlib seaborn scikit-learn
   ```

2. **Ensure Data File**:
   - Place `AI_LSI_Demo_Historical_Data.csv` in: `C:\Users\UM_AS\Downloads\`

3. **Files Created**:
   - `lsi_streamlit_app.py` - Main application
   - `run_lsi_dashboard.bat` - Quick launch script (Windows)
   - `lsi_predictive_model.py` - Original prediction model

### Running the Application

#### Option 1: Double-click the batch file
```
Double-click: run_lsi_dashboard.bat
```

#### Option 2: Run from PowerShell/Terminal
```
cd "C:\Users\UM_AS\OneDrive\Documents"
streamlit run lsi_streamlit_app.py
```

#### Option 3: Run with Python
```
python -m streamlit run "C:\Users\UM_AS\OneDrive\Documents\lsi_streamlit_app.py"
```

### Access the Dashboard
- The application will automatically open in your default web browser
- Default URL: `http://localhost:8501`
- You can view on any device on your network at `http://<your-ip>:8501`

## Navigation

Use the sidebar to navigate between pages:
- **Dashboard**: Overview and trends
- **Predictions**: Real-time LSI prediction tool
- **Model Analysis**: Performance metrics and feature importance
- **Historical Data**: Browse and download historical records

## How to Use

### Making Predictions
1. Go to the **Predictions** page
2. Enter water quality parameters in the input fields
3. Click the **"Predict LSI"** button
4. View results from all three models
5. Check the risk status indicator

### Understanding LSI Results
- **LSI > 0.1**: 🔴 SCALING RISK - Water may precipitate calcium carbonate
- **-0.15 to 0.1**: 🟢 BALANCED - Water is stable and ideal
- **LSI < -0.15**: 🔴 CORROSION RISK - Water may dissolve calcium carbonate

### Analyzing Performance
1. Go to the **Model Analysis** page
2. View the performance comparison table
3. Check R² scores (closer to 1.0 is better)
4. Compare Mean Absolute Error (MAE) values
5. View feature importance chart

## Technical Details

### Model Information
- **Training Data**: 584 samples
- **Test Data**: 147 samples
- **Best Model**: Linear Regression (R² = 0.9999)
- **Key Feature**: pH (99.9% importance)

### Data Parameters
- **Date Range**: January 1, 2023 - October 27, 2023
- **Total Records**: 731
- **Frequency**: Daily measurements

## Troubleshooting

### Port Already in Use
If port 8501 is already in use:
```
streamlit run lsi_streamlit_app.py --server.port 8502
```

### Data File Not Found
Ensure the CSV file is in:
```
C:\Users\UM_AS\Downloads\AI_LSI_Demo_Historical_Data.csv
```

### Slow Performance
- Reduce the historical data range in the slider
- Refresh the browser (F5)
- Restart the application

## File Structure

```
C:\Users\UM_AS\OneDrive\Documents\
├── lsi_streamlit_app.py          (Web interface)
├── lsi_predictive_model.py       (Original model)
├── run_lsi_dashboard.bat         (Launcher script)
├── README.md                     (This file)
└── requirements.txt              (Dependencies)

C:\Users\UM_AS\Downloads\
└── AI_LSI_Demo_Historical_Data.csv (Historical data)
```

## Features & Capabilities

✅ Real-time LSI predictions
✅ Multiple algorithm comparison
✅ Risk assessment indicators
✅ Historical data visualization
✅ Feature importance analysis
✅ Model performance metrics
✅ Data export (CSV)
✅ Interactive charts
✅ Responsive design
✅ Correlation analysis

## Tips for Best Results

1. **Input Realistic Values**: Use parameter ranges within historical data
2. **Monitor Trends**: Use dashboard to track LSI changes over time
3. **Compare Models**: Check predictions across all three algorithms
4. **Review Features**: Understand which parameters most affect LSI
5. **Download Data**: Export for external analysis or reporting

## Support & Maintenance

- **Model Retraining**: Can be done monthly with new data
- **Parameter Updates**: Easily adjustable input ranges
- **Customization**: Modify the CSS styling in the code
- **Data Updates**: Append new data to CSV file

## Performance Metrics

### Linear Regression (Best Model)
- R² Score: 0.999995
- Mean Absolute Error: 0.00036
- RMSE: 0.000448

### Gradient Boosting
- R² Score: 0.999665
- MAE: 0.002879
- RMSE: 0.003745

### Random Forest
- R² Score: 0.999338
- MAE: 0.003987
- RMSE: 0.005267

## License & Usage

This is a demonstration model for water quality monitoring and LSI prediction.
Use for monitoring and analysis purposes only.

---

**Created**: February 5, 2026
**Last Updated**: February 5, 2026
**Version**: 1.0
