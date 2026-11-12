/**
 * Monedas de negociación admitidas: códigos ISO 4217 vigentes que son monedas (sin fondos, metales
 * preciosos, `XXX` ni monedas retiradas como `CUC`). El backend tiene la misma lista: mantenerlas
 * sincronizadas al actualizar cualquiera de las dos.
 */
const CURRENCY_CODE_LIST = `
  AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN
  BZD CAD CDF CHF CLP CNY COP CRC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS
  GIP GMD GNF GTQ GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW
  KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD
  NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD
  SHP SLE SLL SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD UYU UZS
  VED VES VND VUV WST XAF XCD XOF XPF YER ZAR ZMW ZWL
`;

export const CURRENCY_CODES: readonly string[] = CURRENCY_CODE_LIST.trim().split(/\s+/);

const CURRENCY_SET: ReadonlySet<string> = new Set(CURRENCY_CODES);

export function isCurrencyCode(value: string): boolean {
  return CURRENCY_SET.has(value);
}
