import fs from "fs";
import { Orderbook } from "./Orderbook";
import { MessageFromApi } from "../types/fromApi";

export const BASE_CURRENCY = "INR";

interface UserBalance {
    [key: string]: {
        available: boolean;
        locked: number;
    }
}

export class Engine {
    private orderbooks: Orderbook[] = [];
    private balances: Map<string, UserBalance> = new Map();

    constructor() {
        let snapshot = null
   
        try {
            if (process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json");
            }
            
        } catch(e) {
            console.log("No snapshot found");
        }

        
    }

    saveSnapshot() {
        const snapshotSnapshot = {
            orderbooks: this.orderbooks.map(o => o.getSnapshot()),
            balances: Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }

    
}