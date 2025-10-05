
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
from datetime import datetime

def train_k2_model(dataset_path="K2_dataset.csv", output_dir=".", target_col="target"):
    df = pd.read_csv(dataset_path)
    
    X = df.drop(columns=["pl_name", target_col])
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    rf = RandomForestClassifier(
        n_estimators=400,
        max_depth=15,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    print("Random Forest metrics:")
    print(confusion_matrix(y_test, y_pred_rf))
    print(classification_report(y_test, y_pred_rf))

    xgb = XGBClassifier(
        n_estimators=600,
        learning_rate=0.03,
        max_depth=8,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="mlogloss",
        random_state=42
    )
    xgb.fit(X_train, y_train)
    y_pred_xgb = xgb.predict(X_test)
    print("XGBoost metrics:")
    print(classification_report(y_test, y_pred_xgb))

    stack = StackingClassifier(
        estimators=[
            ("rf", RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42)),
            ("xgb", XGBClassifier(n_estimators=500, max_depth=8, random_state=42))
        ],
        final_estimator=LogisticRegression(max_iter=1000),
        n_jobs=-1
    )
    stack.fit(X_train_scaled, y_train)
    y_pred_stack = stack.predict(X_test_scaled)
    print("Stacking Classifier metrics:")
    print(classification_report(y_test, y_pred_stack))

    model_path = os.path.join(output_dir, "k2_stacking_classifier.pkl")
    scaler_path = os.path.join(output_dir, "k2_scaler.pkl")
    joblib.dump(stack, model_path)
    joblib.dump(scaler, scaler_path)

    accuracy = accuracy_score(y_test, y_pred_stack)
    classes = list(y.unique())
    features = list(X.columns)
    last_trained = datetime.utcnow().isoformat() + "Z"

    metrics = {
        "model_name": os.path.basename(model_path),
        "accuracy": round(accuracy, 4),
        "classes": classes,
        "features": features,
        "last_trained": last_trained
    }

    return metrics, model_path, scaler_path

