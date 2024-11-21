import {PrismaClient} from "@prisma/client";
import {promises as fsp} from "fs";
import { comma } from "postcss/lib/list";

/**
 * @swagger
 * /api/code/execute:
 *   post:
 *     summary: Executing code
 *     description: Allows users to execute their code templates
 *     tags:
 *       - Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - language
 *               - input
 *             properties:
 *               content:
 *                 type: string
 *                 description: Raw text of the code to execute
 *                 example: print("Hello World")
 *               language:
 *                 type: string
 *                 description: The language of code being executed
 *                 example: python
 *               input:
 *                 type: string
 *                 description: Raw text of input to pipe into the program
 *                 example: 1
 *     responses:
 *       200:
 *         description: Code execution successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stdout:
 *                   type: string
 *                   example: "Hello World\r\n"
 *                 err:
 *                   type: string
 *                   example: ""
 *       401:
 *         description: Compilation error (for c and c++ programs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stdout:
 *                   type: string
 *                   example: ""
 *                 err:
 *                   type: string
 *                   example: "\\20.572770815721064.c:1:1: error: expected '=', ',', ';', 'asm' or '__attribute__' at end of input\n    1 | print\n      | ^~~~~\n"
 *       402:
 *         description: Execution-time error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stdout:
 *                   type: string
 *                   example: ""
 *                 err:
 *                   type: string
 *                   example: "Traceback (most recent call last):\r\n  File \\6185.253333239207.py\", 
 *                             line 1, in <module>\r\n    print(a)\r\n          ^\r\nNameError: name 'a' is not defined\r\n"
 *       405:
 *         description: Method not allowed.
 *       500:
 *         description: Temp file write error
 *       501:
 *         description: Temp file deletion error
 */

/**
 * Implemented User Stories
 * 
 * As a visitor, I want to execute my code on Scriptorium and see the output in real-time 
 * so that I can quickly verify its correctness.
 *  - Make a POST request satisfying the above swagger docs. Assume all inputs are present and of the correct type.
 *    Assuming the code compiles and runs without issue, the result will be returned under stdout
 * 
 * As a visitor, I want to provide input to my code via the standard input (stdin) before execution so that I can test 
 * programs that require user input.
 *  - Same as previous, the input should go under the input field, and contain all desired inputs for piping (ie: cannot 
 *    continually feed inputs one by one)
 * 
 * As a visitor, I want to see error messages if my code fails to compile or run so that I can debug my code effectively. 
 * This includes compile errors, runtime errors, [...], or any warnings generated in the meantime.
  *  - Same as first, any such errors will be returned under stderr
 */

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const prisma = new  PrismaClient();

export default async function handler(req, res) {
    if (req.method === "POST")  {
        // TODO: rn, this only works with windows commands, we will need to test with teach cs
        const {content, language, input} = req.body

        // TODO: see if theres a better way to make temp ids
        const tempID = Math.random() * 10000
        const path = "temp_scripts/" + tempID

        const extensionLookup = {"python": ".py", "javascript": ".js", "java": ".java", "c": ".c", "cpp": ".cpp", "shell": ".sh", "rust": ".rs", "lua": ".lua", "ruby": ".rb", "r": ".R"}

        // Writing scripts and inputs as files to run commands with them
        try {
            await fsp.writeFile(path + ".txt", input)
            await fsp.writeFile(path + extensionLookup[language], content)
        }   catch (error) {
                console.log(error)
                res.status(500).json({message: "Write Error"})
        }

        // Executing scipt
        try {
            var { stdout} = await exec("docker container create -i -t " + language);
            const container = stdout.replace("\n", "")

            // TODO: REPLACE NUL with /dev/null
            var {stdout} = await exec("docker cp " + path + extensionLookup[language] + " " + container + ":script" + extensionLookup[language] + " > NUL && " + 
                "docker cp " + path + ".txt " + container + ":input.txt > NUL && " + 
                "docker start " + container + " > NUL && " + 
                "docker wait " + container + " > NUL && " + 
                "docker logs " + container + " && " + 
                "docker rm " + container + " > NUL"
            );
            deleteTempFiles(path, extensionLookup[language], res)
            res.status(200).json({stdout: stdout})
        }   catch (error) {
            deleteTempFiles(path, extensionLookup[language], res)
            console.log(error)
            res.status(401).json({message: "Error Executing Code"})
        }
    }
  }


async function deleteTempFiles(path, extension, res)  {
    try {
        await fsp.unlink(path + ".txt")
        await fsp.unlink(path + extension)
    }   catch (error)   {
        console.log(error)
        res.status(501).json({message: "Deletion Error"})
    }
}