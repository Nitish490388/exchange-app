import { Ticker } from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/"
// export const BASE_URL = "ws://localhost:3001"

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance(): SignalingManager {
        if (!SignalingManager.instance) {
            SignalingManager.instance = new SignalingManager();
        }
        return SignalingManager.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        };
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            // debug
           
            
            const type = message.data.e;
            // console.log(type);
            if (this.callbacks[type]) {
                // @ts-ignore
                this.callbacks[type].forEach(({ callback }) => {
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                        };
                        callback(newTicker);
                    }
                    if (type === "depth") {
                        // console.log(message);
                        
                        const updatedBids = message.data.b;
                        const updatedAsks = message.data.a;
                        callback({ bids: updatedBids, asks: updatedAsks });
                    }
                });
            }
        };
    }

    sendMessage(message: any) {
        const messageToSend = {
            ...message,
            id: this.id++
        };
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    registerCallback(type: string, callback: any, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
    }
 
    deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {

            // @ts-ignore
            const index = this.callbacks[type].findIndex(callback => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
    
}
