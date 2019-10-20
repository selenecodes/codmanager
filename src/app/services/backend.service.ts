import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    private path = `${AppConfig.serverInfo.ip}:${AppConfig.serverInfo.backendPort}`;
    private headers = new HttpHeaders({
        'authorization': `Bearer ${localStorage.getItem('api_key')}`
    });
    private options = {
        'headers': this.headers
    };

    constructor(private http: HttpClient) {

    }

    ban(user) {
        return this.http.post(`${this.path}/ban`, {
            ip: user['ip']
        }, this.options);
    }

    unban(user) {
        return this.http.post(`${this.path}/unban`, {
            ip: user['ip']
        }, this.options);
    }

    getBannedUser() {
        return this.http.get(`${this.path}/bans`, this.options);
    }
}
