#!/usr/bin/env python3
"""
HoyMismoGPS - Sistema de Logging Centralizado
Logging estructurado para todas las operaciones críticas
"""

import logging
import json
import datetime
import os
import sys
from typing import Dict, Any, Optional
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path
import traceback
import socket
import threading
from dataclasses import dataclass, asdict

@dataclass
class LogEntry:
    """Entrada de log estructurada"""
    timestamp: str
    level: str
    logger: str
    message: str
    module: str
    function: str
    line: int
    thread_id: str
    process_id: int
    hostname: str
    service: str
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    latency_ms: Optional[float] = None
    extra_data: Optional[Dict[str, Any]] = None
    stack_trace: Optional[str] = None

class HoyMismoGPSLogger:
    """Logger personalizado para HoyMismoGPS"""
    
    def __init__(self, service_name: str, log_dir: str = "/home/ubuntu/HoyMismoGPS/logs"):
        self.service_name = service_name
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.hostname = socket.gethostname()
        
        # Configuración de loggers
        self.setup_loggers()
        
    def setup_loggers(self):
        """Configura los diferentes tipos de loggers"""
        
        # Logger principal de aplicación
        self.app_logger = logging.getLogger(f"{self.service_name}.app")
        self.app_logger.setLevel(logging.INFO)
        
        # Logger de seguridad
        self.security_logger = logging.getLogger(f"{self.service_name}.security")
        self.security_logger.setLevel(logging.WARNING)
        
        # Logger de auditoría
        self.audit_logger = logging.getLogger(f"{self.service_name}.audit")
        self.audit_logger.setLevel(logging.INFO)
        
        # Logger de performance
        self.perf_logger = logging.getLogger(f"{self.service_name}.performance")
        self.perf_logger.setLevel(logging.INFO)
        
        # Logger de errores
        self.error_logger = logging.getLogger(f"{self.service_name}.error")
        self.error_logger.setLevel(logging.ERROR)
        
        # Configurar handlers
        self._setup_handlers()
        
    def _setup_handlers(self):
        """Configura los handlers de logging"""
        
        # Formatter personalizado
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Handler para logs de aplicación (rotating por tamaño)
        app_handler = RotatingFileHandler(
            self.log_dir / f"{self.service_name}_app.log",
            maxBytes=50*1024*1024,  # 50MB
            backupCount=10
        )
        app_handler.setFormatter(formatter)
        self.app_logger.addHandler(app_handler)
        
        # Handler para logs de seguridad (rotating diario)
        security_handler = TimedRotatingFileHandler(
            self.log_dir / f"{self.service_name}_security.log",
            when='midnight',
            interval=1,
            backupCount=90,  # 90 días
            encoding='utf-8'
        )
        security_handler.setFormatter(formatter)
        self.security_logger.addHandler(security_handler)
        
        # Handler para logs de auditoría (permanente)
        audit_handler = TimedRotatingFileHandler(
            self.log_dir / f"{self.service_name}_audit.log",
            when='midnight',
            interval=1,
            backupCount=365,  # 1 año
            encoding='utf-8'
        )
        audit_handler.setFormatter(formatter)
        self.audit_logger.addHandler(audit_handler)
        
        # Handler para performance
        perf_handler = RotatingFileHandler(
            self.log_dir / f"{self.service_name}_performance.log",
            maxBytes=100*1024*1024,  # 100MB
            backupCount=5
        )
        perf_handler.setFormatter(formatter)
        self.perf_logger.addHandler(perf_handler)
        
        # Handler para errores críticos
        error_handler = RotatingFileHandler(
            self.log_dir / f"{self.service_name}_errors.log",
            maxBytes=50*1024*1024,  # 50MB
            backupCount=20
        )
        error_handler.setFormatter(formatter)
        self.error_logger.addHandler(error_handler)
        
        # Handler para consola (solo en desarrollo)
        if os.getenv('ENVIRONMENT', 'production') != 'production':
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(formatter)
            self.app_logger.addHandler(console_handler)
    
    def _create_log_entry(self, level: str, message: str, 
                         organization_id: Optional[str] = None,
                         user_id: Optional[str] = None,
                         request_id: Optional[str] = None,
                         latency_ms: Optional[float] = None,
                         extra_data: Optional[Dict[str, Any]] = None,
                         include_stack: bool = False) -> LogEntry:
        """Crea una entrada de log estructurada"""
        
        # Obtener información del frame de llamada
        frame = sys._getframe(2)
        
        entry = LogEntry(
            timestamp=datetime.datetime.now().isoformat(),
            level=level,
            logger=f"{self.service_name}",
            message=message,
            module=frame.f_code.co_filename.split('/')[-1],
            function=frame.f_code.co_name,
            line=frame.f_lineno,
            thread_id=threading.current_thread().name,
            process_id=os.getpid(),
            hostname=self.hostname,
            service=self.service_name,
            organization_id=organization_id,
            user_id=user_id,
            request_id=request_id,
            latency_ms=latency_ms,
            extra_data=extra_data,
            stack_trace=traceback.format_exc() if include_stack else None
        )
        
        return entry
    
    def _log_structured(self, logger: logging.Logger, entry: LogEntry):
        """Registra una entrada estructurada"""
        # Log como JSON para procesamiento automático
        json_log = json.dumps(asdict(entry), default=str, ensure_ascii=False)
        logger.info(json_log)
    
    # Métodos públicos de logging
    def info(self, message: str, organization_id: Optional[str] = None,
             user_id: Optional[str] = None, request_id: Optional[str] = None,
             extra_data: Optional[Dict[str, Any]] = None):
        """Log de información general"""
        entry = self._create_log_entry(
            'INFO', message, organization_id, user_id, 
            request_id, extra_data=extra_data
        )
        self._log_structured(self.app_logger, entry)
    
    def warning(self, message: str, organization_id: Optional[str] = None,
                user_id: Optional[str] = None, request_id: Optional[str] = None,
                extra_data: Optional[Dict[str, Any]] = None):
        """Log de advertencia"""
        entry = self._create_log_entry(
            'WARNING', message, organization_id, user_id,
            request_id, extra_data=extra_data
        )
        self._log_structured(self.app_logger, entry)
    
    def error(self, message: str, organization_id: Optional[str] = None,
              user_id: Optional[str] = None, request_id: Optional[str] = None,
              extra_data: Optional[Dict[str, Any]] = None, include_stack: bool = True):
        """Log de error"""
        entry = self._create_log_entry(
            'ERROR', message, organization_id, user_id,
            request_id, extra_data=extra_data, include_stack=include_stack
        )
        self._log_structured(self.error_logger, entry)
    
    def security(self, message: str, organization_id: Optional[str] = None,
                 user_id: Optional[str] = None, request_id: Optional[str] = None,
                 severity: str = 'MEDIUM', 
                 extra_data: Optional[Dict[str, Any]] = None):
        """Log de eventos de seguridad"""
        security_data = {
            'severity': severity,
            'event_type': 'security',
            **(extra_data or {})
        }
        
        entry = self._create_log_entry(
            'SECURITY', message, organization_id, user_id,
            request_id, extra_data=security_data
        )
        self._log_structured(self.security_logger, entry)
    
    def audit(self, action: str, resource: str, result: str,
              organization_id: Optional[str] = None,
              user_id: Optional[str] = None,
              request_id: Optional[str] = None,
              extra_data: Optional[Dict[str, Any]] = None):
        """Log de auditoría para acciones críticas"""
        audit_data = {
            'action': action,
            'resource': resource,
            'result': result,
            'event_type': 'audit',
            **(extra_data or {})
        }
        
        message = f"Action: {action} on {resource} - Result: {result}"
        
        entry = self._create_log_entry(
            'AUDIT', message, organization_id, user_id,
            request_id, extra_data=audit_data
        )
        self._log_structured(self.audit_logger, entry)
    
    def performance(self, operation: str, latency_ms: float,
                   organization_id: Optional[str] = None,
                   user_id: Optional[str] = None,
                   request_id: Optional[str] = None,
                   extra_data: Optional[Dict[str, Any]] = None):
        """Log de métricas de rendimiento"""
        perf_data = {
            'operation': operation,
            'latency_ms': latency_ms,
            'event_type': 'performance',
            **(extra_data or {})
        }
        
        message = f"Operation: {operation} completed in {latency_ms:.2f}ms"
        
        entry = self._create_log_entry(
            'PERFORMANCE', message, organization_id, user_id,
            request_id, latency_ms, perf_data
        )
        self._log_structured(self.perf_logger, entry)
    
    def gps_data_received(self, vehicle_id: str, organization_id: str,
                         latency_ms: float, request_id: Optional[str] = None):
        """Log específico para recepción de datos GPS"""
        self.performance(
            operation='gps_data_received',
            latency_ms=latency_ms,
            organization_id=organization_id,
            request_id=request_id,
            extra_data={'vehicle_id': vehicle_id}
        )
        
        self.audit(
            action='GPS_DATA_RECEIVED',
            resource=f'vehicle:{vehicle_id}',
            result='SUCCESS',
            organization_id=organization_id,
            request_id=request_id,
            extra_data={'latency_ms': latency_ms}
        )
    
    def user_login(self, user_id: str, organization_id: str,
                   ip_address: str, user_agent: str,
                   result: str, request_id: Optional[str] = None):
        """Log específico para login de usuarios"""
        self.audit(
            action='USER_LOGIN',
            resource=f'user:{user_id}',
            result=result,
            organization_id=organization_id,
            user_id=user_id,
            request_id=request_id,
            extra_data={
                'ip_address': ip_address,
                'user_agent': user_agent
            }
        )
        
        if result != 'SUCCESS':
            self.security(
                message=f"Failed login attempt for user {user_id} from {ip_address}",
                organization_id=organization_id,
                user_id=user_id,
                request_id=request_id,
                severity='HIGH',
                extra_data={
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'failure_reason': result
                }
            )
    
    def unauthorized_access(self, user_id: str, organization_id: str,
                           resource: str, ip_address: str,
                           request_id: Optional[str] = None):
        """Log específico para intentos de acceso no autorizados"""
        self.security(
            message=f"Unauthorized access attempt by user {user_id} to {resource} from {ip_address}",
            organization_id=organization_id,
            user_id=user_id,
            request_id=request_id,
            severity='CRITICAL',
            extra_data={
                'resource': resource,
                'ip_address': ip_address,
                'event_type': 'unauthorized_access'
            }
        )

