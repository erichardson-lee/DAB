import * as YAML from "https://deno.land/std@0.167.0/encoding/yaml.ts";
import { deepMerge } from "https://deno.land/std@0.167.0/collections/deep_merge.ts";

//#region Code Block Parsing
const spectext = await Deno.readTextFile("spec.md");

const yamlBlocks = Array.from(
  spectext.matchAll(/```yaml\s(?<codeblock>[^`]*)```/gim)
).map(([_, codeblock]) => codeblock);

type CodeBlock = { $file?: string; [key: string]: unknown };

type DocumentData = Omit<CodeBlock, "$file">;
type Document = {
  file: string;
  data: DocumentData;
};

const yamlData = yamlBlocks
  .map<CodeBlock>((block) => YAML.parse(block) as CodeBlock)
  .filter((x) => x?.$file)
  .map<Document>((x) => {
    const file = x.$file;
    if (typeof file !== "string") throw new Error("file is not a string");
    delete x.$file;
    return { file, data: x };
  });

const files = yamlData.reduce((acc, { file, data }) => {
  const merge = deepMerge(acc.get(file) ?? {}, data);

  return acc.set(file, merge);
}, new Map<string, DocumentData>());

//#endregion

console.log("✅ Generated Files!");

//#region File Writing
try {
  Deno.mkdirSync("./out");
} catch (e) {
  if (!(e instanceof Deno.errors.AlreadyExists)) throw e;
}

console.log("✅ Writing to ./out/");

for (const [file, data] of files.entries()) {
  await Deno.writeTextFile(
    `./out/${file}.json`,
    JSON.stringify(data, undefined, 2)
  );
}

//#endregion

console.log("✅ Converting to Typescript");

for (const [file, data] of files.entries()) {
  console.log("⌛ Converting " + file);

  const outfolder = "../api/" + file;

  await Deno.mkdir(outfolder, { recursive: true });

  const codegen = Deno.run({
    cmd: [
      "jtd-codegen",
      "-",
      "--log-format=json",
      "--root-name=" + file,
      "--typescript-out=" + outfolder,
    ],
    stdin: "piped",
    stdout: "null",
    stderr: "inherit",
  });

  codegen.stdin?.write(new TextEncoder().encode(JSON.stringify(data)));

  codegen.stdin?.close();

  const { code } = await codegen.status();

  if (code !== 0) {
    console.error("jtd-codegen failed");
    Deno.exit(code);
  }
}

await Deno.writeTextFile(
  "../api/index.ts",
  "// Code generated by spec/compile.sh; DO NOT EDIT.\n" +
    Array.from(files.keys())
      .map((filename) => `export * from "./${filename}/index.ts";`)
      .join("\n")
);

await Deno.run({ cmd: ["deno", "fmt", "-q", "../api/", "./out"] }).status();

console.log("✅ Done!");
