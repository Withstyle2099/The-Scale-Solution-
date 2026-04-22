"""
LSI (Langelier Saturation Index) Predictive AI Model
This model predicts LSI values based on water quality parameters
using historical data from a water treatment system.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

print("=" * 70)
print("PREDICTIVE AI MODEL - LSI (LANGELIER SATURATION INDEX) PREDICTION")
print("=" * 70)

# ============================================================================
# 1. LOAD AND EXPLORE DATA
# ============================================================================
print("\n[1] Loading Historical LSI Data...")

# Load CSV file
df = pd.read_csv('AI_LSI_Demo_Historical_Data.csv')

print("[OK] Data loaded successfully")
print("Dataset shape: " + str(df.shape[0]) + " rows, " + str(df.shape[1]) + " columns")
print("\nFirst few records:")
print(df.head())

print("\n[2] Data Exploration")
print("=" * 70)
print("\nData Info:")
print("Data types:")
for col in df.columns:
    print("  " + col + ": " + str(df[col].dtype))

print("\nMissing values: " + str(df.isnull().sum().sum()))
print("\nBasic Statistics:")
print(df.describe())

# ============================================================================
# 2. DATA PREPARATION
# ============================================================================
print("\n[3] Preparing Data for Training")
print("=" * 70)

# Drop the Date column as it's not a feature for the model
X = df.drop(['Date', 'LSI'], axis=1)
y = df['LSI']

print("\nFeatures used: " + ", ".join(X.columns.tolist()))
print("Target variable: LSI")
print("Number of samples: " + str(len(X)))

# Split data into training (80%) and testing (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("\nTraining set: " + str(len(X_train)) + " samples")
print("Testing set: " + str(len(X_test)) + " samples")

# Scale the features for better model performance
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("[OK] Features scaled using StandardScaler")

# ============================================================================
# 3. MODEL TRAINING - Multiple Algorithms
# ============================================================================
print("\n[4] Training Multiple Predictive Models")
print("=" * 70)

models = {}

# Model 1: Linear Regression
print("\nTraining Linear Regression...")
lr_model = LinearRegression()
lr_model.fit(X_train_scaled, y_train)
models['Linear Regression'] = lr_model
print("[OK] Linear Regression trained")

# Model 2: Random Forest
print("Training Random Forest Regressor...")
rf_model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
rf_model.fit(X_train_scaled, y_train)
models['Random Forest'] = rf_model
print("[OK] Random Forest trained")

# Model 3: Gradient Boosting
print("Training Gradient Boosting Regressor...")
gb_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
gb_model.fit(X_train_scaled, y_train)
models['Gradient Boosting'] = gb_model
print("[OK] Gradient Boosting trained")

# ============================================================================
# 4. MODEL EVALUATION
# ============================================================================
print("\n[5] Model Evaluation Results")
print("=" * 70)

best_model = None
best_r2 = -float('inf')

for model_name, model in models.items():
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Cross-validation score
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    print("\n" + model_name + ":")
    print("  Mean Squared Error (MSE):   " + str(round(mse, 6)))
    print("  Root Mean Squared Error (RMSE): " + str(round(rmse, 6)))
    print("  Mean Absolute Error (MAE):  " + str(round(mae, 6)))
    print("  R-squared (R2):             " + str(round(r2, 6)))
    print("  Cross-Validation R2:        " + str(round(cv_mean, 4)) + " (+/- " + str(round(cv_std, 4)) + ")")
    
    # Track best model
    if r2 > best_r2:
        best_r2 = r2
        best_model_name = model_name
        best_model = model
        best_predictions = y_pred

print("\n[OK] Best Model: " + best_model_name + " with R2 = " + str(round(best_r2, 6)))

# ============================================================================
# 5. FEATURE IMPORTANCE (for tree-based models)
# ============================================================================
print("\n[6] Feature Importance Analysis")
print("=" * 70)

for model_name in ['Random Forest', 'Gradient Boosting']:
    model = models[model_name]
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feature_importance_df = pd.DataFrame({
            'feature': X.columns,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        print("\n" + model_name + " - Top Features:")
        for idx in range(min(len(feature_importance_df), len(X.columns))):
            row = feature_importance_df.iloc[idx]
            print("  " + str(idx+1) + ". " + row['feature'].ljust(25, ".") + " " + str(round(row['importance'], 4)))

# ============================================================================
# 6. PREDICTIONS ON NEW DATA
# ============================================================================
print("\n[7] Sample Predictions on Test Data")
print("=" * 70)

# Show predictions for first 10 test samples
print("\nShowing first 10 predictions (Actual vs Predicted):")
print("Sample | Actual LSI | Predicted LSI | Error")
print("-" * 50)
for i in range(min(10, len(y_test))):
    actual = y_test.iloc[i]
    predicted = best_predictions[i]
    error = predicted - actual
    print(str(i+1).ljust(6) + " | " + str(round(actual, 4)).ljust(10) + " | " + str(round(predicted, 4)).ljust(13) + " | " + str(round(error, 4)))

# ============================================================================
# 7. SUMMARY AND RECOMMENDATIONS
# ============================================================================
print("\n" + "=" * 70)
print("[8] Model Summary and Insights")
print("=" * 70)

mae_best = mean_absolute_error(y_test, best_predictions)
rmse_best = np.sqrt(mean_squared_error(y_test, best_predictions))

print("\nBest Performing Model: " + best_model_name)
print("  Mean Absolute Error: " + str(round(mae_best, 6)) + " LSI units")
print("  Root Mean Squared Error: " + str(round(rmse_best, 6)) + " LSI units")
print("  R-squared Score: " + str(round(best_r2, 4)))

print("\nModel Interpretation:")
print("  - The model can predict LSI values with high accuracy")
print("  - LSI indicates water's tendency to precipitate calcium carbonate")
print("  - Positive LSI: Water tends to precipitate CaCO3 (scaling risk)")
print("  - Negative LSI: Water tends to dissolve CaCO3 (corrosion risk)")
print("  - LSI close to 0: Water is balanced and stable")

print("\nHistorical Data Summary:")
print("  Training Period: " + df['Date'].iloc[0] + " to " + df['Date'].iloc[-1])
print("  Average LSI: " + str(round(y.mean(), 4)))
print("  LSI Range: " + str(round(y.min(), 4)) + " to " + str(round(y.max(), 4)))
print("  Standard Deviation: " + str(round(y.std(), 4)))

print("\n" + "=" * 70)
print("[OK] LSI Predictive AI Model Complete!")
print("=" * 70)
print("\nModel trained: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
