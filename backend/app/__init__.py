from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.config.Config")

    CORS(app)
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

    return app
