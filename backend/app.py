from flask import Flask, send_from_directory
from flask_cors import CORS
from auth import auth_bp
from admin import admin_bp
from user import user_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(user_bp, url_prefix='/user')

@app.route('/static/images/<filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/images'), filename)

@app.route('/')
def home():
    return {"message": "Backend is running!"}

if __name__ == '__main__':
    app.run(debug=True)
