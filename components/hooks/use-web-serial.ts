import { useCallback, useRef, useState } from 'react';
import { useProjectStore } from '@/lib/store';

export function useWebSerial() {
    const [isConnected, setIsConnected] = useState(false);
    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);
    const { addLog } = useProjectStore();

    const connect = useCallback(async () => {
        if (!('serial' in navigator)) {
            alert("Web Serial API not supported in this browser. Use Chrome/Edge.");
            return;
        }

        try {
            const port = await (navigator as any).serial.requestPort();
            await port.open({ baudRate: 115200 });
            portRef.current = port;
            setIsConnected(true);
            addLog("✅ Serial Port Connected");

            // Start reading (without blocking UI)
            readLoop(port);

        } catch (err: any) {
            console.error(err);
            addLog(`❌ Connection Failed: ${err.message}`);
        }
    }, [addLog]);

    const disconnect = useCallback(async () => {
        if (readerRef.current) {
            await readerRef.current.cancel();
        }
        if (portRef.current) {
            await portRef.current.close();
        }
        setIsConnected(false);
        addLog("🔌 Serial Port Disconnected");
    }, [addLog]);

    const readLoop = async (port: any) => {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        readerRef.current = reader;

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // Allow the serial port to be closed later.
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    // For now, just log everything. 
                    // Future: Parse for "ESP-ROM:esp32" strings to auto-detect

                    // Split lines for cleaner logs
                    // This is a naive implementation, might break lines mid-stream
                    // addLog(`> ${value.trim()}`);
                    console.log(value);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return { isConnected, connect, disconnect };
}
