import { Component, ChangeDetectorRef } from '@angular/core';
import { RconService } from '../../services/rcon.service';
import { BackendService } from '../../services/backend.service';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent  {
    public players = [];
    public filteredPlayers = [];
    private lastCommandWasStatus = false;
    private autoRefreshTurnedOn = true;
    public style: object = {};
    public apiKey = localStorage.getItem('api_key');

    constructor(
        private rcon: RconService,
        private ref: ChangeDetectorRef,
        private backend: BackendService,
    ) {
        this.refresh();
        this.autoRefresh(5);
        this.rcon.client.socket.socket.addListener('message', (res) => {
            if (this.lastCommandWasStatus) {
                this.players = rcon.formatData(res);
                this.filteredPlayers = this.players;
                this.ref.detectChanges();
            }
        });
    }

    kick(user: any) {
        this.lastCommandWasStatus = false;
        this.rcon.kick(user);

        // !NOTE: The timeout is 2100 because it takes 2 seconds to remove a player from playercount
        setTimeout(() => this.refresh(), 2100);
    }

    ban(user: any) {
        if (localStorage.getItem('api_key')) {
            this.lastCommandWasStatus = false;
            this.backend.ban(user);
            this.kick(user);

            // !NOTE: The timeout is 2100 because it takes 2 seconds to remove a player from playercount
            setTimeout(() => this.refresh(), 2100);
        }
    }

    refresh() {
        console.info('refreshing');
        this.lastCommandWasStatus = true;
        this.rcon.getStatus();
    }

    autoRefresh(seconds) {
        setTimeout(() => {
            if (this.autoRefreshTurnedOn) {
                this.refresh();
            }
            this.autoRefresh(seconds);
        }, seconds * 1000);
    }

    searchUsers(event) {
        const query = event.target.value.toLowerCase();

        if (this.players) {
            this.filteredPlayers = this.players.filter(user =>
                user.name.display.toLowerCase().includes(query) || user.ip.includes(query) || user.id.includes(query)
            );
        }
    }

    setApiKey(event) {
        localStorage.setItem('api_key', event.key);
        this.apiKey = event.key;
    }

    // !NOTE used for resizing the console
    validate(event: ResizeEvent): boolean {
        const MIN_DIMENSIONS_PX = 50;
        if (
            event.rectangle.width &&
            event.rectangle.height &&
            (event.rectangle.width < MIN_DIMENSIONS_PX ||
                event.rectangle.height < MIN_DIMENSIONS_PX)
        ) {
            return false;
        }
        return true;
    }
    onResizeEnd(event: ResizeEvent): void {
        this.style = {
            position: 'fixed',
            left: `${event.rectangle.left}px`,
            top: `${event.rectangle.top}px`,
            width: `${event.rectangle.width}px`,
            height: `${event.rectangle.height}px`
        };
    }
}
