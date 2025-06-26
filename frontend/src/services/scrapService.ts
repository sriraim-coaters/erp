import { API_BASE_URL } from '../config';
import { ScrapSale, Payment } from '../types'; // Assuming types are updated

// Type for data to create a new ScrapSale (backend calculates other fields)
export type NewScrapSaleData = Pick<ScrapSale, 'date_of_sale' | 'material_kg' | 'rate_per_kg'>;

// Type for data to create a new Payment
export type NewPaymentData = Pick<Payment, 'date_of_payment' | 'amount_paid'>;

/**
 * Fetches scrap sales from the backend.
 * @param filters Optional filters for start_date, end_date.
 */
export const fetchScrapSales = async (filters?: {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
}): Promise<ScrapSale[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  const response = await fetch(`${API_BASE_URL}/scrap-sales?${queryParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch scrap sales and parse error' }));
    throw new Error(errorData.message || 'Failed to fetch scrap sales');
  }

  const sales: ScrapSale[] = await response.json();
  return sales;
};

/**
 * Adds a new scrap sale to the backend.
 * @param saleData The data for the new scrap sale.
 */
export const addScrapSale = async (saleData: NewScrapSaleData): Promise<ScrapSale> => {
  const response = await fetch(`${API_BASE_URL}/scrap-sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add scrap sale and parse error' }));
    throw new Error(errorData.message || 'Failed to add scrap sale');
  }

  const newSale: ScrapSale = await response.json();
  return newSale;
};

/**
 * Adds a new payment to a specific scrap sale.
 * @param saleId The ID of the scrap sale to add payment to.
 * @param paymentData The data for the new payment.
 */
export const addPaymentToSale = async (saleId: number, paymentData: NewPaymentData): Promise<Payment> => {
  const response = await fetch(`${API_BASE_URL}/scrap-sales/${saleId}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add payment and parse error' }));
    throw new Error(errorData.message || 'Failed to add payment');
  }

  const newPayment: Payment = await response.json();
  return newPayment;
};
