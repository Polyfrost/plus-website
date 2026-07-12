export function isNewItem(createdAt: string) {
    return new Date(createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
}
