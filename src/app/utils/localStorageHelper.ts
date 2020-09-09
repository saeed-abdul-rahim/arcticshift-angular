const localStorageHelper = {
    getItem(key: string) {
        try {
            const value = window.localStorage.getItem(key);
            return JSON.parse(value);
        } catch (err) {
            return null;
        }
    },
    setItem(key: string, value: {}) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
        }
    },
    removeItem(key: string) {
        try {
            window.localStorage.removeItem(key);
        } catch (err) {
        }
    }
};

export default localStorageHelper;
