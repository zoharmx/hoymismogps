#!/usr/bin/env python3
"""
HoyMismoGPS - Configuración de Firebase Auth
Configura custom claims y tokens para el sistema multi-tenant
"""

import firebase_admin
from firebase_admin import credentials, auth, firestore
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class FirebaseAuthManager:
    """Gestor de autenticación y autorización Firebase"""
    
    def __init__(self, service_account_path: str):
        """
        Inicializa el gestor con las credenciales de service account
        
        Args:
            service_account_path: Ruta al archivo JSON de service account
        """
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        
        # Definir roles y permisos
        self.roles_permissions = {
            'super_admin': [
                'manage_organizations', 'manage_users', 'view_all_data',
                'manage_billing', 'system_config', 'create_reports',
                'create_alerts', 'write_gps_data'
            ],
            'admin': [
                'manage_users', 'manage_vehicles', 'manage_geofences',
                'view_reports', 'manage_alerts', 'export_data',
                'create_reports', 'create_alerts'
            ],
            'operator': [
                'view_vehicles', 'view_geofences', 'view_alerts',
                'acknowledge_alerts', 'view_reports', 'manage_vehicles'
            ],
            'viewer': [
                'view_vehicles', 'view_reports'
            ]
        }
    
    def create_user_with_claims(self, email: str, password: str, 
                               organization_id: str, role: str, 
                               display_name: str) -> Dict:
        """
        Crea un usuario con custom claims específicos
        
        Args:
            email: Email del usuario
            password: Contraseña inicial
            organization_id: ID de la organización
            role: Rol del usuario
            display_name: Nombre para mostrar
            
        Returns:
            Información del usuario creado
        """
        try:
            # Crear usuario en Firebase Auth
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                email_verified=True
            )
            
            # Configurar custom claims
            custom_claims = {
                'organizationId': organization_id,
                'role': role,
                'permissions': self.roles_permissions.get(role, []),
                'createdAt': datetime.now().isoformat(),
                'active': True
            }
            
            auth.set_custom_user_claims(user_record.uid, custom_claims)
            
            # Guardar información adicional en Firestore
            user_doc = {
                'uid': user_record.uid,
                'email': email,
                'displayName': display_name,
                'organizationId': organization_id,
                'role': role,
                'permissions': custom_claims['permissions'],
                'createdAt': firestore.SERVER_TIMESTAMP,
                'lastLogin': None,
                'active': True,
                'profile': {
                    'phone': '',
                    'avatar': '',
                    'timezone': 'America/Mexico_City',
                    'language': 'es'
                }
            }
            
            self.db.collection('users').document(user_record.uid).set(user_doc)
            
            logger.info(f"✅ Usuario creado: {email} con rol {role}")
            
            return {
                'uid': user_record.uid,
                'email': email,
                'organizationId': organization_id,
                'role': role,
                'customClaims': custom_claims
            }
            
        except Exception as e:
            logger.error(f"❌ Error creando usuario {email}: {e}")
            raise
    
    def update_user_claims(self, uid: str, organization_id: Optional[str] = None,
                          role: Optional[str] = None) -> bool:
        """
        Actualiza los custom claims de un usuario
        
        Args:
            uid: UID del usuario
            organization_id: Nuevo ID de organización (opcional)
            role: Nuevo rol (opcional)
            
        Returns:
            True si la actualización fue exitosa
        """
        try:
            user = auth.get_user(uid)
            current_claims = user.custom_claims or {}
            
            # Actualizar campos especificados
            if organization_id:
                current_claims['organizationId'] = organization_id
            
            if role:
                current_claims['role'] = role
                current_claims['permissions'] = self.roles_permissions.get(role, [])
            
            current_claims['updatedAt'] = datetime.now().isoformat()
            
            auth.set_custom_user_claims(uid, current_claims)
            
            # Actualizar también en Firestore
            update_data = {}
            if organization_id:
                update_data['organizationId'] = organization_id
            if role:
                update_data['role'] = role
                update_data['permissions'] = current_claims['permissions']
            
            update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            
            self.db.collection('users').document(uid).update(update_data)
            
            logger.info(f"✅ Claims actualizados para usuario {uid}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error actualizando claims para {uid}: {e}")
            return False
    
    def create_service_account_token(self, service_name: str) -> Dict:
        """
        Crea un token para service accounts (simuladores, APIs, etc.)
        
        Args:
            service_name: Nombre del servicio
            
        Returns:
            Información del token creado
        """
        try:
            # Crear usuario técnico
            email = f"{service_name}@hoymismogps-system.com"
            
            user_record = auth.create_user(
                email=email,
                display_name=f"Service Account - {service_name}",
                email_verified=True
            )
            
            # Custom claims para service account
            custom_claims = {
                'service_account': True,
                'service_name': service_name,
                'permissions': [
                    'write_gps_data', 'create_alerts', 
                    'read_all_organizations'  # Solo para servicios del sistema
                ],
                'createdAt': datetime.now().isoformat(),
                'active': True
            }
            
            auth.set_custom_user_claims(user_record.uid, custom_claims)
            
            logger.info(f"✅ Service account creado: {service_name}")
            
            return {
                'uid': user_record.uid,
                'email': email,
                'serviceName': service_name,
                'customClaims': custom_claims
            }
            
        except Exception as e:
            logger.error(f"❌ Error creando service account {service_name}: {e}")
            raise
    
    def setup_demo_users(self):
        """Crea usuarios de demostración para el sistema"""
        demo_users = [
            {
                'email': 'admin@hoymismogps.com',
                'password': 'HoyMismo2024!',
                'organization_id': 'demo_hoymismogps',
                'role': 'super_admin',
                'display_name': 'Administrador HoyMismo'
            },
            {
                'email': 'operador@hoymismogps.com',
                'password': 'Operador2024!',
                'organization_id': 'demo_hoymismogps',
                'role': 'operator',
                'display_name': 'Operador Demo'
            },
            {
                'email': 'viewer@hoymismogps.com',
                'password': 'Viewer2024!',
                'organization_id': 'demo_hoymismogps',
                'role': 'viewer',
                'display_name': 'Visualizador Demo'
            }
        ]
        
        created_users = []
        
        for user_info in demo_users:
            try:
                user = self.create_user_with_claims(**user_info)
                created_users.append(user)
            except Exception as e:
                logger.warning(f"⚠️ No se pudo crear usuario {user_info['email']}: {e}")
        
        # Crear service accounts necesarios
        service_accounts = [
            'gps-simulator',
            'alert-processor',
            'data-processor'
        ]
        
        for service in service_accounts:
            try:
                self.create_service_account_token(service)
            except Exception as e:
                logger.warning(f"⚠️ No se pudo crear service account {service}: {e}")
        
        return created_users
    
    def verify_security_rules(self) -> List[str]:
        """
        Verifica que las reglas de seguridad estén correctamente configuradas
        
        Returns:
            Lista de posibles problemas encontrados
        """
        issues = []
        
        try:
            # Verificar que existe la colección de usuarios
            users_ref = self.db.collection('users')
            users = list(users_ref.limit(1).stream())
            
            if not users:
                issues.append("No hay usuarios en la colección 'users'")
            
            # Verificar que existe la colección de organizaciones
            orgs_ref = self.db.collection('organizations')
            orgs = list(orgs_ref.limit(1).stream())
            
            if not orgs:
                issues.append("No hay organizaciones en la colección 'organizations'")
            
            # Verificar estructura de custom claims
            for user in auth.list_users().iterate_all():
                if user.custom_claims:
                    claims = user.custom_claims
                    if 'organizationId' not in claims and not claims.get('service_account'):
                        issues.append(f"Usuario {user.email} sin organizationId en claims")
                    if 'role' not in claims and not claims.get('service_account'):
                        issues.append(f"Usuario {user.email} sin role en claims")
            
            logger.info(f"🔍 Verificación completada. {len(issues)} problemas encontrados")
            
        except Exception as e:
            issues.append(f"Error durante verificación: {e}")
        
        return issues

