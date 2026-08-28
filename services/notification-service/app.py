from flask import Flask
from dotenv import load_dotenv

from app.routes.notification_routes import mail_bp

load_dotenv()

app = Flask(__name__)

app.register_blueprint(mail_bp, url_prefix="/mail")

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )