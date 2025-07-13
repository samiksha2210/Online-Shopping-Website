from flask import Blueprint, request, jsonify
import pandas as pd
import os
from utils import generate_code
from email_service import send_email, send_reset_code_email


auth_bp = Blueprint('auth', __name__)
USER_CSV = 'data/users.csv'
ADMIN_CSV = 'data/admin.csv'
RESET_CODES = {}  

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if not os.path.exists(USER_CSV):
        pd.DataFrame(columns=['email', 'password']).to_csv(USER_CSV, index=False)

    df = pd.read_csv(USER_CSV)

    if email in df['email'].values:
        return jsonify({'error': 'Email already exists'}), 400

    new_row = pd.DataFrame([{'email': email, 'password': password}])
    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(USER_CSV, index=False)

    return jsonify({'message': 'Signup successful'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    is_admin = data.get('admin', False)
    csv_file = ADMIN_CSV if is_admin else USER_CSV

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if not os.path.exists(csv_file):
        return jsonify({'error': 'User database not found'}), 500

    df = pd.read_csv(csv_file)

    match = df[(df['email'] == email) & (df['password'] == password)]

    if not match.empty:
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
    
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    code = generate_code()
    RESET_CODES[email] = code

    send_reset_code_email(email, code)
    return jsonify({'message': 'Reset code sent to your email'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email, code = data['email'], data['code']

    if RESET_CODES.get(email) != code:
        return jsonify({'error': 'Invalid code'}), 400

    new_pass = data['new_password']

    if not os.path.exists(USER_CSV):
        return jsonify({'error': 'User database not found'}), 500

    df = pd.read_csv(USER_CSV)
    df.loc[df['email'] == email, 'password'] = new_pass
    df.to_csv(USER_CSV, index=False)

    del RESET_CODES[email]
    return jsonify({'message': 'Password reset successful'}), 200