import { writable } from 'svelte/store';

function createNavigationStore() {
    const { subscribe, set } = writable({
        lastVisitedRoute: '/'
    });

    return {
        subscribe,
        setLastRoute: (route: string) => set({ lastVisitedRoute: route }),
        reset: () => set({ lastVisitedRoute: '/' })
    };
}

export const navigationStore = createNavigationStore();