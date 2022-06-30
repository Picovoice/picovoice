import * as path from "path";
import {getPlatform} from "../src/platforms";

function appendLanguage(
    s: string,
    language: string): string {
    if (language === "en") {
        return s;
    } else {
        return s + "_" + language;
    }
}

export function getRhinoModelPathByLanguage(
    relative: string,
    language: string): string {
    return path.join(
        __dirname,
        relative,
        `${appendLanguage('resources/rhino/lib/common/rhino_params', language)}.pv`);
}

export function getPorcupineModelPathByLanguage(
    relative: string,
    language: string): string {
    return path.join(
        __dirname,
        relative,
        `${appendLanguage('resources/porcupine/lib/common/porcupine_params', language)}.pv`);
}

export function getContextPathsByLanguage(
    relative: string,
    language: string,
    context: string): string {
    return path.join(
        __dirname,
        relative,
        appendLanguage('resources/rhino/resources/contexts', language),
        getPlatform(),
        `${context}_${getPlatform()}.rhn`);
}

export function getKeywordPathsByLanguage(
    relativeKeywordPath: string,
    language: string,
    keyword: string): string {
    return path.join(
        __dirname,
        relativeKeywordPath,
        appendLanguage('resources/porcupine/resources/keyword_files', language),
        getPlatform(),
        `${keyword}_${getPlatform()}.ppn`);
}

export function getAudioFileByLanguage(
    relativeAudioFilePath: string,
    language: string,
    audioFile: string): string {

    return path.join(
        __dirname,
        relativeAudioFilePath,
        'resources/audio_samples',
        audioFile);
}