def main():
    """Función principal para configurar Firebase Auth"""
    print("🔐 Configurador de Firebase Auth - HoyMismoGPS")
    print("=" * 50)
    
    # Ruta al service account (debe configurarse)
    service_account_path = "/home/ubuntu/HoyMismoGPS/security/firebase-service-account.json"
    
    try:
        auth_manager = FirebaseAuthManager(service_account_path)
        
        print("🔄 Configurando usuarios de demostración...")
        users = auth_manager.setup_demo_users()
        
        print(f"✅ {len(users)} usuarios creados exitosamente")
        
        print("\n🔍 Verificando configuración de seguridad...")
        issues = auth_manager.verify_security_rules()
        
        if issues:
            print("⚠️ Problemas encontrados:")
            for issue in issues:
                print(f"  • {issue}")
        else:
            print("✅ Configuración de seguridad correcta")
        
        print("\n📋 Usuarios de demostración creados:")
        print("  • admin@hoymismogps.com (super_admin)")
        print("  • operador@hoymismogps.com (operator)")
        print("  • viewer@hoymismogps.com (viewer)")
        print("\n🔑 Contraseñas en el código fuente para desarrollo")
        
    except FileNotFoundError:
        print(f"❌ No se encontró el archivo de service account: {service_account_path}")
        print("   Descarga el archivo JSON desde Firebase Console")
    except Exception as e:
        print(f"❌ Error configurando Firebase Auth: {e}")

if __name__ == "__main__":
    main()
