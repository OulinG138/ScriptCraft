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
    <div className="flex flex-col w-full h-screen bg-gray-50 text-gray-900">
      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden p-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col flex-grow bg-white shadow-lg rounded overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-100 p-3 border-b border-gray-300">
            
            <div className="flex items-center sm:space-x-2 md:space-x-4 w-full sm:w-auto">
              <span className="text-lg font-semibold flex-grow">
                {editorToggle ? "Code Editor" : "Input"}
              </span>

              <select
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-200 border border-gray-300 rounded px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                {languages.map((language) => (
                  <option key={language} value={language} className="bg-gray-200 text-gray-800">
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2 mt-2 sm:mt-0 ml-auto">
              <button
                onClick={toggleEditor}
                className="bg-purple-600 text-white px-2 py-1 text-sm rounded hover:bg-purple-700"
              >
                {editorToggle ? "Switch to Input" : "Switch to Code"}
              </button>
              <button
                onClick={execute}
                className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
              >
                Execute
              </button>
            </div>
          </div>

          <div className="flex-grow">
            {editorToggle ? (
              <Editor
                value={code}
                onChange={(value) => setCode(value)}
                className="w-full h-full border-none focus:outline-none"
                language={language}
                theme="vs-dark"
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white shadow-lg rounded overflow-hidden sm:w-1/3 sm:h-auto sm:self-stretch">
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            <span className="text-lg font-semibold">stdout</span>
          </div>
          <textarea
            value={stdout}
            readOnly
            className="w-full h-40 sm:h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none"
          />
        </div>
      </div>
    </div>
    );
}
