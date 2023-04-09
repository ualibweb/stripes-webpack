/* eslint-disable no-console */
import glob from "fast-glob";
import * as fse from "fs";
import * as path from "path";
import * as ttp from "typescript-to-proptypes";
import { promisify } from "util";
import * as yargs from "yargs";

const useExternalPropsFromInputBase = [
  "autoComplete",
  "autoFocus",
  "color",
  "defaultValue",
  "disabled",
  "endAdornment",
  "error",
  "id",
  "inputProps",
  "inputRef",
  "margin",
  "maxRows",
  "minRows",
  "name",
  "onChange",
  "placeholder",
  "readOnly",
  "required",
  "rows",
  "startAdornment",
  "value",
];

/**
 * A map of components and their props that should be documented
 * but are not used directly in their implementation.
 *
 * TODO: In the future we want to remove them from the API docs in favor
 * of dynamically loading them. At that point this list should be removed.
 * TODO: typecheck values
 */
const useExternalDocumentation: Record<string, "*" | readonly string[]> = {
  Button: ["disableRipple"],
  Box: ["component", "sx"],
  // `classes` is always external since it is applied from a HOC
  // In DialogContentText we pass it through
  // Therefore it's considered "unused" in the actual component but we still want to document it.
  DialogContentText: ["classes"],
  FilledInput: useExternalPropsFromInputBase,
  IconButton: ["disableRipple"],
  Input: useExternalPropsFromInputBase,
  MenuItem: ["dense"],
  OutlinedInput: useExternalPropsFromInputBase,
  Radio: ["disableRipple", "id", "inputProps", "inputRef", "required"],
  Checkbox: ["defaultChecked"],
  Container: ["component"],
  Stack: ["component"],
  Switch: [
    "checked",
    "defaultChecked",
    "disabled",
    "disableRipple",
    "edge",
    "id",
    "inputProps",
    "inputRef",
    "onChange",
    "required",
    "value",
  ],
  SwipeableDrawer: [
    "anchor",
    "hideBackdrop",
    "ModalProps",
    "PaperProps",
    "transitionDuration",
    "variant",
  ],
  Tab: ["disableRipple"],
  TextField: ["margin"],
  ToggleButton: ["disableRipple"],
};

const tsconfig = ttp.loadConfig(path.resolve(__dirname, "../tsconfig.json"));

