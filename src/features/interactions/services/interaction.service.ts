import type { PageQuery, ResponseItem, ResponseList } from '../../common/domain/pagination';
import { apiRequest } from '../../common/services/http';
import type {
  CreateInteractionPayload,
  Interaction,
  InteractionFilters,
  UpdateInteractionPayload,
} from '../domain/interaction';

export async function createInteraction(payload: CreateInteractionPayload): Promise<Interaction> {
  const response = await apiRequest<ResponseItem<Interaction>>('/interacciones', {
    method: 'POST',
    body: payload,
  });
  return response.data;
}

export function listMyInteractions(
  { type, createdFrom, createdTo }: InteractionFilters,
  { page, limit }: PageQuery,
  signal?: AbortSignal,
): Promise<ResponseList<Interaction>> {
  return apiRequest<ResponseList<Interaction>>('/interacciones/mias', {
    query: { page, limit, type, createdFrom, createdTo },
    signal,
  });
}

/** Solo administradores: admite además el filtro `userId`. */
export function listInteractions(
  { type, userId, createdFrom, createdTo }: InteractionFilters,
  { page, limit }: PageQuery,
  signal?: AbortSignal,
): Promise<ResponseList<Interaction>> {
  return apiRequest<ResponseList<Interaction>>('/interacciones', {
    query: { page, limit, type, userId, createdFrom, createdTo },
    signal,
  });
}

export async function updateInteraction(
  id: string,
  payload: UpdateInteractionPayload,
): Promise<Interaction> {
  const response = await apiRequest<ResponseItem<Interaction>>(
    `/interacciones/${encodeURIComponent(id)}`,
    { method: 'PUT', body: payload },
  );
  return response.data;
}

export async function removeInteraction(id: string): Promise<void> {
  await apiRequest<null>(`/interacciones/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
