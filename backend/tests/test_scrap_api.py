import unittest
import json
from datetime import date, timedelta
from app import create_app, db
from models import ScrapSale, Payment
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ScrapAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.from_object(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_add_scrap_sale_success(self):
        payload = {
            "date_of_sale": "2024-07-01",
            "material_kg": 100.5,
            "rate_per_kg": 50.0
        }
        response = self.client.post('/api/scrap-sales', json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['material_kg'], payload['material_kg'])
        self.assertEqual(data['rate_per_kg'], payload['rate_per_kg'])
        self.assertEqual(data['total_value'], 100.5 * 50.0)
        self.assertEqual(data['amount_received'], 0)
        self.assertEqual(data['amount_pending'], 100.5 * 50.0)
        self.assertEqual(len(data['payments']), 0)
        sale = db.session.get(ScrapSale, data['id'])
        self.assertIsNotNone(sale)

    def test_add_scrap_sale_missing_field(self):
        payload = {"date_of_sale": "2024-07-01", "material_kg": 100.5} # Missing rate_per_kg
        response = self.client.post('/api/scrap-sales', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertTrue('Missing field: rate_per_kg' in data['error'])

    def test_add_scrap_sale_invalid_data_type(self):
        payload = {"date_of_sale": "2024-07-01", "material_kg": "not-a-float", "rate_per_kg": 50.0}
        response = self.client.post('/api/scrap-sales', json=payload)
        self.assertEqual(response.status_code, 400) # Expecting error due to float conversion
        data = response.get_json()
        self.assertIn('error', data)
        self.assertTrue('Invalid data type' in data['error'].lower() or 'error processing input data' in data['error'].lower())


    def test_get_scrap_sales_empty(self):
        response = self.client.get('/api/scrap-sales')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def _create_sale(self, days_offset, kg, rate):
        sale = ScrapSale(
            date_of_sale=date.today() - timedelta(days=days_offset),
            material_kg=kg,
            rate_per_kg=rate
        )
        sale.calculate_totals()
        db.session.add(sale)
        db.session.commit() # Commit to get ID for payments
        return sale

    def test_add_payment_to_sale(self):
        sale = self._create_sale(1, 100, 10) # total_value = 1000

        payment_payload = {
            "date_of_payment": (date.today() - timedelta(days=1)).isoformat(),
            "amount_paid": 200.0
        }
        response = self.client.post(f'/api/scrap-sales/{sale.id}/payments', json=payment_payload)
        self.assertEqual(response.status_code, 201)
        payment_data = response.get_json()
        self.assertEqual(payment_data['amount_paid'], 200.0)
        self.assertEqual(payment_data['scrap_sale_id'], sale.id)

        updated_sale = db.session.get(ScrapSale, sale.id)
        self.assertEqual(updated_sale.amount_received, 200.0)
        self.assertEqual(updated_sale.amount_pending, 800.0)

        # Add another payment
        payment_payload_2 = {
            "date_of_payment": date.today().isoformat(),
            "amount_paid": 300.0
        }
        response = self.client.post(f'/api/scrap-sales/{sale.id}/payments', json=payment_payload_2)
        self.assertEqual(response.status_code, 201)

        updated_sale_2 = db.session.get(ScrapSale, sale.id)
        self.assertEqual(updated_sale_2.amount_received, 500.0) # 200 + 300
        self.assertEqual(updated_sale_2.amount_pending, 500.0) # 1000 - 500

    def test_add_payment_to_nonexistent_sale(self):
        payment_payload = {"date_of_payment": date.today().isoformat(), "amount_paid": 100.0}
        response = self.client.post('/api/scrap-sales/999/payments', json=payment_payload)
        self.assertEqual(response.status_code, 404)

    def test_add_payment_invalid_amount(self):
        sale = self._create_sale(1, 100, 10)
        payment_payload = {"date_of_payment": date.today().isoformat(), "amount_paid": -50.0}
        response = self.client.post(f'/api/scrap-sales/{sale.id}/payments', json=payment_payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], "Amount paid must be positive")


    def test_get_scrap_sales_with_data_and_payments(self):
        sale1 = self._create_sale(2, 50, 20) # id=1, total=1000
        sale2 = self._create_sale(1, 100, 10) # id=2, total=1000

        # Add payment to sale2
        self.client.post(f'/api/scrap-sales/{sale2.id}/payments', json={
            "date_of_payment": (date.today() - timedelta(days=1)).isoformat(), "amount_paid": 250.0
        })

        response = self.client.get('/api/scrap-sales')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 2)

        # Check sorting (latest sale first - sale2)
        self.assertEqual(data[0]['id'], sale2.id)
        self.assertEqual(data[0]['amount_received'], 250.0)
        self.assertEqual(data[0]['amount_pending'], 750.0)
        self.assertEqual(len(data[0]['payments']), 1)
        self.assertEqual(data[0]['payments'][0]['amount_paid'], 250.0)

        self.assertEqual(data[1]['id'], sale1.id)
        self.assertEqual(data[1]['amount_received'], 0)
        self.assertEqual(len(data[1]['payments']), 0)

        # Test filtering by date
        target_date_sale1 = (date.today() - timedelta(days=2)).isoformat()
        response_filtered = self.client.get(f'/api/scrap-sales?start_date={target_date_sale1}&end_date={target_date_sale1}')
        self.assertEqual(response_filtered.status_code, 200)
        data_filtered = response_filtered.get_json()
        self.assertEqual(len(data_filtered), 1)
        self.assertEqual(data_filtered[0]['id'], sale1.id)


if __name__ == '__main__':
    unittest.main()