# Instancia global del logger
_logger_instances = {}

def get_logger(service_name: str) -> HoyMismoGPSLogger:
    """Obtiene o crea una instancia del logger para un servicio"""
    if service_name not in _logger_instances:
        _logger_instances[service_name] = HoyMismoGPSLogger(service_name)
    return _logger_instances[service_name]

# Funciones de conveniencia
def info(message: str, service: str = "hoymismogps", **kwargs):
    """Log de información"""
    get_logger(service).info(message, **kwargs)

def error(message: str, service: str = "hoymismogps", **kwargs):
    """Log de error"""
    get_logger(service).error(message, **kwargs)

def security(message: str, service: str = "hoymismogps", **kwargs):
    """Log de seguridad"""
    get_logger(service).security(message, **kwargs)

def audit(action: str, resource: str, result: str, service: str = "hoymismogps", **kwargs):
    """Log de auditoría"""
    get_logger(service).audit(action, resource, result, **kwargs)

def performance(operation: str, latency_ms: float, service: str = "hoymismogps", **kwargs):
    """Log de performance"""
    get_logger(service).performance(operation, latency_ms, **kwargs)

if __name__ == "__main__":
    # Prueba del sistema de logging
    logger = get_logger("test")
    
    logger.info("Sistema de logging inicializado", extra_data={"version": "1.0"})
    logger.performance("test_operation", 123.45, extra_data={"test": True})
    logger.audit("TEST_ACTION", "test_resource", "SUCCESS", extra_data={"test": True})
    logger.security("Prueba de alerta de seguridad", severity="LOW")
    logger.error("Prueba de error", extra_data={"error_code": "TEST_001"})
    
    print("✅ Prueba de logging completada. Revisa los archivos en /home/ubuntu/HoyMismoGPS/logs/")
