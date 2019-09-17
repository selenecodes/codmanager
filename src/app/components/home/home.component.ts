import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RconService } from '../../services/rcon.service';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public players = [];
    private lastCommandWasStatus = false;
    private autoRefreshTurnedOn = false;
    public style: object = {};

    constructor(private rcon: RconService, private ref: ChangeDetectorRef) {
        this.refresh();
        this.autoRefresh(5);
        this.rcon.client.socket.socket.addListener('message', (res) => {
            if (this.lastCommandWasStatus) {
                this.players = rcon.formatData(res);
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
        this.lastCommandWasStatus = false;
        this.rcon.ban(user);

        // !NOTE: The timeout is 2100 because it takes 2 seconds to remove a player from playercount
        setTimeout(() => this.refresh(), 2100);
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

    validate(event: ResizeEvent): boolean {
        const MIN_DIMENSIONS_PX: number = 50;
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

    ngOnInit() { }
}
