from flask import Blueprint, request, jsonify
from app import db # Assuming db is initialized in app.py and imported here
from models import MachineMaintenanceLog
from datetime import datetime

maintenance_bp = Blueprint('maintenance_bp', __name__)

@maintenance_bp.route('/maintenance-logs', methods=['POST'])
def add_maintenance_log():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    required_fields = ['machine_name', 'department', 'date_of_maintenance', 'shift', 'technician_name', 'description', 'machine_status_after']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        # Convert date string to date object
        date_of_maintenance_str = data.get('date_of_maintenance')
        if date_of_maintenance_str:
            data['date_of_maintenance'] = datetime.strptime(date_of_maintenance_str, '%Y-%m-%d').date()
        else:
            return jsonify({"error": "date_of_maintenance is required"}), 400

    except ValueError:
        return jsonify({"error": "Invalid date format for date_of_maintenance. Use YYYY-MM-DD."}), 400

    try:
        new_log = MachineMaintenanceLog(
            machine_name=data['machine_name'],
            department=data['department'],
            date_of_maintenance=data['date_of_maintenance'],
            shift=data['shift'],
            technician_name=data['technician_name'],
            description=data['description'],
            machine_status_after=data['machine_status_after']
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify(new_log.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add maintenance log", "details": str(e)}), 500


@maintenance_bp.route('/maintenance-logs', methods=['GET'])
def get_maintenance_logs():
    try:
        query = MachineMaintenanceLog.query

        machine_name = request.args.get('machine_name')
        if machine_name:
            query = query.filter(MachineMaintenanceLog.machine_name == machine_name)

        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                query = query.filter(MachineMaintenanceLog.date_of_maintenance >= start_date)
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD."}), 400

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                query = query.filter(MachineMaintenanceLog.date_of_maintenance <= end_date)
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD."}), 400

        # Sort by latest date first
        query = query.order_by(MachineMaintenanceLog.date_of_maintenance.desc(), MachineMaintenanceLog.id.desc())

        logs = query.all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch maintenance logs", "details": str(e)}), 500
