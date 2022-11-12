import type { Encoding } from "crypto";

export type Configuration = {
    /*** Defaults to `path.resolve(process.cwd(), '.env')` */
    path?: string;
    /*** Defaults to `"utf-8"` */
    encoding?: Encoding;
    /*** Defaults to `false` */
    debug?: boolean;
    /*** Defaults to `true` */
    override?: boolean;
}

export type Output = {
    /*** Output the .env contents' key(s) only; default behavior includes key-value assignment */
    keys?: boolean;
    /*** Include the system's process.env key-value assignment(s) in output */
    process?: boolean;
    /*** Log output to standard-output; useful for cli usage. Defaults to `true` */
    stdout?: boolean;
}

/***
 * Dot-Environment File Parser
 *
 * - Specify ***`--stdout`*** to output content(s) to standard-output.
 * - Specify ***`--process`*** to output or return all runtime variable(s).
 * - Specify ***`--debug`*** to output debug information for the `dotenv` package.
 *
 * @see {@link Configuration} and {@link Output}
 *
 * @param options {Configuration}
 * @param output {Output}
 * @constructor
 */
export async function Environment( options: Configuration = {}, output: Output = {} ) {
    await import("dotenv/config");

    const Path = await import("path");

    const runtime = { ... process.env };

    options.path ??= Path.resolve(process.cwd(), ".env");
    options.override ??= true;
    options.encoding ??= "utf-8";
    options.debug ??= process.argv.includes("--debug") ?? false;

    output.keys ??= process.argv.includes("--keys") ?? false;
    output.process ??= process.argv.includes("--process") ?? false;
    output.stdout ??= process.argv.includes("--stdout") ?? false;

    const configuration = (await import("dotenv"));

    const { parsed } = configuration.config({ ... options });

    const target = ( output.process ) ? runtime : parsed;

    const accumulator = Reflect.construct(( output.keys ) ? Array : Object, []);

    if ( target ) {
        for ( const [ variable, assignment ] of Object.entries(target) ) {
            if ( output.keys ) {
                ( accumulator as string[] ).push(variable);
            } else {
                ( accumulator as { [ $: string ]: string | undefined | null } )[ variable ] = (assignment as string)
            }
        }
    }

    (output.stdout) && console.log(JSON.stringify(accumulator, null, 4));

    return accumulator as { [ $: string ]: string | undefined | null } | string[];
}

export default Environment;

(process.argv.includes("--stdout")) && (async () => Environment())();