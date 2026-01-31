from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()

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
