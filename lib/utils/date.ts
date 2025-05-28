export function today() {
    return new Date().toISOString().split('T')[0];
}

export function randDate(begin: Date, end: Date) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()))
        .toISOString().split('T')[0];
}
