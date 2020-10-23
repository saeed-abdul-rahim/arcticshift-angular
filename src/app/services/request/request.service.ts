import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';

export interface SuccessResponse {
    data: any;
    timestamp: number;
}

@Injectable()
export class RequestService {

    constructor(private http: HttpClient, private router: Router, private auth: AuthService) { }

    private async setDefaultHeaders() {
        try {
            const user = await this.auth.getCurrentUser();
            if (user.expiry < Date.now()) {
                await this.auth.getUser();
            }
            const { token, shopId } = user;
            return {
                Authorization: `Bearer ${token}`,
                shopId: shopId ? shopId : '',
            };
        } catch (err) {
            throw err;
        }
    }

    async post(url: string, data: any) {
        try {
            const headers = await this.setDefaultHeaders();
            const result = await this.http.post<SuccessResponse>(url, data, { headers }).toPromise();
            return result.data;
        } catch (err) {
            this.errorHandler(err);
        }
    }

    async get(url: string) {
        try {
            const headers = await this.setDefaultHeaders();
            const result = await this.http.get<SuccessResponse>(url, { headers }).toPromise();
            return result.data;
        } catch (err) {
            this.errorHandler(err);
        }
    }

    async patch(url: string, data: any) {
        try {
            const headers = await this.setDefaultHeaders();
            const result = await this.http.patch<SuccessResponse>(url, data, { headers }).toPromise();
            return result.data;
        } catch (err) {
            this.errorHandler(err);
        }
    }

    async put(url: string, data: any) {
        try {
            const headers = await this.setDefaultHeaders();
            const result = await this.http.put<SuccessResponse>(url, data, { headers }).toPromise();
            return result.data;
        } catch (err) {
            this.errorHandler(err);
        }
    }

    async delete(url: string) {
        try {
            const headers = await this.setDefaultHeaders();
            const result = await this.http.delete<SuccessResponse>(url, { headers }).toPromise();
            return result.data;
        } catch (err) {
            this.errorHandler(err);
        }
    }

    private errorHandler(err: any) {
        if (err.status === 401) { this.router.navigateByUrl('/'); }
        const { error, message } = err;
        if (error) { throw error.message; }
        else { throw message; }
    }
}
