import type { Locale } from '../domain/locale';
import { en } from './en';
import { es, type Messages } from './es';

export type { Messages };

export const DICTIONARIES: Record<Locale, Messages> = { es, en };
