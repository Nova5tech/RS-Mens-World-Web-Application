import { apiClient } from '@/lib/apiClient';
import { MockStorage } from '@/mocks/mockAdapter';
import { INITIAL_MEDIA, INITIAL_TEMPLATES, INITIAL_SEGMENTS } from '@/mocks/data/content';
import { MediaAsset, MessageTemplate, Segment, SegmentRules } from '@/types/models';
import { customersStorage } from '@/services/customers';
import { branchesStorage } from '@/services/branches';

export const mediaStorage = new MockStorage<MediaAsset>('media_assets', INITIAL_MEDIA);
export const templatesStorage = new MockStorage<MessageTemplate>('message_templates', INITIAL_TEMPLATES);
export const segmentsStorage = new MockStorage<Segment>('segments', INITIAL_SEGMENTS);

export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

// MEDIA SERVICES
export async function getMedia(): Promise<MediaAsset[]> {
  if (isUsingMocks) {
    return mediaStorage.getAll();
  }
  const response = await apiClient.get<MediaAsset[]>('/media');
  return response.data;
}

export async function uploadMedia(data: Omit<MediaAsset, 'id' | 'created_at'>): Promise<MediaAsset> {
  const newAsset: MediaAsset = {
    ...data,
    id: `media_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isUsingMocks) {
    return mediaStorage.insert(newAsset);
  }

  const response = await apiClient.post<MediaAsset>('/media', data);
  return response.data;
}

export async function deleteMedia(id: string): Promise<boolean> {
  if (isUsingMocks) {
    return mediaStorage.delete(id);
  }
  await apiClient.delete(`/media/${id}`);
  return true;
}

// TEMPLATE SERVICES
export async function getTemplates(): Promise<MessageTemplate[]> {
  if (isUsingMocks) {
    return templatesStorage.getAll();
  }
  const response = await apiClient.get<MessageTemplate[]>('/templates');
  return response.data;
}

export async function getTemplateById(id: string): Promise<MessageTemplate | null> {
  if (isUsingMocks) {
    return templatesStorage.getById(id);
  }
  const response = await apiClient.get<MessageTemplate>(`/templates/${id}`);
  return response.data;
}

export async function createTemplate(data: Omit<MessageTemplate, 'id' | 'created_at'>): Promise<MessageTemplate> {
  const newTemplate: MessageTemplate = {
    ...data,
    id: `tpl_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isUsingMocks) {
    return templatesStorage.insert(newTemplate);
  }

  const response = await apiClient.post<MessageTemplate>('/templates', data);
  return response.data;
}

export async function updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
  if (isUsingMocks) {
    return templatesStorage.update(id, updates);
  }
  const response = await apiClient.patch<MessageTemplate>(`/templates/${id}`, updates);
  return response.data;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  if (isUsingMocks) {
    return templatesStorage.delete(id);
  }
  await apiClient.delete(`/templates/${id}`);
  return true;
}

// SEGMENT SERVICES & PREVIEWS
export async function previewSegmentCount(rules: SegmentRules): Promise<{
  totalCount: number;
  branchCounts: Record<string, number>;
}> {
  if (isUsingMocks) {
    const allCustomers = await customersStorage.getAll();
    const branches = await branchesStorage.getAll();

    const branchCounts: Record<string, number> = {};
    branches.forEach((b) => {
      branchCounts[b.id] = 0;
    });

    const matching = allCustomers.filter((c) => {
      if (rules.opted_in_only && !c.consent) return false;
      if (rules.branch_id && rules.branch_id !== 'all' && c.branch_id !== rules.branch_id) {
        return false;
      }
      if (rules.customer_type && rules.customer_type !== 'all' && c.customer_type !== rules.customer_type) {
        return false;
      }
      if (rules.customer_status && rules.customer_status !== 'all' && c.status !== rules.customer_status) {
        return false;
      }
      if (rules.birthday_month) {
        if (!c.birthday) return false;
        const m = new Date(c.birthday).getMonth() + 1;
        if (m !== rules.birthday_month) return false;
      }
      if (rules.anniversary_month) {
        if (!c.anniversary) return false;
        const m = new Date(c.anniversary).getMonth() + 1;
        if (m !== rules.anniversary_month) return false;
      }
      return true;
    });

    matching.forEach((c) => {
      if (branchCounts[c.branch_id] !== undefined) {
        branchCounts[c.branch_id]++;
      }
    });

    return {
      totalCount: matching.length,
      branchCounts,
    };
  }

  const response = await apiClient.post<{
    totalCount: number;
    branchCounts: Record<string, number>;
  }>('/segments/preview-count', { rules });
  return response.data;
}

export async function getSegments(): Promise<Segment[]> {
  if (isUsingMocks) {
    const segments = await segmentsStorage.getAll();
    // Compute dynamic live counts
    const withCounts = await Promise.all(
      segments.map(async (seg) => {
        const preview = await previewSegmentCount(seg.rules_json);
        return {
          ...seg,
          customer_count: preview.totalCount,
          branch_counts: preview.branchCounts,
        };
      })
    );
    return withCounts;
  }

  const response = await apiClient.get<Segment[]>('/segments');
  return response.data;
}

export async function createSegment(data: Omit<Segment, 'id' | 'created_at'>): Promise<Segment> {
  const preview = await previewSegmentCount(data.rules_json);
  const newSegment: Segment = {
    ...data,
    id: `seg_${Date.now()}`,
    customer_count: preview.totalCount,
    branch_counts: preview.branchCounts,
    created_at: new Date().toISOString(),
  };

  if (isUsingMocks) {
    return segmentsStorage.insert(newSegment);
  }

  const response = await apiClient.post<Segment>('/segments', data);
  return response.data;
}

export async function updateSegment(id: string, updates: Partial<Segment>): Promise<Segment | null> {
  if (isUsingMocks) {
    return segmentsStorage.update(id, updates);
  }
  const response = await apiClient.patch<Segment>(`/segments/${id}`, updates);
  return response.data;
}

export async function deleteSegment(id: string): Promise<boolean> {
  if (isUsingMocks) {
    return segmentsStorage.delete(id);
  }
  await apiClient.delete(`/segments/${id}`);
  return true;
}