async function generateProptypes(
  program: ttp.ts.Program,
  sourceFile: string,
  tsFile: string = sourceFile
): Promise<void> {
  const proptypes = ttp.parseFromProgram(tsFile, program, {
    shouldResolveObject: ({ name }) => {
      if (
        name.toLowerCase().endsWith("classes") ||
        name === "theme" ||
        (name.endsWith("Props") &&
          name !== "componentsProps" &&
          name !== "slotProps")
      ) {
        return false;
      }
      return undefined;
    },
    checkDeclarations: true,
  });

  if (proptypes.body.length === 0) {
    return;
  }

  // exclude internal slot components, eg. ButtonRoot
  proptypes.body = proptypes.body.filter((data) => {
    if (data.propsFilename?.endsWith(".tsx")) {
      // only check for .tsx
      const match = data.propsFilename.match(/.*\/([A-Z][a-zA-Z]+)\.tsx/);
      if (match) {
        return data.name === match[1];
      }
    }
    return true;
  });

  const sourceContent = await promisify(fse.readFile)(sourceFile, "utf8");

  const isTsFile = /(\.(ts|tsx))/.test(sourceFile);

  const unstyledFile = tsFile
    .replace(/.d.ts$/, "")
    .replace(/.tsx?$/, "")
    .replace(/.js$/, "");
  const unstyledPropsFile = unstyledFile.replace(".d.ts", ".types.ts");

  const propsFile = tsFile.replace(/(\.d\.ts|\.tsx|\.ts)/g, "Props.ts");
  const generatedForTypeScriptFile = sourceFile === tsFile;
  const result = ttp.inject(proptypes, sourceContent, {
    disablePropTypesTypeChecking: generatedForTypeScriptFile,
    babelOptions: {
      filename: sourceFile,
    },
    comment: [
      "----------------------------- Warning --------------------------------",
      "| These PropTypes are generated from the TypeScript type definitions |",
      isTsFile
        ? '|     To update them edit TypeScript types and run "yarn proptypes"  |'
        : '|     To update them edit the d.ts file and run "yarn proptypes"     |',
      "----------------------------------------------------------------------",
    ].join("\n"),
    ensureBabelPluginTransformReactRemovePropTypesIntegration: true,
    reconcilePropTypes: (prop, previous, generated) => {
      const usedCustomValidator =
        previous !== undefined && !previous.startsWith("PropTypes");
      const ignoreGenerated =
        previous !== undefined &&
        previous.startsWith("PropTypes /* @typescript-to-proptypes-ignore */");

      if (
        ignoreGenerated &&
        // `ignoreGenerated` implies that `previous !== undefined`
        previous
          ?.replace(
            "PropTypes /* @typescript-to-proptypes-ignore */",
            "PropTypes"
          )
          .replace(/\s/g, "") === generated.replace(/\s/g, "")
      ) {
        throw new Error(
          `Unused \`@typescript-to-proptypes-ignore\` directive for prop '${prop.name}'.`
        );
      }

      if (usedCustomValidator || ignoreGenerated) {
        // `usedCustomValidator` and `ignoreGenerated` narrow `previous` to `string`
        return previous;
      }

      return generated;
    },
    shouldInclude: ({ component, prop }) => {
      if (prop.name === "children") {
        return true;
      }
      let shouldDocument;
      const { name: componentName } = component;

      prop.filenames.forEach((filename) => {
        const isExternal = filename !== tsFile;
        const implementedByUnstyledVariant =
          filename === unstyledFile || filename === unstyledPropsFile;
        const implementedBySelfPropsFile = filename === propsFile;
        if (
          !isExternal ||
          implementedByUnstyledVariant ||
          implementedBySelfPropsFile
        ) {
          shouldDocument = true;
        }
      });

      if (
        useExternalDocumentation[componentName] &&
        (useExternalDocumentation[componentName] === "*" ||
          useExternalDocumentation[componentName].includes(prop.name))
      ) {
        shouldDocument = true;
      }

      return shouldDocument;
    },
  });

  if (!result) {
    throw new Error("Unable to produce inject propTypes into code.");
  }

  await promisify(fse.writeFile)(sourceFile, result);
}

interface HandlerArgv {
  pattern: string;
}
async function run(argv: HandlerArgv) {
  const { pattern } = argv;

  const filePattern = new RegExp(pattern);
  if (pattern.length > 0) {
    console.log(`Only considering declaration files matching ${filePattern}`);
  }

  // Matches files where the folder and file both start with uppercase letters
  // Example: AppBar/AppBar.d.ts

  const allFiles = await Promise.all(
    [path.resolve(__dirname, "../../node_modules/@folio/calendar/src")].map(
      (folderPath) =>
        glob("**/*.@(d.ts|ts|tsx)", {
          absolute: true,
          cwd: folderPath,
        })
    )
  );

  const files = allFiles
    .flat()
    .filter((file) => file.indexOf(".test.") === -1)
    .filter((filePath) => {
      return filePattern.test(filePath);
    });

  // May not be able to understand all files due to mismatch in TS versions.
  // Check `program.getSyntacticDiagnostics()` if referenced files could not be compiled.
  const program = ttp.createTSProgram(files, tsconfig);

  const promises = files.map<Promise<void>>(async (tsFile) => {
    const sourceFile = tsFile.includes(".d.ts")
      ? tsFile.replace(".d.ts", ".js")
      : tsFile;
    try {
      await generateProptypes(program, sourceFile, tsFile);
    } catch (error) {
      error.message = `${tsFile}: ${error.message}`;
      throw error;
    }
  });

  const results = await Promise.allSettled(promises);

  const fails = results.filter((result): result is PromiseRejectedResult => {
    return result.status === "rejected";
  });

  fails.forEach((result) => {
    console.error(result.reason);
  });
  if (fails.length > 0) {
    process.exit(1);
  }
}

yargs
  .command<HandlerArgv>(
    "$0",
    "Generates Component.propTypes from TypeScript declarations",
    (command) => {
      return command.option("pattern", {
        default: "",
        describe: "Only considers declaration files matching this pattern.",
        type: "string",
      });
    },
    run
  )
  .help()
  .strict(true)
  .version(false)
  .parse();
