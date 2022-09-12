import templateDefineAction   from '../templates/defineAction.js?raw';
import templateDefineVariable from '../templates/defineVariable.js?raw';
import templateDefineReporter from '../templates/defineReporter.js?raw';
import templateDefineConstant from '../templates/defineConstant.js?raw';
import templateDefineEnum     from '../templates/defineEnum.js?raw';
import templateIframeHTML     from '../templates/iframe.html?raw';

import windowModify from '../data/windowModify.json';

const defaultTypes = ['number', 'string', 'boolean', 'object', 'null', 'undefined'];

const templatePathTransformers: any = {
    '$$arguments':       serializeArguments,
    '$$action_data':     serializeActionData,
    '$$options':         serializeEnumOptions,
    '$$reporter':        serializeReporterPath,
    '$$name':            serializeToken,
    'else':              serializeArguableValue
}

const definitionTypes: any = {
    action:   templateDefineAction,
    variable: templateDefineVariable,
    reporter: templateDefineReporter,
    constant: templateDefineConstant,
    enum:     templateDefineEnum
}

type Definition = {
    type: string,
    name: string,
    description: string,
    [key: string]: any
}

type DefinitionArgument = { 
    name: string, 
    type: string, 
    default: any 
}

type DefinitionEnumOption = {
    type: any,
    default: string
}

type DefinitionReporterPath = string[];


export function templateIframe (id: string, definitions: any, script: string = "") {
    return templateIframeHTML
        .replaceAll('$$reporterData', '{}')
        .replaceAll('$$definitions', templateAllDefinitions(definitions))
        .replaceAll('$$script', script)
        .replaceAll('$$iframeId', id)
        .replaceAll('$$window_allow', JSON.stringify(windowModify.allow));
}

export function templateAllDefinitions (data: any) {
    let s = '';
    
    data.forEach((definition: Definition) => {
        s += templateDefinition(definition);
        s += '\n';
    });

    return s;
}

export function templateDefinition (data: Definition) {
    const targetTemplate = definitionTypes[data.type];
    if (!targetTemplate) return "";

    let tokens = targetTemplate.split('\n').join('% ').split(' ');

    let tokeni = -1;
    tokens.forEach((token: string) => {
        tokeni++;

        if (token.startsWith('$$')) {
            let targetTransformer = templatePathTransformers[token];
            if (!targetTransformer) targetTransformer = templatePathTransformers.else;

            tokens[tokeni] = targetTransformer(templatePath(token, data));
        }
    });

    return tokens.join(' ').split('% ').join('\n');
}


function templatePath (template: string, data: Definition) {
    let p = template.replace('$$', '').split('_');
    let v = data;
    
    p.forEach(k => {
        v = v[k]
    });

    return v;
}

function serializeToken (value: any) {
    return value.toString();
}

function serializeValue (value: any, type: string) {
    if (defaultTypes.includes(type)) return JSON.stringify(value);
    else return value;
}

function serializeArguableValue (value: any) {
    if (typeof value == 'string' && value.startsWith('$')) return value.slice(1);
    return serializeValue(value, typeof value);
}

function serializeReporterPath (reporter: DefinitionReporterPath) {
    let reporterSer = reporter.map(m => serializeArguableValue(m));
    return reporterSer.join('][');
}

function serializeActionData (data: any) {
    let s = '{';
    
    Object.keys(data).forEach(dk => {
        let dv = data[dk];
        s += `${dk}: ${serializeArguableValue(dv)},`;
    });

    s += '}';
    return s;
}

function serializeArguments (data: DefinitionArgument[]) {
    let a: string[] = [];
    for (let arg of data) {
        let s = arg.name;
        if (arg.default !== undefined) s += `=${serializeValue(arg.default, arg.type)}`;
        a.push(s);
    }
    return a.join();
}

function serializeEnumOptions (data: DefinitionEnumOption[]) {
    let s = '{';
    let i = 0;

    data.forEach(opt => {
        s += `${opt.default}: ${i},`;
        i++;
    });

    s += '}';
    return s;
}