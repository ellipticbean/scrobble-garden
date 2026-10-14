const PYTHON_API_BASE = 'http://localhost:8000';

export interface PythonSyncResponse {
  success: boolean;
  username: string;
  current_top_artist: string;
  calculated_xp: number;
  sync_history: {
    synced_at: string;
    total_xp: number;
    top_artist: string;
  }[];
  automation_note: string;
}

export async function syncGardenWithPython(
  username: string,
  apiKey: string
): Promise<PythonSyncResponse> {
  const query = new URLSearchParams({
    username: username.trim(),
    api_key: apiKey.trim(),
  });

  const response = await fetch(`${PYTHON_API_BASE}/api/sync-garden?${query.toString()}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errData = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(errData.detail || `Python backend error (${response.status})`);
  }

  return (await response.json()) as PythonSyncResponse;
}