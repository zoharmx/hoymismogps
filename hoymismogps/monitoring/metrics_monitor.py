#!/usr/bin/env python3
"""
HoyMismoGPS - Monitor de Métricas y Alertas
Sistema de monitoreo en tiempo real para rendimiento y salud del sistema
"""

import time
import json
import asyncio
import aiohttp
import smtplib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import sqlite3
import threading
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import psutil
import logging

# Importar nuestro sistema de logging
from logger import get_logger

logger = get_logger("metrics_monitor")

@dataclass
class Metric:
    """Métrica del sistema"""
    name: str
    value: float
    unit: str
    timestamp: datetime
    labels: Dict[str, str]
    service: str

@dataclass
class Alert:
    """Alerta del sistema"""
    id: str
    name: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    metric_name: str
    threshold: float
    current_value: float
    timestamp: datetime
    status: str  # FIRING, RESOLVED
    organization_id: Optional[str] = None

class MetricsCollector:
    """Recolector de métricas del sistema"""
    
    def __init__(self):
        self.metrics_db_path = "/home/ubuntu/HoyMismoGPS/monitoring/metrics.db"
        self._init_db()
    
    def _init_db(self):
        """Inicializa la base de datos de métricas"""
        Path(self.metrics_db_path).parent.mkdir(parents=True, exist_ok=True)
        
        conn = sqlite3.connect(self.metrics_db_path)
        cursor = conn.cursor()
        
        # Tabla de métricas
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            labels TEXT,
            service TEXT NOT NULL
        )
        ''')
        
        # Tabla de alertas
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL,
            metric_name TEXT NOT NULL,
            threshold REAL NOT NULL,
            current_value REAL NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            organization_id TEXT,
            resolved_at TEXT
        )
        ''')
        
        # Índices para optimización
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_name_time ON metrics(name, timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)')
        
        conn.commit()
        conn.close()
    
    def record_metric(self, metric: Metric):
        """Registra una métrica en la base de datos"""
        conn = sqlite3.connect(self.metrics_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO metrics (name, value, unit, timestamp, labels, service)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            metric.name,
            metric.value,
            metric.unit,
            metric.timestamp.isoformat(),
            json.dumps(metric.labels),
            metric.service
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Métrica registrada: {metric.name} = {metric.value} {metric.unit}")
    
    def get_recent_metrics(self, metric_name: str, minutes: int = 60) -> List[Dict]:
        """Obtiene métricas recientes"""
        since = datetime.now() - timedelta(minutes=minutes)
        
        conn = sqlite3.connect(self.metrics_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT name, value, unit, timestamp, labels, service
        FROM metrics
        WHERE name = ? AND timestamp >= ?
        ORDER BY timestamp DESC
        ''', (metric_name, since.isoformat()))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'name': row[0],
                'value': row[1],
                'unit': row[2],
                'timestamp': row[3],
                'labels': json.loads(row[4]),
                'service': row[5]
            })
        
        conn.close()
        return results
    
    def collect_system_metrics(self):
        """Recolecta métricas del sistema"""
        timestamp = datetime.now()
        
        # Métricas de CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        self.record_metric(Metric(
            name="system_cpu_usage",
            value=cpu_percent,
            unit="percent",
            timestamp=timestamp,
            labels={"component": "system"},
            service="system"
        ))
        
        # Métricas de memoria
        memory = psutil.virtual_memory()
        self.record_metric(Metric(
            name="system_memory_usage",
            value=memory.percent,
            unit="percent", 
            timestamp=timestamp,
            labels={"component": "system"},
            service="system"
        ))
        
        self.record_metric(Metric(
            name="system_memory_available",
            value=memory.available / (1024**3),  # GB
            unit="GB",
            timestamp=timestamp,
            labels={"component": "system"},
            service="system"
        ))
        
        # Métricas de disco
        disk = psutil.disk_usage('/')
        self.record_metric(Metric(
            name="system_disk_usage",
            value=(disk.used / disk.total) * 100,
            unit="percent",
            timestamp=timestamp,
            labels={"component": "system", "mount": "/"},
            service="system"
        ))
        
        # Métricas de red
        net_io = psutil.net_io_counters()
        self.record_metric(Metric(
            name="system_network_bytes_sent",
            value=net_io.bytes_sent,
            unit="bytes",
            timestamp=timestamp,
            labels={"component": "network", "direction": "sent"},
            service="system"
        ))
        
        self.record_metric(Metric(
            name="system_network_bytes_recv",
            value=net_io.bytes_recv,
            unit="bytes",
            timestamp=timestamp,
            labels={"component": "network", "direction": "received"},
            service="system"
        ))

class AlertManager:
    """Gestor de alertas del sistema"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
        self.active_alerts: Dict[str, Alert] = {}
        
        # Configuración de alertas
        self.alert_rules = [
            {
                'name': 'High CPU Usage',
                'metric': 'system_cpu_usage',
                'threshold': 80.0,
                'severity': 'HIGH',
                'description': 'CPU usage is above 80%'
            },
            {
                'name': 'High Memory Usage',
                'metric': 'system_memory_usage',
                'threshold': 85.0,
                'severity': 'HIGH',
                'description': 'Memory usage is above 85%'
            },
            {
                'name': 'Low Disk Space',
                'metric': 'system_disk_usage',
                'threshold': 90.0,
                'severity': 'CRITICAL',
                'description': 'Disk usage is above 90%'
            },
            {
                'name': 'GPS Data Latency',
                'metric': 'gps_data_latency',
                'threshold': 2000.0,  # 2 segundos
                'severity': 'MEDIUM',
                'description': 'GPS data processing latency is above 2 seconds'
            },
            {
                'name': 'High Error Rate',
                'metric': 'error_rate',
                'threshold': 5.0,  # 5%
                'severity': 'HIGH',
                'description': 'Error rate is above 5%'
            },
            {
                'name': 'Multiple Failed Logins',
                'metric': 'failed_logins_per_minute',
                'threshold': 10.0,
                'severity': 'CRITICAL',
                'description': 'More than 10 failed login attempts per minute'
            }
        ]
        
        # Configuración de notificaciones
        self.notification_config = {
            'email': {
                'enabled': True,
                'smtp_server': 'smtp.gmail.com',
                'smtp_port': 587,
                'username': 'alerts@hoymismogps.com',
                'password': 'app_password_here',  # Usar App Password
                'recipients': ['admin@hoymismogps.com']
            }
        }
    
    def check_alert_rules(self):
        """Verifica las reglas de alertas"""
        for rule in self.alert_rules:
            metrics = self.metrics_collector.get_recent_metrics(rule['metric'], minutes=5)
            
            if not metrics:
                continue
            
            # Obtener el valor más reciente
            current_value = metrics[0]['value']
            
            alert_id = f"{rule['name']}-{rule['metric']}"
            
            # Verificar si se debe disparar una alerta
            if current_value >= rule['threshold']:
                if alert_id not in self.active_alerts:
                    # Nueva alerta
                    alert = Alert(
                        id=alert_id,
                        name=rule['name'],
                        description=rule['description'],
                        severity=rule['severity'],
                        metric_name=rule['metric'],
                        threshold=rule['threshold'],
                        current_value=current_value,
                        timestamp=datetime.now(),
                        status='FIRING'
                    )
                    
                    self.active_alerts[alert_id] = alert
                    self._store_alert(alert)
                    self._send_alert_notification(alert)
                    
                    logger.security(
                        f"Alert triggered: {alert.name}",
                        severity=alert.severity,
                        extra_data={
                            'metric': alert.metric_name,
                            'threshold': alert.threshold,
                            'current_value': alert.current_value
                        }
                    )
            else:
                # Verificar si se debe resolver una alerta activa
                if alert_id in self.active_alerts:
                    alert = self.active_alerts[alert_id]
                    alert.status = 'RESOLVED'
                    alert.current_value = current_value
                    
                    self._update_alert(alert)
                    self._send_resolution_notification(alert)
                    
                    del self.active_alerts[alert_id]
                    
                    logger.info(
                        f"Alert resolved: {alert.name}",
                        extra_data={
                            'metric': alert.metric_name,
                            'current_value': alert.current_value
                        }
                    )
    
    def _store_alert(self, alert: Alert):
        """Almacena una alerta en la base de datos"""
        conn = sqlite3.connect(self.metrics_collector.metrics_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR REPLACE INTO alerts
        (id, name, description, severity, metric_name, threshold, 
         current_value, timestamp, status, organization_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert.id, alert.name, alert.description, alert.severity,
            alert.metric_name, alert.threshold, alert.current_value,
            alert.timestamp.isoformat(), alert.status, alert.organization_id
        ))
        
        conn.commit()
        conn.close()
    
    def _update_alert(self, alert: Alert):
        """Actualiza una alerta en la base de datos"""
        conn = sqlite3.connect(self.metrics_collector.metrics_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        UPDATE alerts
        SET current_value = ?, status = ?, resolved_at = ?
        WHERE id = ?
        ''', (
            alert.current_value, alert.status,
            datetime.now().isoformat() if alert.status == 'RESOLVED' else None,
            alert.id
        ))
        
        conn.commit()
        conn.close()
    
    def _send_alert_notification(self, alert: Alert):
        """Envía notificación de alerta"""
        if not self.notification_config['email']['enabled']:
            return
        
        try:
            subject = f"🚨 HoyMismoGPS Alert: {alert.name}"
            
            body = f"""
            <html>
            <body>
                <h2 style="color: {'red' if alert.severity == 'CRITICAL' else 'orange'};">
                    Alert: {alert.name}
                </h2>
                <p><strong>Severity:</strong> {alert.severity}</p>
                <p><strong>Description:</strong> {alert.description}</p>
                <p><strong>Metric:</strong> {alert.metric_name}</p>
                <p><strong>Threshold:</strong> {alert.threshold}</p>
                <p><strong>Current Value:</strong> {alert.current_value}</p>
                <p><strong>Time:</strong> {alert.timestamp}</p>
                <p><strong>System:</strong> HoyMismoGPS Production</p>
                
                <hr>
                <p style="font-size: 12px; color: gray;">
                This is an automated alert from HoyMismoGPS monitoring system.
                </p>
            </body>
            </html>
            """
            
            self._send_email(subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send alert notification: {e}")
    
    def _send_resolution_notification(self, alert: Alert):
        """Envía notificación de resolución de alerta"""
        if not self.notification_config['email']['enabled']:
            return
        
        try:
            subject = f"✅ HoyMismoGPS Alert Resolved: {alert.name}"
            
            body = f"""
            <html>
            <body>
                <h2 style="color: green;">Alert Resolved: {alert.name}</h2>
                <p><strong>Metric:</strong> {alert.metric_name}</p>
                <p><strong>Previous Value:</strong> {alert.current_value}</p>
                <p><strong>Threshold:</strong> {alert.threshold}</p>
                <p><strong>Resolved at:</strong> {datetime.now()}</p>
                
                <hr>
                <p style="font-size: 12px; color: gray;">
                This is an automated notification from HoyMismoGPS monitoring system.
                </p>
            </body>
            </html>
            """
            
            self._send_email(subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send resolution notification: {e}")
    
    def _send_email(self, subject: str, body: str):
        """Envía un email"""
        config = self.notification_config['email']
        
        msg = MimeMultipart()
        msg['From'] = config['username']
        msg['To'] = ', '.join(config['recipients'])
        msg['Subject'] = subject
        
        msg.attach(MimeText(body, 'html'))
        
        server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
        server.starttls()
        server.login(config['username'], config['password'])
        server.send_message(msg)
        server.quit()

class ApplicationMetrics:
    """Métricas específicas de la aplicación HoyMismoGPS"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
        self.request_counts = {}
        self.error_counts = {}
        self.latency_measurements = {}
        
    def record_request(self, endpoint: str, method: str, status_code: int, 
                      latency_ms: float, organization_id: str = None):
        """Registra métricas de request HTTP"""
        timestamp = datetime.now()
        
        # Contador de requests
        key = f"{method}:{endpoint}"
        self.request_counts[key] = self.request_counts.get(key, 0) + 1
        
        self.metrics_collector.record_metric(Metric(
            name="http_requests_total",
            value=1,
            unit="count",
            timestamp=timestamp,
            labels={
                "endpoint": endpoint,
                "method": method,
                "status_code": str(status_code),
                "organization_id": organization_id or "unknown"
            },
            service="api"
        ))
        
        # Latencia
        self.metrics_collector.record_metric(Metric(
            name="http_request_duration",
            value=latency_ms,
            unit="milliseconds",
            timestamp=timestamp,
            labels={
                "endpoint": endpoint,
                "method": method,
                "organization_id": organization_id or "unknown"
            },
            service="api"
        ))
        
        # Errores
        if status_code >= 400:
            self.error_counts[key] = self.error_counts.get(key, 0) + 1
            
            self.metrics_collector.record_metric(Metric(
                name="http_requests_errors",
                value=1,
                unit="count",
                timestamp=timestamp,
                labels={
                    "endpoint": endpoint,
                    "method": method,
                    "status_code": str(status_code),
                    "organization_id": organization_id or "unknown"
                },
                service="api"
            ))
    
    def record_gps_data(self, vehicle_id: str, organization_id: str, 
                       processing_latency_ms: float):
        """Registra métricas de datos GPS"""
        timestamp = datetime.now()
        
        self.metrics_collector.record_metric(Metric(
            name="gps_data_received",
            value=1,
            unit="count",
            timestamp=timestamp,
            labels={
                "vehicle_id": vehicle_id,
                "organization_id": organization_id
            },
            service="gps_processor"
        ))
        
        self.metrics_collector.record_metric(Metric(
            name="gps_data_latency",
            value=processing_latency_ms,
            unit="milliseconds",
            timestamp=timestamp,
            labels={
                "vehicle_id": vehicle_id,
                "organization_id": organization_id
            },
            service="gps_processor"
        ))
    
    def record_database_operation(self, operation: str, table: str, 
                                 duration_ms: float, success: bool):
        """Registra métricas de operaciones de base de datos"""
        timestamp = datetime.now()
        
        self.metrics_collector.record_metric(Metric(
            name="database_operations_total",
            value=1,
            unit="count",
            timestamp=timestamp,
            labels={
                "operation": operation,
                "table": table,
                "success": str(success).lower()
            },
            service="database"
        ))
        
        self.metrics_collector.record_metric(Metric(
            name="database_operation_duration",
            value=duration_ms,
            unit="milliseconds",
            timestamp=timestamp,
            labels={
                "operation": operation,
                "table": table
            },
            service="database"
        ))

class MonitoringService:
    """Servicio principal de monitoreo"""
    
    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager(self.metrics_collector)
        self.app_metrics = ApplicationMetrics(self.metrics_collector)
        self.running = False
        
    def start(self):
        """Inicia el servicio de monitoreo"""
        self.running = True
        logger.info("Iniciando servicio de monitoreo HoyMismoGPS")
        
        # Hilo para recolección de métricas del sistema
        metrics_thread = threading.Thread(target=self._metrics_collection_loop)
        metrics_thread.daemon = True
        metrics_thread.start()
        
        # Hilo para verificación de alertas
        alerts_thread = threading.Thread(target=self._alerts_check_loop)
        alerts_thread.daemon = True
        alerts_thread.start()
        
        logger.info("Servicio de monitoreo iniciado correctamente")
    
    def stop(self):
        """Detiene el servicio de monitoreo"""
        self.running = False
        logger.info("Servicio de monitoreo detenido")
    
    def _metrics_collection_loop(self):
        """Bucle de recolección de métricas del sistema"""
        while self.running:
            try:
                self.metrics_collector.collect_system_metrics()
                time.sleep(60)  # Recolectar cada minuto
            except Exception as e:
                logger.error(f"Error in metrics collection: {e}")
                time.sleep(60)
    
    def _alerts_check_loop(self):
        """Bucle de verificación de alertas"""
        while self.running:
            try:
                self.alert_manager.check_alert_rules()
                time.sleep(30)  # Verificar cada 30 segundos
            except Exception as e:
                logger.error(f"Error in alerts check: {e}")
                time.sleep(30)
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Obtiene un resumen de las métricas actuales"""
        summary = {
            'timestamp': datetime.now().isoformat(),
            'system_metrics': {},
            'active_alerts': len(self.alert_manager.active_alerts),
            'alerts': []
        }
        
        # Métricas del sistema más recientes
        system_metrics = [
            'system_cpu_usage',
            'system_memory_usage',
            'system_disk_usage'
        ]
        
        for metric_name in system_metrics:
            recent = self.metrics_collector.get_recent_metrics(metric_name, 5)
            if recent:
                summary['system_metrics'][metric_name] = {
                    'current_value': recent[0]['value'],
                    'unit': recent[0]['unit'],
                    'timestamp': recent[0]['timestamp']
                }
        
        # Alertas activas
        for alert in self.alert_manager.active_alerts.values():
            summary['alerts'].append({
                'name': alert.name,
                'severity': alert.severity,
                'metric': alert.metric_name,
                'current_value': alert.current_value,
                'threshold': alert.threshold
            })
        
        return summary

def main():
    """Función principal"""
    print("📊 Monitor de Métricas - HoyMismoGPS")
    print("=" * 40)
    
    monitoring = MonitoringService()
    monitoring.start()
    
    try:
        while True:
            # Mostrar resumen cada 5 minutos
            time.sleep(300)
            summary = monitoring.get_metrics_summary()
            print(f"\n📈 Resumen de métricas ({summary['timestamp']}):")
            print(f"  • CPU: {summary['system_metrics'].get('system_cpu_usage', {}).get('current_value', 'N/A')}%")
            print(f"  • Memoria: {summary['system_metrics'].get('system_memory_usage', {}).get('current_value', 'N/A')}%")
            print(f"  • Disco: {summary['system_metrics'].get('system_disk_usage', {}).get('current_value', 'N/A')}%")
            print(f"  • Alertas activas: {summary['active_alerts']}")
            
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo monitor...")
        monitoring.stop()

if __name__ == "__main__":
    main()
