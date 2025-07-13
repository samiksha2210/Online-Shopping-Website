from flask import Blueprint, request, jsonify
import pandas as pd
import datetime, random, os
from email_service import send_email

user_bp = Blueprint('user', __name__)

PRODUCT_CSV = 'data/products.csv'
CART_CSV = 'data/cart.csv'
ORDER_CSV = 'data/orders.csv'

@user_bp.route('/products', methods=['GET'])
def get_products():
    query = request.args.get('search')
    if not os.path.exists(PRODUCT_CSV):
        return jsonify([])

    df = pd.read_csv(PRODUCT_CSV)
    if query:
        df = df[df['name'].str.contains(query, case=False, na=False)]
    return jsonify(df.to_dict(orient='records'))

@user_bp.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    if os.path.exists(CART_CSV):
        df = pd.read_csv(CART_CSV)
    else:
        df = pd.DataFrame(columns=['email', 'product_id', 'quantity'])

    new_row = pd.DataFrame([{
        'email': data['email'],
        'product_id': data['product_id'],
        'quantity': data['quantity']
    }])
    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(CART_CSV, index=False)
    return jsonify({'message': 'Added to cart'})

@user_bp.route('/cart/<email>', methods=['GET'])
def get_cart(email):
    if not os.path.exists(CART_CSV):
        return jsonify([])
    df = pd.read_csv(CART_CSV)
    user_cart = df[df['email'] == email]
    return jsonify(user_cart.to_dict(orient='records'))

@user_bp.route('/place-order', methods=['POST'])
def place_order():
    email = request.json['email']

    cart_df = pd.read_csv(CART_CSV)
    user_cart = cart_df[cart_df['email'] == email]

    if user_cart.empty:
        return jsonify({'error': 'Cart is empty'}), 400

    prod_df = pd.read_csv(PRODUCT_CSV)
    prod_df.set_index('ID', inplace=True)
    total = 0

    for _, row in user_cart.iterrows():
        pid, qty = int(row['product_id']), int(row['quantity'])
        if pid not in prod_df.index:
            return jsonify({'error': f'Product ID {pid} not found'}), 400
        if qty > int(prod_df.at[pid, 'stock']):
            return jsonify({'error': f'Only {prod_df.at[pid, "stock"]} in stock for {prod_df.at[pid, "name"]}'}), 400
        total += float(prod_df.at[pid, 'price']) * qty
        prod_df.at[pid, 'stock'] -= qty

    order_id = str(random.randint(10000, 99999))
    date = datetime.date.today().isoformat()

    if os.path.exists(ORDER_CSV):
        order_df = pd.read_csv(ORDER_CSV)
    else:
        order_df = pd.DataFrame(columns=['order_id', 'email', 'amount', 'date'])

    new_order = pd.DataFrame([[order_id, email, total, date]],
                             columns=['order_id', 'email', 'amount', 'date'])
    order_df = pd.concat([order_df, new_order], ignore_index=True)
    order_df.to_csv(ORDER_CSV, index=False)

    
    prod_df.reset_index(inplace=True)
    prod_df.to_csv(PRODUCT_CSV, index=False)

    
    cart_df = cart_df[cart_df['email'] != email]
    cart_df.to_csv(CART_CSV, index=False)

    
    send_email(email, f"Order #{order_id} confirmed.\nTotal: ₹{total:.2f}\nDate: {date}")

    return jsonify({'message': 'Order placed', 'order_id': order_id})

@user_bp.route('/cart/remove', methods=['POST'])
def remove_from_cart():
    data = request.json
    if not os.path.exists(CART_CSV):
        return jsonify({'message': 'Cart is already empty'})
    df = pd.read_csv(CART_CSV)
    df = df[~((df['email'] == data['email']) & (df['product_id'].astype(str) == str(data['product_id'])))]
    df.to_csv(CART_CSV, index=False)
    return jsonify({'message': 'Item removed from cart'})

@user_bp.route('/orders/<email>', methods=['GET'])
def get_user_orders(email):
    if not os.path.exists('data/orders.csv') or not os.path.exists('data/cart.csv') or not os.path.exists('data/products.csv'):
        return jsonify([])

    order_df = pd.read_csv('data/orders.csv')
    cart_df = pd.read_csv('data/cart.csv')  
    product_df = pd.read_csv('data/products.csv')

    user_orders = order_df[order_df['email'] == email]

    result = []
    for _, row in user_orders.iterrows():
        order_id = row['order_id']
        date = row['date']
        amount = row['amount']

        
        items = []
        
        same_day_cart = cart_df[(cart_df['email'] == email)]
        for _, item in same_day_cart.iterrows():
            product_id = int(item['product_id'])
            product = product_df[product_df['ID'] == product_id].iloc[0]
            quantity = int(item['quantity'])
            items.append({
                'name': product['name'],
                'quantity': quantity,
                'price': float(product['price']) * quantity
            })

        result.append({
            'order_id': order_id,
            'date': date,
            'amount': amount,
            'items': items
        })

    return jsonify(result)
