import React, { useState, useEffect } from "react";
import { Editor} from '@monaco-editor/react';

const languages = [
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "shell",
    "rust",
    "lua",
    "ruby",
    "r"
]

export default function Coding() {
  const [editorToggle, setEditor] = useState(true)
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [stdout, setStdout] = useState("");

  const execute = async () =>    {
    const reqBody = {content: code, language: language, input: input}

    // TODO: RESTful
    // unrelated TODO: fix stylings
    console.log(JSON.stringify(reqBody))
    let res = await fetch("/api/code/execute", {
        method: "POST",
        body:   JSON.stringify(reqBody)
    })

    const data = await res.json();
    setStdout(data.stdout)
  }

  const toggleEditor = () =>    {
    setEditor(!editorToggle)
  }
  
  return (
    <div className="flex flex-col w-full h-screen p-2 space-y-3">
      <div className="flex flex-row w-full justify-between space-x-1 p-2">
        <select
          onChange={e => setLanguage(e.target.value)}
          className="bg-gray-200 text-black border border-gray-400 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600 hover:bg-gray-300"
        >
          {languages.map(language =>
            <option
              key={language}
              value={language}
              className="bg-gray-50 hover:bg-gray-500 focus:bg-gray-600 text-black hover:text-white focus:text-white"
            >
              {language}
            </option>
          )}
        </select>

        <button
          onClick={e => execute()}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Execute
        </button>
      </div>

      <div className="flex flex-col sm:flex-row w-full h-[90%] p-0 m-0 space-x-6 sm:space-x-3">
        <div className="flex flex-col w-full sm:w-[68%] h-full">
          <div style={{ display: editorToggle ? 'block' : 'none' }} className="flex flex-col w-full h-full p-0 m-0">
            <div className="flex flex-row w-full p-0 m-0 space-x-3">
              <text className="text-lg">Code:</text>
              <button
                onClick={toggleEditor}
                className="bg-purple-700 text-white rounded-full px-3 py-1 space-x-2 overflow-hidden hover:bg-purple-800 transition duration-200 text-sm"
              >
                ⇄ Toggle Input ⇄
              </button>
            </div>
            <Editor
              value={code}
              onChange={e => setCode(e)} // vscode gives me an error but it works, idk
              className="resize-none w-full h-full p-0 m-0 border shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-25"
              language={language}
              theme="vs-dark"
            />
          </div>

          <div style={{ display: !editorToggle ? 'block' : 'none' }} className="flex flex-col w-full h-full p-0 m-0">
            <div className="flex flex-row w-full p-0 m-0 space-x-3">
              <text className="text-lg">Input:</text>
              <button
                onClick={toggleEditor}
                className="bg-purple-700 text-white rounded-full px-3 py-1 space-x-2 overflow-hidden hover:bg-purple-800 transition duration-200 text-sm"
              >
                ⇄ Toggle Code ⇄
              </button>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="resize-none w-full h-full p-4 m-0 border bg-slate-900 text-white border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-25"
            />
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-[28%] h-full">
          <text className="text-lg">stdout:</text>
          <textarea
            value={stdout}
            readOnly
            onChange={e => setStdout(e.target.value)}
            className="resize-none w-full h-full p-4 m-0 border bg-slate-900 text-white border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-25"
          />
        </div>
      </div>
    </div>
    );
}
