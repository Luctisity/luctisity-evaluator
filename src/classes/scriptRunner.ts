import { templateIframe } from '../util/templateAssembler';
import stringifyMethod from '../util/stringifyMethod';

import ActionAdapter from './actionAdapter';

import definitions from '../data/definitions.json';

// result data to send to lucisity-core
export type SendData = {
    actions: any[],
    error: any,
    result: any
}

export default class ScriptRunner {

    id:     string = "";
    target: string = "";
    script: string = "";
    iframe: HTMLIFrameElement;
    actionAdapter: ActionAdapter;

    listeners: Set<Function> = new Set();

    constructor (id: string, target?: string) {
        this.id = id;
        this.target = target || "";

        // construct an iframe and connect events from it
        
        this.iframe = document.createElement('iframe')
        this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        this.iframe.style.display = 'none';

        this.actionAdapter = new ActionAdapter(this.target);
        
        this.setScript(this.script);

        window.addEventListener('message', e => {
            if (e.data.script != this.id) return;
            this.recieveResult(e.data);
        });

        document.body.appendChild(this.iframe);
    }

    setScript (script: string) { 
        // construct an iframe sourcedoc based on the given script and the templates
        this.script = script;
        this.iframe.srcdoc = templateIframe(this.id, definitions, this.script);
    }

    callMethod (name: string, ...args: any) {
        // call a method of an iframe
        this.iframe.contentWindow?.postMessage('$_event_begin();' + stringifyMethod(name, ...args), '*');
    }

    recieveResult (data: any) {
        // handle the result given back from the iframe

        const sendData: SendData = {
            actions: [],
            error: data.error,
            result: data.result
        }

        data.actions.forEach((a: any) => {
            sendData.actions.push(this.actionAdapter.actionToCore(a));
        });

        // send it to all the listeners of luctisity-core
        this.listeners.forEach(listener => {
            listener(sendData);
        });

        // TODO: remove
        console.log(sendData);
    }

    connect (listener: Function) {
        this.listeners.add(listener);
        return this.disconnect;
    }

    disconnect (listener: Function) {
        this.listeners.delete(listener);
    }

}