from flask import Flask
from app.routes.ticket_routes import ticket_bp
from app.routes.categorias_routes import categoria_bp
from app.routes.empresa_routes import empresa_bp

app = Flask(__name__)

app.register_blueprint(ticket_bp, url_prefix="/ticket")
app.register_blueprint(empresa_bp, url_prefix="/empresa")
app.register_blueprint(categoria_bp, url_prefix="/categoria")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)