type Listener = (...args: any[]) => void;

class EventEmitter {
    private listeners: { [key: string]: Listener[] } = {};

    addListener(event: string, listener: Listener): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    removeListener(event: string, listenerToRemove: Listener): void {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event] = this.listeners[event].filter(
            listener => listener !== listenerToRemove
        );
    }

    emit(event: string, ...args: any[]): void {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event].forEach(listener => {
            listener(...args);
        });
    }
}

const eventEmitter = new EventEmitter();
export default eventEmitter; 