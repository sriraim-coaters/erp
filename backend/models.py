from app import db # Changed from .app to app
from sqlalchemy.sql import func # For default timestamps

class MachineMaintenanceLog(db.Model):
    __tablename__ = 'machine_maintenance_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    machine_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False) # 'CNC' or 'Plating'
    date_of_maintenance = db.Column(db.Date, nullable=False)
    shift = db.Column(db.String(50), nullable=False) # 'Morning' / 'Evening'
    technician_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    # 'Working' / 'Needs Attention' / 'Broken'
    machine_status_after = db.Column(db.String(50), nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f'<MachineMaintenanceLog {self.machine_name} on {self.date_of_maintenance}>'

    def to_dict(self):
        return {
            'id': self.id,
            'machine_name': self.machine_name,
            'department': self.department,
            'date_of_maintenance': self.date_of_maintenance.isoformat() if self.date_of_maintenance else None,
            'shift': self.shift,
            'technician_name': self.technician_name,
            'description': self.description,
            'machine_status_after': self.machine_status_after,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class ScrapSale(db.Model):
    __tablename__ = 'scrap_sale'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_of_sale = db.Column(db.Date, nullable=False)
    material_kg = db.Column(db.Float, nullable=False)
    rate_per_kg = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False) # Calculated: material_kg * rate_per_kg
    amount_received = db.Column(db.Float, nullable=False, default=0.0)
    amount_pending = db.Column(db.Float, nullable=False, default=0.0) # Calculated: total_value - amount_received

    payments = db.relationship('Payment', backref='scrap_sale', lazy=True, cascade="all, delete-orphan")

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f'<ScrapSale id={self.id} date={self.date_of_sale} total={self.total_value}>'

    def calculate_totals(self):
        self.total_value = self.material_kg * self.rate_per_kg
        self.update_payment_status()

    def update_payment_status(self):
        self.amount_received = sum(payment.amount_paid for payment in self.payments)
        self.amount_pending = self.total_value - self.amount_received

    def to_dict(self, include_payments=True):
        data = {
            'id': self.id,
            'date_of_sale': self.date_of_sale.isoformat() if self.date_of_sale else None,
            'material_kg': self.material_kg,
            'rate_per_kg': self.rate_per_kg,
            'total_value': self.total_value,
            'amount_received': self.amount_received,
            'amount_pending': self.amount_pending,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_payments:
            data['payments'] = [payment.to_dict() for payment in self.payments]
        return data


class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    scrap_sale_id = db.Column(db.Integer, db.ForeignKey('scrap_sale.id'), nullable=False)
    date_of_payment = db.Column(db.Date, nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f'<Payment id={self.id} sale_id={self.scrap_sale_id} amount={self.amount_paid}>'

    def to_dict(self):
        return {
            'id': self.id,
            'scrap_sale_id': self.scrap_sale_id,
            'date_of_payment': self.date_of_payment.isoformat() if self.date_of_payment else None,
            'amount_paid': self.amount_paid,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
