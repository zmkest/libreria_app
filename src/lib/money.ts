import Decimal from "decimal.js";

export function formatCurrency(value: Decimal | string | number): string {
  const d = new Decimal(value);
  return `$ ${d.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function calculateProfit(
  salePrice: Decimal,
  purchasePrice: Decimal,
): Decimal {
  return salePrice.minus(purchasePrice);
}

export function calculateSaleTotal(
  unitPrice: Decimal,
  quantity: number,
): Decimal {
  return unitPrice.times(quantity);
}
