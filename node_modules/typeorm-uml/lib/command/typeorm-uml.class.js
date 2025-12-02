"use strict";
const command_1 = require("@oclif/command");
const builder_1 = require("../builder");
const types_1 = require("../types");
class TypeormUmlCommand extends command_1.Command {
    async run() {
        try {
            const { args, flags } = this.parse(TypeormUmlCommand);
            const typeormUml = new builder_1.TypeormUml();
            const colors = new Map();
            if (Array.isArray(flags.color)) {
                flags.color.forEach((color) => {
                    if (Array.isArray(color) && color.length === 2) {
                        colors.set(color[0], color[1]);
                    }
                });
            }
            typeormUml.build(args.configName, Object.assign(Object.assign({}, flags), { colors, echo: true }));
        }
        catch (e) {
            this.error(e.message);
        }
    }
}
TypeormUmlCommand.description = 'Generates a database UML diagram based on Typeorm entities.';
TypeormUmlCommand.args = [
    {
        name: 'configName',
        required: false,
        description: 'Path to the Typeorm config file.',
        default: 'ormconfig.json',
    },
];
TypeormUmlCommand.flags = {
    connection: command_1.flags.string({
        char: 'c',
        description: 'The connection name.',
        default: 'default',
    }),
    direction: command_1.flags.enum({
        char: 'D',
        description: 'Arrows directions. TB=top to bottom, LR=left to right.',
        default: types_1.Direction.TB,
        options: [types_1.Direction.TB, types_1.Direction.LR],
    }),
    format: command_1.flags.enum({
        char: 'f',
        description: 'The diagram file format.',
        default: types_1.Format.PNG,
        options: [types_1.Format.PNG, types_1.Format.SVG, types_1.Format.TXT, types_1.Format.PUML],
    }),
    monochrome: command_1.flags.boolean({
        description: 'Whether or not to use monochrome colors.',
        default: false,
    }),
    handwritten: command_1.flags.boolean({
        description: 'Whether or not to use handwritten mode.',
        default: false,
    }),
    download: command_1.flags.string({
        char: 'd',
        description: 'The filename where to download the diagram.',
    }),
    exclude: command_1.flags.string({
        char: 'e',
        description: 'Comma-separated list of entities to exclude from the diagram.',
    }),
    include: command_1.flags.string({
        char: 'i',
        description: 'Comma-separated list of entities to include into the diagram.',
    }),
    color: command_1.flags.string({
        description: 'Custom colors to use for the diagram.',
        helpLabel: '--color',
        helpValue: 'pkey=#aaa',
        multiple: true,
        parse(color) {
            return color.split('=', 2);
        },
    }),
    'with-entity-names-only': command_1.flags.boolean({
        description: 'Whether or not to display only entity names and hide database table names.',
        default: false,
    }),
    'with-table-names-only': command_1.flags.boolean({
        description: 'Whether or not to display only database table names and hide entity names.',
        default: false,
    }),
    'with-enum-values': command_1.flags.boolean({
        description: 'Whether or not to show possible values for the enum type field.',
        default: false,
    }),
    'plantuml-url': command_1.flags.string({
        description: 'URL of the plantuml server to use.',
        default: 'http://www.plantuml.com/plantuml',
    }),
};
module.exports = TypeormUmlCommand;
