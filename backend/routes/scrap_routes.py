from flask import Blueprint, request, jsonify
from app import db # Assuming db is initialized in app.py and imported here
from models import ScrapSale, Payment
from datetime import datetime

scrap_bp = Blueprint('scrap_bp', __name__)

@scrap_bp.route('', methods=['POST']) # Corresponds to /api/scrap-sales
def add_scrap_sale():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    required_fields = ['date_of_sale', 'material_kg', 'rate_per_kg']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        date_of_sale_str = data.get('date_of_sale')
        if date_of_sale_str:
            data['date_of_sale'] = datetime.strptime(date_of_sale_str, '%Y-%m-%d').date()
        else:
            return jsonify({"error": "date_of_sale is required"}), 400

        material_kg = float(data['material_kg'])
        rate_per_kg = float(data['rate_per_kg'])
    except ValueError:
        return jsonify({"error": "Invalid data type for material_kg, rate_per_kg, or date_of_sale."}), 400
    except Exception as e:
         return jsonify({"error": "Error processing input data", "details": str(e)}), 400


    new_sale = ScrapSale(
        date_of_sale=data['date_of_sale'],
        material_kg=material_kg,
        rate_per_kg=rate_per_kg
    )
    new_sale.calculate_totals() # Calculate total_value, amount_pending

    try:
        db.session.add(new_sale)
        db.session.commit()
        return jsonify(new_sale.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add scrap sale", "details": str(e)}), 500


@scrap_bp.route('/<int:sale_id>/payments', methods=['POST'])
def add_payment_to_sale(sale_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    scrap_sale = db.session.get(ScrapSale, sale_id)
    if not scrap_sale:
        return jsonify({"error": "Scrap sale not found"}), 404

    required_fields = ['date_of_payment', 'amount_paid']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        date_of_payment_str = data.get('date_of_payment')
        if date_of_payment_str:
            data['date_of_payment'] = datetime.strptime(date_of_payment_str, '%Y-%m-%d').date()
        else:
            return jsonify({"error": "date_of_payment is required"}), 400

        amount_paid = float(data['amount_paid'])
        if amount_paid <= 0:
            return jsonify({"error": "Amount paid must be positive"}), 400

    except ValueError:
        return jsonify({"error": "Invalid data type for amount_paid or date_of_payment."}), 400
    except Exception as e:
         return jsonify({"error": "Error processing input data", "details": str(e)}), 400

    new_payment = Payment(
        scrap_sale_id=sale_id,
        date_of_payment=data['date_of_payment'],
        amount_paid=amount_paid
    )

    try:
        db.session.add(new_payment)
        # Before commit, update the sale's payment status
        scrap_sale.payments.append(new_payment) # Ensure the payment is in the collection for calculation
        scrap_sale.update_payment_status()

        db.session.commit()
        return jsonify(new_payment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add payment", "details": str(e)}), 500


@scrap_bp.route('', methods=['GET']) # Corresponds to /api/scrap-sales
def get_scrap_sales():
    try:
        query = ScrapSale.query

        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                query = query.filter(ScrapSale.date_of_sale >= start_date)
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD."}), 400

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                query = query.filter(ScrapSale.date_of_sale <= end_date)
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD."}), 400

        # Sort by latest date first
        query = query.order_by(ScrapSale.date_of_sale.desc(), ScrapSale.id.desc())

        sales = query.all()
        # Ensure payment status is up-to-date for all sales (though it should be via add_payment)
        # For safety, could re-calculate here if needed, but ideally it's kept consistent.
        # for sale in sales:
        #     sale.update_payment_status() # Recalculate if there's a chance of stale data

        return jsonify([sale.to_dict(include_payments=True) for sale in sales]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch scrap sales", "details": str(e)}), 500
