from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
import yaml
import os

db = SQLAlchemy()
jwt = JWTManager()
swagger = Swagger()

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.config.Config")

    # Configuración CORS para permitir peticiones desde el frontend
    CORS(app, 
         resources={r"/*": {"origins": [
             "http://localhost:5173", 
             "http://127.0.0.1:5173", 
             "http://localhost:3000",
             "http://192.168.208.1:3000"
         ]}},
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         supports_credentials=True,
         expose_headers=["Content-Type", "Authorization"]
    )
    
    db.init_app(app)
    jwt.init_app(app)
    
    # Inicialización de Flasgger cargando el template manualmente
    openapi_path = os.path.join(app.root_path, '../openapi.yaml')
    with open(openapi_path, 'r', encoding='utf-8') as f:
        template = yaml.safe_load(f)
    
    swagger.template = template
    
    # Configuración explícita para OpenAPI 3.0
    app.config['SWAGGER'] = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,  # all in
                "model_filter": lambda tag: True,  # all in
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/",
        "openapi": "3.0.0" # Forzamos versión 3 para evitar conflicto
    }
    
    swagger.init_app(app)

    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.clients import clients_bp
    app.register_blueprint(clients_bp)

    from app.routes.orders import orders_bp
    app.register_blueprint(orders_bp)

    from app.routes.reports import reports_bp
    app.register_blueprint(reports_bp)

    from app.routes.ai import ai_bp
    app.register_blueprint(ai_bp)

    from app.routes.payments import payments_bp
    app.register_blueprint(payments_bp)

    from app.routes.services import services_bp
    app.register_blueprint(services_bp, url_prefix='/services')

    from app.routes.inventory import inventory_bp
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    return app
