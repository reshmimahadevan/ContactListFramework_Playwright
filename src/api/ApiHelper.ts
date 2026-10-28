import { APIRequestContext, APIResponse, expect } from "@playwright/test";

export class ApiHelper {

    private readonly request: APIRequestContext;
    private readonly baseURL: string;

    constructor(request: APIRequestContext, baseURL: string) {
        this.request = request;
        this.baseURL = baseURL;
    }

    //GET
    async get(endPoint: string, headers?: Record<string, string>): Promise<APIResponse> {
        return await this.request.get(`${this.baseURL}${endPoint}`, { headers });
    }

    //POST
    async post(endPoint: string, data: object, headers?: Record<string, string>): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}${endPoint}`, { headers, data });
    }

    //PUT
    async put(endPoint: string, data: object, headers?: Record<string, string>): Promise<APIResponse> {
        return await this.request.put(`${this.baseURL}${endPoint}`, { headers, data });
    }

    //PATCH
    async patch(endPoint: string, data: object, headers?: Record<string, string>): Promise<APIResponse> {
        return await this.request.patch(`${this.baseURL}${endPoint}`, { headers, data });
    }

    //DELETE
    async delete(endPoint: string, headers?: Record<string, string>): Promise<APIResponse> {
        return await this.request.delete(`${this.baseURL}${endPoint}`, { headers });
    }

     //Create a user and return the auth token  <-- NEW
    async createUser(email: string, password: string, firstName = 'Auto', lastName = 'Tester'): Promise<string> {
        const res = await this.post('/users', { firstName, lastName, email, password });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        return body.token;
    }

    async createContact(token: string, contact: Record<string, string>): Promise<Record<string, string>> {
    const res = await this.post('/contacts', contact, { Authorization: `Bearer ${token}` });
    expect(res.ok()).toBeTruthy();
    return await res.json();
}

async getContact(token: string, id: string): Promise<Record<string, string>> {
    const res = await this.get(`/contacts/${id}`, { Authorization: `Bearer ${token}` });
    expect(res.ok()).toBeTruthy();
    return await res.json();
}

async login(email: string, password: string): Promise<string> {
    const res = await this.post('/users/login', { email, password });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    return body.token;
}

async getContacts(token: string): Promise<Record<string, string>[]> {
    const res = await this.get('/contacts', { Authorization: `Bearer ${token}` });
    expect(res.ok()).toBeTruthy();
    return await res.json();
}

}
