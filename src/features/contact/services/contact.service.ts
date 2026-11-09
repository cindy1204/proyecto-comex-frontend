import type { PageQuery, ResponseItem, ResponseList } from '../../common/domain/pagination';
import { apiRequest } from '../../common/services/http';
import type {
  ContactFilters,
  ContactRequest,
  CreateContactPayload,
  UpdateContactPayload,
} from '../domain/contact';

/** Público; si hay sesión, el backend asocia la solicitud al usuario. */
export async function createContactRequest(payload: CreateContactPayload): Promise<ContactRequest> {
  const response = await apiRequest<ResponseItem<ContactRequest>>('/solicitudes-contacto', {
    method: 'POST',
    body: payload,
  });
  return response.data;
}

export function listMyContactRequests(
  { tipoProducto, createdFrom, createdTo }: ContactFilters,
  { page, limit }: PageQuery,
  signal?: AbortSignal,
): Promise<ResponseList<ContactRequest>> {
  return apiRequest<ResponseList<ContactRequest>>('/solicitudes-contacto/mias', {
    query: { page, limit, tipoProducto, createdFrom, createdTo },
    signal,
  });
}

/** Solo administradores. */
export function listContactRequests(
  { tipoProducto, search, createdFrom, createdTo }: ContactFilters,
  { page, limit }: PageQuery,
  signal?: AbortSignal,
): Promise<ResponseList<ContactRequest>> {
  return apiRequest<ResponseList<ContactRequest>>('/solicitudes-contacto', {
    query: { page, limit, tipoProducto, search, createdFrom, createdTo },
    signal,
  });
}

export async function updateContactRequest(
  id: string,
  payload: UpdateContactPayload,
): Promise<ContactRequest> {
  const response = await apiRequest<ResponseItem<ContactRequest>>(
    `/solicitudes-contacto/${encodeURIComponent(id)}`,
    { method: 'PUT', body: payload },
  );
  return response.data;
}

export async function removeContactRequest(id: string): Promise<void> {
  await apiRequest<null>(`/solicitudes-contacto/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
