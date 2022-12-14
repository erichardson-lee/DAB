import * as YAML from "https://deno.land/std@0.167.0/encoding/yaml.ts";

const file = Deno.readTextFile(Deno.args[0]);
const data = YAML.parse(await file);
console.log(JSON.stringify(data, null, 2));
