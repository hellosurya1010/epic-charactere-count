export const debounce = <T>(mainFunction: (...args: T[]) => void, delay: number) => {
    let timer;
    return function (...args: T[]) {
        clearTimeout(timer);
        let result = null;
        timer = setTimeout(() => {
            result = mainFunction(...args);
        }, delay);
        return result;
    }
}