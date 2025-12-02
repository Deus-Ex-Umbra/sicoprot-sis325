import { Command, flags } from '@oclif/command';
import { Direction, Format } from '../types';
declare class TypeormUmlCommand extends Command {
    static description: string;
    static args: {
        name: string;
        required: boolean;
        description: string;
        default: string;
    }[];
    static flags: {
        connection: flags.IOptionFlag<string>;
        direction: flags.IOptionFlag<Direction>;
        format: flags.IOptionFlag<Format>;
        monochrome: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        handwritten: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        download: flags.IOptionFlag<string>;
        exclude: flags.IOptionFlag<string>;
        include: flags.IOptionFlag<string>;
        color: flags.IOptionFlag<string[]>;
        'with-entity-names-only': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'with-table-names-only': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'with-enum-values': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'plantuml-url': flags.IOptionFlag<string>;
    };
    run(): Promise<any>;
}
export = TypeormUmlCommand;
