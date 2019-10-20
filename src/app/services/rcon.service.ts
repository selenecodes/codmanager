import { Injectable } from '@angular/core';
import { colorcapture } from './regex';
import { AppConfig } from '../../environments/environment';
const ipRegex = require('ip-port-regex/lib/node7')
const { RCON } = require('./rcon.ts');

@Injectable({
    providedIn: 'root'
})
export class RconService {
    private options = {
        tcp: false,       // false for UDP, true for TCP (default true)
        challenge: false  // true to use the challenge protocol (default true)
    };

    public client = new RCON(
        AppConfig.serverInfo.ip,
        AppConfig.serverInfo.rconPort,
        AppConfig.serverInfo.rconPass,
        this.options
    );

    constructor() {
        this.client.connect();
    }

    // // !NOTE: Not working yet needs to be fixed
    // public ban(user: any): any {
    //     const confirmation = confirm(`Are you sure you want to ban ${user.name.display} with ID: ${user.id}?`);
    //     if (confirmation) {
    //         this.client.send(`say ^1Banned user ${user.name.display}`);
    //         this.client.send(`banClient ${user.id}`);
    //         // return this.client.send(`banUser ${user.name.real}`);
    //     }
    // }

    // // !NOTE: Not working yet needs to be fixed
    // public unban(user: any): any {
    //     const confirmation = confirm(`Are you sure you want to unban ${user.name.display} with ID: ${user.id}?`);
    //     if (confirmation) {
    //         this.client.send(`unban ${user.name.real}`);
    //     }
    // }

    public kick(user: any): any {
        const confirmation = confirm(`Are you sure you want to kick ${user.name.display} with ID: ${user.id}?`);
        if (confirmation) {
            this.client.send(`clientkick  ${user.id}`);
        }
    }

    public getStatus(): Promise<any> {
        return this.client.send('status');
    }

    public formatData(data) {
        const a = data.readUInt32LE(0);
        if (a === 0xffffffff) {
            const str = data.toString('utf-8', 4);
            return this.cleanStatus(str);
        } else {
            throw new Error('Received malformed packet');
        }
    }

    private cleanStatus(data) {
        const newData = [];
        let lines = data.split('\n');
        lines = lines.slice(4);
        lines.forEach(_line => {
            let line = _line.trim();

            const rate = line.substring(line.length - 5, line.length);
            line = line.substring(0, line.length-5).trim();
            const qport = line.substring(line.length - 5, line.length);
            line = line.substring(0, line.length - 5).trim();

            const ipaddress = ipRegex.parts(line);
            const ip = ipaddress.ip;
            // !NOTE: Warn about negative ports when a port is above 32767
            const port = ipaddress.port ? ipaddress.port : '> 32767';

            const words = line.split(/\s+/);

            if (words.length > 1) {
                const id = words[0];
                const score = words[1] || null;
                const ping = words[2] || null;

                const name = words.slice(3, - 2).join(' ') || null;
                const lastmsg = words[words.length - 2] || null;

                newData.push({
                    'id': id,
                    'score': score,
                    'ping': this.cleanPing(ping),
                    'name': {
                        'display': this.cleanPlayerName(name),
                        'real': name
                    },
                    'lastmsg': lastmsg,
                    'ip': ip,
                    'port': port,
                    'qport': qport,
                    'rate': rate
                });
            }
        });

        return newData;
    }

    private cleanPing(ping: string): string {
        if (['CNCT', '999'].includes(ping)) {
            return 'Connecting';
        } else if (ping === 'ZMBI') {
            return 'Slot reserved';
        } else {
            return ping;
        }
    }

    private cleanPlayerName(name: string): string {
        return name ? name.replace(colorcapture, '') : name;
    }
}



