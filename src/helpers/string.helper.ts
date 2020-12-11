export namespace StringHelpers {
    export const ReplaceChars = (str: string) => {
        if (str === '' || !str) return str;
        return str
            .replace(' ', '%20')
            .split('ä')
            .join('a')
            .split('å')
            .join('a')
            .split('ö')
            .join('o')
            .split('Ä')
            .join('a')
            .split('Å')
            .join('a')
            .split('Ö')
            .join('o');
    };
}
