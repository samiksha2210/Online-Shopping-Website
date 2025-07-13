from flask import Blueprint, request, jsonify
import pandas as pd
import os
admin_bp = Blueprint('admin', __name__)
USER_CSV = 'data/users.csv'
PRODUCT_CSV = 'data/products.csv'
ORDER_CSV = 'data/orders.csv'

@admin_bp.route('/users', methods=['GET'])
def get_users():
    df = pd.read_csv(USER_CSV) 
    return jsonify(df.to_dict(orient='records'))

@admin_bp.route('/orders', methods=['GET'])
def get_orders():
    date = request.args.get('date')
    df = pd.read_csv(ORDER_CSV)
    if date:
        df = df[df['date'] == date]
    df = df.rename(columns={
        'order ID': 'order_id',
        'user email': 'user_email',
        'total price': 'total_price',
        'date': 'date'
    })
    return jsonify(df.to_dict(orient='records'))


@admin_bp.route('/add-product', methods=['POST'])
def add_product():
    name = request.form.get('name')
    price = request.form.get('price')
    stock = request.form.get('stock')
    image = request.files.get('image')

    if not all([name, price, stock, image]):
        return jsonify({'error': 'Missing fields'}), 400

    filename = image.filename
    image_path = os.path.join('static', 'images', filename)
    os.makedirs(os.path.dirname(image_path), exist_ok=True)
    image.save(image_path)

    if os.path.exists(PRODUCT_CSV):
        df = pd.read_csv(PRODUCT_CSV)
    else:
        df = pd.DataFrame(columns=['ID', 'name', 'price', 'stock', 'image'])

    new_id = df['ID'].max() + 1 if not df.empty else 1
    df.loc[len(df)] = [new_id, name, float(price), int(stock), filename]
    df.to_csv(PRODUCT_CSV, index=False)

    return jsonify({'message': 'Product added'}), 200

@admin_bp.route('/products', methods=['GET'])
def get_products():
    df = pd.read_csv(PRODUCT_CSV)
    return jsonify(df.to_dict(orient='records'))

@admin_bp.route('/remove-product/<product_id>', methods=['DELETE'])
def remove_product(product_id):
    df = pd.read_csv(PRODUCT_CSV, dtype={'ID': str})  
    original_count = len(df)
    df = df[df['ID'] != product_id] 
    df.to_csv(PRODUCT_CSV, index=False)
    
    if len(df) < original_count:
        return jsonify({'message': f'Product {product_id} removed'})
    else:
        return jsonify({'message': f'Product {product_id} not found'}), 404
