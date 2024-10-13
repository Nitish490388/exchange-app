import { useEffect, useState } from "react";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { getTicker, getDepth, getTrades } from "@/app/utils/httpClient";


export function Depth({ market }: {market: string}) {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();

    useEffect(() => {

        // getDepth(market).then(d => {    
        //     setBids(d.bids.reverse());
        //     setAsks(d.asks);
        // });

        const signalingManager = SignalingManager.getInstance();

        signalingManager.registerCallback("depth", (data: any) => {
    
    
            setBids((originalBids) => {
                const bidsAfterUpdate = [...(originalBids || [])];
    
                for (let i = 0; i < bidsAfterUpdate.length; i++) {
                    for (let j = 0; j < data.bids.length; j++) {
                        if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                            bidsAfterUpdate[i][1] = data.bids[j][1];
                            if (Number(bidsAfterUpdate[i][1]) === 0) {
                                bidsAfterUpdate.splice(i, 1);
                            }
                            break;
                        }
                    }
                }
    
                for (let j = 0; j < data.bids.length; j++) {
                    if (Number(data.bids[j][1]) !== 0 && !bidsAfterUpdate.map(x => x[0]).includes(data.bids[j][0])) {
                        bidsAfterUpdate.push(data.bids[j]);
                        break;
                    }
                }
    
                bidsAfterUpdate.sort((x, y) => Number(y[0]) > Number(x[0]) ? -1 : 1);
                return bidsAfterUpdate; 
            });
    
            // Update asks
            setAsks((originalAsks) => {
                const asksAfterUpdate = [...(originalAsks || [])];
    
                for (let i = 0; i < asksAfterUpdate.length; i++) {
                    for (let j = 0; j < data.asks.length; j++) {
                        if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                            asksAfterUpdate[i][1] = data.asks[j][1];
                            if (Number(asksAfterUpdate[i][1]) === 0) {
                                asksAfterUpdate.splice(i, 1);
                            }
                            break;
                        }
                    }
                }
    
                for (let j = 0; j < data.asks.length; j++) {
                    if (Number(data.asks[j][1]) !== 0 && !asksAfterUpdate.map(x => x[0]).includes(data.asks[j][0])) {
                        asksAfterUpdate.push(data.asks[j]);
                        break;
                    }
                }
    
                asksAfterUpdate.sort((x, y) => Number(y[0]) > Number(x[0]) ? 1 : -1);
                return asksAfterUpdate; 
            });

        }, `DEPTH-${market}`); 

        SignalingManager.getInstance().sendMessage({"method":"SUBSCRIBE","params":[`depth.200ms.${market}`]});

        

        getTicker(market).then(t => {
            setPrice(t.lastPrice)
            
        });
        // getTrades(market).then(t => {
        //     setPrice(t[0].price);
        //     console.log(t[0].price);
        // });

        return () => {
            SignalingManager.getInstance().sendMessage({"method": "UNSUBSCRIBE", "params": [`depth@${market}`]});
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
        }
    }, []);


    return <div>
        <TableHeader />
        {asks && <AskTable asks={asks} />}
        {price && <div>{price}</div>}
        {bids && <BidTable bids={bids} />}
    </div>
}


function TableHeader() {
    return <div className="flex justify-between text-xs">
    <div className="text-white">Price</div>
    <div className="text-slate-500">Size</div>
    <div className="text-slate-500">Total</div>
</div>
}