import unittest
import json
from datetime import date, timedelta
from app import create_app, db
from models import MachineMaintenanceLog
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:' # Use in-memory SQLite for tests
    # SQLALCHEMY_DATABASE_URI = 'sqlite:///test_project.db' # Or a temporary file
    WTF_CSRF_ENABLED = False # Disable CSRF for testing forms if any; not relevant for JSON API here


class MaintenanceAPITestCase(unittest.TestCase):
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
        # import os
        # if TestConfig.SQLALCHEMY_DATABASE_URI == 'sqlite:///test_project.db':
        #     if os.path.exists('test_project.db'):
        #         os.remove('test_project.db')

    def test_add_maintenance_log_success(self):
        payload = {
            "machine_name": "CNC-001",
            "department": "CNC",
            "date_of_maintenance": "2024-07-01",
            "shift": "Morning",
            "technician_name": "Test Tech",
            "description": "Routine checkup",
            "machine_status_after": "Working"
        }
        response = self.client.post('/api/machines/maintenance-logs', json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['machine_name'], payload['machine_name'])
        log = db.session.get(MachineMaintenanceLog, data['id'])
        self.assertIsNotNone(log)

    def test_add_maintenance_log_missing_field(self):
        payload = { # Missing machine_name
            "department": "CNC",
            "date_of_maintenance": "2024-07-01",
            "shift": "Morning",
            "technician_name": "Test Tech",
            "description": "Routine checkup",
            "machine_status_after": "Working"
        }
        response = self.client.post('/api/machines/maintenance-logs', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertTrue('Missing field: machine_name' in data['error'])

    def test_add_maintenance_log_invalid_date(self):
        payload = {
            "machine_name": "CNC-002",
            "department": "CNC",
            "date_of_maintenance": "invalid-date-format",
            "shift": "Evening",
            "technician_name": "Test Tech 2",
            "description": "Oil change",
            "machine_status_after": "Needs Attention"
        }
        response = self.client.post('/api/machines/maintenance-logs', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertTrue('Invalid date format' in data['error'])

    def test_get_maintenance_logs_empty(self):
        response = self.client.get('/api/machines/maintenance-logs')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 0)

    def _create_log(self, machine_name, days_offset, status):
        log = MachineMaintenanceLog(
            machine_name=machine_name,
            department="CNC",
            date_of_maintenance=date.today() - timedelta(days=days_offset),
            shift="Morning",
            technician_name="Tech " + machine_name,
            description="Log " + status,
            machine_status_after=status
        )
        db.session.add(log)
        return log

    def test_get_maintenance_logs_with_data_and_filters(self):
        self._create_log("CNC-001", 1, "Working")
        self._create_log("CNC-002", 2, "Needs Attention")
        self._create_log("CNC-001", 3, "Broken")
        db.session.commit()

        # Get all
        response = self.client.get('/api/machines/maintenance-logs')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 3)
        # Check sorting (latest first)
        self.assertEqual(data[0]['machine_name'], "CNC-001") # days_offset=1
        self.assertEqual(data[0]['description'], "Log Working")

        # Filter by machine_name
        response = self.client.get('/api/machines/maintenance-logs?machine_name=CNC-001')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(item['machine_name'] == "CNC-001" for item in data))

        # Filter by date range (exact date)
        target_date = (date.today() - timedelta(days=2)).isoformat()
        response = self.client.get(f'/api/machines/maintenance-logs?start_date={target_date}&end_date={target_date}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['machine_name'], "CNC-002")

        # Filter by machine_name and date_range
        target_date_cnc1_recent = (date.today() - timedelta(days=1)).isoformat()
        response = self.client.get(f'/api/machines/maintenance-logs?machine_name=CNC-001&start_date={target_date_cnc1_recent}&end_date={target_date_cnc1_recent}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['machine_name'], "CNC-001")
        self.assertEqual(data[0]['description'], "Log Working")

if __name__ == '__main__':
    unittest.main()
