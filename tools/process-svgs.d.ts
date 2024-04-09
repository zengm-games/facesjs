
declare module 'process-svgs' {

    interface SvgsStructure {
        [folderName: string]: {
            [fileName: string]: string;
        };
    }

    interface SvgsIndex {
        [folderName: string]: string[];
    }

    interface SvgsGenders {
        [folderName: string]: string[];
    }

    export function processSVGs(): Promise<void>;
}
