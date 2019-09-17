import DgramAsPromised from './dgram-as-promised/dgram-as-promised';
const Buffer = require('buffer').Buffer;

export class RCON {
    private connection = {
        host: null,
        port: null,
        password: null
    };
    private rconId = 0x0012D4A6;

    public socket = DgramAsPromised.createSocket('udp4');

    constructor(private host: string, private port: number, private password: string | number, private _options: any) {
        const options = this._options || {};

        this.connection.host = this.host;
        this.connection.port = this.port;
        this.connection.password = this.password;

        this.rconId = options.id || this.rconId; // This is arbitrary in most cases
    }

    public send = (data): Promise<any> => {
        let str = 'rcon ';

        if (this.connection.password) {
            str += `${this.connection.password} `;
        }

        str += `${data} \n`;

        const sendBuf = new Buffer(4 + Buffer.byteLength(str));
        sendBuf.writeInt32LE(-1, 0);
        sendBuf.write(str, 4);

        return this._sendSocket(sendBuf);
    }

    public _sendSocket(buf) {
        if (this.socket) {
            return this.socket.send(buf, 0, buf.length, this.connection.port, this.connection.host);
        }
    }

    public connect() {
        this.socket.socket.addListener('listening', () => this.socketOnConnect());
        this.socket.socket.addListener('error', (e) => console.error(e));
        this.socket.bind({ port: 0 });
    }

    public socketOnConnect() {
        const sendBuf = new Buffer(5);
        sendBuf.writeInt32LE(-1, 0);
        sendBuf.writeUInt8(0, 4);
        this._sendSocket(sendBuf);
    }

    public async disconnect() {
        await this.socket.close();
        console.log('Socket is closed');
    }
}
