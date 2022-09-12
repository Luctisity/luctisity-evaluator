export enum ActionExecuteMode { INSTANT, TASK }

export type Action = {
    type: string,
    target: any,
    executeMode: ActionExecuteMode,
    [key: string]: any
}

const executeModesMap: any = {
    instant: ActionExecuteMode.INSTANT,
    task:    ActionExecuteMode.TASK
}

export default class ActionAdapter {

    target: string = "";

    constructor (target: string) {
        this.target = target;
    }

    // convert an internal "iframe" action type to a luctisity-core action

    actionToCore (data: any) {
        
        let a: Action = {
            type: data.name,
            target: this.target,
            executeMode: executeModesMap[data.executeMode] || executeModesMap.instant
        }

        Object.keys(data.data).forEach(dk => {
            let dv = data.data[dk];
            a[dk] = dv;
        });

        return a;

    }

    // and vice versd

    actionFromCore (action: Action) {

        let d: any = {
            name: action.type,
            executeMode: this.getMapKeyOf(executeModesMap, action.executeMode),
            data: {}
        }

        Object.keys(action)
            .filter(f => !['type', 'executeMode', 'target'].includes(f))
            .forEach(ak => {
                let av = action[ak];
                d.data[ak] = av;
            });

        return d;

    }

    private getMapKeyOf (map: any, value: any) {
        return Object.keys(map)[Object.values(map).indexOf(value)];
    }
    

}