import { Tables } from '../mappers/tables.mapper';

export namespace Factory {
    export const DbDataToTable = (
        data: Array<{
            table: Tables;
            obj: any;
        }>,
    ): object[] => {
        const newobj: any = {};
        return data.map((obj) => {
            newobj[obj.table] = [];
            newobj[obj.obj].push(obj);
            return newobj;
        });
    };

    export const DbDataToTableJSON = (
        data: Array<{
            table: Tables;
            obj: any;
        }>,
    ) => {
        return JSON.stringify(Factory.DbDataToTable(data));
    };

    export const FlattenPromiseData = (collection: any[]) => {
        return Object.assign({}, ...collection);
    };
}
