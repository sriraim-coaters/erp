# Backend API Documentation

This document outlines the API endpoints available in the Flask backend.

## Base URL

All API endpoints are prefixed with `/api`.
The application runs on `http://localhost:5000` by default.
So, the full base URL for API calls would be `http://localhost:5000/api`.

## Health Check

*   **Endpoint:** `/health`
*   **Method:** `GET`
*   **Description:** Checks if the backend service is running.
*   **Response (200 OK):**
    ```json
    {
      "status": "healthy",
      "message": "Backend is running!"
    }
    ```

## Machine Maintenance Logs

Base path: `/machines/maintenance-logs`

### Add Maintenance Log

*   **Endpoint:** `/machines/maintenance-logs`
*   **Method:** `POST`
*   **Description:** Adds a new maintenance log for a machine.
*   **Request Body (JSON):**
    ```json
    {
      "machine_name": "string",
      "department": "string (e.g., 'CNC', 'Plating')",
      "date_of_maintenance": "string (YYYY-MM-DD)",
      "shift": "string ('Morning' or 'Evening')",
      "technician_name": "string",
      "description": "string (text description of work done)",
      "machine_status_after": "string ('Working', 'Needs Attention', or 'Broken')"
    }
    ```
*   **Response (201 Created):** The created maintenance log object.
    ```json
    {
      "id": "integer",
      "machine_name": "string",
      "department": "string",
      "date_of_maintenance": "string (YYYY-MM-DD)",
      "shift": "string",
      "technician_name": "string",
      "description": "string",
      "machine_status_after": "string",
      "created_at": "string (ISO 8601 datetime)",
      "updated_at": "string (ISO 8601 datetime, optional)"
    }
    ```
*   **Response (400 Bad Request):** If input is invalid or missing fields.

### Get Maintenance Logs

*   **Endpoint:** `/machines/maintenance-logs`
*   **Method:** `GET`
*   **Description:** Fetches maintenance logs, sorted by latest date first.
*   **Query Parameters (Optional):**
    *   `machine_name` (string): Filter by exact machine name.
    *   `start_date` (string, YYYY-MM-DD): Filter logs on or after this date.
    *   `end_date` (string, YYYY-MM-DD): Filter logs on or before this date.
*   **Response (200 OK):** An array of maintenance log objects.
    ```json
    [
      {
        "id": "integer",
        "machine_name": "string",
        // ... other fields as above
      }
    ]
    ```

## Scrap Sales Tracking

Base path: `/scrap-sales`

### Add Scrap Sale

*   **Endpoint:** `/scrap-sales`
*   **Method:** `POST`
*   **Description:** Logs a new scrap sale. `total_value`, `amount_received`, and `amount_pending` are calculated by the backend.
*   **Request Body (JSON):**
    ```json
    {
      "date_of_sale": "string (YYYY-MM-DD)",
      "material_kg": "float (weight in KG)",
      "rate_per_kg": "float (rate per KG in ₹)"
    }
    ```
*   **Response (201 Created):** The created scrap sale object, including calculated totals and an empty payments list.
    ```json
    {
      "id": "integer",
      "date_of_sale": "string (YYYY-MM-DD)",
      "material_kg": "float",
      "rate_per_kg": "float",
      "total_value": "float",
      "amount_received": 0.0,
      "amount_pending": "float (equal to total_value initially)",
      "payments": [],
      "created_at": "string (ISO 8601 datetime)",
      "updated_at": "string (ISO 8601 datetime, optional)"
    }
    ```

### Add Payment to Scrap Sale

*   **Endpoint:** `/scrap-sales/<int:sale_id>/payments`
*   **Method:** `POST`
*   **Description:** Adds a payment record to a specific scrap sale. This updates the `amount_received` and `amount_pending` on the parent scrap sale.
*   **Request Body (JSON):**
    ```json
    {
      "date_of_payment": "string (YYYY-MM-DD)",
      "amount_paid": "float (amount of payment)"
    }
    ```
*   **Response (201 Created):** The created payment object.
    ```json
    {
      "id": "integer",
      "scrap_sale_id": "integer",
      "date_of_payment": "string (YYYY-MM-DD)",
      "amount_paid": "float",
      "created_at": "string (ISO 8601 datetime)",
      "updated_at": "string (ISO 8601 datetime, optional)"
    }
    ```
*   **Response (404 Not Found):** If `sale_id` does not exist.

### Get Scrap Sales

*   **Endpoint:** `/scrap-sales`
*   **Method:** `GET`
*   **Description:** Fetches scrap sales, sorted by latest date first. Each sale includes its payment history.
*   **Query Parameters (Optional):**
    *   `start_date` (string, YYYY-MM-DD): Filter sales on or after this date.
    *   `end_date` (string, YYYY-MM-DD): Filter sales on or before this date.
*   **Response (200 OK):** An array of scrap sale objects, each including a list of its payments.
    ```json
    [
      {
        "id": "integer",
        "date_of_sale": "string (YYYY-MM-DD)",
        "material_kg": "float",
        "rate_per_kg": "float",
        "total_value": "float",
        "amount_received": "float",
        "amount_pending": "float",
        "created_at": "string (ISO 8601 datetime)",
        "updated_at": "string (ISO 8601 datetime, optional)",
        "payments": [
          {
            "id": "integer",
            "scrap_sale_id": "integer",
            "date_of_payment": "string (YYYY-MM-DD)",
            "amount_paid": "float",
            "created_at": "string (ISO 8601 datetime)",
            "updated_at": "string (ISO 8601 datetime, optional)"
          }
          // ... more payments
        ]
      }
      // ... more sales
    ]
    ```

## Error Responses

*   **400 Bad Request:** Typically for invalid input, missing fields, or incorrect data types. The response body will usually contain an `error` field with a descriptive message.
    ```json
    { "error": "Descriptive error message" }
    ```
*   **404 Not Found:** If a requested resource (e.g., a specific scrap sale for adding a payment) does not exist.
    ```json
    { "error": "Resource not found" }
    ```
*   **500 Internal Server Error:** For unexpected server-side errors.
    ```json
    { "error": "Failed to process request", "details": "optional error details if DEBUG is on" }
    ```
```
