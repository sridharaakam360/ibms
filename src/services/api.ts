// API Service Layer
// Handles all API calls with authentication

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Investors API
export const investorsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/investors`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/investors/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/investors`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    if (data instanceof FormData) {
      const response = await fetch(`${API_BASE_URL}/investors/${id}`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: data
      });
      return handleResponse(response);
    }

    const response = await fetch(`${API_BASE_URL}/investors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/investors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Portfolios API
export const portfoliosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolios`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const token = localStorage.getItem('auth_token');

    // Check if we have file uploads (logo)
    const hasLogoFile = data.logoFile instanceof File;

    let response: Response;

    if (hasLogoFile) {
      const fd = new FormData();
      const payload: any = { ...data };
      delete payload.logoFile;

      fd.append('data', JSON.stringify(payload));
      fd.append('logo', data.logoFile);

      response = await fetch(`${API_BASE_URL}/portfolios`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: fd,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/portfolios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
    }

    return handleResponse(response);
  },

  addSubMarketor: async (portfolioId: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    const hasPhotoFile = data.photoFile instanceof File;

    let response: Response;

    if (hasPhotoFile) {
      const fd = new FormData();
      const payload: any = { ...data };
      delete payload.photoFile;

      fd.append('data', JSON.stringify(payload));
      fd.append('photo', data.photoFile);

      response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/sub-marketors`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: fd,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/sub-marketors`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
    }

    return handleResponse(response);
  },

  updateSubMarketor: async (portfolioId: string, subMarketorId: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    const hasPhotoFile = data.photoFile instanceof File;

    let response: Response;

    if (hasPhotoFile) {
      const fd = new FormData();
      const payload: any = { ...data };
      delete payload.photoFile;

      fd.append('data', JSON.stringify(payload));
      fd.append('photo', data.photoFile);

      response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/sub-marketors/${subMarketorId}`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: fd,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/sub-marketors/${subMarketorId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
    }

    return handleResponse(response);
  },

  deleteSubMarketor: async (portfolioId: string, subMarketorId: string) => {
    const response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/sub-marketors/${subMarketorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Admin Banks API
export const adminBanksAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/admin-banks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: { ifsc: string; bankName: string; branch: string; accountHolderName: string; accountNumber: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin-banks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin-banks/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (data: { name: string; email: string; phone: string; photoFile?: string | File | null; bankAccounts: any[] }) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No auth token found. Please login before saving the admin profile.');
    }

    // If there are files (photoFile or passbook files), use FormData
    const hasPhotoFile = data.photoFile instanceof File;
    const hasPassbookFiles = (data.bankAccounts || []).some((b: any) => b.passbookFile instanceof File);

    let response: Response;

    if (hasPhotoFile || hasPassbookFiles) {
      const fd = new FormData();
      // Clone payload without file objects
      const payload: any = { ...data };
      if (payload.photoFile) delete payload.photoFile;
      if (payload.bankAccounts) payload.bankAccounts = payload.bankAccounts.map((b: any) => ({ ...b, passbookFile: undefined }));

      fd.append('data', JSON.stringify(payload));

      if (hasPhotoFile && data.photoFile instanceof File) {
        fd.append('photo', data.photoFile);
      }

      if (hasPassbookFiles) {
        for (const bank of data.bankAccounts) {
          if (bank.passbookFile instanceof File) {
            fd.append(`passbook_${bank.id}`, bank.passbookFile);
          }
        }
      }

      response = await fetch(`${API_BASE_URL}/admin-banks/profile`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: fd,
      });

    } else {
      response = await fetch(`${API_BASE_URL}/admin-banks/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
    }

    try {
      return await handleResponse(response);
    } catch (err: any) {
      // Add context for easier debugging on the client
      throw new Error(`${err.message} (PUT /admin-banks/profile returned ${response.status})`);
    }
  },

};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getActivities: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Export all APIs
export default {
  investors: investorsAPI,
  portfolios: portfoliosAPI,
  adminBanks: adminBanksAPI,
  dashboard: dashboardAPI,
};
